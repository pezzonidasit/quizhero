/**
 * QuizHero — Duel 1v1 Engine
 * Real-time duels via Firebase Realtime DB.
 * Depends on: firebase.js, questions.js, app.js (showScreen, ProfileManager)
 */

const Duel = {
  code: null,
  role: null,        // 'a' or 'b'
  listener: null,    // Firebase .on() ref
  timerInterval: null,
  timerStart: null,
  state: null,       // local copy of duel state
  _currentDisplayedRound: null,

  // ── Create ──

  async create(category, stake) {
    if (!firebaseUid) { alert('Connexion requise'); return; }
    const coins = ProfileManager.get('coins', 0);
    if (stake < 5) { alert('Mise minimum : 5 pièces'); return; }
    if (stake > coins) { alert('Pas assez de pièces !'); return; }

    const code = String(1000 + Math.floor(Math.random() * 9000));
    // Check code not taken
    const existing = await db.ref('duels/' + code).once('value');
    if (existing.exists()) {
      return this.create(category, stake);
    }

    const profile = ProfileManager.getActive();
    const displayName = profile.name.split(' ')[0];

    await db.ref('duels/' + code).set({
      status: 'waiting',
      category: category,
      difficulty: null,
      stake: { a: stake, b: 0, effective: 0 },
      players: {
        a: { uid: firebaseUid, name: displayName, score: 0 },
      },
      currentRound: 0,
      rounds: {},
      winner: null,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });

    this.code = code;
    this.role = 'a';

    // Show waiting UI
    document.getElementById('duel-code-display').textContent = code;
    document.getElementById('duel-create-settings').style.display = 'none';
    document.getElementById('btn-duel-launch').style.display = 'none';
    document.getElementById('duel-waiting').style.display = '';

    this._listen();
  },

  // ── Find ──

  async find(code) {
    code = code.trim();
    if (code.length !== 4) { alert('Code à 4 chiffres'); return null; }
    const snap = await db.ref('duels/' + code).once('value');
    if (!snap.exists()) { alert('Duel introuvable'); return null; }
    const duel = snap.val();
    if (duel.status !== 'waiting') { alert('Ce duel a déjà commencé'); return null; }
    if (duel.players.a.uid === firebaseUid) { alert('Tu ne peux pas te défier toi-même !'); return null; }
    return duel;
  },

  // ── Join ──

  async join(code, difficulty, stake) {
    if (!firebaseUid) { alert('Connexion requise'); return; }
    const coins = ProfileManager.get('coins', 0);
    if (stake < 5) { alert('Mise minimum : 5 pièces'); return; }
    if (stake > coins) { alert('Pas assez de pièces !'); return; }

    const profile = ProfileManager.getActive();
    const displayName = profile.name.split(' ')[0];

    const snap = await db.ref('duels/' + code).once('value');
    const duel = snap.val();
    const effective = Math.min(stake, duel.stake.a);

    await db.ref('duels/' + code).update({
      status: 'ready',
      difficulty: difficulty,
      'stake/b': stake,
      'stake/effective': effective,
      'players/b': { uid: firebaseUid, name: displayName, score: 0 },
    });

    this.code = code;
    this.role = 'b';
    this._listen();
  },

  // ── Firebase Listener ──

  _listen() {
    if (this.listener) this.listener.off();
    const ref = db.ref('duels/' + this.code);
    this.listener = ref;

    ref.on('value', (snap) => {
      const duel = snap.val();
      if (!duel) { this._cleanup(); return; }
      this.state = duel;

      if (duel.status === 'ready' && this.role === 'a') {
        this._startNextRound();
      }

      if (duel.status === 'playing') {
        this._renderFight(duel);
      }

      if (duel.status === 'finished') {
        this._showEnd(duel);
      }
    });
  },

  // ── Round Management ──

  async _startNextRound() {
    const duel = this.state;
    const round = (duel.currentRound || 0) + 1;

    // Only player A generates questions
    if (this.role === 'a') {
      const cat = duel.category;
      const diff = duel.difficulty || 'medium';
      const subLevel = diff === 'easy' ? 1 : diff === 'hard' ? 3 : 2;
      const q = generateQuestion(cat, subLevel, null);

      await db.ref('duels/' + this.code).update({
        status: 'playing',
        currentRound: round,
        ['rounds/' + round]: {
          question: { text: q.text, answer: q.answer, unit: q.unit || '', hint: q.hint || '', explanation: q.explanation || '', category: q.category || cat },
          answers: {},
          winner: null,
        },
      });
    }
  },

  // ── Submit Answer ──

  async submitAnswer(value) {
    const duel = this.state;
    const round = duel.currentRound;
    const roundData = duel.rounds[round];
    const elapsed = Date.now() - this.timerStart;

    const q = roundData.question;
    let correct;
    if (q.textAnswer !== undefined || q.acceptedAnswers) {
      const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
      const accepted = q.acceptedAnswers || [q.textAnswer];
      correct = accepted.some(a => norm(value) === norm(a));
    } else {
      correct = Math.abs(Number(value) - q.answer) < 0.01;
    }

    await db.ref('duels/' + this.code + '/rounds/' + round + '/answers/' + this.role).set({
      value: (q.textAnswer !== undefined || q.acceptedAnswers) ? value : Number(value),
      time: elapsed,
      correct: correct,
    });

    document.getElementById('duel-answer-section').style.display = 'none';
    document.getElementById('duel-waiting-opponent').style.display = '';
    this._stopTimer();
  },

  // ── Timeout ──

  async _timeout() {
    const duel = this.state;
    const round = duel.currentRound;
    const roundData = duel.rounds?.[round];

    if (!roundData?.answers?.[this.role]) {
      await db.ref('duels/' + this.code + '/rounds/' + round + '/answers/' + this.role).set({
        value: null,
        time: 30000,
        correct: false,
      });
      document.getElementById('duel-answer-section').style.display = 'none';
      document.getElementById('duel-waiting-opponent').style.display = '';
    }
  },

  // ── Render Fight ──

  _renderFight(duel) {
    const round = duel.currentRound;
    const roundData = duel.rounds?.[round];
    if (!roundData) return;

    if (!this._currentDisplayedRound || this._currentDisplayedRound !== round) {
      this._currentDisplayedRound = round;
      showScreen('screen-duel-fight');

      // Scoreboard
      document.getElementById('duel-name-a').textContent = duel.players.a.name;
      document.getElementById('duel-name-b').textContent = duel.players.b?.name || '?';
      document.getElementById('duel-score-a').textContent = duel.players.a.score;
      document.getElementById('duel-score-b').textContent = duel.players.b?.score || 0;
      document.getElementById('duel-round-label').textContent = 'Round ' + round;
      document.getElementById('duel-stake-label').textContent = duel.stake.effective + ' 🪙 en jeu';

      // Question
      const q = roundData.question;
      const catNames = { calcul: '🧮 Calcul', logique: '🧩 Logique', geometrie: '📐 Géométrie', fractions: '🍕 Fractions', mesures: '📏 Mesures', ouvert: '💡 Problèmes', all: '🎯 Toutes' };
      document.getElementById('duel-category-badge').textContent = catNames[q.category] || q.category;
      document.getElementById('duel-question-text').textContent = q.text;
      document.getElementById('duel-question-unit').textContent = q.unit || '';

      // Reset UI
      document.getElementById('duel-answer-section').style.display = '';
      document.getElementById('duel-waiting-opponent').style.display = 'none';
      document.getElementById('duel-round-result').style.display = 'none';
      const input = document.getElementById('duel-answer-input');
      const isTextQ = q.textAnswer !== undefined || q.acceptedAnswers;
      input.type = isTextQ ? 'text' : 'number';
      input.inputMode = isTextQ ? 'text' : 'decimal';
      input.value = '';
      setTimeout(() => input.focus(), 100);

      this._startTimer();
    }

    // Check if both answered
    const answers = roundData.answers || {};
    if (answers.a && answers.b && !roundData.winner) {
      if (this.role === 'a') {
        this._resolveRound(duel, round, answers);
      }
    }

    // Show round result if resolved
    if (roundData.winner) {
      this._showRoundResult(duel, round, roundData);
    }
  },

  // ── Resolve Round ──

  async _resolveRound(duel, round, answers) {
    let winner = null;
    if (answers.a.correct && !answers.b.correct) {
      winner = 'a';
    } else if (!answers.a.correct && answers.b.correct) {
      winner = 'b';
    } else if (answers.a.correct && answers.b.correct) {
      winner = answers.a.time <= answers.b.time ? 'a' : 'b';
    } else {
      winner = 'none';
    }

    const updates = {};
    updates['rounds/' + round + '/winner'] = winner;

    if (winner === 'a' || winner === 'b') {
      const newScore = (duel.players[winner].score || 0) + 1;
      updates['players/' + winner + '/score'] = newScore;

      if (newScore >= 3) {
        updates['status'] = 'finished';
        updates['winner'] = winner;
      }
    }

    // If round 5 and no winner yet
    if (round >= 5 && !updates['winner']) {
      const scoreA = (duel.players.a.score || 0) + (winner === 'a' ? 1 : 0);
      const scoreB = (duel.players.b.score || 0) + (winner === 'b' ? 1 : 0);
      updates['status'] = 'finished';
      updates['winner'] = scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : 'draw';
    }

    await db.ref('duels/' + this.code).update(updates);
  },

  // ── Show Round Result ──

  _showRoundResult(duel, round, roundData) {
    this._stopTimer();
    document.getElementById('duel-answer-section').style.display = 'none';
    document.getElementById('duel-waiting-opponent').style.display = 'none';
    document.getElementById('duel-round-result').style.display = '';

    const answers = roundData.answers || {};
    const winner = roundData.winner;
    const winnerEl = document.getElementById('duel-round-winner');
    const detailEl = document.getElementById('duel-round-detail');

    // Update scores
    document.getElementById('duel-score-a').textContent = duel.players.a.score;
    document.getElementById('duel-score-b').textContent = duel.players.b?.score || 0;

    if (winner === 'none') {
      winnerEl.textContent = '💀 Personne ne marque !';
      detailEl.textContent = 'Réponse correcte : ' + roundData.question.answer;
    } else if (winner === this.role) {
      winnerEl.textContent = '✅ Tu marques le point !';
      if (answers.a?.correct && answers.b?.correct) {
        detailEl.textContent = 'Plus rapide ! (' + (answers[this.role].time / 1000).toFixed(1) + 's)';
      } else {
        detailEl.textContent = 'Bonne réponse : ' + roundData.question.answer;
      }
    } else {
      winnerEl.textContent = '❌ Point pour l\'adversaire';
      detailEl.textContent = 'Réponse correcte : ' + roundData.question.answer;
    }

    // Auto-advance after 2.5s (only player A triggers)
    if (duel.status === 'playing' && this.role === 'a') {
      setTimeout(() => {
        if (this.state && this.state.status === 'playing') {
          this._startNextRound();
        }
      }, 2500);
    }
  },

  // ── Timer ──

  _startTimer() {
    this.timerStart = Date.now();
    const fill = document.getElementById('duel-timer-fill');
    fill.style.width = '100%';
    fill.className = 'boss-timer-fill';

    this._stopTimer();
    this.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - this.timerStart) / 1000;
      const remaining = Math.max(0, 1 - elapsed / 30);
      fill.style.width = (remaining * 100) + '%';
      if (remaining < 0.25) fill.className = 'boss-timer-fill danger';
      if (elapsed >= 30) {
        this._timeout();
        this._stopTimer();
      }
    }, 100);
  },

  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  // ── Show End ──

  _showEnd(duel) {
    this._stopTimer();
    this._currentDisplayedRound = null;
    showScreen('screen-duel-end');

    const iWon = duel.winner === this.role;
    const isDraw = duel.winner === 'draw';
    const effective = duel.stake.effective;

    document.getElementById('duel-end-icon').textContent = isDraw ? '🤝' : iWon ? '🏆' : '😢';
    document.getElementById('duel-end-title').textContent = isDraw ? 'Égalité !' : iWon ? 'Victoire !' : 'Défaite...';
    document.getElementById('duel-end-score').textContent = duel.players.a.score + ' - ' + (duel.players.b?.score || 0);

    const coinsEl = document.getElementById('duel-end-coins');
    if (isDraw) {
      coinsEl.innerHTML = '<div class="reward-row"><span>Mise rendue</span><span class="reward-value">0 🪙</span></div>';
    } else if (iWon) {
      coinsEl.innerHTML = '<div class="reward-row"><span>Pièces gagnées</span><span class="reward-value" style="color:var(--accent-green)">+' + effective + ' 🪙</span></div>';
      ProfileManager.set('coins', ProfileManager.get('coins', 0) + effective);
    } else {
      coinsEl.innerHTML = '<div class="reward-row"><span>Pièces perdues</span><span class="reward-value" style="color:var(--accent-red, #ff6b6b)">-' + effective + ' 🪙</span></div>';
      ProfileManager.set('coins', Math.max(0, ProfileManager.get('coins', 0) - effective));
    }

    if (typeof updateProfileHeader === 'function') updateProfileHeader();

    // Cleanup Firebase duel after 10s
    setTimeout(() => {
      db.ref('duels/' + this.code).remove().catch(() => {});
    }, 10000);

    if (this.listener) { this.listener.off(); this.listener = null; }
  },

  // ── Cancel ──

  async cancel() {
    if (this.code) {
      await db.ref('duels/' + this.code).remove().catch(() => {});
    }
    this._cleanup();
    showScreen('screen-home');
  },

  // ── Rematch ──

  rematch() {
    const duel = this.state;
    this._cleanup();
    if (!duel) { showScreen('screen-home'); return; }
    // Always go to create screen for simplicity
    document.getElementById('duel-my-coins').textContent = ProfileManager.get('coins', 0);
    showScreen('screen-duel-create');
  },

  // ── Purge stale duels (>1h old) on app start ──

  async purgeStale() {
    try {
      const snap = await db.ref('duels').once('value');
      const duels = snap.val();
      if (!duels) return;
      const now = Date.now();
      const maxAge = 3600000; // 1 hour
      const deletes = {};
      for (const [code, d] of Object.entries(duels)) {
        if (d.createdAt && (now - d.createdAt) > maxAge) {
          deletes['duels/' + code] = null;
        }
      }
      if (Object.keys(deletes).length > 0) {
        await db.ref().update(deletes);
      }
    } catch (e) { /* silent */ }
  },

  // ── Cleanup ──

  _cleanup() {
    this._stopTimer();
    this._currentDisplayedRound = null;
    if (this.listener) { this.listener.off(); this.listener = null; }
    this.code = null;
    this.role = null;
    this.state = null;

    // Reset create screen UI
    const settingsCard = document.getElementById('duel-create-settings');
    if (settingsCard) settingsCard.style.display = '';
    const launchBtn = document.getElementById('btn-duel-launch');
    if (launchBtn) launchBtn.style.display = '';
    const waiting = document.getElementById('duel-waiting');
    if (waiting) waiting.style.display = 'none';
  },
};
