/* MathQuiz V2 — App Logic (profile-aware) */

// ── State ──────────────────────────────────────────────────────────
const state = {
  category: 'all',
  difficulty: 'medium',
  questionCount: 5,
  timerEnabled: false,
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreakThisGame: 0,
  hintUsed: false,
  answered: false,
  subLevel: 2,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  badgesUnlocked: [],
  noHintCount: 0,
  questionStartTime: 0,
  gameStartTime: 0,
  timerInterval: null,
  records: {},
  badges: [],
  categoryStats: {},
  pendingChests: [],
};

// ── Difficulty ─────────────────────────────────────────────────────
const DIFFICULTY_BASE = { easy: 1, medium: 2, hard: 3 };

function getSubLevel() {
  const base = DIFFICULTY_BASE[state.difficulty];
  return Math.max(1, Math.min(3, base + (state.subLevel - 2)));
}

// ── Profile-aware Persistence ──────────────────────────────────────
function loadProfileData() {
  state.records = ProfileManager.get('records', {});
  state.badges = ProfileManager.get('badges', []);
  state.categoryStats = ProfileManager.get('catStats', {});
}

function saveProfileData() {
  ProfileManager.set('records', state.records);
  ProfileManager.set('badges', state.badges);
  ProfileManager.set('catStats', state.categoryStats);
}

function saveGameState() {
  ProfileManager.set('gameState', {
    category: state.category,
    difficulty: state.difficulty,
    questionCount: state.questionCount,
    timerEnabled: state.timerEnabled,
    questions: state.questions,
    currentIndex: state.currentIndex,
    score: state.score,
    streak: state.streak,
    bestStreakThisGame: state.bestStreakThisGame,
    subLevel: state.subLevel,
    consecutiveCorrect: state.consecutiveCorrect,
    consecutiveWrong: state.consecutiveWrong,
    noHintCount: state.noHintCount,
    gameStartTime: state.gameStartTime,
    elapsedBeforeSave: Date.now() - state.gameStartTime,
  });
}

function clearGameState() {
  ProfileManager.set('gameState', null);
}

function loadGameState() {
  return ProfileManager.get('gameState', null);
}

// ── Screen Navigation ──────────────────────────────────────────────
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// ── Pill Selection ─────────────────────────────────────────────────
document.querySelectorAll('.pill-group').forEach(group => {
  group.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const setting = group.dataset.setting;
    const value = pill.dataset.value;

    if (setting === 'category') state.category = value;
    else if (setting === 'difficulty') state.difficulty = value;
    else if (setting === 'count') state.questionCount = parseInt(value, 10);
  });
});

// Timer toggle
document.getElementById('timer-toggle').addEventListener('change', (e) => {
  state.timerEnabled = e.target.checked;
});

// ── Profile Selection Screen ──────────────────────────────────────
function renderProfilesList() {
  const profiles = ProfileManager.getAll();
  const container = document.getElementById('profiles-list');
  if (profiles.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Aucun joueur pour le moment</p>';
    return;
  }
  container.innerHTML = profiles.map(p => {
    const xp = ProfileManager._getData(p.id, 'xp', 0);
    const rank = getRank(xp);
    return `<div class="profile-card-select" data-id="${p.id}">
      <span class="rank-icon">${rank.icon}</span>
      <div><div class="profile-name">${p.name}</div><div class="profile-rank-name">${rank.name}</div></div>
      <span class="profile-xp">${xp} XP</span>
    </div>`;
  }).join('');
  container.querySelectorAll('.profile-card-select').forEach(card => {
    card.addEventListener('click', () => selectProfile(card.dataset.id));
  });
}

// ── Profile Creation ──────────────────────────────────────────────
let selectedTheme = 'nuit';

document.getElementById('btn-new-profile').addEventListener('click', () => {
  renderThemePicker();
  document.getElementById('profile-name-input').value = '';
  showScreen('screen-create-profile');
});

document.getElementById('btn-cancel-profile').addEventListener('click', () => {
  applyTheme('nuit');
  showScreen('screen-profiles');
});

function renderThemePicker() {
  const container = document.getElementById('theme-picker');
  container.innerHTML = FREE_THEMES.map(id => {
    const t = THEMES[id];
    return `<div class="theme-option ${id === selectedTheme ? 'selected' : ''}" data-theme="${id}">
      <span class="theme-icon">${t.preview}</span>
      <span class="theme-name">${t.name}</span>
    </div>`;
  }).join('');
  container.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.theme-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedTheme = opt.dataset.theme;
      applyTheme(selectedTheme);
    });
  });
}

document.getElementById('btn-create-profile').addEventListener('click', () => {
  const name = document.getElementById('profile-name-input').value.trim();
  if (!name) return;
  const profile = ProfileManager.create(name, selectedTheme);
  selectProfile(profile.id);
});

// ── Select Profile (entry point to home) ──────────────────────────
function selectProfile(id) {
  ProfileManager.setActive(id);
  applyTheme(ProfileManager.get('activeTheme', 'nuit'));
  loadProfileData();
  updateProfileHeader();
  renderRecords();

  const savedGame = loadGameState();
  if (savedGame) {
    state.category = savedGame.category;
    state.difficulty = savedGame.difficulty;
    state.questionCount = savedGame.questionCount;
    state.timerEnabled = savedGame.timerEnabled;
    state.questions = savedGame.questions;
    state.currentIndex = savedGame.currentIndex;
    state.score = savedGame.score;
    state.streak = savedGame.streak;
    state.bestStreakThisGame = savedGame.bestStreakThisGame;
    state.subLevel = savedGame.subLevel;
    state.consecutiveCorrect = savedGame.consecutiveCorrect;
    state.consecutiveWrong = savedGame.consecutiveWrong;
    state.noHintCount = savedGame.noHintCount;
    state.gameStartTime = Date.now() - (savedGame.elapsedBeforeSave || 0);
    state.answered = false;
    state.currentIndex++;
    if (state.currentIndex >= state.questionCount) {
      showScreen('screen-home');
      clearGameState();
    } else {
      const lastCat = state.questions[state.currentIndex - 1]?.category;
      state.questions.push(generateQuestion(state.category, getSubLevel(), lastCat));
      showScreen('screen-game');
      if (state.timerEnabled) {
        document.getElementById('timer-stat').style.display = '';
        startTimer();
      } else {
        document.getElementById('timer-stat').style.display = 'none';
      }
      showQuestion();
    }
  } else {
    showScreen('screen-home');
  }
}

// ── Update Profile Header ─────────────────────────────────────────
function updateProfileHeader() {
  const profile = ProfileManager.getActive();
  if (!profile) return;
  const xp = ProfileManager.get('xp', 0);
  const coins = ProfileManager.get('coins', 0);
  const rp = getRankProgress(xp);
  document.getElementById('profile-name-display').textContent = profile.name;
  document.getElementById('profile-rank-icon').textContent = rp.current.icon;
  document.getElementById('home-coins').textContent = coins;
  document.getElementById('xp-bar').style.width = (rp.progress * 100) + '%';
  document.getElementById('xp-text').textContent = rp.next ? rp.xpInLevel + '/' + rp.xpNeeded : 'MAX';
}

// ── Records Display ────────────────────────────────────────────────
function renderRecords() {
  const container = document.getElementById('records-display');
  const keys = Object.keys(state.records);
  if (keys.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '<h3>Records</h3><div class="records-grid">';
  keys.forEach(key => {
    const rec = state.records[key];
    const label = key === 'global' ? 'Global' : (CATEGORIES[key] ? CATEGORIES[key].label : key);
    html += `<div class="record-item"><strong>${label}</strong><br>Score: ${rec.score} | Série: ${rec.streak}</div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// ── Start Game ─────────────────────────────────────────────────────
function startGame() {
  state.questions = [];
  state.currentIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreakThisGame = 0;
  state.hintUsed = false;
  state.answered = false;
  state.subLevel = 2;
  state.consecutiveCorrect = 0;
  state.consecutiveWrong = 0;
  state.badgesUnlocked = [];
  state.noHintCount = 0;
  state.gameStartTime = Date.now();

  state.questions.push(generateQuestion(state.category, getSubLevel(), null));

  showScreen('screen-game');

  if (state.timerEnabled) {
    document.getElementById('timer-stat').style.display = '';
    startTimer();
  } else {
    document.getElementById('timer-stat').style.display = 'none';
  }

  showQuestion();
}

document.getElementById('btn-play').addEventListener('click', startGame);

// ── Timer ──────────────────────────────────────────────────────────
function startTimer() {
  stopTimer();
  state.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.gameStartTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById('timer-display').textContent = m + ':' + String(s).padStart(2, '0');
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// ── Show Question ──────────────────────────────────────────────────
function showQuestion() {
  const q = state.questions[state.currentIndex];

  document.getElementById('question-counter').textContent =
    (state.currentIndex + 1) + ' / ' + state.questionCount;
  document.getElementById('score-display').textContent = state.score;

  const badge = document.getElementById('category-badge');
  const catInfo = CATEGORIES[q.category];
  badge.textContent = catInfo ? catInfo.label : q.category;
  badge.setAttribute('data-cat', q.category);

  document.getElementById('question-text').textContent = q.text;
  const unitEl = document.getElementById('question-unit');
  unitEl.textContent = q.unit ? 'Réponse en ' + q.unit : '';

  state.hintUsed = false;
  const hintBtn = document.getElementById('btn-hint');
  const freeHints = ProfileManager.get('freeHints', 0);
  hintBtn.textContent = freeHints > 0 ? "Indice (gratuit : " + freeHints + ")" : "Afficher l'indice";
  hintBtn.style.display = '';
  document.getElementById('hint-text').textContent = '';
  document.getElementById('hint-text').classList.remove('visible');

  state.answered = false;
  document.getElementById('answer-section').style.display = '';
  document.getElementById('feedback-section').style.display = 'none';

  const input = document.getElementById('answer-input');
  input.value = '';
  if (q.textAnswer !== undefined) {
    input.type = 'text';
    input.placeholder = 'Ta réponse...';
  } else {
    input.type = 'number';
    input.placeholder = 'Ta réponse...';
  }

  document.getElementById('btn-next').textContent = 'Suivant';

  state.questionStartTime = Date.now();

  const card = document.getElementById('question-card');
  card.classList.remove('slide-in');
  void card.offsetWidth;
  card.classList.add('slide-in');

  setTimeout(() => input.focus(), 100);
}

// ── Hint System (with free hints support) ─────────────────────────
document.getElementById('btn-hint').addEventListener('click', () => {
  if (state.answered) return;
  const q = state.questions[state.currentIndex];
  const freeHints = ProfileManager.get('freeHints', 0);
  if (freeHints > 0) {
    ProfileManager.set('freeHints', freeHints - 1);
    // Don't mark hintUsed — no point penalty
  } else {
    state.hintUsed = true;
  }
  document.getElementById('hint-text').textContent = q.hint;
  document.getElementById('hint-text').classList.add('visible');
  const remainingHints = freeHints > 0 ? freeHints - 1 : 0;
  document.getElementById('btn-hint').textContent = freeHints > 0 ? `Indice gratuit ! (${remainingHints} restants)` : 'Indice affiché';
});

// ── Answer Validation ──────────────────────────────────────────────
function validateAnswer() {
  if (state.answered) return;

  const q = state.questions[state.currentIndex];
  const input = document.getElementById('answer-input');
  const userAnswer = input.value.trim();

  if (userAnswer === '') return;

  state.answered = true;

  let isCorrect = false;

  if (q.textAnswer !== undefined) {
    isCorrect = userAnswer.toLowerCase() === q.textAnswer.toLowerCase();
  } else {
    const numAnswer = parseFloat(userAnswer);
    isCorrect = numAnswer === q.answer;
  }

  const elapsed = (Date.now() - state.questionStartTime) / 1000;

  if (isCorrect) {
    let points = 10;
    if (!state.hintUsed) points += 5;
    if (state.timerEnabled && elapsed < 10) points += 3;
    else if (state.timerEnabled && elapsed < 20) points += 1;
    state.score += points;

    state.streak++;
    if (state.streak > state.bestStreakThisGame) {
      state.bestStreakThisGame = state.streak;
    }

    state.consecutiveCorrect++;
    state.consecutiveWrong = 0;

    if (!state.hintUsed) state.noHintCount++;

    if (state.consecutiveCorrect >= 3) {
      state.subLevel = Math.min(3, state.subLevel + 1);
      state.consecutiveCorrect = 0;
    }
  } else {
    state.streak = 0;
    state.consecutiveWrong++;
    state.consecutiveCorrect = 0;

    if (state.consecutiveWrong >= 2) {
      state.subLevel = Math.max(1, state.subLevel - 1);
      state.consecutiveWrong = 0;
    }
  }

  if (!state.categoryStats[q.category]) {
    state.categoryStats[q.category] = { correct: 0, total: 0 };
  }
  state.categoryStats[q.category].total++;
  if (isCorrect) state.categoryStats[q.category].correct++;

  document.getElementById('score-display').textContent = state.score;
  updateStreak();

  const feedbackResult = document.getElementById('feedback-result');
  const feedbackExplanation = document.getElementById('feedback-explanation');

  if (isCorrect) {
    feedbackResult.textContent = 'Correct !';
    feedbackResult.className = 'feedback-result correct';
    launchMiniConfetti();
  } else {
    const correctAnswer = q.textAnswer !== undefined ? q.textAnswer : q.answer;
    feedbackResult.textContent = 'Incorrect — la réponse était ' + correctAnswer;
    feedbackResult.className = 'feedback-result incorrect';
    const card = document.getElementById('question-card');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 500);
  }

  feedbackExplanation.textContent = q.explanation;

  saveGameState();

  document.getElementById('answer-section').style.display = 'none';
  document.getElementById('feedback-section').style.display = '';

  if (state.currentIndex >= state.questionCount - 1) {
    document.getElementById('btn-next').textContent = 'Voir les résultats';
  }
}

document.getElementById('btn-validate').addEventListener('click', validateAnswer);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const gameScreen = document.getElementById('screen-game');
  if (!gameScreen.classList.contains('active')) return;
  if (state.answered) {
    document.getElementById('btn-next').click();
  } else {
    validateAnswer();
  }
});

// ── Streak Display ─────────────────────────────────────────────────
function updateStreak() {
  document.getElementById('streak-display').innerHTML =
    state.streak + ' <span id="streak-flame"></span>';

  const flame = document.getElementById('streak-flame');
  flame.className = '';
  if (state.streak >= 10) flame.className = 'flame-ultra';
  else if (state.streak >= 7) flame.className = 'flame-big';
  else if (state.streak >= 3) flame.className = 'flame-medium';
  else if (state.streak >= 1) flame.className = 'flame-small';
}

// ── Next Question ──────────────────────────────────────────────────
document.getElementById('btn-next').addEventListener('click', () => {
  state.currentIndex++;
  if (state.currentIndex >= state.questionCount) {
    endGame();
  } else {
    const lastCat = state.questions[state.currentIndex - 1]?.category;
    state.questions.push(generateQuestion(state.category, getSubLevel(), lastCat));
    showQuestion();
  }
});

// ── Badges System ──────────────────────────────────────────────────
const BADGE_DEFS = [
  { id: 'first_game', name: 'Première partie', icon: '\u2B50', check: () => true },
  { id: 'perfect', name: 'Sans faute', icon: '\uD83C\uDFC6', check: () => state.bestStreakThisGame >= state.questionCount },
  { id: 'on_fire', name: 'En feu !', icon: '\uD83D\uDD25', check: () => state.bestStreakThisGame >= 10 },
  { id: 'no_hints', name: 'Sans aide', icon: '\uD83E\uDDE0', check: () => state.noHintCount >= 5 },
  { id: 'speedster', name: 'Rapide', icon: '\u26A1', check: () => state.timerEnabled && (Date.now() - state.gameStartTime) < 120000 },
  { id: 'hard_mode', name: 'Mode difficile', icon: '\uD83D\uDCAA', check: () => state.difficulty === 'hard' },
  { id: 'explorer', name: 'Explorateur', icon: '\uD83C\uDF0D', check: () => Object.keys(state.categoryStats).length >= 6 },
  { id: 'master_calcul', name: 'Maître Calcul', icon: '\uD83E\uDDEE', check: () => (state.categoryStats.calcul?.correct || 0) >= 50 },
  { id: 'master_logique', name: 'Maître Logique', icon: '\uD83E\uDE84', check: () => (state.categoryStats.logique?.correct || 0) >= 50 },
  { id: 'master_geometrie', name: 'Maître Géométrie', icon: '\uD83D\uDCD0', check: () => (state.categoryStats.geometrie?.correct || 0) >= 50 },
];

function checkBadges() {
  BADGE_DEFS.forEach(def => {
    if (!state.badges.includes(def.id) && def.check()) {
      state.badges.push(def.id);
      state.badgesUnlocked.push(def);
    }
  });
}

// ── End Game ───────────────────────────────────────────────────────
function endGame() {
  stopTimer();
  clearGameState();

  const bestStreak = state.bestStreakThisGame;
  let isNewRecord = false;

  const recordKeys = state.category === 'all' ? ['global'] : [state.category, 'global'];
  recordKeys.forEach(key => {
    if (!state.records[key]) {
      state.records[key] = { score: 0, streak: 0 };
    }
    if (state.score > state.records[key].score || bestStreak > state.records[key].streak) {
      isNewRecord = true;
    }
    if (state.score > state.records[key].score) {
      state.records[key].score = state.score;
    }
    if (bestStreak > state.records[key].streak) {
      state.records[key].streak = bestStreak;
    }
  });

  checkBadges();
  saveProfileData();

  // Display final score
  const finalScore = document.getElementById('final-score');
  finalScore.textContent = state.score + ' points';
  finalScore.classList.remove('pop-in');
  void finalScore.offsetWidth;
  finalScore.classList.add('pop-in');

  // New record
  const newRecordEl = document.getElementById('new-record');
  if (isNewRecord) {
    newRecordEl.style.display = '';
    launchBigConfetti();
  } else {
    newRecordEl.style.display = 'none';
  }

  // Badges unlocked this game
  const badgesContainer = document.getElementById('badges-unlocked');
  if (state.badgesUnlocked.length > 0) {
    let html = '<h3>Badges débloqués !</h3><div class="badges-grid">';
    state.badgesUnlocked.forEach(b => {
      html += `<div class="badge-item"><span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span></div>`;
    });
    html += '</div>';
    badgesContainer.innerHTML = html;
  } else {
    badgesContainer.innerHTML = '';
  }

  // ── V2: XP, coins, chest milestones, rank-up ──
  const xpBoost = ProfileManager.get('xpBoostActive', false);
  const rewards = calculateRewards(state.score, state.difficulty, xpBoost);
  const oldXP = ProfileManager.get('xp', 0);
  const newXP = oldXP + rewards.xp;
  ProfileManager.set('xp', newXP);
  ProfileManager.set('coins', ProfileManager.get('coins', 0) + rewards.coins);
  if (xpBoost) ProfileManager.set('xpBoostActive', false);

  // Game streak for chest milestones
  let gamesPlayed = ProfileManager.get('gamesPlayed', 0) + 1;
  ProfileManager.set('gamesPlayed', gamesPlayed);
  let goodStreak = ProfileManager.get('goodGamesStreak', 0);
  const maxPossible = state.questionCount * 15;
  if (state.score >= maxPossible * 0.5) {
    goodStreak++;
  } else {
    const shields = ProfileManager.get('shields', 0);
    if (shields > 0) { ProfileManager.set('shields', shields - 1); }
    else { goodStreak = 0; }
  }
  ProfileManager.set('goodGamesStreak', goodStreak);

  // Check chests
  const chestsOpened = ProfileManager.get('chestsOpened', []);
  state.pendingChests = checkChestMilestones(gamesPlayed, newXP, chestsOpened);

  // Check rank up
  const oldRank = getRank(oldXP);
  const newRank = getRank(newXP);

  // Display rewards
  document.getElementById('xp-earned').textContent = '+' + rewards.xp + ' XP';
  document.getElementById('coins-earned').textContent = '+' + rewards.coins + ' \uD83E\uDE99';
  const rankUpEl = document.getElementById('rank-up-display');
  if (newRank.id !== oldRank.id) {
    rankUpEl.style.display = '';
    document.getElementById('rank-up-text').textContent = oldRank.icon + ' \u2192 ' + newRank.icon + ' ' + newRank.name + ' !';
    launchBigConfetti();
  } else {
    rankUpEl.style.display = 'none';
  }
  const progress = getRankProgress(newXP);
  document.getElementById('xp-bar-end-fill').style.width = (progress.progress * 100) + '%';
  document.getElementById('xp-bar-end-text').textContent = progress.next ? progress.xpInLevel + '/' + progress.xpNeeded + ' XP' : 'MAX';

  showScreen('screen-end');
}

// ── Replay / Menu ──────────────────────────────────────────────────
document.getElementById('btn-replay').addEventListener('click', () => {
  if (state.pendingChests && state.pendingChests.length > 0) {
    state.replayAfterChests = true;
    showChest(state.pendingChests.shift());
  } else {
    startGame();
  }
});

document.getElementById('btn-menu').addEventListener('click', () => {
  if (state.pendingChests && state.pendingChests.length > 0) {
    showChest(state.pendingChests.shift());
  } else {
    updateProfileHeader();
    renderRecords();
    showScreen('screen-home');
  }
});

// ── Shop Screen ────────────────────────────────────────────────────
document.getElementById('btn-shop').addEventListener('click', () => { renderShop(); showScreen('screen-shop'); });
document.getElementById('btn-shop-back').addEventListener('click', () => { updateProfileHeader(); showScreen('screen-home'); });

function renderShop() {
  const coins = ProfileManager.get('coins', 0);
  const owned = ProfileManager.get('ownedThemes', []);
  const activeTheme = ProfileManager.get('activeTheme', 'nuit');
  document.getElementById('shop-coins').textContent = coins;
  const container = document.getElementById('shop-grid');
  container.innerHTML = getThemeList().filter(t => t.price > 0).map(t => {
    const isOwned = owned.includes(t.id);
    const isActive = t.id === activeTheme;
    return `<div class="shop-item ${isOwned ? 'owned' : ''} ${isActive ? 'active-theme' : ''}" data-theme="${t.id}">
      <span class="shop-icon">${t.preview}</span>
      <span class="shop-name">${t.name}</span>
      <span class="shop-price">${isOwned ? (isActive ? '\u2713 Actif' : '\u2713 Possédé') : '\uD83E\uDE99 ' + t.price}</span>
    </div>`;
  }).join('');

  container.querySelectorAll('.shop-item').forEach(item => {
    item.addEventListener('click', () => {
      const themeId = item.dataset.theme;
      const theme = THEMES[themeId];
      const currentCoins = ProfileManager.get('coins', 0);
      const currentOwned = ProfileManager.get('ownedThemes', []);
      if (currentOwned.includes(themeId)) {
        ProfileManager.set('activeTheme', themeId);
        ProfileManager.updateMeta(ProfileManager.getActiveId(), { theme: themeId });
        applyTheme(themeId);
        renderShop();
      } else if (currentCoins >= theme.price) {
        ProfileManager.set('coins', currentCoins - theme.price);
        currentOwned.push(themeId);
        ProfileManager.set('ownedThemes', currentOwned);
        ProfileManager.set('activeTheme', themeId);
        ProfileManager.updateMeta(ProfileManager.getActiveId(), { theme: themeId });
        applyTheme(themeId);
        renderShop();
      }
    });
  });
}

// ── Chest Screen ───────────────────────────────────────────────────
function showChest(chest) {
  const owned = ProfileManager.get('ownedThemes', []);
  const loot = generateChestLoot(chest.tier, owned);
  showScreen('screen-chest');
  const box = document.getElementById('chest-box');
  const itemsContainer = document.getElementById('chest-items');
  const closeBtn = document.getElementById('btn-chest-close');
  box.className = 'chest-box';
  box.textContent = '\uD83C\uDF81';
  itemsContainer.innerHTML = '';
  closeBtn.style.display = 'none';

  box.onclick = () => {
    box.classList.add('shaking');
    setTimeout(() => {
      box.classList.remove('shaking');
      box.classList.add('opened');
      box.textContent = '\uD83C\uDF89';
      loot.forEach((item, i) => {
        applyLootItem(item);
        setTimeout(() => {
          itemsContainer.innerHTML += `<div class="chest-item" data-rarity="${item.rarity}" style="animation-delay:${i * 0.15}s">
            <span class="item-icon">${item.icon}</span>
            <div class="item-info"><div class="item-name">${item.name}</div><div class="item-desc">${item.description || ''}</div></div>
            <span class="item-rarity">${item.rarity}</span>
          </div>`;
        }, 300 + i * 400);
      });
      setTimeout(() => { closeBtn.style.display = ''; }, 300 + loot.length * 400 + 200);
      const co = ProfileManager.get('chestsOpened', []);
      co.push(chest.id);
      ProfileManager.set('chestsOpened', co);
    }, 800);
  };
}

document.getElementById('btn-chest-close').addEventListener('click', () => {
  if (state.pendingChests && state.pendingChests.length > 0) {
    showChest(state.pendingChests.shift());
  } else if (state.replayAfterChests) {
    state.replayAfterChests = false;
    updateProfileHeader();
    startGame();
  } else {
    updateProfileHeader();
    renderRecords();
    showScreen('screen-home');
  }
});

// ── Profile Detail Screen ─────────────────────────────────────────
document.getElementById('btn-profile-detail').addEventListener('click', () => { renderProfileDetail(); showScreen('screen-profile-detail'); });
document.getElementById('btn-profile-back').addEventListener('click', () => { showScreen('screen-home'); });

function renderProfileDetail() {
  const profile = ProfileManager.getActive();
  const xp = ProfileManager.get('xp', 0);
  const coins = ProfileManager.get('coins', 0);
  const gamesPlayed = ProfileManager.get('gamesPlayed', 0);
  const rp = getRankProgress(xp);
  const badges = ProfileManager.get('badges', []);

  document.getElementById('profile-card').innerHTML = `
    <span class="rank-icon">${rp.current.icon}</span>
    <span class="profile-name">${profile.name}</span>
    <span class="rank-name">${rp.current.name}</span>
    <div class="xp-bar-container" style="width:100%;height:12px">
      <div class="xp-bar" style="width:${rp.progress * 100}%"></div>
      <span class="xp-text" style="top:-18px">${rp.next ? rp.xpInLevel + '/' + rp.xpNeeded + ' XP' : 'MAX'}</span>
    </div>
    <div class="stat-grid">
      <div class="stat-box"><span class="stat-value">${xp}</span><span class="stat-label">XP</span></div>
      <div class="stat-box"><span class="stat-value">\uD83E\uDE99 ${coins}</span><span class="stat-label">Pièces</span></div>
      <div class="stat-box"><span class="stat-value">${gamesPlayed}</span><span class="stat-label">Parties</span></div>
    </div>`;

  const allBadges = [...BADGE_DEFS, {id:'collector',name:'Collectionneur',icon:'\uD83C\uDFC5'}, {id:'lucky',name:'Chanceux',icon:'\uD83C\uDF40'}];
  document.getElementById('profile-badges-list').innerHTML = '<h3>Badges</h3><div class="badges-grid">' +
    allBadges.map(b => {
      const unlocked = badges.includes(b.id);
      return `<div class="badge-item" style="${unlocked ? '' : 'opacity:0.3;filter:grayscale(1)'}">
        <span class="badge-icon">${b.icon}</span><span class="badge-name">${unlocked ? b.name : '???'}</span>
      </div>`;
    }).join('') + '</div>';
}

document.getElementById('btn-delete-profile').addEventListener('click', () => {
  const profile = ProfileManager.getActive();
  if (confirm('Supprimer le profil de ' + profile.name + ' ? Toute sa progression sera perdue.')) {
    ProfileManager.delete(profile.id);
    applyTheme('nuit');
    renderProfilesList();
    showScreen('screen-profiles');
  }
});

// ── Confetti System ────────────────────────────────────────────────
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#FFEB3B', '#00BCD4'];

function createParticle(x, y, vx, vy) {
  return {
    x, y, vx, vy,
    size: Math.random() * 6 + 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
    life: 1,
  };
}

function launchMiniConfetti() {
  const particles = [];
  const cx = confettiCanvas.width / 2;
  const cy = confettiCanvas.height / 2;
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    particles.push(createParticle(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed));
  }
  animateConfetti(particles);
}

function launchBigConfetti() {
  const particles = [];
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * confettiCanvas.width;
    const y = -10 - Math.random() * 50;
    const vx = (Math.random() - 0.5) * 4;
    const vy = Math.random() * 2 + 1;
    particles.push(createParticle(x, y, vx, vy));
  }
  animateConfetti(particles);
}

function animateConfetti(particles) {
  function frame() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let alive = false;
    particles.forEach(p => {
      if (p.life <= 0) return;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.rotation += p.rotSpeed;
      p.life -= 0.015;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.life);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    });

    if (alive) {
      requestAnimationFrame(frame);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  requestAnimationFrame(frame);
}

// ── Init ───────────────────────────────────────────────────────────
const activeId = ProfileManager.getActiveId();
if (activeId && ProfileManager.getActive()) {
  selectProfile(activeId);
} else {
  renderProfilesList();
  showScreen('screen-profiles');
}
