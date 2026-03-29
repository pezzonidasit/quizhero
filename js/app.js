/* QuizHero V2 — App Logic (profile-aware) */

const APP_VERSION = '7.4.5';

// ── Theme Helpers ───────────────────────────────────────────────
function isCatTheme() {
  return document.body.classList.contains('theme-pattern-paws');
}
function isOnePieceTheme() {
  return document.body.classList.contains('theme-pattern-onepiece');
}
function isSplatoonTheme() {
  return document.body.classList.contains('theme-pattern-splatoon');
}
function isDBZTheme() {
  return document.body.classList.contains('theme-pattern-dbz');
}

// ── Theme Migration (old activeTheme → split palette/visual) ────
function migrateThemeData() {
  if (ProfileManager.get('_themeMigrated')) return;

  const oldTheme = ProfileManager.get('activeTheme', 'nuit');
  if (VISUAL_IDS.has(oldTheme)) {
    ProfileManager.set('activeVisual', oldTheme);
    ProfileManager.set('activePalette', 'none');
  } else if (PALETTE_IDS.has(oldTheme)) {
    ProfileManager.set('activePalette', oldTheme);
    ProfileManager.set('activeVisual', 'none');
  } else {
    ProfileManager.set('activePalette', 'none');
    ProfileManager.set('activeVisual', 'none');
  }

  const oldOwned = ProfileManager.get('ownedThemes', []);
  const ownedPalettes = oldOwned.filter(id => PALETTE_IDS.has(id));
  const ownedVisuals = oldOwned.filter(id => VISUAL_IDS.has(id));
  ProfileManager.set('ownedPalettes', ownedPalettes);
  ProfileManager.set('ownedVisuals', ownedVisuals);

  ProfileManager.set('_themeMigrated', true);
}

// ── HTML Sanitization ────────────────────────────────────────────
const _escapeDiv = document.createElement('div');
function escapeHtml(str) {
  _escapeDiv.textContent = str || '';
  return _escapeDiv.innerHTML;
}

// V4: No PIN gate — app opens directly
initApp();

function initApp() {

// ── Performance: detect slow devices ────────────────────────────
(function detectSlowDevice() {
  // Quick GPU benchmark: measure a rAF round-trip
  const start = performance.now();
  requestAnimationFrame(() => {
    const elapsed = performance.now() - start;
    // If a single frame takes > 50ms or device has ≤ 4 logical cores, enable low-perf mode
    const slowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    if (elapsed > 50 || slowCPU) {
      document.body.classList.add('low-perf-mode');
      console.log('[QuizHero] Low-perf mode enabled (frame: ' + Math.round(elapsed) + 'ms, cores: ' + (navigator.hardwareConcurrency || '?') + ')');
    }
  });
})();

// ── Session start time (V5: session limit nudge) ─────────────────
const sessionStartTime = Date.now();

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
  activeBoost: null,
  shieldActive: false,
  coinRainActive: false,
  // V3 — Boss Fight
  bossState: null,
  pendingBoss: null,
  gamesSinceBoss: 0,
  // V3 — Contrat
  activeContract: null,
  contractGameResult: null,
  // V8a — Adventure Mode
  adventureMode: false,
  adventureExpResult: null,
  adventureBossQuestions: [],
  adventureBossQIndex: 0,
  // Fiches d'aide
  timerPaused: false,
  timerPausedAt: null,
  ficheReturnScreen: 'screen-game',
  // Révisions
  revisionMode: false,
  revisionSetId: null,
  revisionQuestions: [],
  xpMultiplier: 1,
};

// ── Difficulty ─────────────────────────────────────────────────────
const DIFFICULTY_BASE = { easy: 1, medium: 2, hard: 3 };

function getSubLevel(category) {
  const catLevel = ProfileManager.get('catLevel', null);
  if (!catLevel) return 2;
  // If no specific category (e.g. 'all' mode), return the full map
  // so generateQuestion can resolve per-category after picking
  if (!category) return catLevel;
  return Math.max(1, Math.min(3, catLevel[category] || 2));
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
    questionCount: state.questionCount,
    timerEnabled: state.timerEnabled,
    questions: state.questions,
    currentIndex: state.currentIndex + 1,
    score: state.score,
    streak: state.streak,
    bestStreakThisGame: state.bestStreakThisGame,
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

// ── Boss Persistence ──────────────────────────────────────────────────
function loadBossState() {
  state.pendingBoss = ProfileManager.get('pendingBoss', null);
  state.gamesSinceBoss = ProfileManager.get('gamesSinceBoss', 0);
  if (state.pendingBoss) {
    const full = BOSS_POOL.find(b => b.id === state.pendingBoss.id);
    if (full) state.pendingBoss = full;
    else state.pendingBoss = null;
  }
}

function saveBossState() {
  ProfileManager.set('pendingBoss', state.pendingBoss ? { id: state.pendingBoss.id } : null);
  ProfileManager.set('gamesSinceBoss', state.gamesSinceBoss);
}

// ── Screen Navigation ──────────────────────────────────────────────
// ── Navigation history (browser back button support) ────────────
const screenHistory = [];

function showScreen(screenId, opts) {
  const replace = opts && opts.replace;
  const fromPop = opts && opts.fromPop;
  const current = document.querySelector('.screen.active');
  const currentId = current ? current.id : null;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  // Push to browser history so back button works
  if (!fromPop) {
    if (replace) {
      history.replaceState({ screen: screenId }, '');
    } else {
      if (currentId && currentId !== screenId) {
        screenHistory.push(currentId);
      }
      history.pushState({ screen: screenId }, '');
    }
  }
}

// Map screens to their "back" destination
const screenBackMap = {
  'screen-home': 'screen-profiles',
  'screen-game': 'screen-home',
  'screen-end': 'screen-home',
  'screen-shop': 'screen-home',
  'screen-chest': 'screen-home',
  'screen-profile-detail': 'screen-home',
  'screen-boss-appear': 'screen-home',
  'screen-boss-fight': 'screen-home',
  'screen-boss-end': 'screen-home',
  'screen-leaderboard': 'screen-home',
  'screen-contract': 'screen-home',
  'screen-revisions': 'screen-home',
  'screen-groups': 'screen-home',
  'screen-group-detail': 'screen-groups',
  'screen-group-dashboard': 'screen-group-detail',
  'screen-create-profile': 'screen-profiles',
  'screen-duel-create': 'screen-home',
  'screen-duel-join': 'screen-home',
  'screen-duel-fight': 'screen-home',
  'screen-duel-end': 'screen-home',
  'screen-adventure-map': 'screen-home',
  'screen-adventure-zone': 'screen-adventure-map',
  'screen-adventure-boss': 'screen-adventure-zone',
  'screen-adventure-boss-end': 'screen-adventure-zone',
};

window.addEventListener('popstate', (e) => {
  // Block back-navigation from home when a profile is active — home IS the root screen
  const current = document.querySelector('.screen.active');
  if (current && current.id === 'screen-home' && ProfileManager.getActiveId()) {
    history.pushState({ screen: 'screen-home' }, '');
    return;
  }

  if (e.state && e.state.screen) {
    showScreen(e.state.screen, { fromPop: true });
  } else if (screenHistory.length > 0) {
    const prev = screenHistory.pop();
    showScreen(prev, { fromPop: true });
  } else {
    // Fallback: use the back map based on current screen
    if (current && screenBackMap[current.id]) {
      showScreen(screenBackMap[current.id], { fromPop: true });
    }
  }
});

// Initialize history state
history.replaceState({ screen: 'screen-profiles' }, '');

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
    else if (setting === 'age') selectedAge = parseInt(value, 10);
    else if (setting === 'count') state.questionCount = parseInt(value, 10);
    updateSettingsSummary();
  });
});

// Timer toggle
document.getElementById('timer-toggle').addEventListener('change', (e) => {
  state.timerEnabled = e.target.checked;
});

function updateSettingsSummary() {
  const catLabels = { all: '🎯 Toutes', calcul: '🧮 Calcul', logique: '🧩 Logique', geometrie: '📐 Géométrie', fractions: '🍕 Fractions', mesures: '📏 Mesures', ouvert: '💡 Problèmes', geographie: '🌍 Géographie', conjugaison: '✏️ Conjugaison' };
  const el = document.getElementById('settings-summary-text');
  if (el) el.textContent = (catLabels[state.category] || 'Toutes') + ' · #' + state.questionCount;
  renderCatLevelIndicators();
}

function renderCatLevelIndicators() {
  const catLevel = ProfileManager.get('catLevel', {});
  document.querySelectorAll('[data-setting="category"] .pill').forEach(pill => {
    const cat = pill.dataset.value;
    if (cat === 'all') return;
    const existing = pill.querySelector('.cat-level');
    if (existing) existing.remove();
    const level = catLevel[cat] || 2;
    const span = document.createElement('span');
    span.className = 'cat-level';
    span.textContent = '⭐'.repeat(level);
    pill.appendChild(span);
  });
}

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
      <div><div class="profile-name">${escapeHtml(p.name)}</div><div class="profile-rank-name">${rank.name}</div></div>
      <span class="profile-xp">${xp} XP</span>
    </div>`;
  }).join('');
  container.querySelectorAll('.profile-card-select').forEach(card => {
    card.addEventListener('click', () => selectProfile(card.dataset.id));
  });
}

// ── Profile Creation ──────────────────────────────────────────────
let selectedTheme = 'nuit';
let selectedAge = 10;

document.getElementById('btn-new-profile').addEventListener('click', () => {
  // Guard: confirm if profiles already exist to prevent accidental creation
  const existing = ProfileManager.getAll();
  if (existing.length > 0) {
    if (!confirm('Tu as déjà ' + existing.length + ' profil(s). Créer un nouveau joueur ?')) return;
  }
  renderThemePicker();
  document.getElementById('profile-name-input').value = '';
  selectedAge = 10;
  document.querySelectorAll('[data-setting="age"] .pill').forEach(p => {
    p.classList.toggle('active', p.dataset.value === '10');
  });
  showScreen('screen-create-profile');
});

document.getElementById('btn-cancel-profile').addEventListener('click', () => {
  applyThemeCombo('none', 'none');
  showScreen('screen-profiles');
});

document.getElementById('btn-recover-profile').addEventListener('click', async () => {
  const code = prompt('Entre ton code de récupération (ex: LIAM-4829) :');
  if (!code) return;
  try {
    if (!firebaseUid) await firebaseSignIn();
    const profile = await restoreFromCode(code);
    if (profile._migrationFailed) {
      alert('Profil de ' + profile.name + ' restauré, mais les groupes n\'ont pas pu être transférés. Rejoins-les à nouveau.');
    } else {
      alert('Profil de ' + profile.name + ' restauré !');
    }
    selectProfile(profile.id);
  } catch(e) {
    alert('Erreur : ' + e.message);
  }
});

function renderThemePicker() {
  const container = document.getElementById('theme-picker');
  container.innerHTML = FREE_PALETTES.map(id => {
    const p = PALETTES[id];
    return `<div class="theme-option ${id === selectedTheme ? 'selected' : ''}" data-theme="${id}">
      <span class="theme-icon">${p.preview}</span>
      <span class="theme-name">${p.name}</span>
    </div>`;
  }).join('');
  container.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.theme-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedTheme = opt.dataset.theme;
      applyPalette(selectedTheme);
    });
  });
}

document.getElementById('btn-create-profile').addEventListener('click', () => {
  const name = document.getElementById('profile-name-input').value.trim();
  if (!name) return;
  const profile = ProfileManager.create(name, selectedTheme, selectedAge);
  selectProfile(profile.id);

  // V4: Sign in to Firebase on first profile creation
  if (!firebaseUid) {
    firebaseSignIn().then(() => {
      MQSync._pushAll().catch(() => {});
      _consumePendingJoin();
      Duel.purgeStale();
    }).catch(() => {});
  } else {
    MQSync._pushAll().catch(() => {});
    _consumePendingJoin();
  }

  // V4: Generate and save recovery code
  if (typeof generateRecoveryCode === 'function') {
    const code = generateRecoveryCode(name);
    ProfileManager._setData(profile.id, 'recoveryCode', code);
    saveRecoveryCode(code).catch(() => {});
  }
});

// ── Select Profile (entry point to home) ──────────────────────────
function selectProfile(id) {
  ProfileManager.setActive(id);
  ProfileManager.migrate(id);
  migrateThemeData();
  applyThemeCombo(
    ProfileManager.get('activePalette', 'none'),
    ProfileManager.get('activeVisual', 'none')
  );
  loadProfileData();
  loadBossState();
  updateProfileHeader();
  renderRecords();

  const savedGame = loadGameState();
  if (savedGame) {
    state.category = savedGame.category;
    state.questionCount = savedGame.questionCount;
    state.timerEnabled = savedGame.timerEnabled;
    state.questions = savedGame.questions;
    state.currentIndex = savedGame.currentIndex;
    state.score = savedGame.score;
    state.streak = savedGame.streak;
    state.bestStreakThisGame = savedGame.bestStreakThisGame;
    state.consecutiveCorrect = savedGame.consecutiveCorrect;
    state.consecutiveWrong = savedGame.consecutiveWrong;
    state.noHintCount = savedGame.noHintCount;
    state.gameStartTime = Date.now() - (savedGame.elapsedBeforeSave || 0);
    state.answered = false;
    // Don't increment - saveGameState already saved the next index
    if (state.currentIndex >= state.questionCount) {
      showScreen('screen-home');
      clearGameState();
    } else {
      const lastCat = state.questions[state.currentIndex - 1]?.category;
      state.questions.push(generateQuestion(state.category, getSubLevel(lastCat || state.category), lastCat));
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
    renderBossWaitingIcon();
    MQSync.checkWeeklyReset();
    renderRegularityStreak();
    checkLoginReward();
    if (typeof checkInboxOnLaunch === 'function') checkInboxOnLaunch();
    _consumePendingJoin();
  }
}

// ── V5: Weekly Ceremony ──────────────────────────────────────────
function checkWeeklyCeremony() {
  if (!ProfileManager.get('showWeeklyCeremony', false)) return;
  const stats = ProfileManager.get('lastWeekStats', null);
  if (!stats) { ProfileManager.set('showWeeklyCeremony', false); return; }

  const grid = document.getElementById('weekly-ceremony-stats');
  grid.innerHTML =
    '<div class="weekly-stat"><span class="weekly-stat-value">' + stats.xp + '</span><span class="weekly-stat-label">XP gagnés</span></div>' +
    '<div class="weekly-stat"><span class="weekly-stat-value">' + stats.games + '</span><span class="weekly-stat-label">Parties jouées</span></div>';

  document.getElementById('weekly-ceremony-overlay').style.display = 'flex';
  if (typeof launchBigConfetti === 'function') launchBigConfetti();

  document.getElementById('btn-close-ceremony').onclick = () => {
    ProfileManager.set('showWeeklyCeremony', false);
    document.getElementById('weekly-ceremony-overlay').style.display = 'none';
  };
}

// ── V5: Daily Login Reward ──────────────────────────────────────────
const LOGIN_REWARDS = [15, 20, 25, 30, 35, 40, 0]; // Day 7 = chest

function checkLoginReward() {
  const today = new Date().toISOString().slice(0, 10);
  const lastLogin = ProfileManager.get('lastLoginDate', '');
  if (lastLogin === today) { checkWeeklyCeremony(); return; }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let loginStreak = ProfileManager.get('loginStreak', 0);
  if (lastLogin === yesterday) {
    loginStreak = Math.min(loginStreak + 1, 6);
  } else if (lastLogin !== today) {
    loginStreak = 0;
  }

  const dayReward = LOGIN_REWARDS[loginStreak];
  const isChestDay = loginStreak === 6;

  const dotsEl = document.getElementById('login-reward-streak');
  let dotsHtml = '';
  for (let i = 0; i < 7; i++) {
    const cls = i < loginStreak ? 'claimed' : i === loginStreak ? 'today' : 'future';
    const label = i === 6 ? '🎁' : 'J' + (i + 1);
    dotsHtml += '<div class="login-dot ' + cls + '">' + label + '</div>';
  }
  dotsEl.innerHTML = dotsHtml;

  const amountEl = document.getElementById('login-reward-amount');
  if (isChestDay) {
    amountEl.innerHTML = '🎁 Coffre bonus !';
  } else {
    amountEl.innerHTML = '+' + dayReward + ' 🪙';
  }

  document.getElementById('login-reward-overlay').style.display = 'flex';

  document.getElementById('btn-claim-login').onclick = () => {
    if (isChestDay) {
      const loot = generateChestLoot('small', ProfileManager.get('ownedPalettes', []), ProfileManager.get('ownedVisuals', []));
      loot.forEach(item => applyLootItem(item));
      recordChestOpened();
    } else {
      ProfileManager.set('coins', ProfileManager.get('coins', 0) + dayReward);
    }
    ProfileManager.set('lastLoginDate', today);
    ProfileManager.set('loginStreak', loginStreak);
    document.getElementById('login-reward-overlay').style.display = 'none';
    updateProfileHeader();
    checkWeeklyCeremony();
  };
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

  // Render next goals widget
  renderNextGoals();
  // Render boost selector
  renderBoostSelector();
  // V8: Settings summary
  updateSettingsSummary();
  const versionEl = document.getElementById('app-version-display');
  if (versionEl) versionEl.textContent = 'v' + APP_VERSION;
  // V8: Pet + Daily Question
  renderPetZone();
  checkDailyQuestion();
  renderDailyQuests();

  // V4: Admin button only visible for admins (set manually in Firebase)
  const adminBtn = document.getElementById('btn-admin');
  if (adminBtn) {
    checkIsGlobalAdmin().then(isAdmin => {
      adminBtn.style.display = isAdmin ? '' : 'none';
    }).catch(() => { adminBtn.style.display = 'none'; });
  }

  // V4: Show group prompt if not in any group
  let noGroupBanner = document.getElementById('no-group-banner');
  if (!noGroupBanner) {
    noGroupBanner = document.createElement('div');
    noGroupBanner.id = 'no-group-banner';
    noGroupBanner.className = 'no-group-banner';
    const playBtnWrapper = document.getElementById('btn-play').parentNode;
    playBtnWrapper.parentNode.insertBefore(noGroupBanner, playBtnWrapper);
  }

  getMyGroups().then(groups => {
    if (groups.length === 0) {
      // Admin can create, others can only join
      checkIsGlobalAdmin().then(isAdmin => {
        let html = '<p>👥 Rejoins un groupe pour commencer à jouer !</p>' +
          '<button class="btn-primary" onclick="renderGroupsScreen(&quot;screen-home&quot;)" style="font-size:0.85rem">Rejoindre un groupe</button>';
        if (isAdmin) {
          html += '<br><button class="btn-secondary" onclick="quickCreateGroup()" style="font-size:0.85rem;margin-top:0.5rem">Créer un groupe (admin)</button>';
        }
        noGroupBanner.innerHTML = html;
      }).catch(() => {
        noGroupBanner.innerHTML = '<p>👥 Rejoins un groupe pour commencer à jouer !</p>' +
          '<button class="btn-primary" onclick="renderGroupsScreen(&quot;screen-home&quot;)" style="font-size:0.85rem">Rejoindre un groupe</button>';
      });
      noGroupBanner.style.display = '';
      document.getElementById('btn-play').parentNode.style.display = 'none';
    } else {
      noGroupBanner.style.display = 'none';
      document.getElementById('btn-play').parentNode.style.display = '';
    }
  }).catch(() => {
    // Offline — allow play
    noGroupBanner.style.display = 'none';
    document.getElementById('btn-play').parentNode.style.display = '';
  });
}

function renderBoostSelector() {
  const container = document.getElementById('boost-selector');
  if (!container) return;
  const boosts = ProfileManager.get('boosts', {});
  const hasBoosts = Object.values(boosts).some(v => v > 0);

  if (!hasBoosts) {
    container.innerHTML = '<div class="boost-hint">⚡ Boosts disponibles en boutique</div>';
    state.activeBoost = null;
    return;
  }

  let html = '<div class="boost-bar">';
  html += '<span class="boost-label">Boost :</span>';
  html += `<button class="boost-chip ${!state.activeBoost ? 'active' : ''}" data-boost="">Aucun</button>`;
  BOOSTS.forEach(b => {
    const count = boosts[b.id] || 0;
    if (count > 0) {
      html += `<button class="boost-chip ${state.activeBoost === b.id ? 'active' : ''}" data-boost="${b.id}">${b.icon} ${b.name} ×${count}</button>`;
    }
  });
  html += '</div>';

  // Show difficulty warning
  if (state.activeBoost) {
    const catLevel = ProfileManager.get('catLevel', {});
    const currentLevel = state.category !== 'all' ? (catLevel[state.category] || 2) : 2;
    const mult = getBoostMultiplier(currentLevel);
    const pctLabel = mult === 0.75 ? '75%' : mult === 1.5 ? '×1.5' : '100%';
    const levelLabel = currentLevel === 1 ? 'Débutant' : currentLevel === 3 ? 'Avancé' : 'Normal';
    html += `<div class="boost-warning">⚠️ Effet ${pctLabel} en ${levelLabel} — perdu si pas 100% correct !</div>`;
  }

  container.innerHTML = html;

  container.querySelectorAll('.boost-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.activeBoost = chip.dataset.boost || null;
      renderBoostSelector();
    });
  });
}

function renderNextGoals() {
  let container = document.getElementById('next-goals');
  if (!container) {
    // Create container after records display (bottom of home)
    container = document.createElement('div');
    container.id = 'next-goals';
    container.className = 'next-goals';
    const records = document.getElementById('records-display');
    if (records) records.parentNode.insertBefore(container, records);
    else {
      const header = document.getElementById('profile-header');
      header.parentNode.insertBefore(container, header.nextSibling);
    }
  }

  // Find the 3 closest unfinished badges with progress
  const upcoming = BADGE_DEFS
    .filter(b => !state.badges.includes(b.id) && !b.hidden && !b.reallife && b.progress)
    .map(b => {
      const p = b.progress();
      return { ...b, cur: p.cur, max: p.max, pct: p.cur / p.max };
    })
    .filter(b => b.pct < 1 && b.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  if (upcoming.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '<h3>🎯 Prochains objectifs</h3>' +
    upcoming.map(b => `
      <div class="goal-row">
        <span class="goal-icon">${b.icon}</span>
        <div class="goal-info">
          <div class="goal-name">${b.name}</div>
          <div class="goal-bar-container">
            <div class="goal-bar" style="width:${Math.round(b.pct * 100)}%"></div>
          </div>
          <div class="goal-text">${b.cur} / ${b.max}</div>
        </div>
      </div>
    `).join('');
}

// ── V5: Regularity Streak ──────────────────────────────────────────
function renderRegularityStreak() {
  const container = document.getElementById('regularity-streak');
  if (!container) return;
  if (!ProfileManager.getActiveId()) { container.innerHTML = ''; return; }

  const daysPlayed = ProfileManager.get('daysPlayedThisWeek', []);
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const now = new Date();
  const currentDay = now.getDay();

  const weekStart = new Date(now);
  const diff = currentDay === 0 ? -6 : 1 - currentDay;
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  let html = '<div class="regularity-header">📅 Cette semaine</div><div class="regularity-dots">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const played = daysPlayed.includes(dateStr);
    const isToday = dateStr === now.toISOString().slice(0, 10);
    const isFuture = d > now && !isToday;
    let cls = 'reg-dot';
    if (played) cls += ' played';
    else if (isToday) cls += ' today';
    else if (isFuture) cls += ' future';
    else cls += ' missed';
    html += '<div class="' + cls + '"><span class="reg-label">' + dayLabels[i] + '</span></div>';
  }
  html += '</div>';
  const count = daysPlayed.length;
  if (count >= 5) {
    html += '<div class="regularity-msg">🔥 Super régulier cette semaine !</div>';
  } else if (count >= 3) {
    html += '<div class="regularity-msg">👍 Bon rythme, continue !</div>';
  }
  container.innerHTML = html;
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
  state.consecutiveCorrect = 0;
  state.consecutiveWrong = 0;
  state.badgesUnlocked = [];
  state.noHintCount = 0;
  state.streakLostMessage = null;
  state.timerPaused = false;
  state.timerPausedAt = null;
  state.ficheReturnScreen = 'screen-game';
  state.gameStartTime = Date.now();
  // Reset adventure mode unless explicitly set before calling startGame
  if (!state.adventureMode) {
    state.adventureExpResult = null;
  }

  // Consume active boost from inventory
  if (state.activeBoost) {
    const inv = ProfileManager.get('boosts', {});
    if (inv[state.activeBoost] > 0) {
      inv[state.activeBoost]--;
      ProfileManager.set('boosts', inv);
    } else {
      state.activeBoost = null;
    }
  }

  // hint_pack boost: add free hints immediately
  if (state.activeBoost === 'hint_pack') {
    const current = ProfileManager.get('freeHints', 0);
    const catLevel = ProfileManager.get('catLevel', {});
    const currentLevel = state.category !== 'all' ? (catLevel[state.category] || 2) : 2;
    const hintsToAdd = currentLevel === 3 ? 6 : 3;
    ProfileManager.set('freeHints', current + hintsToAdd);
  }

  // streak_shield boost: activate shield for this game
  state.shieldActive = (state.activeBoost === 'streak_shield');

  // coin_rain boost: flag to bypass diminishing returns
  state.coinRainActive = (state.activeBoost === 'coin_rain');

  const firstCat = state.category === 'all' ? null : state.category;
  state.questions.push(generateQuestion(state.category, getSubLevel(firstCat), null));

  showScreen('screen-game');

  // Daily quest: try_new_cat
  if (state.category !== 'all') {
    const todayPlayed = ProfileManager.get('dailyCatsPlayed', { date: '', cats: [] });
    const today = getTodayStr();
    if (todayPlayed.date !== today) {
      todayPlayed.date = today;
      todayPlayed.cats = [state.category];
      ProfileManager.set('dailyCatsPlayed', todayPlayed);
      updateQuestProgress('try_new_cat', 1);
    } else if (!todayPlayed.cats.includes(state.category)) {
      todayPlayed.cats.push(state.category);
      ProfileManager.set('dailyCatsPlayed', todayPlayed);
      updateQuestProgress('try_new_cat', 1);
    }
  }

  if (state.timerEnabled) {
    document.getElementById('timer-stat').style.display = '';
    startTimer();
  } else {
    document.getElementById('timer-stat').style.display = 'none';
  }

  showQuestion();
}

document.getElementById('btn-play').addEventListener('click', async () => {
  // V4: Must be in a group to play
  let groups = [];
  try { groups = await getMyGroups(); } catch(e) {}
  if (groups.length === 0) {
    alert('Rejoins un groupe pour jouer ! Va dans ton profil → Mes Groupes.');
    return;
  }
  showContractScreen();
});

// ── Révisions ─────────────────────────────────────────────────────────

/** Check if player has active revision sets and show/hide button */
async function checkRevisionSets() {
  const btn = document.getElementById('btn-revisions');
  const badge = document.getElementById('revisions-badge');
  if (!btn) return;
  try {
    const sets = await getActiveRevisionSets();
    if (sets.length > 0) {
      btn.style.display = '';
      let newCount = 0;
      for (const s of sets) {
        const score = await getRevisionScore(s.id);
        if (!score) newCount++;
      }
      badge.textContent = newCount > 0 ? newCount : '';
      localStorage.setItem('mq_revision_sets_cache', JSON.stringify(sets));
    } else {
      btn.style.display = 'none';
    }
  } catch(e) {
    const cached = localStorage.getItem('mq_revision_sets_cache');
    if (cached && JSON.parse(cached).length > 0) {
      btn.style.display = '';
    } else {
      btn.style.display = 'none';
    }
  }
}

/** Show revision list screen */
async function showRevisionsList() {
  showScreen('screen-revisions');
  const list = document.getElementById('revisions-list');
  const emptyMsg = document.getElementById('revisions-empty');
  list.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Chargement...</p>';

  try {
    const sets = await getActiveRevisionSets();
    if (sets.length === 0) {
      list.innerHTML = '';
      emptyMsg.style.display = '';
      return;
    }
    emptyMsg.style.display = 'none';

    let html = '';
    for (const s of sets) {
      const score = await getRevisionScore(s.id);
      const subjectIcon = s.subject === 'allemand' ? '🇩🇪' : '📖';
      const inCooldown = score && score.cooldownUntil && Date.now() < score.cooldownUntil;
      const cooldownClass = inCooldown ? ' cooldown' : '';

      const metaText = s.questionCount + ' questions';
      let scoreText = '';
      let cooldownText = '';

      if (score) {
        scoreText = score.bestPct + '%';
        if (inCooldown) {
          const remaining = Math.ceil((score.cooldownUntil - Date.now()) / 60000);
          cooldownText = '⏳ ' + (remaining >= 60 ? Math.floor(remaining / 60) + 'h' + (remaining % 60 > 0 ? String(remaining % 60).padStart(2, '0') : '') : remaining + 'min');
        }
      }

      html += '<div class="revision-card' + cooldownClass + '" data-set-id="' + s.id + '">'
        + '<span class="revision-card-icon">' + subjectIcon + '</span>'
        + '<div class="revision-card-info">'
        + '<div class="revision-card-title">' + escapeHtml(s.title) + '</div>'
        + '<div class="revision-card-meta">' + metaText + '</div>'
        + (cooldownText ? '<div class="revision-card-cooldown">' + cooldownText + '</div>' : '')
        + '</div>'
        + (scoreText ? '<div class="revision-card-score">' + scoreText + '</div>' : '')
        + '</div>';
    }
    list.innerHTML = html;

    list.querySelectorAll('.revision-card:not(.cooldown)').forEach(card => {
      card.addEventListener('click', () => startRevisionGame(card.dataset.setId));
    });
  } catch(e) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Erreur de chargement. Vérifie ta connexion.</p>';
  }
}

/** Start a revision quiz from a set */
async function startRevisionGame(setId) {
  const questions = await getRevisionQuestions(setId);
  if (questions.length === 0) {
    alert('Ce set est vide.');
    return;
  }

  // Load context as a temporary fiche if available
  const setSnap = await firebase.database().ref('revisionSets/' + setId + '/context').once('value');
  const context = setSnap.val();
  if (context && window.FICHES) {
    window.FICHES['_rev_' + setId] = {
      titre: context.titre || 'Aide — Révision',
      intro: context.intro || '',
      regle: context.regle || '',
      exemples: context.exemples || [],
      astuce: context.astuce || ''
    };
  }

  shuffleArray(questions);

  state.revisionMode = true;
  state.revisionSetId = setId;
  state.revisionQuestions = questions;
  state.xpMultiplier = 2;
  state.questionCount = questions.length;
  state.category = 'revision';

  state.questions = [];
  state.currentIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreakThisGame = 0;
  state.hintUsed = false;
  state.answered = false;
  state.consecutiveCorrect = 0;
  state.consecutiveWrong = 0;
  state.badgesUnlocked = [];
  state.noHintCount = 0;
  state.streakLostMessage = null;
  state.gameStartTime = Date.now();
  state.activeBoost = null;
  state.shieldActive = false;
  state.coinRainActive = false;
  state.activeContract = null;
  state.contractGameResult = null;
  state.categoryStats = {};

  // Convert revision questions to game format
  state.revisionQuestions.forEach(q => {
    const gameQ = {
      category: 'revision',
      text: q.text,
      unit: '',
      hint: q.hint || '',
      explanation: q.explanation || '',
    };
    if (context) gameQ.ficheKey = '_rev_' + setId;
    if (q.type === 'qcm') {
      gameQ.qcmChoices = q.choices;
      gameQ.textAnswer = q.answer;
    } else if (q.type === 'text') {
      gameQ.textAnswer = q.answer;
      gameQ.acceptedAnswers = q.acceptedAnswers || [q.answer];
    } else {
      gameQ.answer = Number(q.answer);
    }
    state.questions.push(gameQ);
  });

  showScreen('screen-game');
  if (state.timerEnabled) {
    document.getElementById('timer-stat').style.display = '';
    startTimer();
  } else {
    document.getElementById('timer-stat').style.display = 'none';
  }
  showQuestion();
}

document.getElementById('btn-revisions').addEventListener('click', showRevisionsList);
document.getElementById('btn-revisions-back').addEventListener('click', () => showScreen('screen-home'));

// ── Fiches d'aide ──────────────────────────────────────────────────────
function loadFichesAndShow(ficheKey) {
  showFiche(ficheKey);
}

function showFiche(ficheKey) {
  const fiche = window.FICHES && window.FICHES[ficheKey];
  if (!fiche) {
    document.getElementById('fiche-titre').textContent = 'Fiche introuvable';
    document.getElementById('fiche-content').innerHTML =
      '<div class="fiche-loading">Fiche non disponible pour ce sujet.</div>';
    showScreen('screen-fiche');
    return;
  }

  document.getElementById('fiche-titre').textContent = fiche.titre;

  const exempleHTML = fiche.exemples.map(e => `
    <div class="fiche-exemple">
      <div class="fiche-exemple-enonce">${e.enonce}</div>
      <div class="fiche-exemple-calcul">${e.calcul}</div>
    </div>
  `).join('');

  document.getElementById('fiche-content').innerHTML = `
    <div class="fiche-section">
      <p class="fiche-intro">${fiche.intro}</p>
      ${fiche.schema ? '<div class="fiche-schema">' + fiche.schema + '</div>' : ''}
    </div>
    <div class="fiche-section">
      <div class="fiche-section-titre">LA RÈGLE</div>
      <div class="fiche-regle">${fiche.regle}</div>
    </div>
    <div class="fiche-section">
      <div class="fiche-section-titre">EXEMPLES</div>
      ${exempleHTML}
    </div>
    <div class="fiche-section">
      <div class="fiche-astuce">${fiche.astuce}</div>
    </div>
  `;

  showScreen('screen-fiche');
}

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
  document.getElementById('question-card').setAttribute('data-cat', q.category);

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

  // Fiche d'aide : show button if ficheKey exists, hide context panel
  const btnFiche = document.getElementById('btn-fiche');
  const revContext = document.getElementById('revision-context');
  revContext.style.display = 'none';
  if (btnFiche) btnFiche.style.display = q && q.ficheKey ? '' : 'none';

  state.answered = false;
  document.getElementById('answer-section').style.display = '';
  document.getElementById('feedback-section').style.display = 'none';

  const input = document.getElementById('answer-input');
  const qcmDiv = document.getElementById('qcm-choices');
  const validateBtn = document.getElementById('btn-validate');
  input.value = '';

  if (q.qcmChoices) {
    // QCM mode
    input.style.display = 'none';
    validateBtn.style.display = 'none';
    qcmDiv.style.display = '';
    qcmDiv.innerHTML = q.qcmChoices.map((c, i) =>
      '<button class="qcm-btn" data-index="' + i + '">' + escapeHtml(c) + '</button>'
    ).join('');
    qcmDiv.querySelectorAll('.qcm-btn').forEach(btn => {
      btn.addEventListener('click', () => validateQCMAnswer(btn));
    });
  } else if (q.textAnswer !== undefined || q.acceptedAnswers) {
    input.type = 'text';
    input.placeholder = 'Ta réponse...';
    input.style.display = '';
    validateBtn.style.display = '';
    qcmDiv.style.display = 'none';
  } else {
    input.type = 'number';
    input.placeholder = 'Ta réponse...';
    input.style.display = '';
    validateBtn.style.display = '';
    qcmDiv.style.display = 'none';
  }

  document.getElementById('btn-next').textContent = 'Suivant';

  state.questionStartTime = Date.now();

  // V3: Show contract indicator
  let contractIndicator = document.getElementById('contract-indicator');
  if (state.activeContract) {
    if (!contractIndicator) {
      contractIndicator = document.createElement('div');
      contractIndicator.id = 'contract-indicator';
      contractIndicator.className = 'contract-indicator';
      document.querySelector('.game-header').after(contractIndicator);
    }
    contractIndicator.innerHTML = `<span class="contract-tier-icon">${state.activeContract.icon}</span> Contrat : ${state.activeContract.label}`;
    contractIndicator.style.display = '';
  } else if (contractIndicator) {
    contractIndicator.style.display = 'none';
  }

  const card = document.getElementById('question-card');
  card.classList.remove('slide-in');
  void card.offsetWidth;
  card.classList.add('slide-in');

  setTimeout(() => input.focus(), 100);

  renderSkipButton();
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

// ── Fiche d'aide listeners ─────────────────────────────────────────
document.getElementById('btn-fiche').addEventListener('click', () => {
  const q = state.questions[state.currentIndex];
  const ficheKey = q && q.ficheKey;
  if (!ficheKey) return;

  // Revision context: toggle inline expandable instead of navigating
  if (ficheKey.startsWith('_rev_') && window.FICHES && window.FICHES[ficheKey]) {
    const revContext = document.getElementById('revision-context');
    const contextContent = document.getElementById('context-content');
    if (revContext.style.display === 'none') {
      const fiche = window.FICHES[ficheKey];
      let html = '';
      if (fiche.intro) html += '<p>' + escapeHtml(fiche.intro) + '</p>';
      if (fiche.regle) html += '<p><strong>Texte :</strong></p><p>' + escapeHtml(fiche.regle) + '</p>';
      if (fiche.exemples && fiche.exemples.length > 0) {
        fiche.exemples.forEach(e => {
          html += '<p><strong>' + escapeHtml(e.enonce) + '</strong></p><p>' + escapeHtml(e.calcul) + '</p>';
        });
      }
      if (fiche.astuce) html += '<p>💡 ' + escapeHtml(fiche.astuce) + '</p>';
      contextContent.innerHTML = html;
      revContext.style.display = '';
    } else {
      revContext.style.display = 'none';
    }
    return;
  }

  // Classic fiche: navigate to fiche screen
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.timerPaused = true;
    state.timerPausedAt = Date.now();
  }
  state.ficheReturnScreen = 'screen-game';
  loadFichesAndShow(ficheKey);
});

document.getElementById('btn-fiche-back').addEventListener('click', () => {
  // Reprendre le timer si il était pausé à cause de la fiche
  if (state.timerPaused && state.timerPausedAt !== null) {
    // Décaler gameStartTime pour compenser le temps passé sur la fiche
    const pauseDuration = Date.now() - state.timerPausedAt;
    state.gameStartTime += pauseDuration;
    state.timerPaused = false;
    state.timerPausedAt = null;
    // Relancer le timer uniquement si une partie est en cours
    if (state.timerInterval === null && state.questions.length > 0 && !state.answered) {
      startTimer();
    }
  } else {
    state.timerPaused = false;
    state.timerPausedAt = null;
  }
  showScreen(state.ficheReturnScreen || 'screen-game');
});

// ── Answer Validation ──────────────────────────────────────────────

/** Shared scoring + feedback logic for all answer types (number, text, QCM) */
function processAnswer(isCorrect, q) {
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
      const cat = q.category;
      if (cat && cat !== 'revision') {
        const catLevel = ProfileManager.get('catLevel', {});
        catLevel[cat] = Math.min(3, (catLevel[cat] || 2) + 1);
        ProfileManager.set('catLevel', catLevel);
      }
      state.consecutiveCorrect = 0;
    }
  } else {
    // Streak shield: absorb one wrong answer
    if (state.shieldActive) {
      state.shieldActive = false;
      state.streakLostMessage = '🛡️ Bouclier activé ! Série protégée';
    } else {
      if (state.streak >= 3) {
        state.streakLostMessage = 'Belle série de ' + state.streak + ' ! On recommence';
      }
      state.streak = 0;
    }
    state.consecutiveWrong++;
    state.consecutiveCorrect = 0;

    if (state.consecutiveWrong >= 2) {
      const cat = q.category;
      if (cat && cat !== 'revision') {
        const catLevel = ProfileManager.get('catLevel', {});
        catLevel[cat] = Math.max(1, (catLevel[cat] || 2) - 1);
        ProfileManager.set('catLevel', catLevel);
      }
      state.consecutiveWrong = 0;
    }
  }

  if (!state.categoryStats[q.category]) {
    state.categoryStats[q.category] = { correct: 0, total: 0 };
  }
  state.categoryStats[q.category].total++;
  if (isCorrect) state.categoryStats[q.category].correct++;

  // V3: Track contract metrics
  if (state.contractGameResult) {
    const cr = state.contractGameResult;
    if (isCorrect) {
      cr.correct++;
      cr._currentStreak++;
      if (cr._currentStreak > cr.bestStreak) cr.bestStreak = cr._currentStreak;
      if (elapsed < 10) cr.fastAnswers++;
      cr._consecWrong = 0;
    } else {
      cr._currentStreak = 0;
      cr._consecWrong++;
      if (cr._consecWrong > cr.maxConsecWrong) cr.maxConsecWrong = cr._consecWrong;
    }
    if (state.hintUsed) cr.hintsUsed++;
  }

  document.getElementById('score-display').textContent = state.score;
  updateStreak();

  const feedbackResult = document.getElementById('feedback-result');
  const feedbackExplanation = document.getElementById('feedback-explanation');

  if (isCorrect) {
    feedbackResult.textContent = isCatTheme() ? '😺 Correct !' : isOnePieceTheme() ? '☠️ Yohoho !' : isSplatoonTheme() ? '🦑 Splaaaash !' : isDBZTheme() ? '⚡ KAMEHAMEHA !' : 'Correct !';
    feedbackResult.className = 'feedback-result correct';
    launchMiniConfetti();
  } else {
    const correctAnswer = q.textAnswer !== undefined ? q.textAnswer : q.answer;
    const userInput = document.getElementById('answer-input').value.trim();
    const acceptedList = q.acceptedAnswers && q.acceptedAnswers.length > 1 ? ' (ou ' + q.acceptedAnswers.map(a => escapeHtml(a)).join(', ') + ')' : '';
    const themePrefix = isCatTheme() ? '😿 ' : isOnePieceTheme() ? '⚓ ' : isSplatoonTheme() ? '💦 ' : isDBZTheme() ? '🔥 ' : '';
    const themeMsg = isOnePieceTheme() ? 'Pas encore, nakama !' : isSplatoonTheme() ? "Oups, raté l'encre !" : isDBZTheme() ? 'Ce n\'est pas fini, Saiyan !' : 'Pas encore !';
    feedbackResult.innerHTML = themePrefix + themeMsg + '<br>Ta réponse : <strong>' + escapeHtml(userInput) + '</strong><br>Réponse correcte : <strong>' + escapeHtml(String(correctAnswer)) + '</strong>' + acceptedList;
    feedbackResult.className = 'feedback-result incorrect';
    if (state.streakLostMessage) {
      feedbackResult.textContent += ' · ' + state.streakLostMessage;
      state.streakLostMessage = null;
    }
  }

  feedbackExplanation.textContent = q.explanation;

  saveGameState();

  document.getElementById('answer-section').style.display = 'none';
  document.getElementById('feedback-section').style.display = '';

  if (state.currentIndex >= state.questionCount - 1) {
    document.getElementById('btn-next').textContent = 'Voir les résultats';
  }

  // Daily quest: answer_count
  updateQuestProgress('answer_count', 1);
  // Daily quest: use_hint (used hint + correct)
  if (isCorrect && state.hintUsed) {
    updateQuestProgress('use_hint', 1);
  }
}

function validateAnswer() {
  if (state.answered) return;

  const q = state.questions[state.currentIndex];
  const input = document.getElementById('answer-input');
  const userAnswer = input.value.trim();

  if (userAnswer === '') return;

  state.answered = true;

  let isCorrect = false;

  if (q.acceptedAnswers) {
    // Text mode: check against accepted answers (case + accent + whitespace insensitive)
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    isCorrect = q.acceptedAnswers.some(a => norm(userAnswer) === norm(a));
  } else if (q.textAnswer !== undefined) {
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    isCorrect = norm(userAnswer) === norm(q.textAnswer);
  } else {
    const numAnswer = parseFloat(userAnswer);
    isCorrect = numAnswer === q.answer;
  }

  processAnswer(isCorrect, q);
}

/** QCM answer validation — called when a QCM button is clicked */
function validateQCMAnswer(btnEl) {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.currentIndex];
  const chosen = btnEl.textContent;
  const isCorrect = chosen === q.textAnswer;

  // Highlight correct/incorrect
  const allBtns = document.querySelectorAll('#qcm-choices .qcm-btn');
  allBtns.forEach(b => {
    b.classList.add('disabled');
    if (b.textContent === q.textAnswer) b.classList.add('correct');
  });
  if (!isCorrect) btnEl.classList.add('incorrect');

  processAnswer(isCorrect, q);
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
  if (isCatTheme()) {
    let catEmoji = '';
    if (state.streak >= 10) catEmoji = '😻';
    else if (state.streak >= 7) catEmoji = '😸';
    else if (state.streak >= 3) catEmoji = '😺';
    else if (state.streak >= 1) catEmoji = '🐱';
    document.getElementById('streak-display').innerHTML =
      state.streak + ' <span id="streak-flame">' + catEmoji + '</span>';
    return;
  }
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
    state.questions.push(generateQuestion(state.category, getSubLevel(lastCat || state.category), lastCat));
    showQuestion();
  }
});

// ── Badges System ──────────────────────────────────────────────────
// Helper for badge checks
function totalCorrect() {
  return Object.values(state.categoryStats).reduce((s, c) => s + (c.correct || 0), 0);
}
function profileXP() { return ProfileManager.get('xp', 0); }
function profileGames() { return ProfileManager.get('gamesPlayed', 0); }

// ── Boosts System ───────────────────────────────────────────────
const BOOSTS = [
  { id: 'xp_boost', name: 'Boost XP', icon: '⚡', price: 50, desc: 'XP ×2 si score parfait (×3 en difficile)', effect: 'xp' },
  { id: 'coin_boost', name: 'Boost Pièces', icon: '💰', price: 60, desc: 'Pièces ×2 si score parfait (×3 en difficile)', effect: 'coins' },
  { id: 'score_boost', name: 'Boost Score', icon: '🎯', price: 40, desc: 'Score ×1.5 si score parfait (×2 en difficile)', effect: 'score' },
  { id: 'hint_pack', name: 'Pack Indices', icon: '💡', price: 30, desc: '3 indices gratuits pour cette partie', effect: 'hints' },
  { id: 'streak_shield', name: 'Bouclier de série', icon: '🛡️', price: 75, desc: 'Protège ta série 1 fois (1 erreur pardonnée)', effect: 'shield' },
  { id: 'coin_rain', name: 'Pluie de pièces', icon: '🌧️', price: 30, desc: 'Pas de réduction de pièces après 3 parties (1 partie)', effect: 'rain' },
];

function getBoostMultiplier(catLevelValue) {
  if (catLevelValue === 1) return 0.75;
  if (catLevelValue === 3) return 1.5;
  return 1;
}

// ── Stickers (saisonniers — ajoutés régulièrement) ──────────────
const STICKERS = [
  // Printemps 2026 — Vague 1
  { id: 'stk_spring_flower', name: 'Fleur de printemps', icon: '🌸', price: 80, season: 'Printemps 2026' },
  { id: 'stk_spring_sun', name: 'Soleil doré', icon: '☀️', price: 80, season: 'Printemps 2026' },
  { id: 'stk_spring_rainbow', name: 'Arc-en-ciel', icon: '🌈', price: 120, season: 'Printemps 2026' },
  { id: 'stk_spring_butterfly', name: 'Papillon', icon: '🦋', price: 100, season: 'Printemps 2026' },
  // Printemps 2026 — Vague 2
  { id: 'stk_spring_bee', name: 'Abeille', icon: '🐝', price: 90, season: 'Printemps 2026' },
  { id: 'stk_spring_ladybug', name: 'Coccinelle', icon: '🐞', price: 90, season: 'Printemps 2026' },
  { id: 'stk_spring_tulip', name: 'Tulipe', icon: '🌷', price: 100, season: 'Printemps 2026' },
  { id: 'stk_spring_bird', name: 'Oiseau chanteur', icon: '🐦', price: 110, season: 'Printemps 2026' },
  { id: 'stk_spring_clover', name: 'Trèfle chanceux', icon: '🍀', price: 150, season: 'Printemps 2026' },
];

const BADGE_DEFS = [
  // ── Débuts ──
  { id: 'first_game', name: 'Première partie', icon: '⭐', category: 'debut', check: () => true, progress: () => ({ cur: Math.min(profileGames(), 1), max: 1 }) },
  { id: 'ten_games', name: '10 parties', icon: '🎯', category: 'debut', check: () => profileGames() >= 10, progress: () => ({ cur: Math.min(profileGames(), 10), max: 10 }) },
  { id: 'fifty_games', name: '50 parties', icon: '🎪', category: 'debut', check: () => profileGames() >= 50, progress: () => ({ cur: Math.min(profileGames(), 50), max: 50 }) },
  { id: 'hundred_games', name: '100 parties !', icon: '💯', category: 'debut', check: () => profileGames() >= 100, progress: () => ({ cur: Math.min(profileGames(), 100), max: 100 }) },

  // ── Performance ──
  { id: 'perfect', name: 'Sans faute', icon: '🏆', category: 'perf', check: () => state.bestStreakThisGame >= state.questionCount, hint: 'Fais un score parfait' },
  { id: 'perfect_20', name: 'Parfait x20', icon: '👑', category: 'perf', check: () => state.bestStreakThisGame >= 20 && state.questionCount === 20, hint: '20/20 en mode 20 questions' },
  { id: 'on_fire', name: 'En feu !', icon: '🔥', category: 'perf', check: () => state.bestStreakThisGame >= 10, hint: '10 bonnes réponses d\'affilée' },
  { id: 'inferno', name: 'Inferno', icon: '🌋', category: 'perf', check: () => state.bestStreakThisGame >= 20, hint: '20 bonnes réponses d\'affilée' },
  { id: 'no_hints', name: 'Sans aide', icon: '🧠', category: 'perf', check: () => state.noHintCount >= 5, hint: '5 réponses sans indice en 1 partie' },
  { id: 'no_hints_10', name: 'Cerveau d\'acier', icon: '🦾', category: 'perf', check: () => state.noHintCount >= 10, hint: '10 réponses sans indice en 1 partie' },
  { id: 'speedster', name: 'Rapide', icon: '⚡', category: 'perf', check: () => state.timerEnabled && (Date.now() - state.gameStartTime) < 120000, hint: 'Finis en moins de 2 min (chrono)' },
  { id: 'flash', name: 'Flash', icon: '💨', category: 'perf', check: () => state.timerEnabled && (Date.now() - state.gameStartTime) < 60000, hint: 'Finis en moins de 1 min (chrono)' },
  { id: 'hard_mode', name: 'Mode avancé', icon: '💪', category: 'perf', check: () => { const cl = ProfileManager.get('catLevel', {}); return Object.values(cl).some(v => v === 3); }, hint: 'Atteins le niveau 3 dans une catégorie' },
  { id: 'hard_perfect', name: 'Avancé parfait', icon: '🏅', category: 'perf', check: () => { const cl = ProfileManager.get('catLevel', {}); return Object.values(cl).some(v => v === 3) && state.bestStreakThisGame >= state.questionCount; }, hint: 'Score parfait avec un niveau 3' },
  { id: 'score_100', name: 'Score 100+', icon: '📈', category: 'perf', check: () => state.score >= 100, hint: 'Atteins 100 points en 1 partie' },
  { id: 'score_200', name: 'Score 200+', icon: '📊', category: 'perf', check: () => state.score >= 200, hint: 'Atteins 200 points en 1 partie' },
  { id: 'score_300', name: 'Score 300+', icon: '🚀', category: 'perf', check: () => state.score >= 300, hint: 'Atteins 300 points en 1 partie' },

  // ── Exploration ──
  { id: 'explorer', name: 'Explorateur', icon: '🌍', category: 'explore', check: () => Object.keys(state.categoryStats).length >= 6, progress: () => ({ cur: Object.keys(state.categoryStats).length, max: 6 }), hint: 'Joue dans les 6 catégories' },
  { id: 'try_easy', name: 'Échauffement', icon: '😊', category: 'explore', check: () => { const cl = ProfileManager.get('catLevel', {}); return Object.values(cl).some(v => v === 1); }, hint: 'Avoir un niveau 1 dans une catégorie' },
  { id: 'try_chrono', name: 'Contre la montre', icon: '⏱️', category: 'explore', check: () => state.timerEnabled, hint: 'Active le chronomètre' },
  { id: 'marathon', name: 'Marathon', icon: '🏃', category: 'explore', check: () => state.questionCount === 20, hint: 'Joue une partie de 20 questions' },

  // ── Maîtrise par catégorie ──
  { id: 'master_calcul', name: 'Maître Calcul', icon: '🧮', category: 'master', check: () => (state.categoryStats.calcul?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.calcul?.correct || 0, 50), max: 50 }) },
  { id: 'master_logique', name: 'Maître Logique', icon: '🧩', category: 'master', check: () => (state.categoryStats.logique?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.logique?.correct || 0, 50), max: 50 }) },
  { id: 'master_geometrie', name: 'Maître Géométrie', icon: '📐', category: 'master', check: () => (state.categoryStats.geometrie?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.geometrie?.correct || 0, 50), max: 50 }) },
  { id: 'master_fractions', name: 'Maître Fractions', icon: '🍕', category: 'master', check: () => (state.categoryStats.fractions?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.fractions?.correct || 0, 50), max: 50 }) },
  { id: 'master_mesures', name: 'Maître Mesures', icon: '📏', category: 'master', check: () => (state.categoryStats.mesures?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.mesures?.correct || 0, 50), max: 50 }) },
  { id: 'master_geographie', name: 'Maître Géographie', icon: '🌍', category: 'master', check: () => (state.categoryStats.geographie?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.geographie?.correct || 0, 50), max: 50 }) },
  { id: 'master_conjugaison', name: 'Maître Conjugaison', icon: '✏️', category: 'master', check: () => (state.categoryStats.conjugaison?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.conjugaison?.correct || 0, 50), max: 50 }) },
  { id: 'master_ouvert', name: 'Maître Ouvert', icon: '💡', category: 'master', check: () => (state.categoryStats.ouvert?.correct || 0) >= 50, progress: () => ({ cur: Math.min(state.categoryStats.ouvert?.correct || 0, 50), max: 50 }) },
  { id: 'grand_master', name: 'Grand Maître', icon: '🎓', category: 'master', check: () => {
    return ['calcul','logique','geometrie','fractions','mesures','ouvert'].every(c => (state.categoryStats[c]?.correct || 0) >= 50);
  }, progress: () => {
    const done = ['calcul','logique','geometrie','fractions','mesures','ouvert'].filter(c => (state.categoryStats[c]?.correct || 0) >= 50).length;
    return { cur: done, max: 6 };
  }},

  // ── XP milestones ──
  { id: 'xp_100', name: 'Centurion', icon: '🔰', category: 'xp', check: () => profileXP() >= 100, progress: () => ({ cur: Math.min(profileXP(), 100), max: 100 }) },
  { id: 'xp_500', name: 'Vétéran', icon: '⚔️', category: 'xp', check: () => profileXP() >= 500, progress: () => ({ cur: Math.min(profileXP(), 500), max: 500 }) },
  { id: 'xp_1000', name: 'Champion', icon: '🗡️', category: 'xp', check: () => profileXP() >= 1000, progress: () => ({ cur: Math.min(profileXP(), 1000), max: 1000 }) },
  { id: 'xp_2500', name: 'Héros', icon: '🦸', category: 'xp', check: () => profileXP() >= 2500, progress: () => ({ cur: Math.min(profileXP(), 2500), max: 2500 }) },
  { id: 'xp_5000', name: 'Légende', icon: '🐉', category: 'xp', check: () => profileXP() >= 5000, progress: () => ({ cur: Math.min(profileXP(), 5000), max: 5000 }) },
  { id: 'xp_10000', name: 'Mythique', icon: '🌟', category: 'xp', check: () => profileXP() >= 10000, progress: () => ({ cur: Math.min(profileXP(), 10000), max: 10000 }) },

  // ── Réponses totales ──
  { id: 'correct_50', name: '50 bonnes réponses', icon: '✅', category: 'total', check: () => totalCorrect() >= 50, progress: () => ({ cur: Math.min(totalCorrect(), 50), max: 50 }) },
  { id: 'correct_100', name: '100 bonnes réponses', icon: '💚', category: 'total', check: () => totalCorrect() >= 100, progress: () => ({ cur: Math.min(totalCorrect(), 100), max: 100 }) },
  { id: 'correct_250', name: '250 bonnes réponses', icon: '💎', category: 'total', check: () => totalCorrect() >= 250, progress: () => ({ cur: Math.min(totalCorrect(), 250), max: 250 }) },
  { id: 'correct_500', name: '500 bonnes réponses', icon: '🏰', category: 'total', check: () => totalCorrect() >= 500, progress: () => ({ cur: Math.min(totalCorrect(), 500), max: 500 }) },
  { id: 'correct_1000', name: '1000 bonnes réponses', icon: '👸', category: 'total', check: () => totalCorrect() >= 1000, progress: () => ({ cur: Math.min(totalCorrect(), 1000), max: 1000 }) },

  // ═══ BADGES CACHÉS (le kid les découvre par hasard) ═══
  { id: 'night_owl', name: 'Hibou', icon: '🦉', category: 'hidden', hidden: true,
    check: () => new Date().getHours() >= 21 || new Date().getHours() < 6 },
  { id: 'early_bird', name: 'Lève-tôt', icon: '🐓', category: 'hidden', hidden: true,
    check: () => { const h = new Date().getHours(); return h >= 6 && h < 8; }},
  { id: 'weekend', name: 'Week-end warrior', icon: '🎉', category: 'hidden', hidden: true,
    check: () => [0, 6].includes(new Date().getDay()) },
  { id: 'answer_42', name: 'La réponse ultime', icon: '🌌', category: 'hidden', hidden: true,
    check: () => state.score === 42 },
  { id: 'lucky_7', name: 'Lucky Seven', icon: '🍀', category: 'hidden', hidden: true,
    check: () => state.bestStreakThisGame === 7 },
  { id: 'palindrome', name: 'Palindrome', icon: '🔄', category: 'hidden', hidden: true,
    check: () => { const s = String(state.score); return s.length >= 2 && s === s.split('').reverse().join(''); }},
  { id: 'speed_demon', name: 'Speed Demon', icon: '😈', category: 'hidden', hidden: true,
    check: () => state.timerEnabled && (Date.now() - state.gameStartTime) < 30000 && state.questionCount >= 5 },
  { id: 'triple_cat', name: 'Tricolore', icon: '🌈', category: 'hidden', hidden: true,
    check: () => {
      const cats = state.questions.map(q => q.category);
      return new Set(cats).size >= 3;
    }},

  // ═══ BOSS BADGES ═══
  { id: 'boss_first_win', name: 'Première Victoire', icon: '⚔️', category: 'boss',
    check: () => (ProfileManager.get('defeatedBosses', []).length >= 1),
    progress: () => ({ cur: Math.min(ProfileManager.get('defeatedBosses', []).length, 1), max: 1 }) },
  { id: 'boss_slayer', name: 'Tueur de Boss', icon: '🗡️', category: 'boss',
    check: () => (ProfileManager.get('defeatedBosses', []).length >= 6),
    progress: () => ({ cur: Math.min(ProfileManager.get('defeatedBosses', []).length, 6), max: 6 }) },
  { id: 'boss_flawless', name: 'Sans Égratignure', icon: '🛡️', category: 'boss',
    check: () => false, hint: 'Bats un boss sans perdre de PV' },
  { id: 'boss_critical', name: 'Critique !', icon: '💥', category: 'boss',
    check: () => false, hint: '3 réponses critiques dans un combat' },
  { id: 'boss_dragon_enraged', name: 'Chasseur de Dragons', icon: '🐉', category: 'boss', hidden: true,
    check: () => false },

  // ═══ CONTRAT BADGES ═══
  { id: 'contract_first', name: 'Premier Contrat', icon: '🎯', category: 'contrat',
    check: () => { const c = ProfileManager.get('contractsCompleted', {}); return (c.bronze||0)+(c.silver||0)+(c.gold||0) >= 1; },
    progress: () => { const c = ProfileManager.get('contractsCompleted', {}); return { cur: Math.min((c.bronze||0)+(c.silver||0)+(c.gold||0), 1), max: 1 }; } },
  { id: 'contract_gold_hunter', name: 'Chasseur d\'Or', icon: '🥇', category: 'contrat',
    check: () => (ProfileManager.get('contractsCompleted', {}).gold || 0) >= 10,
    progress: () => ({ cur: Math.min(ProfileManager.get('contractsCompleted', {}).gold || 0, 10), max: 10 }) },
  { id: 'contract_perfectionist', name: 'Perfectionniste', icon: '✨', category: 'contrat',
    check: () => false, hint: '5 contrats Or d\'affilée' },
  { id: 'contract_all_bronze', name: 'Tout Bronze', icon: '🥉', category: 'contrat', hidden: true,
    check: () => (ProfileManager.get('contractsCompleted', {}).bronze || 0) >= 20 },

  // ═══ REGULARITY BADGES ═══
  { id: 'regular_5', name: 'Régulier', icon: '📅', category: 'xp',
    description: '5 jours joués en une semaine',
    check: () => (ProfileManager.get('daysPlayedThisWeek', []).length >= 5),
    progress: () => ({ cur: ProfileManager.get('daysPlayedThisWeek', []).length, max: 5 }),
  },
  { id: 'regular_7', name: 'Marathonien', icon: '🏃', category: 'xp',
    description: '7 jours joués en une semaine',
    check: () => (ProfileManager.get('daysPlayedThisWeek', []).length >= 7),
    progress: () => ({ cur: ProfileManager.get('daysPlayedThisWeek', []).length, max: 7 }),
  },

  // ── Compagnons Majestueux ──
  { id: 'pet_majestueux_dragon', name: 'Dragon Majestueux', icon: '🐉', category: 'pet',
    description: 'Faire évoluer le Dragon jusqu\'au stade Majestueux',
    check: () => ProfileManager.get('petMajestueuxRewarded_dragon', false),
  },
  { id: 'pet_majestueux_robot', name: 'Robot Majestueux', icon: '🤖', category: 'pet',
    description: 'Faire évoluer le Robot jusqu\'au stade Majestueux',
    check: () => ProfileManager.get('petMajestueuxRewarded_robot', false),
  },
  { id: 'pet_majestueux_fox', name: 'Renard Majestueux', icon: '🦊', category: 'pet',
    description: 'Faire évoluer le Renard jusqu\'au stade Majestueux',
    check: () => ProfileManager.get('petMajestueuxRewarded_fox', false),
  },

];

function checkBadges() {
  BADGE_DEFS.forEach(def => {
    if (!state.badges.includes(def.id) && def.check()) {
      state.badges.push(def.id);
      state.badgesUnlocked.push(def);
    }
  });
}

// ── End Game (sub-functions) ─────────────────────────────────────

function updateRecords() {
  const bestStreak = state.bestStreakThisGame;
  let isNewRecord = false;
  const recordKeys = state.category === 'all' ? ['global'] : [state.category, 'global'];
  recordKeys.forEach(key => {
    if (!state.records[key]) state.records[key] = { score: 0, streak: 0 };
    if (state.score > state.records[key].score || bestStreak > state.records[key].streak) isNewRecord = true;
    if (state.score > state.records[key].score) state.records[key].score = state.score;
    if (bestStreak > state.records[key].streak) state.records[key].streak = bestStreak;
  });
  return isNewRecord;
}

function trackRegularity() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const daysPlayed = ProfileManager.get('daysPlayedThisWeek', []);
  if (!daysPlayed.includes(todayStr)) {
    daysPlayed.push(todayStr);
    ProfileManager.set('daysPlayedThisWeek', daysPlayed);
  }
}

function computeRewards() {
  const xpBoost = ProfileManager.get('xpBoostActive', false);
  const catLevel = ProfileManager.get('catLevel', {});
  const playedCats = Object.keys(state.categoryStats);
  const avgLevel = playedCats.length > 0
    ? Math.round(playedCats.reduce((sum, c) => sum + (catLevel[c] || 2), 0) / playedCats.length)
    : 2;
  const rewards = calculateRewards(state.score, avgLevel, xpBoost, state.coinRainActive);
  if (state.xpMultiplier > 1) {
    rewards.xp = Math.round(rewards.xp * state.xpMultiplier);
  }
  const oldXP = ProfileManager.get('xp', 0);
  ProfileManager.set('xp', oldXP + rewards.xp);
  ProfileManager.set('coins', ProfileManager.get('coins', 0) + rewards.coins);
  if (xpBoost) ProfileManager.set('xpBoostActive', false);
  return { rewards, avgLevel, oldXP };
}

function applyBoostRewards(rewards, avgLevel) {
  if (state.activeBoost) {
    const isPerfect = state.bestStreakThisGame >= state.questionCount;
    const boost = BOOSTS.find(b => b.id === state.activeBoost);
    const mult = getBoostMultiplier(avgLevel);

    if (isPerfect && boost) {
      if (boost.effect === 'xp') {
        const bonusXP = Math.round(rewards.xp * mult);
        rewards.xp += bonusXP;
        ProfileManager.set('xp', ProfileManager.get('xp', 0) + bonusXP);
      } else if (boost.effect === 'coins') {
        const bonusCoins = Math.round(rewards.coins * mult);
        rewards.coins += bonusCoins;
        ProfileManager.set('coins', ProfileManager.get('coins', 0) + bonusCoins);
      } else if (boost.effect === 'score') {
        const bonusScore = Math.round(state.score * (mult === 1.5 ? 1 : mult === 0.75 ? 0.5 : 0.5));
        rewards.xp += bonusScore;
        rewards.coins += Math.round(bonusScore / 2);
        ProfileManager.set('xp', ProfileManager.get('xp', 0) + bonusScore);
        ProfileManager.set('coins', ProfileManager.get('coins', 0) + Math.round(bonusScore / 2));
      }
    }

    const boostResultEl = document.getElementById('boost-result');
    if (boostResultEl) {
      if (boost && boost.effect === 'hints') {
        boostResultEl.textContent = `${boost.icon} Pack Indices utilisé !`;
        boostResultEl.style.display = '';
        boostResultEl.style.color = 'var(--accent-green)';
      } else if (isPerfect && boost) {
        boostResultEl.textContent = `${boost.icon} Boost ${boost.name} activé ! (×${1 + mult})`;
        boostResultEl.style.display = '';
        boostResultEl.style.color = 'var(--accent-green)';
      } else if (boost) {
        boostResultEl.textContent = `${boost.icon} Boost ${boost.name} perdu... (pas de score parfait)`;
        boostResultEl.style.display = '';
        boostResultEl.style.color = 'var(--error)';
      }
    }
    state.activeBoost = null;
  } else {
    const boostResultEl = document.getElementById('boost-result');
    if (boostResultEl) boostResultEl.style.display = 'none';
  }
}

function applyPetEffects(rewards) {
  if (ProfileManager.get('vacationMode', false)) return;
  addPetXP(state.score);
  checkDragonSkip(state.questionCount);

  const petBonus = getPetBonus();
  const petPct = getPetBonusPct();
  if (petBonus === 'xp' && petPct > 0) {
    const bonusPetXP = Math.round(rewards.xp * petPct);
    rewards.xp += bonusPetXP;
    ProfileManager.set('xp', ProfileManager.get('xp', 0) + bonusPetXP);
  } else if (petBonus === 'coins' && petPct > 0) {
    const bonusPetCoins = Math.round(rewards.coins * petPct);
    rewards.coins += bonusPetCoins;
    ProfileManager.set('coins', ProfileManager.get('coins', 0) + bonusPetCoins);
  }

  const majReward = checkPetMajestueux();
  if (majReward) state.pendingMajReward = majReward;
}

function updateGameStreak() {
  let gamesPlayed = ProfileManager.get('gamesPlayed', 0) + 1;
  ProfileManager.set('gamesPlayed', gamesPlayed);
  incrementDailyGameCount();
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

  const finalXP = ProfileManager.get('xp', 0);
  const chestsOpened = ProfileManager.get('chestsOpened', []);
  const allPending = checkChestMilestones(gamesPlayed, finalXP, chestsOpened);
  state.pendingChests = canOpenChestToday() ? allPending : [];
  const chestWaiting = !canOpenChestToday() && allPending.length > 0;

  return { gamesPlayed, finalXP, chestWaiting };
}

function renderEndScreen(isNewRecord, rewards, oldXP, finalXP, gamesPlayed, chestWaiting) {
  // Score
  const finalScore = document.getElementById('final-score');
  finalScore.textContent = state.score + ' points';
  finalScore.classList.remove('pop-in');
  void finalScore.offsetWidth;
  finalScore.classList.add('pop-in');

  // Record
  const newRecordEl = document.getElementById('new-record');
  newRecordEl.style.display = isNewRecord ? '' : 'none';
  if (isNewRecord) {
    newRecordEl.textContent = isCatTheme() ? '😻 Nouveau record !' : '🏆 Nouveau record !';
    launchBigConfetti();
  }

  // Badges
  const badgesContainer = document.getElementById('badges-unlocked');
  if (state.badgesUnlocked.length > 0) {
    let html = '<h3>Badges débloqués !</h3><div class="badges-grid">';
    state.badgesUnlocked.forEach(b => {
      html += `<div class="badge-item"><span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span></div>`;
    });
    badgesContainer.innerHTML = html + '</div>';
  } else {
    badgesContainer.innerHTML = '';
  }

  // XP + coins
  const xpEarnedEl = document.getElementById('xp-earned');
  if (state.xpMultiplier > 1) {
    xpEarnedEl.innerHTML = '+' + rewards.xp + ' XP <span class="xp-multiplier-badge">×' + state.xpMultiplier + '</span>';
  } else {
    xpEarnedEl.textContent = '+' + rewards.xp + ' XP';
  }
  document.getElementById('coins-earned').textContent = '+' + rewards.coins + ' \uD83E\uDE99';

  // Rank up
  const oldRank = getRank(oldXP);
  const newRank = getRank(finalXP);
  const rankUpEl = document.getElementById('rank-up-display');
  if (newRank.id !== oldRank.id) {
    rankUpEl.style.display = '';
    document.getElementById('rank-up-text').textContent = oldRank.icon + ' \u2192 ' + newRank.icon + ' ' + newRank.name + ' !';
    launchBigConfetti();
  } else {
    rankUpEl.style.display = 'none';
  }
  const progress = getRankProgress(finalXP);
  document.getElementById('xp-bar-end-fill').style.width = (progress.progress * 100) + '%';
  document.getElementById('xp-bar-end-text').textContent = progress.next ? progress.xpInLevel + '/' + progress.xpNeeded + ' XP' : 'MAX';

  // "Tu étais si près !" — chest-waiting has priority
  const almostEl = document.getElementById('almost-there');
  if (chestWaiting) {
    almostEl.textContent = '🎁 Coffres en attente ! Reviens demain pour les ouvrir.';
    almostEl.style.display = '';
  } else {
    const almostHints = [];
    const nextGameChest = GAME_MILESTONES.find(m => m > gamesPlayed);
    if (nextGameChest && nextGameChest - gamesPlayed <= 3) {
      almostHints.push('Plus que ' + (nextGameChest - gamesPlayed) + ' partie' + (nextGameChest - gamesPlayed > 1 ? 's' : '') + ' pour un coffre !');
    }
    const nextXPChest = XP_MILESTONES.find(m => m > finalXP);
    if (nextXPChest && nextXPChest - finalXP <= 100) {
      almostHints.push('Plus que ' + (nextXPChest - finalXP) + ' XP pour un coffre !');
    }
    const nextRankInfo = getNextRank(finalXP);
    if (nextRankInfo && nextRankInfo.xp - finalXP <= 150) {
      almostHints.push('Plus que ' + (nextRankInfo.xp - finalXP) + ' XP pour ' + nextRankInfo.icon + ' ' + nextRankInfo.name + ' !');
    }
    if (almostHints.length > 0) {
      almostEl.textContent = almostHints[0];
      almostEl.style.display = '';
    } else {
      almostEl.style.display = 'none';
    }
  }

  // Adventure expedition result
  const advInfoEl = document.getElementById('end-adventure-info');
  if (advInfoEl) {
    if (state.adventureMode && state.adventureExpResult) {
      const r = state.adventureExpResult;
      advInfoEl.innerHTML = (r.starAwarded ? '<p class="adventure-star-earned">⭐ +1 étoile !</p>' : '<p class="adventure-no-star">Pas d\'étoile cette fois...</p>')
        + (r.bossUnlocked ? '<p class="adventure-boss-unlocked">⚔️ Boss débloqué !</p>' : '');
    } else {
      advInfoEl.innerHTML = '';
    }
  }

  // Majestueux notification
  const majEl = document.getElementById('pet-majestueux-display');
  if (state.pendingMajReward && majEl) {
    const r = state.pendingMajReward;
    majEl.style.display = '';
    majEl.innerHTML = r.emoji + ' Ton ' + r.name + ' est devenu <strong>Majestueux</strong> ! +200🪙 · Badge · Titre débloqué !';
    launchBigConfetti();
    state.pendingMajReward = null;
  } else if (majEl) {
    majEl.style.display = 'none';
  }
}

function evaluateContract() {
  if (!state.activeContract || !state.contractGameResult) return;

  const contractMet = state.activeContract.check(state.contractGameResult);
  const contractEl = document.createElement('div');
  contractEl.className = 'contract-result ' + (contractMet ? 'success' : 'failure');

  if (contractMet) {
    const bonus = state.activeContract.bonus;
    ProfileManager.set('coins', ProfileManager.get('coins', 0) + bonus);
    contractEl.textContent = `${state.activeContract.icon} Contrat ${state.activeContract.tier === 'gold' ? 'Or' : state.activeContract.tier === 'silver' ? 'Argent' : 'Bronze'} rempli ! +${bonus} 🪙`;
    const contractsCompleted = ProfileManager.get('contractsCompleted', { bronze: 0, silver: 0, gold: 0, goldStreak: 0 });
    contractsCompleted[state.activeContract.tier]++;
    if (state.activeContract.tier === 'gold') {
      contractsCompleted.goldStreak++;
    } else {
      contractsCompleted.goldStreak = 0;
    }
    ProfileManager.set('contractsCompleted', contractsCompleted);
    checkContractBadges(contractsCompleted);
  } else {
    contractEl.textContent = `${state.activeContract.icon} Contrat non rempli — la prochaine fois !`;
    const contractsCompleted = ProfileManager.get('contractsCompleted', { bronze: 0, silver: 0, gold: 0, goldStreak: 0 });
    contractsCompleted.goldStreak = 0;
    ProfileManager.set('contractsCompleted', contractsCompleted);
  }

  const rewardsSection = document.getElementById('rewards-section');
  const existing = document.querySelector('.contract-result');
  if (existing) existing.remove();
  rewardsSection.parentNode.insertBefore(contractEl, rewardsSection);

  state.activeContract = null;
  state.contractGameResult = null;
}

function syncToFirebase(rewards) {
  const gameElapsed = Math.round((Date.now() - state.gameStartTime) / 1000);
  ProfileManager.set('weeklyTimeSpent', (ProfileManager.get('weeklyTimeSpent', 0)) + gameElapsed);
  MQSync.syncAfterGame(rewards.xp).catch(() => {});

  if (state.revisionMode && state.revisionSetId) {
    const totalQ = state.questionCount;
    const correctQ = Object.values(state.categoryStats).reduce((s, c) => s + (c.correct || 0), 0);
    const pct = Math.round(correctQ / totalQ * 100);
    saveRevisionScore(state.revisionSetId, state.score, totalQ, pct).then(() => {
      getRevisionScore(state.revisionSetId).then(score => {
        if (score && score.cooldownUntil && Date.now() < score.cooldownUntil) {
          const almostEl = document.getElementById('almost-there');
          if (almostEl) {
            almostEl.textContent = '🎓 Bravo, 3× parfait ! Reviens dans 2h pour rejouer ce set.';
            almostEl.style.display = '';
          }
        }
      }).catch(() => {});
    }).catch(() => {});
  }
}

function checkSessionLimit() {
  const sessionMinutes = (Date.now() - sessionStartTime) / 60000;
  const alreadyNudged = sessionStorage.getItem('mq_session_nudged');
  if (sessionMinutes >= 30 && !alreadyNudged) {
    sessionStorage.setItem('mq_session_nudged', 'true');
    setTimeout(() => {
      document.getElementById('session-limit-overlay').style.display = 'flex';
    }, 1500);
  }
}

// ── End Game ───────────────────────────────────────────────────────
function endGame() {
  stopTimer();
  clearGameState();

  const isNewRecord = updateRecords();
  trackRegularity();
  checkBadges();

  // Check mastery level-ups
  const masteryUps = checkMasteryUp(state.category === 'all' ? 'all' : state.category);
  masteryUps.forEach(b => {
    state.badgesUnlocked.push(b);
    const toast = document.createElement('div');
    toast.className = 'coin-toast mastery-toast';
    toast.textContent = '🌟 ' + b.name + ' !';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  });

  saveProfileData();

  // ── Daily quests tracking ──
  const playedCategory = state.category === 'all'
    ? Object.keys(state.categoryStats)[0] || 'calcul'
    : state.category;

  updateQuestProgress('play_games', 1);
  updateQuestProgress('play_category', 1, { category: playedCategory });
  updateQuestProgress('correct_streak', state.bestStreakThisGame);

  const isPerfect = state.bestStreakThisGame >= state.questionCount && state.score > 0;
  if (isPerfect) {
    updateQuestProgress('perfect_game', 1);
  }

  // Rewards pipeline — NB: rewards object is mutated by boost and pet effects
  const { rewards, avgLevel, oldXP } = computeRewards();
  applyBoostRewards(rewards, avgLevel);
  applyPetEffects(rewards);
  const { gamesPlayed, finalXP, chestWaiting } = updateGameStreak();

  // Adventure mode: complete expedition
  if (state.adventureMode && _adventureZoneId) {
    const expResult = completeExpedition(state.score, state.questionCount, _adventureZoneId);
    state.adventureExpResult = expResult;
  }

  // Render
  renderEndScreen(isNewRecord, rewards, oldXP, finalXP, gamesPlayed, chestWaiting);
  evaluateContract();
  syncToFirebase(rewards);
  checkSessionLimit();
  renderRegularityStreak();

  showScreen('screen-end');

  // Keep adventure zone for replay, reset mode flag after replay check
  state._adventureReturnZone = state.adventureMode ? _adventureZoneId : null;

  // Track games since boss (skip in adventure mode — adventure has its own bosses)
  if (!state.adventureMode) {
    state.gamesSinceBoss++;
    saveBossState();
  }

  state.adventureMode = false;
}

// ── Replay / Menu ──────────────────────────────────────────────────
document.getElementById('btn-replay').addEventListener('click', () => {
  // Revision replay: restart same set
  if (state.revisionMode && state.revisionSetId) {
    startRevisionGame(state.revisionSetId);
    return;
  }
  // Adventure replay: go back to zone detail
  if (state._adventureReturnZone) {
    const zoneId = state._adventureReturnZone;
    state._adventureReturnZone = null;
    if (state.pendingChests && state.pendingChests.length > 0) {
      state.replayAfterChests = false;
      showChest(state.pendingChests.shift());
    }
    openZoneDetail(zoneId);
    return;
  }
  if (state.pendingChests && state.pendingChests.length > 0) {
    state.replayAfterChests = true;
    showChest(state.pendingChests.shift());
  } else {
    if (shouldTriggerBoss()) {
      triggerBoss();
    } else {
      showContractScreen();
    }
  }
});

document.getElementById('btn-share-score').addEventListener('click', () => {
  const score = state.score;
  const cat = state.category === 'all' ? 'toutes catégories' : (CATEGORIES[state.category]?.label || state.category);
  const catLevel = ProfileManager.get('catLevel', {});
  const playedCats2 = Object.keys(state.categoryStats);
  const avgLevel2 = playedCats2.length > 0
    ? Math.round(playedCats2.reduce((sum, c) => sum + (catLevel[c] || 2), 0) / playedCats2.length)
    : 2;
  const diff = avgLevel2 === 1 ? 'Débutant' : avgLevel2 === 3 ? 'Avancé' : 'Normal';
  const text = `🎯 QuizHero — ${score} points en ${cat} (${diff}) !\nTu peux faire mieux ? 🧮`;
  if (navigator.share) {
    navigator.share({ title: 'QuizHero', text, url: 'https://pezzonidasit.github.io/quizhero/' }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + '\nhttps://pezzonidasit.github.io/quizhero/').then(() => {
      const btn = document.getElementById('btn-share-score');
      const orig = btn.textContent;
      btn.textContent = '✅ Copié !';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => {});
  }
});

document.getElementById('btn-menu').addEventListener('click', () => {
  // Reset revision state
  state.revisionMode = false;
  state.revisionSetId = null;
  state.revisionQuestions = [];
  state.xpMultiplier = 1;

  if (state.pendingChests && state.pendingChests.length > 0) {
    showChest(state.pendingChests.shift());
  } else {
    updateProfileHeader();
    renderRecords();
    renderDailyQuests();
    checkRevisionSets();
    if (shouldTriggerBoss()) {
      triggerBoss();
    } else {
      renderBossWaitingIcon();
      showScreen('screen-home');
    }
  }
});

// ── Daily Quests UI ─────────────────────────────────────────────────────────
function renderDailyQuests() {
  const panel = document.getElementById('daily-quests-panel');
  if (!panel) return;

  const data = getDailyQuests();
  const streak = getDailyStreak();

  let html = '<div class="dq-header">';
  html += '<h3 class="dq-title">📋 Quêtes du jour</h3>';
  if (streak.count > 0) {
    html += '<span class="dq-streak">🔥 ' + streak.count + ' jour' + (streak.count > 1 ? 's' : '') + '</span>';
  }
  html += '</div>';

  data.quests.forEach((quest, i) => {
    const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
    html += '<div class="dq-quest' + (quest.done ? ' dq-done' : '') + '">';
    html += '<span class="dq-icon">' + quest.icon + '</span>';
    html += '<div class="dq-info">';
    html += '<span class="dq-text">' + quest.text + '</span>';
    html += '<div class="dq-bar-container"><div class="dq-bar" style="width:' + pct + '%"></div></div>';
    html += '</div>';
    html += '<span class="dq-status">' + (quest.done ? '✅' : quest.progress + '/' + quest.target) + '</span>';
    html += '<span class="dq-reward">🪙 ' + quest.reward + '</span>';
    html += '</div>';
  });

  // 3/3 bonus chest button
  if (data.allDone && !data.chestClaimed) {
    html += '<button class="btn-primary dq-chest-btn" id="btn-dq-chest">🎁 Ouvrir le coffre du jour !</button>';
  } else if (data.chestClaimed) {
    html += '<div class="dq-complete">✨ Quêtes terminées — reviens demain !</div>';
  }

  panel.innerHTML = html;

  // Chest button handler
  const chestBtn = document.getElementById('btn-dq-chest');
  if (chestBtn) {
    chestBtn.addEventListener('click', () => {
      const result = claimDailyChest();
      if (result) {
        // Show sticker toasts
        result.stickerRewards.forEach(stk => {
          const toast = document.createElement('div');
          toast.className = 'coin-toast mastery-toast';
          toast.textContent = stk.icon + ' ' + stk.name + ' !';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 4000);
        });
        // Show chest
        showChest({ id: 'daily_' + getTodayStr(), tier: result.tier });
        // Re-render after chest
        setTimeout(() => renderDailyQuests(), 500);
      }
    });
  }
}

// ── Adventure Mode ─────────────────────────────────────────────
let _adventureZoneId = null;

document.getElementById('btn-adventure')?.addEventListener('click', () => {
  // Check star decay on map open
  const decayed = checkStarDecay();
  showScreen('screen-adventure-map');
  requestAnimationFrame(() => {
    renderAdventureMap();
    // Show decay notification if stars were lost
    if (decayed.length > 0) {
      const names = decayed.map(d => d.name).filter((v, i, a) => a.indexOf(v) === i);
      const msg = `⚠️ Tu n'as pas joué depuis longtemps...\n${names.join(', ')} : -${decayed.length} étoile${decayed.length > 1 ? 's' : ''}`;
      setTimeout(() => alert(msg), 300);
    }
  });
});
document.getElementById('btn-adventure-back')?.addEventListener('click', () => {
  showScreen('screen-home');
});
document.getElementById('btn-zone-back')?.addEventListener('click', () => {
  showScreen('screen-adventure-map');
  requestAnimationFrame(() => renderAdventureMap());
});

function renderAdventureMap() {
  const adv = initAdventure();
  const mapEl = document.getElementById('adventure-map');
  if (!mapEl) return;

  const order = ['calcul', 'logique', 'geometrie', 'geographie', 'fractions', 'conjugaison', 'mesures', 'ouvert'];
  // Use actual container size (padding-bottom: 100% makes it square)
  const w = mapEl.offsetWidth;
  const h = w; // square
  const cx = w / 2, cy = h / 2;
  const radius = cx * 0.68;

  // Check if all bosses defeated → master unlocked
  const allDefeated = order.every(z => adv.zones[z].bossDefeated);

  let html = '';

  // Connection lines + zone nodes
  order.forEach((zoneId, i) => {
    const zone = adv.zones[zoneId];
    const def = ADVENTURE_ZONES[zoneId];
    const angle = (i * 360 / order.length) - 90; // start from top
    const rad = angle * Math.PI / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);

    let stateClass = 'locked';
    if (zone.bossDefeated) stateClass = 'completed';
    else if (zone.stars > 0) stateClass = 'in-progress';
    else if (zone.unlocked) stateClass = 'unlocked';

    const connClass = zone.bossDefeated ? 'completed' : zone.unlocked ? 'active' : '';
    const starsStr = zone.stars > 0 ? '⭐'.repeat(Math.min(zone.stars, 5)) : '';

    // Connection line from center
    html += `<div class="map-connection ${connClass}" style="transform: rotate(${angle}deg)"></div>`;

    // Zone node
    html += `<div class="map-node ${stateClass}" data-zone="${zoneId}" style="left:${x}px;top:${y}px">
      <div class="map-node-icon">${def.icon}</div>
      <div class="map-node-name">${def.name}</div>
      ${starsStr ? `<div class="map-node-stars">${starsStr}</div>` : ''}
    </div>`;
  });

  // Master node in center
  const masterClass = allDefeated ? 'ready' : 'locked';
  html += `<div class="map-master ${masterClass}">
    <div class="map-master-icon">👑</div>
    <div class="map-master-name">MASTER</div>
  </div>`;

  mapEl.innerHTML = html;

  // Click handlers
  mapEl.querySelectorAll('.map-node:not(.locked)').forEach(node => {
    node.addEventListener('click', () => {
      openZoneDetail(node.dataset.zone);
    });
  });
}

function openZoneDetail(zoneId) {
  const adv = getAdventure();
  const zone = adv.zones[zoneId];
  const def = ADVENTURE_ZONES[zoneId];
  _adventureZoneId = zoneId;

  document.getElementById('zone-title').textContent = def.name;

  // Build dungeon path (bottom to top: start at bottom, boss at top)
  const pathEl = document.getElementById('dungeon-path');
  let html = '';

  // Boss at top
  const bossReady = zone.bossUnlocked && !zone.bossDefeated;
  const bossDefeated = zone.bossDefeated;
  const bossClass = bossDefeated ? 'defeated' : bossReady ? 'ready' : 'locked';
  const bossConnClass = bossDefeated ? 'completed' : bossReady ? 'active' : '';
  const bossIcon = bossDefeated ? '👑' : '💀';
  const bossLabelClass = bossDefeated ? 'defeated' : bossReady ? 'ready' : 'locked';

  html += `<div class="dungeon-boss-wrapper">
    <div class="dungeon-boss-node ${bossClass}" data-boss="true">
      ${bossIcon}
    </div>
    <div class="dungeon-boss-label ${bossLabelClass}">${def.bossName}</div>
  </div>`;
  html += `<div class="dungeon-connector ${bossConnClass}"></div>`;

  // Star nodes top to bottom (5 down to 1)
  for (let i = STARS_FOR_BOSS; i >= 1; i--) {
    const isCompleted = zone.stars >= i;
    const isCurrent = zone.stars === i - 1 && !zone.bossDefeated;
    const nodeClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
    const connClass = isCompleted ? 'completed' : isCurrent ? 'active' : '';
    const icon = isCompleted ? '⭐' : isCurrent ? '⚔️' : '🔒';
    const label = isCompleted ? `Étoile ${i}` : isCurrent ? 'Expédition !' : `Étoile ${i}`;

    // Node
    html += `<div class="dungeon-node ${nodeClass}" data-star="${i}">
      ${icon}
      <span class="dungeon-node-label">${label}</span>
    </div>`;

    // Connector below (except after last)
    if (i > 1) {
      const prevCompleted = zone.stars >= i - 1;
      const prevCurrent = zone.stars === i - 2 && !zone.bossDefeated;
      const prevConnClass = prevCompleted ? 'completed' : prevCurrent ? 'active' : '';
      html += `<div class="dungeon-connector ${prevConnClass}"></div>`;
    }
  }

  // Zone header at bottom (start point)
  html += `<div class="dungeon-connector ${zone.stars >= 1 ? 'completed' : 'active'}"></div>`;
  html += `<div class="dungeon-zone-header">
    <div class="dungeon-zone-icon">${def.icon}</div>
    <div class="dungeon-zone-name">${def.name}</div>
  </div>`;

  // Post-boss: replay node at very top
  if (bossDefeated) {
    const replayHtml = `<div class="dungeon-node completed" data-star="replay" style="border-color:#4ecdc4">
      🔄
      <span class="dungeon-node-label">Rejouer</span>
    </div>
    <div class="dungeon-connector completed"></div>`;
    html = replayHtml + html;
  }

  // Expedition limit counter
  const remaining = getRemainingExpeditions();
  html += `<div class="dungeon-limit-info">
    <span class="dungeon-limit-icon">${remaining > 0 ? '🗺️' : '⏳'}</span>
    <span>${remaining > 0 ? `${remaining} expédition${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} aujourd'hui` : "Reviens demain pour continuer !"}</span>
  </div>`;

  pathEl.innerHTML = html;

  // Click handlers — star nodes launch expedition (if limit not reached)
  const canExpedition = remaining > 0;
  pathEl.querySelectorAll('.dungeon-node.current, .dungeon-node.completed, .dungeon-node[data-star="replay"]').forEach(node => {
    if (!canExpedition) {
      node.classList.add('exhausted');
      return;
    }
    node.addEventListener('click', () => {
      state.category = _adventureZoneId;
      state.questionCount = EXPEDITION_LENGTH;
      state.revisionMode = false;
      state.adventureMode = true;
      startGame();
    });
  });

  // Boss node
  const bossNode = pathEl.querySelector('.dungeon-boss-node.ready');
  if (bossNode) {
    bossNode.addEventListener('click', () => {
      launchAdventureBoss(_adventureZoneId);
    });
  }

  showScreen('screen-adventure-zone');

  // Auto-scroll to current node (we climb up, so scroll down to see start)
  setTimeout(() => {
    const current = pathEl.querySelector('.dungeon-node.current') || pathEl.querySelector('.dungeon-boss-node.ready');
    if (current) current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else pathEl.scrollTop = pathEl.scrollHeight;
  }, 100);
}

// ── Adventure Boss Fight ──────────────────────────────────────
let _criticalBarInterval = null;
let _criticalBarStart = 0;
const CRITICAL_BAR_DURATION = 10;

function launchAdventureBoss(zoneId) {
  const boss = startAdventureBoss(zoneId);
  const def = ADVENTURE_ZONES[zoneId];

  document.getElementById('adv-boss-emoji').textContent = def.icon;
  document.getElementById('adv-boss-name').textContent = def.bossName;
  updateAdvBossHpBar(boss.hp, boss.maxHp);
  renderErrorPips(boss.errorsMax, 0);

  const subLevel = getSubLevel(zoneId);
  state.adventureBossQuestions = [];
  for (let i = 0; i < boss.maxHp + boss.errorsMax + 5; i++) {
    state.adventureBossQuestions.push(generateQuestion(zoneId, subLevel, null));
  }
  state.adventureBossQIndex = 0;

  showScreen('screen-adventure-boss');
  showNextAdvBossQuestion();
}

function showNextAdvBossQuestion() {
  const q = state.adventureBossQuestions[state.adventureBossQIndex];
  if (!q) return;
  document.getElementById('adv-boss-question').textContent = q.text;
  const input = document.getElementById('adv-boss-answer');
  input.value = '';
  input.focus();
  _criticalBarStart = performance.now();
  startCriticalBar();
}

function startCriticalBar() {
  const fill = document.getElementById('critical-bar-fill');
  if (_criticalBarInterval) cancelAnimationFrame(_criticalBarInterval);
  function tick() {
    const elapsed = (performance.now() - _criticalBarStart) / 1000;
    const pct = Math.min(100, (elapsed / CRITICAL_BAR_DURATION) * 100);
    fill.style.width = pct + '%';
    if (pct < 100) _criticalBarInterval = requestAnimationFrame(tick);
  }
  _criticalBarInterval = requestAnimationFrame(tick);
}

function stopCriticalBar() {
  if (_criticalBarInterval) cancelAnimationFrame(_criticalBarInterval);
  _criticalBarInterval = null;
}

document.getElementById('adv-boss-submit')?.addEventListener('click', submitAdvBossAnswer);
document.getElementById('adv-boss-answer')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') submitAdvBossAnswer();
});

function submitAdvBossAnswer() {
  const q = state.adventureBossQuestions[state.adventureBossQIndex];
  const input = document.getElementById('adv-boss-answer');
  const raw = input.value.trim();
  if (!raw) return;

  stopCriticalBar();
  const elapsed = (performance.now() - _criticalBarStart) / 1000;
  const threshold = getCriticalThreshold(_adventureZoneId);

  const correct = checkAdvAnswer(raw, q);

  if (correct) {
    const isCritical = elapsed <= threshold;
    bossDamage(isCritical);
    const boss = getAdventureBoss();
    updateAdvBossHpBar(boss.hp, boss.maxHp);

    if (isCritical) {
      document.querySelector('.adventure-boss-arena')?.classList.add('screen-shake');
      document.querySelector('.adventure-boss-emoji')?.classList.add('critical-impact');
      setTimeout(() => {
        document.querySelector('.adventure-boss-arena')?.classList.remove('screen-shake');
        document.querySelector('.adventure-boss-emoji')?.classList.remove('critical-impact');
      }, 500);
    }

    if (boss.victory) {
      setTimeout(() => showAdventureBossEnd(true), 600);
      return;
    }
  } else {
    bossError();
    const boss = getAdventureBoss();
    renderErrorPips(boss.errorsMax, boss.errors);

    if (boss.defeated) {
      setTimeout(() => showAdventureBossEnd(false), 600);
      return;
    }
  }

  state.adventureBossQIndex++;
  setTimeout(showNextAdvBossQuestion, 400);
}

function checkAdvAnswer(raw, question) {
  if (question.textAnswer) {
    return raw.toLowerCase().trim() === question.textAnswer.toLowerCase().trim();
  }
  const num = parseFloat(raw.replace(',', '.'));
  return !isNaN(num) && Math.abs(num - question.answer) < 0.01;
}

function updateAdvBossHpBar(hp, maxHp) {
  const pct = (hp / maxHp) * 100;
  document.getElementById('adv-boss-hp-fill').style.width = pct + '%';
  document.getElementById('adv-boss-hp-text').textContent = `${hp}/${maxHp}`;
}

function renderErrorPips(max, used) {
  document.getElementById('adv-boss-errors').innerHTML = Array.from({ length: max }, (_, i) =>
    `<div class="boss-error-pip ${i < used ? 'used' : ''}"></div>`
  ).join('');
}

function showAdventureBossEnd(victory) {
  const def = ADVENTURE_ZONES[_adventureZoneId];
  document.getElementById('adv-boss-end-emoji').textContent = def.icon;
  document.getElementById('adv-boss-end-title').textContent = victory ? 'Victoire !' : 'Défaite...';
  document.getElementById('adv-boss-end-subtitle').textContent = victory
    ? `Tu as vaincu ${def.bossName} !`
    : `${def.bossName} est trop fort... pour l'instant.`;

  const rewardsEl = document.getElementById('adv-boss-end-rewards');
  if (victory) {
    const coins = 50;
    const xp = 100;
    ProfileManager.set('coins', (ProfileManager.get('coins', 0) || 0) + coins);
    ProfileManager.set('xp', (ProfileManager.get('xp', 0) || 0) + xp);
    const adv = getAdventure();
    const zone = adv.zones[_adventureZoneId];
    const titles = ProfileManager.get('titles', []);
    if (zone.bossTitle && !titles.includes(zone.bossTitle)) {
      titles.push(zone.bossTitle);
      ProfileManager.set('titles', titles);
    }
    rewardsEl.innerHTML = `
      <p>🪙 +${coins} pièces</p>
      <p>✨ +${xp} XP</p>
      <p>🏅 Titre : ${zone.bossTitle}</p>
    `;
    state.pendingChests.push({ tier: 'big', source: 'adventure-boss' });
  } else {
    rewardsEl.innerHTML = `<p>Réessaie — tu seras plus fort la prochaine fois !</p>`;
  }
  showScreen('screen-adventure-boss-end');
}

document.getElementById('btn-adventure-boss-continue')?.addEventListener('click', () => {
  if (state.pendingChests.length > 0) {
    showChest(state.pendingChests.shift());
  } else {
    openZoneDetail(_adventureZoneId);
  }
});

// ── Shop Screen ────────────────────────────────────────────────────
document.getElementById('btn-shop').addEventListener('click', () => { renderShop(); showScreen('screen-shop'); });
document.getElementById('btn-shop-back').addEventListener('click', () => { updateProfileHeader(); showScreen('screen-home'); });

async function renderShop() {
  const coins = ProfileManager.get('coins', 0);
  const ownedPalettes = ProfileManager.get('ownedPalettes', []);
  const ownedVisuals = ProfileManager.get('ownedVisuals', []);
  const ownedStickers = ProfileManager.get('ownedStickers', []);
  document.getElementById('shop-coins').textContent = coins;
  const container = document.getElementById('shop-grid');

  // === SECTION 1: Palettes (only unpurchased paid) ===
  const paidPalettes = getPaletteList().filter(p => p.price > 0);
  const unboughtPalettes = paidPalettes.filter(p => !ownedPalettes.includes(p.id));
  let html = '';
  if (unboughtPalettes.length > 0) {
    html += '<h3 class="shop-section-title">🎨 Palettes</h3>';
    html += unboughtPalettes.map(p => {
      return `<div class="shop-item shop-palette" data-palette="${p.id}">
        <span class="shop-icon">${p.preview}</span>
        <span class="shop-name">${p.name}</span>
        <span class="shop-price">🪙 ${p.price}</span>
      </div>`;
    }).join('');
  }

  // === SECTION 1b: Thèmes visuels (only unpurchased paid) ===
  const paidVisuals = getVisualList().filter(v => v.price > 0);
  const unboughtVisuals = paidVisuals.filter(v => !ownedVisuals.includes(v.id));
  if (unboughtVisuals.length > 0) {
    html += '<h3 class="shop-section-title">🖼️ Thèmes visuels</h3>';
    html += unboughtVisuals.map(v => {
      return `<div class="shop-item shop-visual" data-visual="${v.id}">
        <span class="shop-icon">${v.preview}</span>
        <span class="shop-name">${v.name}</span>
        <span class="shop-price">🪙 ${v.price}</span>
      </div>`;
    }).join('');
  }

  const allThemesOwned = unboughtPalettes.length === 0 && unboughtVisuals.length === 0;

  // === SECTION 2: Stickers saisonniers (only unpurchased) ===
  const unboughtStickers = STICKERS.filter(s => !ownedStickers.includes(s.id));
  if (unboughtStickers.length > 0) {
    const currentSeason = STICKERS[0].season;
    html += `<h3 class="shop-section-title">🏷️ Stickers — ${currentSeason}</h3>`;
    unboughtStickers.forEach(s => {
      html += `<div class="shop-item shop-sticker" data-sticker="${s.id}">
        <span class="shop-icon">${s.icon}</span>
        <span class="shop-name">${s.name}</span>
        <span class="shop-price">🪙 ${s.price}</span>
      </div>`;
    });
  }

  const allStickersOwned = unboughtStickers.length === 0;
  const boostsUnlocked = allThemesOwned && allStickersOwned;

  // === SECTION 3: Boosts (verrouillés tant que tout n'est pas acheté) ===
  html += '<h3 class="shop-section-title">⚡ Boosts de partie</h3>';
  if (!boostsUnlocked) {
    const palettesLeft = unboughtPalettes.length;
    const visualsLeft = unboughtVisuals.length;
    const stickersLeft = STICKERS.filter(s => !ownedStickers.includes(s.id)).length;
    html += `<div class="shop-locked-msg">🔒 Achète toutes les palettes, thèmes visuels${STICKERS.length > 0 ? ' et stickers' : ''} pour débloquer les boosts !`;
    if (palettesLeft > 0) html += `<br><span class="shop-locked-detail">${palettesLeft} palette${palettesLeft > 1 ? 's' : ''} restante${palettesLeft > 1 ? 's' : ''}</span>`;
    if (visualsLeft > 0) html += `<br><span class="shop-locked-detail">${visualsLeft} thème${visualsLeft > 1 ? 's' : ''} visuel${visualsLeft > 1 ? 's' : ''} restant${visualsLeft > 1 ? 's' : ''}</span>`;
    if (stickersLeft > 0) html += `<br><span class="shop-locked-detail">${stickersLeft} sticker${stickersLeft > 1 ? 's' : ''} restant${stickersLeft > 1 ? 's' : ''}</span>`;
    html += '</div>';
  } else {
    const boostsOwned = ProfileManager.get('boosts', {});
    BOOSTS.forEach(b => {
      const count = boostsOwned[b.id] || 0;
      html += `<div class="shop-item shop-boost" data-boost="${b.id}">
        <span class="shop-icon">${b.icon}</span>
        <span class="shop-name">${b.name}</span>
        <span class="shop-desc">${b.desc}</span>
        <span class="shop-price">🪙 ${b.price}</span>
        ${count > 0 ? `<span class="shop-owned-count">×${count} en stock</span>` : ''}
      </div>`;
    });
  }

  // === SECTION 4: Récompenses Vraie Vie (from groups) ===
  try {
    const groupRewards = await getAllMyRewards();
    const buyableRewards = groupRewards.filter(r => {
      const key = 'purchased_reward_' + r.groupCode + '_' + r.id;
      return !ProfileManager.get(key, false);
    });
    if (buyableRewards.length > 0) {
      html += '<h3 class="shop-section-title">🎁 Récompenses Vraie Vie</h3>';
      buyableRewards.forEach(r => {
        html += '<div class="shop-item shop-reward" data-reward-group="' + r.groupCode + '" data-reward-id="' + r.id + '" data-price="' + r.price + '">' +
          '<span class="shop-icon">' + (r.icon || '🎁') + '</span>' +
          '<span class="shop-name">' + r.name + '</span>' +
          '<span class="shop-desc">' + (r.description || '') + '</span>' +
          '<span class="shop-price">🪙 ' + r.price + '</span>' +
          '<span class="shop-desc" style="font-size:0.65rem">👥 ' + r.groupName + '</span>' +
          '</div>';
      });
    }
  } catch(e) { /* offline — skip rewards */ }

  container.innerHTML = html;

  // === Event handlers ===
  // Reward buy (group-based)
  container.querySelectorAll('.shop-reward').forEach(item => {
    item.addEventListener('click', () => {
      const groupCode = item.dataset.rewardGroup;
      const rewardId = item.dataset.rewardId;
      const price = parseInt(item.dataset.price);
      const name = item.querySelector('.shop-name').textContent;
      const c = ProfileManager.get('coins', 0);
      if (c >= price) {
        if (confirm('Acheter ' + name + ' pour ' + price + ' 🪙 ?')) {
          ProfileManager.set('coins', c - price);
          ProfileManager.set('purchased_reward_' + groupCode + '_' + rewardId, true);
          renderShop();
        }
      } else {
        alert('Pas assez de pièces ! (' + c + '/' + price + ')');
      }
    });
  });

  // Palette buy
  container.querySelectorAll('.shop-palette').forEach(item => {
    item.addEventListener('click', () => {
      const paletteId = item.dataset.palette;
      const palette = PALETTES[paletteId];
      const c = ProfileManager.get('coins', 0);
      if (c >= palette.price) {
        if (confirm(`Acheter ${palette.name} ${palette.preview} pour ${palette.price} 🪙 ?`)) {
          ProfileManager.set('coins', c - palette.price);
          const o = ProfileManager.get('ownedPalettes', []);
          o.push(paletteId);
          ProfileManager.set('ownedPalettes', o);
          renderShop();
        }
      } else {
        alert(`Pas assez de pièces ! (${c}/${palette.price})`);
      }
    });
  });

  // Visual theme buy
  container.querySelectorAll('.shop-visual').forEach(item => {
    item.addEventListener('click', () => {
      const visualId = item.dataset.visual;
      const visual = VISUAL_THEMES[visualId];
      const c = ProfileManager.get('coins', 0);
      if (c >= visual.price) {
        if (confirm(`Acheter ${visual.name} ${visual.preview} pour ${visual.price} 🪙 ?`)) {
          ProfileManager.set('coins', c - visual.price);
          const o = ProfileManager.get('ownedVisuals', []);
          o.push(visualId);
          ProfileManager.set('ownedVisuals', o);
          renderShop();
        }
      } else {
        alert(`Pas assez de pièces ! (${c}/${visual.price})`);
      }
    });
  });

  // Sticker buy (shop only shows unbought)
  container.querySelectorAll('.shop-sticker').forEach(item => {
    item.addEventListener('click', () => {
      const stickerId = item.dataset.sticker;
      const sticker = STICKERS.find(s => s.id === stickerId);
      const c = ProfileManager.get('coins', 0);
      if (c >= sticker.price) {
        if (confirm(`Acheter ${sticker.name} ${sticker.icon} pour ${sticker.price} 🪙 ?`)) {
          ProfileManager.set('coins', c - sticker.price);
          const o = ProfileManager.get('ownedStickers', []);
          o.push(stickerId);
          ProfileManager.set('ownedStickers', o);
          renderShop();
        }
      } else {
        alert(`Pas assez de pièces ! (${c}/${sticker.price})`);
      }
    });
  });

  // Boost buy
  if (boostsUnlocked) {
    container.querySelectorAll('.shop-boost').forEach(item => {
      item.addEventListener('click', () => {
        const boostId = item.dataset.boost;
        const boost = BOOSTS.find(b => b.id === boostId);
        const c = ProfileManager.get('coins', 0);
        if (c >= boost.price) {
          if (confirm(`Acheter ${boost.name} pour ${boost.price} 🪙 ?`)) {
            ProfileManager.set('coins', c - boost.price);
            const inv = ProfileManager.get('boosts', {});
            inv[boostId] = (inv[boostId] || 0) + 1;
            ProfileManager.set('boosts', inv);
            renderShop();
          }
        } else {
          alert(`Pas assez de pièces ! (${c}/${boost.price})`);
        }
      });
    });
  }
}

// ── Chest Screen ───────────────────────────────────────────────────
function showChest(chest) {
  const ownedPal = ProfileManager.get('ownedPalettes', []);
  const ownedVis = ProfileManager.get('ownedVisuals', []);
  const loot = generateChestLoot(chest.tier, ownedPal, ownedVis);
  showScreen('screen-chest');
  const box = document.getElementById('chest-box');
  const itemsContainer = document.getElementById('chest-items');
  const closeBtn = document.getElementById('btn-chest-close');
  const screenEl = document.getElementById('screen-chest');
  const isBig = chest.tier === 'big';
  box.className = 'chest-box' + (isBig ? ' chest-big' : '');
  screenEl.classList.toggle('chest-screen-big', isBig);
  box.textContent = isBig ? '👑' : '🎁';
  itemsContainer.innerHTML = '';
  closeBtn.style.display = 'none';

  box.onclick = () => {
    box.classList.add('shaking');
    setTimeout(() => {
      box.classList.remove('shaking');
      box.classList.add('opened');
      box.textContent = isBig ? '💎' : '🎉';
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
      recordChestOpened();
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
    renderDailyQuests();
    showScreen('screen-home');
  }
});

// ── Profile Detail Screen ─────────────────────────────────────────
document.getElementById('btn-profile-detail').addEventListener('click', () => { renderProfileDetail(); showScreen('screen-profile-detail'); });
document.getElementById('btn-profile-back').addEventListener('click', () => { showScreen('screen-home'); });

async function renderProfileDetail() {
  const profile = ProfileManager.getActive();
  const xp = ProfileManager.get('xp', 0);
  const coins = ProfileManager.get('coins', 0);
  const gamesPlayed = ProfileManager.get('gamesPlayed', 0);
  const rp = getRankProgress(xp);
  const badges = ProfileManager.get('badges', []);

  document.getElementById('profile-card').innerHTML = `
    <span class="rank-icon">${rp.current.icon}</span>
    <span class="profile-name">${escapeHtml(profile.name)}</span>
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

  // === Stats de jeu ===
  const catStats = ProfileManager.get('catStats', {});
  const totalQ = Object.values(catStats).reduce((s, c) => s + (c.total || 0), 0);
  const totalC = Object.values(catStats).reduce((s, c) => s + (c.correct || 0), 0);
  const pct = totalQ > 0 ? Math.round(totalC / totalQ * 100) : 0;
  const timeSpent = ProfileManager.get('weeklyTimeSpent', 0);
  const timeMin = Math.round(timeSpent / 60);
  const contracts = ProfileManager.get('contractsCompleted', { bronze: 0, silver: 0, gold: 0 });
  const totalContracts = (contracts.bronze || 0) + (contracts.silver || 0) + (contracts.gold || 0);

  let statsHtml = '<div class="profile-game-stats"><h3>📊 Mes Stats</h3>';
  statsHtml += '<div class="stat-grid">';
  statsHtml += '<div class="stat-box"><span class="stat-value">' + totalQ + '</span><span class="stat-label">Questions</span></div>';
  statsHtml += '<div class="stat-box"><span class="stat-value">' + pct + '%</span><span class="stat-label">Réussite</span></div>';
  statsHtml += '<div class="stat-box"><span class="stat-value">' + timeMin + 'min</span><span class="stat-label">Temps</span></div>';
  statsHtml += '<div class="stat-box"><span class="stat-value">' + totalContracts + '</span><span class="stat-label">Contrats</span></div>';
  statsHtml += '</div>';

  const catLabels = { calcul: '🧮 Calcul', logique: '🧩 Logique', geometrie: '📐 Géométrie', fractions: '🍕 Fractions', mesures: '📏 Mesures', ouvert: '💡 Problèmes' };
  const catColors = { calcul: '#4a9eff', logique: '#a855f7', geometrie: '#4ecdc4', fractions: '#ff8c42', mesures: '#ff6b6b', ouvert: '#ffd93d' };
  statsHtml += '<div class="category-bars">';
  for (const [cat, label] of Object.entries(catLabels)) {
    const cs = catStats[cat] || { correct: 0, total: 0 };
    const catPct = cs.total > 0 ? Math.round(cs.correct / cs.total * 100) : 0;
    const barColor = catPct >= 60 ? (catColors[cat] || '#4a9eff') : '#ff6b6b';
    statsHtml += '<div class="cat-bar-row">' +
      '<span class="cat-bar-label">' + label + '</span>' +
      '<div class="cat-bar-track"><div class="cat-bar-fill" style="width:' + catPct + '%;background:' + barColor + '"></div></div>' +
      '<span class="cat-bar-pct" style="color:' + barColor + '">' + catPct + '%</span>' +
      (catPct < 50 ? ' <span style="font-size:0.7rem">⚠️</span>' : '') +
      '</div>';
  }
  statsHtml += '</div></div>';
  document.getElementById('profile-card').innerHTML += statsHtml;

  // === Age selector ===
  const currentAge = ProfileManager.get('age', 10);
  let ageHtml = '<div class="profile-age-selector"><h3>🎂 Mon âge</h3><div class="pill-group" data-setting="profile-age">';
  [8, 9, 10, 11, 12].forEach(a => {
    ageHtml += '<button class="pill ' + (a === currentAge ? 'active' : '') + '" data-value="' + a + '">' + a + ' ans</button>';
  });
  ageHtml += '</div></div>';
  document.getElementById('profile-card').innerHTML += ageHtml;

  // === Palette selector ===
  const ownedPaletteIds = ProfileManager.get('ownedPalettes', []);
  const activePaletteId = ProfileManager.get('activePalette', 'none');
  const allOwnedPalettes = [...FREE_PALETTES, ...ownedPaletteIds]
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .map(id => PALETTES[id])
    .filter(Boolean);

  let paletteHtml = '<h3>🎨 Palette de couleur</h3><div class="theme-selector">';
  // "None" option
  const palNoneActive = activePaletteId === 'none';
  paletteHtml += `<div class="theme-select-item ${palNoneActive ? 'theme-active' : ''}" data-palette="none">
    <span class="theme-select-icon">🚫</span>
    <span class="theme-select-name">Aucune</span>
    ${palNoneActive ? '<span class="theme-select-check">✓</span>' : ''}
  </div>`;
  allOwnedPalettes.forEach(p => {
    const isActive = p.id === activePaletteId;
    paletteHtml += `<div class="theme-select-item ${isActive ? 'theme-active' : ''}" data-palette="${p.id}">
      <span class="theme-select-icon">${p.preview}</span>
      <span class="theme-select-name">${p.name}</span>
      ${isActive ? '<span class="theme-select-check">✓</span>' : ''}
    </div>`;
  });
  paletteHtml += '</div>';
  document.getElementById('profile-card').innerHTML += paletteHtml;

  // === Visual theme selector ===
  const ownedVisualIds = ProfileManager.get('ownedVisuals', []);
  const activeVisualId = ProfileManager.get('activeVisual', 'none');
  const allOwnedVisuals = [...FREE_VISUALS, ...ownedVisualIds]
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .map(id => VISUAL_THEMES[id])
    .filter(Boolean);

  let visualHtml = '<h3>🖼️ Thème visuel</h3><div class="theme-selector">';
  // "None" option
  const visNoneActive = activeVisualId === 'none';
  visualHtml += `<div class="theme-select-item ${visNoneActive ? 'theme-active' : ''}" data-visual="none">
    <span class="theme-select-icon">🚫</span>
    <span class="theme-select-name">Aucun</span>
    ${visNoneActive ? '<span class="theme-select-check">✓</span>' : ''}
  </div>`;
  allOwnedVisuals.forEach(v => {
    const isActive = v.id === activeVisualId;
    const isBoss = v.price === -1;
    visualHtml += `<div class="theme-select-item ${isActive ? 'theme-active' : ''}" data-visual="${v.id}">
      <span class="theme-select-icon">${v.preview}</span>
      <span class="theme-select-name">${v.name}</span>
      ${isBoss ? '<span class="theme-select-badge">⚔️</span>' : ''}
      ${isActive ? '<span class="theme-select-check">✓</span>' : ''}
    </div>`;
  });
  visualHtml += '</div>';
  document.getElementById('profile-card').innerHTML += visualHtml;

  // V5: Title selector
  const ownedTitles = ProfileManager.get('bossTitles', []) || [];
  if (ownedTitles.length > 0) {
    const activeTitle = ProfileManager.get('activeTitle', null);
    let titleHtml = '<div class="title-section"><h3>🏆 Titres</h3><div class="title-chips">';
    titleHtml += '<button class="title-chip ' + (!activeTitle ? 'active' : '') + '" data-title="">Aucun</button>';
    ownedTitles.forEach(t => {
      const name = TITLE_NAMES[t] || t;
      titleHtml += '<button class="title-chip ' + (activeTitle === t ? 'active' : '') + '" data-title="' + t + '">' + name + '</button>';
    });
    titleHtml += '</div></div>';
    document.getElementById('profile-card').innerHTML += titleHtml;
  }

  // V4: Groups + Riddle creation buttons
  document.getElementById('profile-card').innerHTML += `
    <div style="display:flex;gap:0.5rem;margin-top:1rem;width:100%">
      <button class="btn-primary" id="btn-profile-groups" style="flex:1;font-size:0.85rem">👥 Mes Groupes</button>
      <button class="btn-secondary" id="btn-profile-riddle" style="flex:1;font-size:0.85rem">📝 Créer une énigme</button>
      <button class="btn-secondary" id="btn-profile-progression" style="flex:1;font-size:0.85rem">📊 Progression</button>
    </div>
    <div style="display:flex;gap:0.5rem;margin-top:0.5rem;width:100%">
      <button class="btn-secondary" id="btn-profile-pet" style="flex:1;font-size:0.85rem">🐾 Mon compagnon</button>
    </div>
    <div style="margin-top:0.75rem;font-size:0.75rem;color:var(--text-secondary);text-align:center">
      Code de récupération : <strong style="color:var(--accent-yellow);letter-spacing:1px">${ProfileManager.get('recoveryCode', '...')}</strong>
    </div>
    <div style="margin-top:0.25rem;font-size:0.6rem;color:var(--text-secondary);word-break:break-all;text-align:center;opacity:0.5">
      ID : ${firebaseUid || 'non connecté'}
    </div>
    <div style="margin-top:0.75rem;text-align:center">
      <button id="btn-force-update-profile" style="background:none;border:none;color:var(--text-muted,#888);font-size:0.7rem;cursor:pointer;text-decoration:underline;opacity:0.6">🔄 Forcer la mise à jour</button>
    </div>
  `;

  // Force update button in profile
  document.getElementById('btn-force-update-profile').addEventListener('click', async () => {
    if (!confirm('Forcer la mise à jour ? L\'app va redémarrer.')) return;
    try {
      const [regs, keys] = await Promise.all([
        navigator.serviceWorker.getRegistrations(),
        caches.keys()
      ]);
      await Promise.all([...regs.map(r => r.unregister()), ...keys.map(k => caches.delete(k))]);
    } catch (e) { /* no SW support */ }
    location.reload();
  });

  // Palette selector click handlers
  document.querySelectorAll('[data-palette]').forEach(item => {
    item.addEventListener('click', () => {
      const paletteId = item.dataset.palette;
      ProfileManager.set('activePalette', paletteId);
      const currentVisual = ProfileManager.get('activeVisual', 'none');
      applyThemeCombo(paletteId === 'none' ? null : paletteId, currentVisual === 'none' ? null : currentVisual);
      renderProfileDetail();
    });
  });

  // Visual theme selector click handlers
  document.querySelectorAll('[data-visual]').forEach(item => {
    item.addEventListener('click', () => {
      const visualId = item.dataset.visual;
      ProfileManager.set('activeVisual', visualId);
      const currentPalette = ProfileManager.get('activePalette', 'none');
      applyThemeCombo(currentPalette === 'none' ? null : currentPalette, visualId === 'none' ? null : visualId);
      renderProfileDetail();
    });
  });

  // V5: Title chip click handlers
  document.querySelectorAll('.title-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const titleId = chip.dataset.title;
      ProfileManager.set('activeTitle', titleId || null);
      renderProfileDetail();
    });
  });

  // V6: Age selector click handler
  document.querySelectorAll('[data-setting="profile-age"] .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const newAge = parseInt(pill.dataset.value, 10);
      ProfileManager.set('age', newAge);
      ProfileManager.updateMeta(ProfileManager.getActiveId(), { age: newAge });
      const newLevel = newAge <= 9 ? 1 : newAge >= 11 ? 3 : 2;
      const catLevel = {};
      ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert'].forEach(k => { catLevel[k] = newLevel; });
      ProfileManager.set('catLevel', catLevel);
      ProfileManager.set('catStreak', {});
      renderProfileDetail();
      renderCatLevelIndicators();
    });
  });

  // V4: Groups + Riddle nav from profile
  const groupsBtn = document.getElementById('btn-profile-groups');
  if (groupsBtn) groupsBtn.addEventListener('click', () => renderGroupsScreen('screen-profile-detail'));
  const riddleBtn = document.getElementById('btn-profile-riddle');
  if (riddleBtn) riddleBtn.addEventListener('click', () => showCreateRiddleScreen());
  const progressionBtn = document.getElementById('btn-profile-progression');
  if (progressionBtn) progressionBtn.addEventListener('click', () => renderProgressionScreen());
  const petProfileBtn = document.getElementById('btn-profile-pet');
  if (petProfileBtn) petProfileBtn.addEventListener('click', () => showMyPet());

  const allBadges = [...BADGE_DEFS, {id:'collector',name:'Collectionneur',icon:'🏅',category:'hidden',hidden:true}, {id:'lucky',name:'Chanceux',icon:'🍀',category:'hidden',hidden:true}];

  const sections = [
    { key: 'reallife', title: '🎁 Récompenses Vraie Vie' },
    { key: 'perf', title: '🏆 Performance' },
    { key: 'master', title: '🎓 Maîtrise' },
    { key: 'xp', title: '⚔️ Progression XP' },
    { key: 'total', title: '✅ Réponses' },
    { key: 'debut', title: '⭐ Débuts' },
    { key: 'explore', title: '🌍 Exploration' },
    { key: 'boss', title: '⚔️ Boss' },
    { key: 'contrat', title: '🎯 Contrats' },
    { key: 'hidden', title: '🔮 Secrets' },
  ];

  let badgesHtml = '';
  for (const sec of sections) {
    const secBadges = allBadges.filter(b => b.category === sec.key);
    if (secBadges.length === 0) continue;

    // For hidden badges: only show unlocked ones + count of remaining mysteries
    if (sec.key === 'hidden') {
      const unlockedHidden = secBadges.filter(b => badges.includes(b.id));
      const hiddenCount = secBadges.length - unlockedHidden.length;
      badgesHtml += `<h3>${sec.title}</h3><div class="badges-grid">`;
      unlockedHidden.forEach(b => {
        badgesHtml += `<div class="badge-item badge-hidden"><span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span></div>`;
      });
      if (hiddenCount > 0) {
        badgesHtml += `<div class="badge-item" style="opacity:0.3"><span class="badge-icon">❓</span><span class="badge-name">${hiddenCount} secrets à découvrir</span></div>`;
      }
      badgesHtml += '</div>';
      continue;
    }

    if (sec.key === 'reallife') {
      // Show purchased group rewards ready to use
      let rlHtml = '<h3>' + sec.title + '</h3>';
      let hasRewards = false;
      try {
        const groupRewards = await getAllMyRewards();
        const ready = groupRewards.filter(r => {
          const key = 'purchased_reward_' + r.groupCode + '_' + r.id;
          return ProfileManager.get(key, false);
        });
        if (ready.length > 0) {
          hasRewards = true;
          rlHtml += '<div class="badges-grid">';
          ready.forEach(r => {
            const key = 'purchased_reward_' + r.groupCode + '_' + r.id;
            rlHtml += '<div class="badge-item badge-reallife" data-reward-key="' + key + '" style="cursor:pointer">' +
              '<span class="badge-icon">' + (r.icon || '🎁') + '</span>' +
              '<span class="badge-name">' + r.name + '</span>' +
              '<span class="badge-reward">' + (r.description || '') + '</span>' +
              '<span class="badge-hint" style="color:var(--accent-green)">Cliquer pour utiliser</span>' +
              '</div>';
          });
          rlHtml += '</div>';
        }
      } catch(e) { /* offline */ }
      if (!hasRewards) {
        rlHtml += '<p style="color:var(--text-secondary);font-size:0.85rem;text-align:center">Achète des récompenses dans la boutique !</p>';
      }
      badgesHtml += rlHtml;
      continue;
    }

    badgesHtml += `<h3>${sec.title}</h3><div class="badges-grid">`;
    secBadges.forEach(b => {
      const unlocked = badges.includes(b.id);
      const isRL = b.reallife;
      if (isRL) return; // skip — handled above
      let progressHtml = '';
      if (!unlocked && b.progress) {
        const p = b.progress();
        if (p.cur > 0) {
          const pct = Math.round((p.cur / p.max) * 100);
          progressHtml = `<div class="badge-progress"><div class="badge-progress-bar" style="width:${pct}%"></div></div><span class="badge-progress-text">${p.cur}/${p.max}</span>`;
        }
      }
      const hintHtml = !unlocked && b.hint ? `<span class="badge-hint">${b.hint}</span>` : '';
      const badgeStyle = !unlocked ? 'opacity:0.4;filter:grayscale(0.8)' : '';
      badgesHtml += `<div class="badge-item" style="${badgeStyle}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${b.name}</span>
        ${progressHtml}${hintHtml}
      </div>`;
    });
    badgesHtml += '</div>';
  }

  document.getElementById('profile-badges-list').innerHTML = badgesHtml;

  // Click handler for real-life rewards: use
  document.querySelectorAll('.badge-reallife[data-reward-key]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.rewardKey;
      if (confirm('Utiliser cette récompense ? Elle retournera dans la boutique.')) {
        ProfileManager.set(key, false);
        renderProfileDetail();
      }
    });
  });
}

document.getElementById('btn-delete-profile').addEventListener('click', () => {
  const profile = ProfileManager.getActive();
  if (!confirm('Supprimer le profil de ' + profile.name + ' ?\nToute sa progression sera perdue.')) return;
  if (!confirm('VRAIMENT supprimer ' + profile.name + ' ? Cette action est irréversible !')) return;
  ProfileManager.delete(profile.id);
  applyThemeCombo('none', 'none');
  renderProfilesList();
  showScreen('screen-profiles');
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

const _lowPerf = () => document.body.classList.contains('low-perf-mode');

function launchMiniConfetti() {
  if (_lowPerf()) return;
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
  const count = _lowPerf() ? 25 : 120;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * confettiCanvas.width;
    const y = -10 - Math.random() * 50;
    const vx = (Math.random() - 0.5) * 4;
    const vy = Math.random() * 2 + 1;
    particles.push(createParticle(x, y, vx, vy));
  }
  animateConfetti(particles);
}

let confettiAnimating = false;

function animateConfetti(particles) {
  if (confettiAnimating) {
    // Skip new animation if one is already running
    return;
  }
  confettiAnimating = true;
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
      confettiAnimating = false;
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

// V4: Firebase sync on launch
MQSync.syncOnLaunch().then(() => {
  // Show coin notification if earned from riddles
  const coinNotif = ProfileManager.get('coinNotification', 0);
  if (coinNotif > 0) {
    ProfileManager.set('coinNotification', 0);
    showCoinToast(coinNotif);
  }
  // Check for active revision sets
  checkRevisionSets();
}).catch(() => {});

// ══════════════════════════════════════════════════════════════════════
// V3 — BOSS FIGHT SYSTEM
// ══════════════════════════════════════════════════════════════════════

function shouldTriggerBoss() {
  if (state.pendingBoss) return false;
  const g = state.gamesSinceBoss;
  if (g <= 0) return false;
  if (g >= 15) return true;
  let prob = 0;
  if (g >= 11) prob = 0.20;
  else if (g >= 6) prob = 0.10;
  else if (g >= 2) prob = 0.05;
  return Math.random() < prob;
}

function pickBoss() {
  const defeated = ProfileManager.get('defeatedBosses', []);
  const lastBossCat = ProfileManager.get('lastBossCategory', null);
  let candidates = BOSS_POOL.filter(b => !defeated.includes(b.id));
  if (candidates.length === 0) candidates = BOSS_POOL;
  if (lastBossCat && candidates.length > 1) {
    const filtered = candidates.filter(b => b.category !== lastBossCat);
    if (filtered.length > 0) candidates = filtered;
  }
  return pick(candidates);
}

function triggerBoss() {
  const boss = pickBoss();
  state.pendingBoss = boss;
  state.gamesSinceBoss = 0;
  saveBossState();
  showBossAppear(boss);
}

function showBossAppear(boss) {
  const coins = ProfileManager.get('coins', 0);
  document.getElementById('boss-appear-emoji').textContent = boss.emoji;
  document.getElementById('boss-appear-name').textContent = boss.name;
  document.getElementById('boss-appear-category').textContent = CATEGORIES[boss.category]?.label || boss.category;
  document.getElementById('boss-appear-stake').textContent = boss.stake + ' 🪙';
  const fightBtn = document.getElementById('btn-boss-fight');
  if (coins < boss.stake) {
    fightBtn.textContent = `Pas assez de pièces (${coins}/${boss.stake} 🪙)`;
    fightBtn.disabled = true;
  } else {
    fightBtn.textContent = '⚔️ L\'affronter !';
    fightBtn.disabled = false;
  }
  showScreen('screen-boss-appear');
}

document.getElementById('btn-boss-fight').addEventListener('click', () => {
  if (!state.pendingBoss) return;
  startBossFight(state.pendingBoss);
});

document.getElementById('btn-boss-later').addEventListener('click', () => {
  saveBossState();
  updateProfileHeader();
  renderBossWaitingIcon();
  showScreen('screen-home');
});

function startBossFight(boss) {
  const coins = ProfileManager.get('coins', 0);
  ProfileManager.set('coins', coins - boss.stake);
  const defeated = ProfileManager.get('defeatedBosses', []);
  const isEnraged = defeated.includes(boss.id);
  const maxPlayerHP = 3;
  const maxBossHP = isEnraged ? boss.hp + 2 : boss.hp;
  const subLevel = Math.min(3, getSubLevel(boss.category) + 1);
  const phase1Questions = [];
  let lastCat = null;
  for (let i = 0; i < 3; i++) {
    const q = generateQuestion(boss.category, subLevel, lastCat);
    phase1Questions.push(q);
    lastCat = q.category;
  }
  const bossQ = getBossQuestion(boss.id);
  state.bossState = {
    boss, isEnraged, phase: 1, questionIndex: 0,
    playerHP: maxPlayerHP, bossHP: maxBossHP, maxPlayerHP, maxBossHP,
    questions: phase1Questions, bossQuestion: bossQ,
    currentStepIndex: 0, criticalHits: 0, answered: false,
    timerInterval: null, timerStart: 0, timerDuration: 0,
  };
  // Apply boss zone color
  document.getElementById('boss-zone').style.backgroundColor = boss.color || '#1a1a2e';
  showScreen('screen-boss-fight');
  // Set boss SVG
  const emojiEl = document.getElementById('boss-fight-emoji');
  if (BOSS_SVG[boss.id]) {
    emojiEl.innerHTML = BOSS_SVG[boss.id];
  } else {
    emojiEl.textContent = boss.emoji;
  }
  updateBossHP();
  showBossPhaseLabel();
  showBossQuestion();
}

function updateBossHP() {
  const bs = state.bossState;
  // Boss HP bar
  const bossPct = (Math.max(0, bs.bossHP) / bs.maxBossHP) * 100;
  document.getElementById('boss-hp-fill').style.width = bossPct + '%';
  document.getElementById('boss-hp-text').textContent = Math.max(0, bs.bossHP) + '/' + bs.maxBossHP;
  // Boss info
  // Use pixel art SVG if available, fallback to emoji
  const emojiEl = document.getElementById('boss-fight-emoji');
  if (BOSS_SVG[bs.boss.id] && !emojiEl.querySelector('svg')) {
    emojiEl.innerHTML = BOSS_SVG[bs.boss.id];
  }
  document.getElementById('boss-fight-name').textContent = bs.boss.name;
  // Player HP bar
  const playerPct = (bs.playerHP / bs.maxPlayerHP) * 100;
  document.getElementById('player-hp-fill').style.width = playerPct + '%';
  document.getElementById('player-hp-text').textContent = bs.playerHP + '/' + bs.maxPlayerHP;
  // Player hearts
  let hearts = '';
  for (let i = 0; i < bs.maxPlayerHP; i++) {
    hearts += i < bs.playerHP ? '❤️' : '🖤';
  }
  document.getElementById('player-hearts').innerHTML = hearts;
  // Boss low HP state — tremble when near death
  const emoji = document.getElementById('boss-fight-emoji');
  if (bs.bossHP <= 2 && bs.bossHP > 0) {
    emoji.classList.add('low-hp');
  } else {
    emoji.classList.remove('low-hp');
  }
}

function showBossPhaseLabel() {
  const bs = state.bossState;
  const label = document.getElementById('boss-phase-label');
  if (bs.phase === 1) {
    label.textContent = `Phase 1 — Assaut (${bs.questionIndex + 1}/3)`;
  } else {
    label.textContent = `⚔️ COUP FATAL — Étape ${bs.currentStepIndex + 1}/${bs.bossQuestion.steps.length}`;
  }
}

function showBossQuestion() {
  const bs = state.bossState;
  bs.answered = false;
  let q, timerDuration;
  if (bs.phase === 1) {
    q = bs.questions[bs.questionIndex];
    timerDuration = bs.isEnraged ? 12 : 15;
  } else {
    q = bs.bossQuestion.steps[bs.currentStepIndex];
    timerDuration = 30;
  }
  const badge = document.getElementById('boss-category-badge');
  const catInfo = CATEGORIES[q.category || bs.boss.category];
  badge.textContent = catInfo ? catInfo.label : '';
  badge.setAttribute('data-cat', q.category || bs.boss.category);
  document.getElementById('boss-question-card').setAttribute('data-cat', q.category || bs.boss.category);
  document.getElementById('boss-question-text').textContent = q.text;
  document.getElementById('boss-question-unit').textContent = q.unit ? 'Réponse en ' + q.unit : '';
  document.getElementById('boss-answer-section').style.display = '';
  document.getElementById('boss-feedback-section').style.display = 'none';
  const input = document.getElementById('boss-answer-input');
  input.value = '';
  input.type = q.textAnswer !== undefined ? 'text' : 'number';
  input.placeholder = 'Ta réponse...';
  startBossTimer(timerDuration);
  const card = document.getElementById('boss-question-card');
  card.classList.remove('slide-in');
  void card.offsetWidth;
  card.classList.add('slide-in');
  setTimeout(() => input.focus(), 100);
}

function startBossTimer(seconds) {
  const bs = state.bossState;
  stopBossTimer();
  bs.timerStart = Date.now();
  bs.timerDuration = seconds * 1000;
  const fill = document.getElementById('boss-timer-fill');
  fill.style.width = '100%';
  fill.className = 'boss-timer-fill';
  bs.timerInterval = setInterval(() => {
    const elapsed = Date.now() - bs.timerStart;
    const remaining = Math.max(0, 1 - elapsed / bs.timerDuration);
    fill.style.width = (remaining * 100) + '%';
    if (remaining < 0.25) fill.className = 'boss-timer-fill danger';
    else if (remaining < 0.5) fill.className = 'boss-timer-fill warning';
    if (remaining <= 0) {
      stopBossTimer();
      handleBossAnswer(true);
    }
  }, 50);
}

function stopBossTimer() {
  const bs = state.bossState;
  if (bs && bs.timerInterval) {
    clearInterval(bs.timerInterval);
    bs.timerInterval = null;
  }
}

function handleBossAnswer(timedOut) {
  const bs = state.bossState;
  if (bs.answered) return;
  bs.answered = true;
  stopBossTimer();
  let q, isCorrect;
  const elapsed = (Date.now() - bs.timerStart) / 1000;
  const input = document.getElementById('boss-answer-input');
  const userAnswer = timedOut ? '' : input.value.trim();
  if (bs.phase === 1) {
    q = bs.questions[bs.questionIndex];
  } else {
    q = bs.bossQuestion.steps[bs.currentStepIndex];
  }
  if (timedOut) {
    isCorrect = false;
  } else if (q.textAnswer !== undefined) {
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    isCorrect = norm(userAnswer) === norm(q.textAnswer);
  } else {
    isCorrect = parseFloat(userAnswer) === q.answer;
  }
  const isCritical = isCorrect && elapsed < (bs.timerDuration / 2000);
  const emoji = document.getElementById('boss-fight-emoji');
  if (isCorrect) {
    const damage = isCritical ? 2 : 1;
    bs.bossHP = Math.max(0, bs.bossHP - damage);
    if (isCritical) bs.criticalHits++;
    emoji.classList.remove('hit');
    void emoji.offsetWidth;
    emoji.classList.add('hit');
    launchMiniConfetti();
    // Flash boss HP bar
    const bossFill = document.getElementById('boss-hp-fill');
    bossFill.classList.remove('flash');
    void bossFill.offsetWidth;
    bossFill.classList.add('flash');
    // Critical flash overlay
    if (isCritical) {
      const flash = document.getElementById('boss-critical-flash');
      flash.classList.remove('active');
      void flash.offsetWidth;
      flash.classList.add('active');
    }
  } else {
    if (bs.phase === 1) {
      bs.playerHP--;
      // Shake player zone
      const playerZone = document.querySelector('.player-zone');
      playerZone.classList.remove('shake');
      void playerZone.offsetWidth;
      playerZone.classList.add('shake');
      emoji.classList.remove('attack');
      void emoji.offsetWidth;
      emoji.classList.add('attack');
    }
  }
  updateBossHP();
  const feedbackResult = document.getElementById('boss-feedback-result');
  const feedbackExplanation = document.getElementById('boss-feedback-explanation');
  if (isCorrect) {
    feedbackResult.textContent = isCritical ? 'CRITIQUE ! Dégâts ×2 !' : 'Correct ! Touché !';
    feedbackResult.className = 'feedback-result correct';
  } else {
    const correctAnswer = q.textAnswer !== undefined ? q.textAnswer : q.answer;
    feedbackResult.textContent = timedOut
      ? 'Temps écoulé ! La réponse était ' + correctAnswer
      : 'Tu as répondu ' + userAnswer + ' — la bonne réponse était ' + correctAnswer;
    feedbackResult.className = 'feedback-result incorrect';
  }
  feedbackExplanation.textContent = q.explanation || '';
  document.getElementById('boss-answer-section').style.display = 'none';
  document.getElementById('boss-feedback-section').style.display = '';
  if (bs.playerHP <= 0) {
    document.getElementById('btn-boss-next').textContent = 'Défaite...';
  } else if (bs.bossHP <= 0) {
    document.getElementById('btn-boss-next').textContent = 'Victoire !';
  } else {
    document.getElementById('btn-boss-next').textContent = 'Suivant';
  }
}

document.getElementById('btn-boss-validate').addEventListener('click', () => handleBossAnswer(false));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const bossScreen = document.getElementById('screen-boss-fight');
  if (!bossScreen.classList.contains('active')) return;
  if (state.bossState && state.bossState.answered) {
    document.getElementById('btn-boss-next').click();
  } else {
    handleBossAnswer(false);
  }
});

document.getElementById('btn-boss-next').addEventListener('click', () => {
  const bs = state.bossState;
  if (!bs) return;
  if (bs.playerHP <= 0) { endBossFight(false); return; }
  if (bs.bossHP <= 0) { endBossFight(true); return; }
  if (bs.phase === 1) {
    bs.questionIndex++;
    if (bs.questionIndex >= 3) {
      // Show COUP FATAL overlay, then transition to phase 2
      bs.phase = 2;
      bs.currentStepIndex = 0;
      const overlay = document.getElementById('boss-fatal-overlay');
      overlay.classList.add('active');
      setTimeout(() => {
        overlay.classList.remove('active');
        showBossPhaseLabel();
        showBossQuestion();
      }, 1800);
      return;
    }
  } else {
    bs.currentStepIndex++;
    if (bs.currentStepIndex >= bs.bossQuestion.steps.length) {
      endBossFight(bs.bossHP <= 0);
      return;
    }
  }
  showBossPhaseLabel();
  showBossQuestion();
});

function endBossFight(victory) {
  stopBossTimer();
  const bs = state.bossState;
  const boss = bs.boss;
  document.getElementById('boss-end-emoji').textContent = boss.emoji;
  if (victory) {
    document.getElementById('boss-end-title').textContent = 'Victoire !';
    document.getElementById('boss-end-message').textContent = boss.name + ' est vaincu !';
    const reward = calculateBossReward(boss, bs.playerHP, bs.maxPlayerHP);
    ProfileManager.set('coins', ProfileManager.get('coins', 0) + reward.coins);
    ProfileManager.set('xp', ProfileManager.get('xp', 0) + reward.xp);
    const defeated = ProfileManager.get('defeatedBosses', []);
    if (!defeated.includes(boss.id)) defeated.push(boss.id);
    ProfileManager.set('defeatedBosses', defeated);
    ProfileManager.set('lastBossCategory', boss.category);
    // Award boss title on every boss defeat
    const titleId = 'boss_' + boss.id;
    if (TITLE_NAMES[titleId]) {
      const titles = ProfileManager.get('bossTitles', []) || [];
      if (!titles.includes(titleId)) {
        ProfileManager.set('bossTitles', [...titles, titleId]);
      }
    }
    const loot = applyBossLoot(boss);
    let rewardsHtml = `<div class="reward-row"><span>Pièces gagnées</span><span class="reward-value">+${reward.coins} 🪙</span></div>`;
    rewardsHtml += `<div class="reward-row"><span>XP gagnés</span><span class="reward-value">+${reward.xp} XP</span></div>`;
    if (reward.flawless) {
      rewardsHtml += `<div class="reward-row"><span>🛡️ Sans égratignure !</span><span class="reward-value">+50 🪙 bonus</span></div>`;
    }
    document.getElementById('boss-end-rewards').innerHTML = rewardsHtml;
    const lootIcon = boss.lootType === 'theme' ? (THEMES[boss.lootId]?.preview || '🎁')
                   : boss.lootType === 'sticker' ? '🏷️'
                   : boss.lootType === 'badge' ? '🏅'
                   : boss.lootType === 'effect' ? '✨' : '🏆';
    document.getElementById('boss-end-loot').innerHTML = `
      <span class="loot-label">Loot exclusif !</span>
      <span class="loot-icon">${lootIcon}</span>
      <span class="loot-name">${boss.lootName}</span>
    `;
    document.getElementById('boss-end-loot').style.display = '';
    checkBossBadges(bs);
    launchBigConfetti();
  } else {
    document.getElementById('boss-end-title').textContent = 'Défaite...';
    document.getElementById('boss-end-message').textContent = boss.name + ' a gagné cette fois. Il reviendra... prépare-toi !';
    document.getElementById('boss-end-rewards').innerHTML = `<div class="reward-row"><span>Mise perdue</span><span class="reward-value" style="color:var(--accent-red)">−${boss.stake} 🪙</span></div>`;
    document.getElementById('boss-end-loot').style.display = 'none';
    onBossLost();
  }
  state.pendingBoss = null;
  state.gamesSinceBoss = 0;
  saveBossState();
  state.bossState = null;
  showScreen('screen-boss-end');
}

function checkBossBadges(bs) {
  const badges = ProfileManager.get('badges', []);
  const newBadges = [];
  if (!badges.includes('boss_first_win')) {
    badges.push('boss_first_win');
    newBadges.push({ icon: '⚔️', name: 'Première Victoire' });
  }
  const defeated = ProfileManager.get('defeatedBosses', []);
  if (defeated.length >= 6 && !badges.includes('boss_slayer')) {
    badges.push('boss_slayer');
    newBadges.push({ icon: '🗡️', name: 'Tueur de Boss' });
  }
  if (bs.playerHP === bs.maxPlayerHP && !badges.includes('boss_flawless')) {
    badges.push('boss_flawless');
    newBadges.push({ icon: '🛡️', name: 'Sans Égratignure' });
  }
  if (bs.criticalHits >= 3 && !badges.includes('boss_critical')) {
    badges.push('boss_critical');
    newBadges.push({ icon: '💥', name: 'Critique !' });
  }
  if (bs.isEnraged && bs.boss.id === 'dragon' && !badges.includes('boss_dragon_enraged')) {
    badges.push('boss_dragon_enraged');
    newBadges.push({ icon: '🐉', name: 'Chasseur de Dragons' });
  }
  ProfileManager.set('badges', badges);
  if (newBadges.length > 0) {
    const rewardsEl = document.getElementById('boss-end-rewards');
    newBadges.forEach(b => {
      rewardsEl.innerHTML += `<div class="reward-row"><span>${b.icon} Badge !</span><span class="reward-value">${b.name}</span></div>`;
    });
  }
}

document.getElementById('btn-boss-end-close').addEventListener('click', () => {
  updateProfileHeader();
  renderRecords();
  renderBossWaitingIcon();
  showScreen('screen-home');
});

function renderBossWaitingIcon() {
  let icon = document.getElementById('boss-waiting-icon');
  if (state.pendingBoss) {
    if (!icon) {
      icon = document.createElement('div');
      icon.id = 'boss-waiting-icon';
      icon.className = 'boss-waiting-icon';
      document.getElementById('screen-home').appendChild(icon);
    }
    icon.textContent = state.pendingBoss.emoji;
    icon.style.display = '';
    icon.onclick = () => showBossAppear(state.pendingBoss);
  } else if (icon) {
    icon.style.display = 'none';
  }
}

// ══════════════════════════════════════════════════════════════════════
// V3 — CONTRAT D'OBJECTIF
// ══════════════════════════════════════════════════════════════════════

function showContractScreen() {
  const catLevel = ProfileManager.get('catLevel', {});
  const contractLevel = state.category !== 'all' ? (catLevel[state.category] || 2) : 2;
  const contracts = generateContracts(
    state.category, contractLevel, state.questionCount, state.categoryStats
  );
  const container = document.getElementById('contract-options');
  container.innerHTML = contracts.map(c => {
    const condText = c.conditions.length > 0
      ? c.conditions.map(cond => cond.label).join(' + ')
      : '';
    return `<div class="contract-card" data-tier="${c.tier}">
      <span class="contract-icon">${c.icon}</span>
      <div class="contract-info">
        <div class="contract-title">${c.label}</div>
        <div class="contract-conditions">${condText}</div>
      </div>
      <span class="contract-bonus">+${c.bonus} 🪙</span>
    </div>`;
  }).join('');
  state._contracts = contracts;
  container.querySelectorAll('.contract-card').forEach(card => {
    card.addEventListener('click', () => {
      const tier = card.dataset.tier;
      state.activeContract = contracts.find(c => c.tier === tier);
      state.contractGameResult = {
        correct: 0, hintsUsed: 0, maxConsecWrong: 0,
        _consecWrong: 0, fastAnswers: 0, bestStreak: 0, _currentStreak: 0,
      };
      startGame();
    });
  });
  document.getElementById('btn-no-contract').onclick = () => {
    state.activeContract = null;
    state.contractGameResult = null;
    startGame();
  };
  showScreen('screen-contract');
}

function checkContractBadges(stats) {
  const badges = ProfileManager.get('badges', []);
  const newBadges = [];
  const total = stats.bronze + stats.silver + stats.gold;
  if (total >= 1 && !badges.includes('contract_first')) {
    badges.push('contract_first');
    newBadges.push({ icon: '🎯', name: 'Premier Contrat' });
  }
  if (stats.gold >= 10 && !badges.includes('contract_gold_hunter')) {
    badges.push('contract_gold_hunter');
    newBadges.push({ icon: '🥇', name: 'Chasseur d\'Or' });
  }
  if (stats.goldStreak >= 5 && !badges.includes('contract_perfectionist')) {
    badges.push('contract_perfectionist');
    newBadges.push({ icon: '✨', name: 'Perfectionniste' });
  }
  if (stats.bronze >= 20 && !badges.includes('contract_all_bronze')) {
    badges.push('contract_all_bronze');
    newBadges.push({ icon: '🥉', name: 'Tout Bronze' });
  }
  if (newBadges.length > 0) {
    ProfileManager.set('badges', badges);
    state.badgesUnlocked.push(...newBadges);
  }
}

// ══════════════════════════════════════════════════════════════════════
// V4 — LEADERBOARD
// ══════════════════════════════════════════════════════════════════════

let currentLbTab = 'global';
let lbGroups = [];

document.getElementById('btn-leaderboard').addEventListener('click', async () => {
  showScreen('screen-leaderboard');
  await renderLeaderboard();
});

document.getElementById('btn-lb-back').addEventListener('click', () => {
  updateProfileHeader();
  showScreen('screen-home');
});

async function renderLeaderboard() {
  // Build tabs
  lbGroups = [];
  try { lbGroups = await getMyGroups(); } catch(e) {}

  const tabsEl = document.getElementById('lb-tabs');
  let tabsHtml = '';
  if (lbGroups.length > 1) {
    tabsHtml += '<button class="lb-tab ' + (currentLbTab === 'global' ? 'active' : '') + '" data-tab="global">🌍 Tous</button>';
  }
  lbGroups.forEach(g => {
    tabsHtml += '<button class="lb-tab ' + (currentLbTab === g.code ? 'active' : '') + '" data-tab="' + g.code + '">' + g.name + '</button>';
  });
  // Default to first group if no tab selected or only 1 group
  if (!currentLbTab || currentLbTab === 'global') {
    if (lbGroups.length === 1) currentLbTab = lbGroups[0].code;
    else if (lbGroups.length > 1) currentLbTab = 'global';
  }
  tabsEl.innerHTML = tabsHtml;

  tabsEl.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentLbTab = tab.dataset.tab;
      renderLeaderboard();
    });
  });

  // Fetch entries
  let entries = [];
  const listEl = document.getElementById('lb-list');
  const meEl = document.getElementById('lb-me');

  listEl.innerHTML = '<div class="lb-empty">Chargement...</div>';

  try {
    if (currentLbTab === 'global') {
      // Merge all group leaderboards (deduplicate by uid)
      const seen = new Set();
      for (const g of lbGroups) {
        const groupEntries = await getGroupLeaderboard(g.code);
        groupEntries.forEach(e => {
          if (!seen.has(e.uid)) { seen.add(e.uid); entries.push(e); }
        });
      }
      entries.sort((a, b) => b.xp - a.xp);
    } else {
      entries = await getGroupLeaderboard(currentLbTab);
    }
  } catch(e) {
    entries = [];
  }

  if (lbGroups.length === 0) {
    listEl.innerHTML = '<div class="lb-empty">Rejoins un groupe pour voir le classement !</div>';
    meEl.innerHTML = '';
    return;
  }

  if (entries.length === 0) {
    listEl.innerHTML = '<div class="lb-empty">Pas encore de joueurs cette semaine !</div>';
    meEl.innerHTML = '';
    return;
  }

  const rankIcons = { bronze: '🥉', argent: '🥈', or: '🥇', diamant: '💎', maitre: '👑', legende: '⭐' };

  listEl.innerHTML = entries.map((e, i) => {
    const isMe = e.uid === firebaseUid;
    const isChampion = i === 0;
    const rankNum = i + 1;
    const rankDisplay = rankNum <= 3 ? ['👑', '🥈', '🥉'][i] : rankNum;
    // V5: Show active title
    let titleDisplay = '';
    if (isMe) {
      const myTitle = ProfileManager.get('activeTitle', null);
      if (myTitle && TITLE_NAMES[myTitle]) titleDisplay = '<div class="player-title">' + TITLE_NAMES[myTitle] + '</div>';
    } else if (e.activeTitle && TITLE_NAMES[e.activeTitle]) {
      titleDisplay = '<div class="player-title">' + TITLE_NAMES[e.activeTitle] + '</div>';
    }
    return '<div class="lb-entry ' + (isMe ? 'me' : '') + ' ' + (isChampion ? 'champion' : '') + '">' +
      '<span class="lb-rank">' + rankDisplay + '</span>' +
      '<span class="lb-rank-icon">' + (rankIcons[e.rank] || '🥉') + '</span>' +
      '<div class="lb-info"><div class="lb-name">' + (e.name || 'Joueur') + '</div>' +
      titleDisplay +
      '<div class="lb-stats">Streak: ' + (e.bestStreak || 0) + ' | Boss: ' + (e.bossesDefeated || 0) + '</div></div>' +
      '<span class="lb-xp">' + (e.xp || 0) + ' XP</span>' +
      '</div>';
  }).join('');

  // Show my position
  const myIndex = entries.findIndex(e => e.uid === firebaseUid);
  if (myIndex >= 0) {
    meEl.innerHTML = '📊 Toi : #' + (myIndex + 1) + ' — ' + entries[myIndex].xp + ' XP';
  } else {
    const weeklyXP = ProfileManager.get('weeklyXP', 0);
    meEl.innerHTML = '📊 Toi : ' + weeklyXP + ' XP cette semaine';
  }
}

// ══════════════════════════════════════════════════════════════════════
// V4 — GROUPS
// ══════════════════════════════════════════════════════════════════════

let currentGroupCode = null;

let groupsBackTarget = 'screen-home';
document.getElementById('btn-groups-back').addEventListener('click', () => {
  if (groupsBackTarget === 'screen-home') {
    updateProfileHeader();
  }
  showScreen(groupsBackTarget);
});
document.getElementById('btn-gd-back').addEventListener('click', () => { renderGroupsScreen(); showScreen('screen-groups'); });
document.getElementById('btn-dash-back').addEventListener('click', () => { showScreen('screen-group-detail'); });

async function renderGroupsScreen(backTo) {
  if (backTo) groupsBackTarget = backTo;
  const listEl = document.getElementById('groups-list');
  listEl.innerHTML = '<div class="groups-empty">Chargement...</div>';
  showScreen('screen-groups');

  let groups = [];
  try { groups = await getMyGroups(); } catch(e) {}

  // Show/hide create button: only if admin OR already in a group
  const createBtn = document.getElementById('btn-create-group');
  if (groups.length > 0) {
    createBtn.style.display = '';
  } else {
    checkIsGlobalAdmin().then(isAdmin => {
      createBtn.style.display = isAdmin ? '' : 'none';
    }).catch(() => { createBtn.style.display = 'none'; });
  }

  if (groups.length === 0) {
    listEl.innerHTML = '<div class="groups-empty">Aucun groupe. Rejoins un groupe avec un code !</div>';
  } else {
    listEl.innerHTML = groups.map(g => {
      return '<div class="group-card" data-code="' + g.code + '">' +
        '<span class="group-icon">👥</span>' +
        '<div class="group-info">' +
        '<div class="group-name">' + g.name + '</div>' +
        '<div class="group-code">Code : ' + g.code + ' · ' + g.memberCount + ' membre' + (g.memberCount > 1 ? 's' : '') + '</div>' +
        '</div></div>';
    }).join('');

    listEl.querySelectorAll('.group-card').forEach(card => {
      card.addEventListener('click', () => {
        currentGroupCode = card.dataset.code;
        renderGroupDetail(currentGroupCode);
      });
    });
  }
}

document.getElementById('btn-join-group').addEventListener('click', async () => {
  const code = prompt('Entre le code du groupe (6 caractères) :');
  if (!code) return;
  try {
    const result = await joinGroup(code);
    alert('Groupe "' + result.name + '" rejoint !');
    renderGroupsScreen();
  } catch(e) {
    alert('Erreur : ' + e.message);
  }
});

document.getElementById('btn-create-group').addEventListener('click', async () => {
  const name = prompt('Nom du groupe :');
  if (!name) return;
  try {
    const result = await createGroup(name);
    alert('Groupe créé ! Code à partager : ' + result.code);
    renderGroupsScreen();
  } catch(e) {
    alert('Erreur : ' + e.message);
  }
});

async function renderGroupDetail(code) {
  showScreen('screen-group-detail');
  const headerEl = document.getElementById('gd-header');
  const lbEl = document.getElementById('gd-leaderboard');
  const actionsEl = document.getElementById('gd-actions');

  headerEl.innerHTML = '<div class="gd-group-name">Chargement...</div>';
  lbEl.innerHTML = '';
  actionsEl.innerHTML = '';

  try {
    const group = await getGroupInfo(code);
    if (!group) { alert('Groupe introuvable'); return; }

    const isAdmin = group.createdBy === firebaseUid;
    const isParent = isParentInGroup(group);
    const canViewDashboard = isAdmin || isParent;
    const memberCount = group.membersList ? group.membersList.length : 0;

    headerEl.innerHTML = '<div class="gd-group-name">' + escapeHtml(group.name) + '</div>' +
      '<div class="gd-group-code">' + escapeHtml(code) + '</div>' +
      '<div class="gd-member-count">' + memberCount + ' membre' + (memberCount > 1 ? 's' : '') + '</div>';

    // Generate QR code for joining
    const joinUrl = 'https://pezzonidasit.github.io/quizhero/?join=' + code;
    const qr = qrcode(0, 'M');
    qr.addData(joinUrl);
    qr.make();
    const qrSize = 4;
    headerEl.innerHTML += '<div class="gd-qr">' + qr.createSvgTag(qrSize, 0) + '</div>' +
      '<p class="gd-qr-hint">Scanne pour rejoindre</p>' +
      '<a href="' + joinUrl + '" class="gd-join-link" onclick="event.preventDefault();navigator.clipboard.writeText(\'' + joinUrl + '\').then(()=>{this.textContent=\'✅ Lien copié !\';setTimeout(()=>{this.textContent=\'' + joinUrl + '\'},2000)})">' + joinUrl + '</a>';

    // Group leaderboard
    const entries = await getGroupLeaderboard(code);
    const rankIcons = { bronze: '🥉', argent: '🥈', or: '🥇', diamant: '💎', maitre: '👑', legende: '⭐' };

    if (entries.length > 0) {
      lbEl.innerHTML = '<h3 style="width:100%;text-align:center">🏆 Classement du groupe</h3>' +
        entries.map((e, i) => {
          const isMe = e.uid === firebaseUid;
          const rankNum = i + 1;
          const rankDisplay = rankNum <= 3 ? ['👑', '🥈', '🥉'][i] : rankNum;
          let gTitleDisplay = '';
          if (isMe) {
            const myT = ProfileManager.get('activeTitle', null);
            if (myT && TITLE_NAMES[myT]) gTitleDisplay = '<div class="player-title">' + TITLE_NAMES[myT] + '</div>';
          } else if (e.activeTitle && TITLE_NAMES[e.activeTitle]) {
            gTitleDisplay = '<div class="player-title">' + TITLE_NAMES[e.activeTitle] + '</div>';
          }
          return '<div class="lb-entry ' + (isMe ? 'me' : '') + ' ' + (i === 0 ? 'champion' : '') + '">' +
            '<span class="lb-rank">' + rankDisplay + '</span>' +
            '<span class="lb-rank-icon">' + (rankIcons[e.rank] || '🥉') + '</span>' +
            '<div class="lb-info"><div class="lb-name">' + (e.name || 'Joueur') + '</div>' +
            gTitleDisplay + '</div>' +
            '<span class="lb-xp">' + (e.xp || 0) + ' XP</span>' +
            '</div>';
        }).join('');
    }

    // Actions
    let actHtml = '';

    // Dashboard visible for admin and parents
    if (canViewDashboard) {
      actHtml += '<button class="btn-primary" onclick="showDashboard(\'' + code + '\')">📊 Dashboard</button>';
    }

    // Homework upload button for parents
    if (isParent) {
      actHtml += '<button class="btn-primary" style="margin-top:0.5rem" onclick="document.getElementById(\'homework-overlay\').style.display=\'\'">📷 Envoyer un devoir</button>';
    }

    // Admin-only actions
    if (isAdmin) {
      actHtml += '<button class="btn-danger" style="margin-top:0.5rem" onclick="regenerateCodeAction(\'' + code + '\')">🔄 Régénérer le code</button>';
      actHtml += '<button class="btn-primary" style="margin-top:0.5rem;font-size:0.85rem" onclick="addRewardToGroup(\'' + code + '\')">🎁 Ajouter une récompense</button>';

      // Show parent requests for admin
      const requests = group.parentRequests || {};
      const requestKeys = Object.keys(requests);
      if (requestKeys.length > 0) {
        actHtml += '<div style="margin-top:1rem;padding:0.75rem;background:rgba(255,215,0,0.1);border:1px solid var(--accent-gold, #ffd700);border-radius:8px">';
        actHtml += '<p style="font-weight:600;margin-bottom:0.5rem">👪 Demandes de rôle parent :</p>';
        requestKeys.forEach(uid => {
          const req = requests[uid];
          actHtml += '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem">' +
            '<span>' + escapeHtml(req.name || 'Joueur') + '</span>' +
            '<button class="btn-primary" style="font-size:0.7rem;padding:0.2rem 0.5rem" onclick="acceptParentAction(\'' + code + '\',\'' + uid + '\')">✅ Accepter</button>' +
            '<button class="btn-danger" style="font-size:0.7rem;padding:0.2rem 0.5rem" onclick="rejectParentAction(\'' + code + '\',\'' + uid + '\')">❌ Refuser</button>' +
            '</div>';
        });
        actHtml += '</div>';
      }

      // Show current parents list (admin can remove)
      const parentUids = Object.keys(group.parents || {}).filter(uid => uid !== group.createdBy);
      if (parentUids.length > 0) {
        actHtml += '<div style="margin-top:0.75rem;padding:0.75rem;background:rgba(255,255,255,0.03);border:1px solid var(--bg-card-hover);border-radius:8px">';
        actHtml += '<p style="font-weight:600;margin-bottom:0.5rem;font-size:0.85rem">👪 Parents actuels :</p>';
        for (const uid of parentUids) {
          const member = group.membersList.find(m => m.uid === uid);
          const name = member ? member.name : 'Joueur';
          actHtml += '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem">' +
            '<span style="font-size:0.85rem">' + escapeHtml(name) + '</span>' +
            '<button class="btn-danger" style="font-size:0.65rem;padding:0.15rem 0.4rem" onclick="removeParentAction(\'' + code + '\',\'' + uid + '\')">Retirer</button>' +
            '</div>';
        }
        actHtml += '</div>';
      }
    }

    // Show "Devenir parent" only if user is flagged as parentCapable in Firebase
    if (!canViewDashboard) {
      try {
        const capSnap = await db.ref('players/' + firebaseUid + '/parentCapable').once('value');
        if (capSnap.val() === true) {
          const hasPendingRequest = group.parentRequests && group.parentRequests[firebaseUid];
          if (hasPendingRequest) {
            actHtml += '<p style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-secondary)">⏳ Demande de rôle parent en attente...</p>';
          } else {
            actHtml += '<button class="btn-secondary" style="margin-top:0.5rem;font-size:0.85rem" onclick="requestParentAction(\'' + code + '\')">👪 Devenir parent</button>';
          }
        }
      } catch(e) { /* offline — hide button */ }
    }

    actHtml += '<button class="btn-secondary" style="margin-top:0.5rem" onclick="leaveGroupAction(\'' + code + '\')">Quitter le groupe</button>';

    actionsEl.innerHTML = actHtml;
  } catch(e) {
    headerEl.innerHTML = '<div class="gd-group-name">Erreur : ' + e.message + '</div>';
  }
}

async function leaveGroupAction(code) {
  if (!confirm('Quitter ce groupe ?')) return;
  try {
    await leaveGroup(code);
    renderGroupsScreen();
    showScreen('screen-groups');
  } catch(e) { alert('Erreur : ' + e.message); }
}

async function regenerateCodeAction(oldCode) {
  if (!confirm('Régénérer le code ? L\'ancien code ne fonctionnera plus.')) return;
  try {
    const newCode = await regenerateGroupCode(oldCode);
    alert('Nouveau code : ' + newCode);
    currentGroupCode = newCode;
    renderGroupDetail(newCode);
  } catch(e) { alert('Erreur : ' + e.message); }
}

// ══════════════════════════════════════════════════════════════════════
// V4 — DASHBOARD PARENT
// ══════════════════════════════════════════════════════════════════════

async function showDashboard(code) {
  showScreen('screen-dashboard');
  const contentEl = document.getElementById('dash-content');
  contentEl.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Chargement...</p>';

  try {
    const group = await getGroupInfo(code);
    const dashData = await getGroupDashboard(code);
    const dashIsAdmin = group.createdBy === firebaseUid;
    const catLabels = { calcul: '🧮 Calcul', logique: '🧩 Logique', geometrie: '📐 Géométrie', fractions: '🍕 Fractions', mesures: '📏 Mesures', ouvert: '💡 Problèmes' };
    const allCats = ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert'];

    let html = '<h3 style="text-align:center">' + escapeHtml(group.name) + '</h3>';

    for (const member of group.membersList) {
      const data = dashData[member.uid];
      if (!data) {
        html += '<div class="dash-member"><div class="dash-member-name">👤 ' + escapeHtml(member.name) + '</div><p style="color:var(--text-secondary);font-size:0.8rem">Pas de données</p></div>';
        continue;
      }

      const catStats = data.catStats || {};
      const timeMin = Math.round((data.timeSpent || 0) / 60);
      const contracts = data.contractsCompleted || {};

      const memberId = 'dash-member-' + member.uid.slice(0, 8);
      const totalMQ = Object.values(catStats).reduce((s, c) => s + (c.total || 0), 0);
      const totalMC = Object.values(catStats).reduce((s, c) => s + (c.correct || 0), 0);
      const overallPct = totalMQ > 0 ? Math.round(totalMC / totalMQ * 100) : 0;
      const totalContr = (contracts.gold || 0) + (contracts.silver || 0) + (contracts.bronze || 0);

      html += '<div class="dash-member">';
      html += '<div class="dash-member-header" onclick="document.getElementById(\'' + memberId + '\').classList.toggle(\'open\')">';
      html += '<span class="dash-member-name">👤 ' + escapeHtml(member.name) + '</span>';
      html += '<span class="dash-member-summary">' + overallPct + '% · ' + (data.weeklyGames || 0) + ' parties · ' + timeMin + 'min</span>';
      html += '<span class="dash-expand-icon">▸</span>';
      html += '</div>';

      html += '<div class="dash-member-details" id="' + memberId + '">';

      // Stats row
      html += '<div class="dash-stats-row">';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + (data.weeklyGames || 0) + '</div><div class="dash-stat-label">Parties</div></div>';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + timeMin + 'min</div><div class="dash-stat-label">Temps</div></div>';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + overallPct + '%</div><div class="dash-stat-label">Réussite</div></div>';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + totalContr + '</div><div class="dash-stat-label">Contrats</div></div>';
      html += '</div>';

      // Category bars
      html += '<div class="dash-cat-bars">';
      allCats.forEach(cat => {
        const stat = catStats[cat];
        const pct = stat && stat.total > 0 ? Math.round(stat.correct / stat.total * 100) : 0;
        const played = stat && stat.total > 0;
        const isWeak = !played || pct < 50;
        const barColor = pct >= 70 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)';

        html += '<div class="dash-cat-row">';
        html += '<span class="dash-cat-name">' + (catLabels[cat] || cat) + '</span>';
        html += '<div class="dash-cat-bar"><div class="dash-cat-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>';
        html += '<span class="dash-cat-pct ' + (isWeak ? 'dash-weak' : '') + '">' + (played ? pct + '%' : '—') + '</span>';
        if (isWeak) html += '<span class="dash-cat-warning">⚠️</span>';
        html += '</div>';
      });
      html += '</div>';

      // Admin actions for this member (parents can't ban)
      if (dashIsAdmin && member.uid !== firebaseUid) {
        html += '<div style="margin-top:0.5rem;text-align:right"><button class="btn-danger" style="font-size:0.75rem;padding:0.3rem 0.75rem" onclick="banMemberAction(\'' + code + '\',\'' + member.uid + '\',\'' + escapeHtml(member.name).replace(/'/g, '&#39;') + '\')">Bannir</button></div>';
      }

      html += '</div>'; // close details
      html += '</div>'; // close member
    }

    // Group rewards section
    try {
      const rewards = await getGroupRewards(code);
      html += '<h3 style="margin-top:1rem">🎁 Récompenses du groupe</h3>';
      if (rewards.length === 0) {
        html += '<p style="color:var(--text-secondary);font-size:0.85rem">Aucune récompense. Ajoute-en depuis le détail du groupe !</p>';
      } else {
        rewards.forEach(r => {
          html += '<div class="dash-member" style="padding:0.5rem 0.75rem">' +
            '<span style="font-size:1.2rem;margin-right:0.5rem">' + (r.icon || '🎁') + '</span>' +
            '<strong>' + r.name + '</strong> — ' + r.price + ' 🪙' +
            '<br><span style="font-size:0.75rem;color:var(--text-secondary)">' + (r.description || '') + '</span>' +
            '<button class="btn-danger" style="font-size:0.65rem;padding:0.15rem 0.4rem;margin-left:0.5rem" onclick="removeRewardAction(\'' + code + '\',\'' + r.id + '\',\'' + r.name.replace(/'/g, '') + '\')">×</button>' +
            '</div>';
        });
      }
    } catch(e) {}

    contentEl.innerHTML = html;
  } catch(e) {
    contentEl.innerHTML = '<p style="text-align:center;color:var(--accent-red)">Erreur : ' + e.message + '</p>';
  }
}

async function banMemberAction(code, uid, name) {
  if (!confirm('Bannir ' + name + ' du groupe ?')) return;
  try {
    await banMember(code, uid);
    alert(name + ' a été banni.');
    showDashboard(code);
  } catch(e) { alert('Erreur : ' + e.message); }
}

// ══════════════════════════════════════════════════════════════════════
// V4 — CREATE RIDDLE
// ══════════════════════════════════════════════════════════════════════

document.getElementById('btn-riddle-back').addEventListener('click', () => { showScreen('screen-home'); });
document.getElementById('btn-progression-back').addEventListener('click', () => showScreen('screen-profile-detail'));
document.getElementById('btn-my-pet-back').addEventListener('click', () => { renderPetZone(); showScreen('screen-home'); });
document.getElementById('btn-pet-choice-back').addEventListener('click', () => {
  const petType = ProfileManager.get('petType', null);
  if (petType) { renderMyPetScreen(); showScreen('screen-my-pet'); }
  else { renderPetZone(); showScreen('screen-home'); }
});
// btn-pet click handled via inline onclick in HTML (stopPropagation needed)

async function showCreateRiddleScreen() {
  // Populate group dropdown
  const select = document.getElementById('riddle-share');
  select.innerHTML = '<option value="">🌍 Tout le monde</option>';
  try {
    const groups = await getMyGroups();
    groups.forEach(g => {
      select.innerHTML += '<option value="' + g.code + '">👥 ' + g.name + '</option>';
    });
  } catch(e) {}

  // Clear form
  document.getElementById('riddle-text').value = '';
  document.getElementById('riddle-answer').value = '';
  document.getElementById('riddle-hint').value = '';
  document.getElementById('riddle-explanation').value = '';

  showScreen('screen-create-riddle');
}

document.getElementById('btn-submit-riddle').addEventListener('click', async () => {
  const text = document.getElementById('riddle-text').value.trim();
  const answer = parseFloat(document.getElementById('riddle-answer').value);
  const hint = document.getElementById('riddle-hint').value.trim();
  const explanation = document.getElementById('riddle-explanation').value.trim();
  const category = document.getElementById('riddle-category').value;
  const groupCode = document.getElementById('riddle-share').value || null;

  if (!text) { alert('Écris une question !'); return; }
  if (isNaN(answer)) { alert('La réponse doit être un nombre !'); return; }
  if (!hint) { alert('Ajoute un indice !'); return; }

  const profile = ProfileManager.getActive();

  try {
    await createRiddle({
      category,
      text,
      answer,
      hint,
      explanation: explanation || 'Pas d\'explication fournie.',
      creatorName: profile ? profile.name : 'Anonyme',
      groupCode,
    });
    alert('Énigme publiée ! 🎉');
    showScreen('screen-home');
  } catch(e) {
    alert('Erreur : ' + e.message);
  }
});

// ══════════════════════════════════════════════════════════════════════
// V4 — COIN TOAST
// ══════════════════════════════════════════════════════════════════════

function showCoinToast(amount) {
  const toast = document.createElement('div');
  toast.className = 'coin-toast';
  toast.textContent = '🪙 Tes énigmes ont rapporté +' + amount + ' pièces !';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ══════════════════════════════════════════════════════════════════════
// V4 — AUTO-JOIN GROUP FROM URL
// ══════════════════════════════════════════════════════════════════════

const urlParams = new URLSearchParams(window.location.search);
const joinCode = urlParams.get('join');
if (joinCode) {
  // Clean URL
  window.history.replaceState({}, '', window.location.pathname);
  // Store for after profile creation (if no profile yet)
  sessionStorage.setItem('pendingJoinCode', joinCode);
  // If already signed in with a profile, join immediately
  if (firebaseUid && ProfileManager.getActiveId()) {
    _consumePendingJoin();
  }
}

function _refreshGroupBanner() {
  const noGroupBanner = document.getElementById('no-group-banner');
  if (!noGroupBanner) return;
  getMyGroups().then(groups => {
    if (groups.length > 0) {
      noGroupBanner.style.display = 'none';
      document.getElementById('btn-play').parentNode.style.display = '';
    }
  }).catch(() => {});
}

async function _consumePendingJoin() {
  const code = sessionStorage.getItem('pendingJoinCode');
  if (!code) return;
  const normalized = code.toUpperCase().trim();
  try {
    if (!firebaseUid) await firebaseSignIn();
    if (firebaseUid) {
      const memberSnap = await db.ref('groups/' + normalized + '/members/' + firebaseUid).once('value');
      if (memberSnap.exists()) {
        // Ensure players/{uid}/groups is consistent (may be missing after migration)
        await db.ref('players/' + firebaseUid + '/groups/' + normalized).set(true);
        sessionStorage.removeItem('pendingJoinCode');
        _refreshGroupBanner();
        return;
      }
      const result = await joinGroup(normalized);
      sessionStorage.removeItem('pendingJoinCode');
      alert('Groupe "' + result.name + '" rejoint ! 🎉');
      _refreshGroupBanner();
    }
  } catch(e) {
    alert('Impossible de rejoindre : ' + e.message);
  }
}

// ══════════════════════════════════════════════════════════════════════
// V4 — ADMIN GLOBAL DASHBOARD
// ══════════════════════════════════════════════════════════════════════

let adminTab = 'players';

document.getElementById('btn-admin').addEventListener('click', async () => {
  const isAdmin = await checkIsGlobalAdmin();
  if (isAdmin) {
    showScreen('screen-admin');
    renderAdminDashboard();
  } else {
    alert('Accès réservé. Configure isAdmin dans Firebase Console.');
  }
});

document.getElementById('btn-admin-back').addEventListener('click', () => {
  updateProfileHeader();
  showScreen('screen-home');
});

document.getElementById('btn-admin-force-update').addEventListener('click', async () => {
  if (!confirm('Forcer la mise à jour sur TOUS les appareils ? Ils rechargeront au prochain lancement.')) return;
  try {
    const snap = await db.ref('app_version').once('value');
    const current = snap.val() || 0;
    await db.ref('app_version').set(current + 1);
    alert('Version bumpée à ' + (current + 1) + '. Tous les appareils se mettront à jour.');
  } catch(e) {
    alert('Erreur : ' + e.message);
  }
});

document.getElementById('admin-tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.lb-tab');
  if (!tab) return;
  adminTab = tab.dataset.tab;
  document.querySelectorAll('#admin-tabs .lb-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  renderAdminDashboard();
});

async function renderAdminDashboard() {
  const contentEl = document.getElementById('admin-content');
  contentEl.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Chargement...</p>';

  try {
    if (adminTab === 'players') {
      await renderAdminPlayers(contentEl);
    } else if (adminTab === 'groups') {
      await renderAdminGroups(contentEl);
    } else if (adminTab === 'riddles') {
      await renderAdminRiddles(contentEl);
    } else if (adminTab === 'feedback') {
      await renderAdminFeedback(contentEl);
    }
  } catch(e) {
    contentEl.innerHTML = '<p style="color:var(--accent-red)">Erreur : ' + e.message + '</p>';
  }
}

async function renderAdminPlayers(el) {
  const players = await getAllPlayers();
  const recoveryCodes = await getAllRecoveryCodes();
  const rankIcons = { bronze: '🥉', argent: '🥈', or: '🥇', diamant: '💎', maitre: '👑', legende: '⭐' };

  if (players.length === 0) {
    el.innerHTML = '<div class="lb-empty">Aucun joueur</div>';
    return;
  }

  players.sort((a, b) => (b.xp || 0) - (a.xp || 0));

  let html = '<p style="text-align:center;color:var(--text-secondary);font-size:0.85rem">' + players.length + ' joueur' + (players.length > 1 ? 's' : '') + '</p>';

  const allCats = ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert'];
  const catLabelsAdmin = { calcul: '🧮 Calcul', logique: '🧩 Logique', geometrie: '📐 Géométrie', fractions: '🍕 Fractions', mesures: '📏 Mesures', ouvert: '💡 Problèmes', geographie: '🌍 Géographie', conjugaison: '✏️ Conjugaison' };

  players.forEach(p => {
    const rankIcon = rankIcons[p.rank] || '🥉';
    const groupCodes = p.groups ? Object.keys(p.groups) : [];
    const recovery = recoveryCodes.find(r => r.uid === p.uid);
    const isMe = p.uid === firebaseUid;
    const detailId = 'admin-player-' + p.uid.slice(0, 8);

    html += '<div class="dash-member">';
    html += '<div class="dash-member-name">' + rankIcon + ' ' + escapeHtml(p.name || 'Joueur') + (isMe ? ' <span style="font-size:0.65rem;color:var(--accent-green)">(toi)</span>' : '') + '</div>';

    // Stats row
    html += '<div style="font-size:0.8rem;color:var(--text-secondary)">';
    html += (p.xp || 0) + ' XP — ' + (p.gamesPlayed || 0) + ' parties';
    html += '</div>';

    // Recovery code
    if (recovery) {
      html += '<div style="font-size:0.75rem;margin-top:0.3rem">🔑 <span style="color:var(--accent-yellow);font-family:monospace;letter-spacing:1px">' + recovery.code + '</span></div>';
    }

    // Groups
    if (groupCodes.length > 0) {
      html += '<div style="margin-top:0.3rem">';
      groupCodes.forEach(c => {
        html += '<span style="font-size:0.65rem;background:var(--bg-card-hover);padding:0.15rem 0.4rem;border-radius:6px;margin-right:0.3rem">' + c + '</span>';
      });
      html += '</div>';
    }

    // Expandable stats
    const catStats = p.catStats || {};
    const totalQ = Object.values(catStats).reduce((s, c) => s + (c.total || 0), 0);
    const totalC = Object.values(catStats).reduce((s, c) => s + (c.correct || 0), 0);
    const overallPct = totalQ > 0 ? Math.round(totalC / totalQ * 100) : 0;
    const pTimeMin = Math.round((p.weeklyTimeSpent || 0) / 60);
    const pContracts = p.contractsCompleted || {};
    const pTotalContr = (pContracts.gold || 0) + (pContracts.silver || 0) + (pContracts.bronze || 0);

    if (totalQ > 0) {
      html += '<div class="dash-member-header" onclick="document.getElementById(\'' + detailId + '\').classList.toggle(\'open\')" style="margin-top:0.4rem">';
      html += '<span style="font-size:0.8rem;color:var(--accent-blue)">📊 Stats détaillées</span>';
      html += '<span class="dash-member-summary">' + overallPct + '% · ' + totalQ + ' questions</span>';
      html += '<span class="dash-expand-icon">▸</span>';
      html += '</div>';

      html += '<div class="dash-member-details" id="' + detailId + '">';
      html += '<div class="dash-stats-row">';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + totalQ + '</div><div class="dash-stat-label">Questions</div></div>';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + overallPct + '%</div><div class="dash-stat-label">Réussite</div></div>';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + pTimeMin + 'min</div><div class="dash-stat-label">Temps</div></div>';
      html += '<div class="dash-stat"><div class="dash-stat-value">' + pTotalContr + '</div><div class="dash-stat-label">Contrats</div></div>';
      html += '</div>';

      html += '<div class="dash-cat-bars">';
      allCats.forEach(cat => {
        const stat = catStats[cat];
        const pct = stat && stat.total > 0 ? Math.round(stat.correct / stat.total * 100) : 0;
        const played = stat && stat.total > 0;
        const isWeak = !played || pct < 50;
        const barColor = pct >= 70 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)';
        html += '<div class="dash-cat-row">';
        html += '<span class="dash-cat-name">' + (catLabelsAdmin[cat] || cat) + '</span>';
        html += '<div class="dash-cat-bar"><div class="dash-cat-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>';
        html += '<span class="dash-cat-pct ' + (isWeak ? 'dash-weak' : '') + '">' + (played ? pct + '%' : '—') + '</span>';
        if (isWeak) html += '<span class="dash-cat-warning">⚠️</span>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>'; // close details
    }

    // UID
    html += '<div style="font-size:0.55rem;color:var(--text-secondary);opacity:0.4;margin-top:0.2rem">' + p.uid + '</div>';

    // Parent toggle + delete button (not for self)
    if (!isMe) {
      const isPC = p.parentCapable === true;
      html += '<button class="btn-secondary" style="font-size:0.7rem;padding:0.2rem 0.6rem;margin-top:0.4rem" onclick="toggleParentCapable(\'' + p.uid + '\',' + !isPC + ')">' + (isPC ? '👪 Retirer parent' : '👪 Marquer parent') + '</button> ';
      html += '<button class="btn-danger" style="font-size:0.7rem;padding:0.2rem 0.6rem;margin-top:0.4rem" onclick="adminDeletePlayerAction(\'' + p.uid + '\',\'' + escapeHtml((p.name || 'Joueur').replace(/'/g, '')) + '\')">Supprimer ce joueur</button>';
    }

    html += '</div>';
  });

  el.innerHTML = html;
}

async function renderAdminGroups(el) {
  const groups = await getAllGroups();

  if (groups.length === 0) {
    el.innerHTML = '<div class="lb-empty">Aucun groupe</div>';
    return;
  }

  let html = '<p style="text-align:center;color:var(--text-secondary);font-size:0.85rem">' + groups.length + ' groupe' + (groups.length > 1 ? 's' : '') + '</p>';

  for (const g of groups) {
    const memberCount = g.members ? Object.keys(g.members).length : 0;
    const bannedCount = g.banned ? Object.keys(g.banned).length : 0;

    html += '<div class="dash-member">';
    html += '<div class="dash-member-name">👥 ' + (g.name || 'Sans nom') + '</div>';
    html += '<div style="font-size:0.8rem;color:var(--text-secondary)">';
    html += 'Code : <span style="font-family:monospace;color:var(--accent-yellow);letter-spacing:2px">' + g.code + '</span>';
    html += ' — ' + memberCount + ' membre' + (memberCount > 1 ? 's' : '');
    if (bannedCount > 0) html += ' — ' + bannedCount + ' banni' + (bannedCount > 1 ? 's' : '');
    html += '</div>';

    // List members
    if (g.members) {
      html += '<div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.3rem">';
      for (const uid of Object.keys(g.members)) {
        const snap = await db.ref('players/' + uid + '/name').once('value');
        const name = snap.val() || 'Joueur';
        html += '<span style="font-size:0.7rem;background:var(--bg-card-hover);padding:0.2rem 0.5rem;border-radius:6px">' + name + '</span>';
      }
      html += '</div>';
    }

    // Delete group button
    html += '<button class="btn-danger" style="font-size:0.7rem;padding:0.2rem 0.6rem;margin-top:0.5rem" onclick="adminDeleteGroupAction(\'' + g.code + '\',\'' + (g.name || '').replace(/'/g, '') + '\')">Supprimer ce groupe</button>';

    html += '</div>';
  }

  el.innerHTML = html;
}

async function renderAdminRiddles(el) {
  const riddles = await getAllRiddles();

  if (riddles.length === 0) {
    el.innerHTML = '<div class="lb-empty">Aucune énigme</div>';
    return;
  }

  let html = '<p style="text-align:center;color:var(--text-secondary);font-size:0.85rem">' + riddles.length + ' énigme' + (riddles.length > 1 ? 's' : '') + '</p>';

  riddles.forEach(r => {
    const totalVotes = (r.upvotes || 0) + (r.downvotes || 0);
    const approval = totalVotes > 0 ? Math.round(r.upvotes / totalVotes * 100) : 0;

    html += '<div class="dash-member">';
    html += '<div class="dash-member-name">📝 ' + (r.creatorName || 'Anonyme') + ' <span style="font-size:0.7rem;color:var(--text-secondary)">' + (r.category || '') + '</span></div>';
    html += '<p style="font-size:0.85rem;margin:0.3rem 0">"' + (r.text || '').substring(0, 80) + (r.text && r.text.length > 80 ? '...' : '') + '"</p>';
    html += '<div style="font-size:0.75rem;color:var(--text-secondary)">Réponse : ' + r.answer + ' | ' + (r.plays || 0) + ' plays | ' + approval + '% 👍</div>';
    html += '<button class="btn-danger" style="font-size:0.7rem;padding:0.2rem 0.5rem;margin-top:0.3rem" onclick="adminDeleteRiddleAction(\'' + r.id + '\')">Supprimer</button>';
    html += '</div>';
  });

  el.innerHTML = html;
}

// ── Admin Feedback Tab ─────────────────────────────────────────────
async function renderAdminFeedback(el) {
  const feedbacks = await getAllFeedbacks();

  if (!feedbacks.length) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Aucun feedback reçu.</p>';
    return;
  }

  const groups = { new: [], implement: [], done: [], discard: [] };
  feedbacks.forEach(fb => {
    const s = fb.status || 'new';
    if (groups[s]) groups[s].push(fb);
    else groups['new'].push(fb);
  });

  const QUICK_REPLIES = [
    "Merci, c'est noté !",
    "C'est corrigé !",
    "Bonne idée, on va l'ajouter !"
  ];

  function timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'à l\'instant';
    if (mins < 60) return 'il y a ' + mins + 'min';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return 'il y a ' + hrs + 'h';
    const days = Math.floor(hrs / 24);
    if (days < 7) return 'il y a ' + days + 'j';
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function renderCard(fb) {
    const icon = fb.type === 'bug' ? '🐛' : '💡';
    const name = escapeHtml(fb.profileName || 'Anonyme');
    const text = escapeHtml(fb.text);
    const screenshotHtml = fb.screenshot
      ? '<img src="' + fb.screenshot + '" class="admin-fb-thumb" onclick="var lb=document.createElement(\'div\');lb.className=\'admin-fb-lightbox\';lb.innerHTML=\'<img src=&quot;\'+this.src+\'&quot;>\';lb.onclick=function(){lb.remove()};document.body.appendChild(lb)" alt="screenshot">'
      : '';
    const replyHtml = fb.adminReply
      ? '<div class="admin-fb-reply-sent">✉️ ' + escapeHtml(fb.adminReply) + '</div>'
      : '<div class="admin-fb-reply-zone">' +
           '<div class="admin-fb-quick-replies">' +
             QUICK_REPLIES.map(function(r) { return '<button class="admin-fb-quick-btn" data-reply="' + escapeHtml(r) + '">' + escapeHtml(r) + '</button>'; }).join('') +
           '</div>' +
           '<div style="display:flex;gap:0.5rem;margin-top:0.5rem">' +
             '<input type="text" class="admin-fb-reply-input" placeholder="Répondre..." maxlength="200" style="flex:1">' +
             '<button class="admin-fb-reply-send">Envoyer</button>' +
           '</div>' +
         '</div>';

    const s = fb.status || 'new';
    const statusBtns = {
      new: '<button class="admin-fb-action btn-small" data-action="implement">✅ Implémenter</button>' +
           '<button class="admin-fb-action btn-small btn-danger-small" data-action="discard">❌ Discard</button>',
      implement: '<button class="admin-fb-action btn-small" data-action="done">✔️ Done</button>' +
           '<button class="admin-fb-action btn-small btn-danger-small" data-action="discard">❌ Discard</button>',
      done: '<button class="admin-fb-action btn-small" data-action="implement">↩️ Réouvrir</button>',
      discard: '<button class="admin-fb-action btn-small" data-action="implement">✅ Implémenter</button>'
    };

    var notesHtml = (s === 'implement' || s === 'done')
      ? '<div class="admin-fb-notes-zone">' +
          '<textarea class="admin-fb-notes-input" placeholder="Détails d\'implémentation..." rows="2">' + escapeHtml(fb.adminNotes || '') + '</textarea>' +
          '<button class="admin-fb-notes-save btn-small">💾 Sauver notes</button>' +
        '</div>'
      : (fb.adminNotes ? '<div class="admin-fb-notes-display">📋 ' + escapeHtml(fb.adminNotes) + '</div>' : '');

    return '<div class="admin-fb-card ' + (s === 'discard' ? 'admin-fb-discarded' : '') + (s === 'done' ? ' admin-fb-done' : '') + '" data-fb-id="' + fb.id + '">' +
      '<div class="admin-fb-header">' +
        '<span>' + icon + ' <strong>' + name + '</strong></span>' +
        '<span class="admin-fb-time">' + timeAgo(fb.timestamp) + '</span>' +
      '</div>' +
      '<p class="admin-fb-text">' + text + '</p>' +
      screenshotHtml +
      '<div class="admin-fb-actions">' + statusBtns[s] + '</div>' +
      notesHtml +
      replyHtml +
    '</div>';
  }

  function renderSection(title, items, collapsed) {
    if (!items.length) return '';
    return '<div class="admin-fb-section ' + (collapsed ? 'collapsed' : '') + '">' +
      '<div class="admin-fb-section-header" onclick="this.parentElement.classList.toggle(\'collapsed\')">' +
        '<span>' + title + ' (' + items.length + ')</span>' +
        '<span class="admin-fb-chevron">▼</span>' +
      '</div>' +
      '<div class="admin-fb-section-body">' +
        items.map(renderCard).join('') +
      '</div>' +
    '</div>';
  }

  el.innerHTML =
    renderSection('🆕 Nouveau', groups.new, false) +
    renderSection('✅ À implémenter', groups.implement, true) +
    renderSection('✔️ Done', groups.done, true) +
    renderSection('🗑️ Discard', groups.discard, true);

  // Event delegation for actions (cleanup previous listener on re-render)
  if (el._adminFbHandler) el.removeEventListener('click', el._adminFbHandler);
  async function adminFbHandler(e) {
    const card = e.target.closest('.admin-fb-card');
    if (!card) return;
    const fbId = card.dataset.fbId;

    // Status change
    const actionBtn = e.target.closest('.admin-fb-action');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      await setFeedbackStatus(fbId, action);
      await renderAdminFeedback(el);
      return;
    }

    // Save notes
    const notesBtn = e.target.closest('.admin-fb-notes-save');
    if (notesBtn) {
      const textarea = card.querySelector('.admin-fb-notes-input');
      const notes = textarea?.value?.trim() || '';
      notesBtn.textContent = '⏳';
      await saveAdminNotes(fbId, notes);
      notesBtn.textContent = '✅ Sauvé';
      setTimeout(function() { notesBtn.textContent = '💾 Sauver notes'; }, 1500);
      return;
    }

    // Quick reply — fills the input
    const quickBtn = e.target.closest('.admin-fb-quick-btn');
    if (quickBtn) {
      const input = card.querySelector('.admin-fb-reply-input');
      if (input) input.value = quickBtn.dataset.reply;
      return;
    }

    // Send reply
    const sendBtn = e.target.closest('.admin-fb-reply-send');
    if (sendBtn) {
      const input = card.querySelector('.admin-fb-reply-input');
      const text = input?.value?.trim();
      if (!text) return;
      sendBtn.disabled = true;
      await sendAdminReply(fbId, text);
      await renderAdminFeedback(el);
      return;
    }
  }
  el._adminFbHandler = adminFbHandler;
  el.addEventListener('click', adminFbHandler);
}

async function adminDeleteRiddleAction(riddleId) {
  if (!confirm('Supprimer cette énigme ?')) return;
  try {
    await adminDeleteAnyRiddle(riddleId);
    renderAdminDashboard();
  } catch(e) { alert('Erreur : ' + e.message); }
}

// Expose V4 functions for inline onclick handlers
window.leaveGroupAction = leaveGroupAction;
window.regenerateCodeAction = regenerateCodeAction;
window.banMemberAction = banMemberAction;
window.showDashboard = showDashboard;
window.adminDeleteRiddleAction = adminDeleteRiddleAction;

async function adminDeletePlayerAction(uid, name) {
  if (!confirm('Supprimer le joueur "' + name + '" ? Ses données, énigmes et appartenances aux groupes seront supprimées.')) return;
  try {
    await adminDeletePlayer(uid);
    alert(name + ' supprimé.');
    renderAdminDashboard();
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.adminDeletePlayerAction = adminDeletePlayerAction;

async function toggleParentCapable(uid, value) {
  try {
    const isAdmin = await checkIsGlobalAdmin();
    if (!isAdmin) { alert('Accès refusé'); return; }
    await db.ref('players/' + uid + '/parentCapable').set(value);
    showToast(value ? 'Marqué comme parent' : 'Rôle parent retiré');
    renderAdminDashboard();
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.toggleParentCapable = toggleParentCapable;

async function adminDeleteGroupAction(code, name) {
  if (!confirm('Supprimer le groupe "' + name + '" (' + code + ') ? Tous les membres seront retirés.')) return;
  try {
    await adminDeleteGroup(code);
    alert('Groupe "' + name + '" supprimé.');
    renderAdminDashboard();
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.adminDeleteGroupAction = adminDeleteGroupAction;

window.renderGroupsScreen = renderGroupsScreen;

async function quickCreateGroup() {
  const name = prompt('Nom du groupe :');
  if (!name) return;
  try {
    if (!firebaseUid) await firebaseSignIn();
    const result = await createGroup(name);
    alert('Groupe créé ! Code à partager : ' + result.code);
    updateProfileHeader();
  } catch(e) {
    alert('Erreur : ' + e.message);
  }
}
window.quickCreateGroup = quickCreateGroup;

// ══════════════════════════════════════════════════════════════════════
// V6 — PROGRESSION SCREEN
// ══════════════════════════════════════════════════════════════════════

function renderProgressionScreen() {
  showScreen('screen-progression');

  const catKeys = ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert'];
  const catIcons = { calcul: '🧮', logique: '⚙️', geometrie: '📐', fractions: '🔢', mesures: '📏', ouvert: '💡', geographie: '🌍', conjugaison: '✏️' };

  // Section 1: Mastery bars
  let barsHtml = '';
  catKeys.forEach(cat => {
    const prog = getMasteryProgress(cat);
    const catLabel = CATEGORIES[cat]?.label || cat;
    const catColor = CATEGORIES[cat]?.color || '#888';
    const pct = prog.next ? Math.round(Math.min(prog.progressTotal, prog.progressRate) * 100) : 100;
    const stats = ProfileManager.get('catStats', {})[cat] || { correct: 0, total: 0 };
    const rate = stats.total > 0 ? Math.round(stats.correct / stats.total * 100) : 0;
    const nextLabel = prog.next ? ' → ' + prog.next.label : '';

    barsHtml += '<div class="mastery-row">' +
      '<span class="mastery-cat-icon">' + (catIcons[cat] || '📚') + '</span>' +
      '<div class="mastery-info">' +
        '<div class="mastery-top">' +
          '<span class="mastery-cat-name">' + catLabel + '</span>' +
          '<span class="mastery-level-badge">' + prog.current.icon + ' ' + prog.current.label + '</span>' +
        '</div>' +
        '<div class="mastery-bar"><div class="mastery-bar-fill" style="width:' + pct + '%;background:' + catColor + '"></div></div>' +
        '<div class="mastery-stats">' + stats.total + ' questions · ' + rate + '%' + nextLabel + '</div>' +
      '</div></div>';
  });
  document.getElementById('mastery-bars').innerHTML = barsHtml;

  // Section 2: Weekly delta
  const lastWeekCatStats = ProfileManager.get('lastWeekCatStats', null);
  const currentCatStats = ProfileManager.get('catStats', {});
  let deltaHtml = '<h3>📈 Cette semaine</h3>';

  if (!lastWeekCatStats) {
    deltaHtml += '<p style="color:var(--text-secondary);font-size:0.85rem">Première semaine — les deltas apparaîtront lundi !</p>';
  } else {
    let hasData = false;
    catKeys.forEach(cat => {
      const cur = currentCatStats[cat] || { correct: 0, total: 0 };
      const prev = lastWeekCatStats[cat] || { correct: 0, total: 0 };
      if (cur.total === prev.total) return;
      hasData = true;
      const curRate = cur.total > 0 ? Math.round(cur.correct / cur.total * 100) : 0;
      const prevRate = prev.total > 0 ? Math.round(prev.correct / prev.total * 100) : 0;
      const diff = curRate - prevRate;
      const cls = diff > 0 ? 'delta-up' : diff < 0 ? 'delta-down' : 'delta-same';
      const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '=';
      const sign = diff > 0 ? '+' : '';
      deltaHtml += '<div class="delta-row">' +
        '<span class="delta-cat">' + (CATEGORIES[cat]?.label || cat) + '</span>' +
        '<span class="delta-change ' + cls + '">' + prevRate + '% → ' + curRate + '% (' + sign + diff + '%) ' + arrow + '</span>' +
        '</div>';
    });
    if (!hasData) {
      deltaHtml += '<p style="color:var(--text-secondary);font-size:0.85rem">Joue cette semaine pour voir tes progrès !</p>';
    }
  }
  document.getElementById('weekly-delta').innerHTML = deltaHtml;

  // Section 3: Mastery badges
  const badges = ProfileManager.get('badges', []);
  const masteryBadges = badges.filter(b => b.startsWith('mastery_'));
  let badgesHtml = '<h3>🎓 Badges de maîtrise</h3>';
  if (masteryBadges.length === 0) {
    badgesHtml += '<p style="color:var(--text-secondary);font-size:0.85rem">Monte en niveau pour débloquer des badges !</p>';
  } else {
    badgesHtml += '<div class="mastery-badge-grid">';
    masteryBadges.forEach(bid => {
      const parts = bid.replace('mastery_', '').split('_');
      let label, icon;
      if (parts[0] === 'all') {
        const cross = { apprenti: { n: 'Polyvalent', i: '📘' }, confirme: { n: 'Touche-à-tout', i: '⚔️' }, expert: { n: 'Maître absolu', i: '💎' } };
        const c = cross[parts[1]] || { n: bid, i: '🏅' };
        label = c.n; icon = c.i;
      } else {
        const catLabel = CATEGORIES[parts[0]]?.label || parts[0];
        const lvl = MASTERY_LEVELS.find(l => l.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === parts[1]);
        label = catLabel + ' ' + (lvl ? lvl.label : parts[1]);
        icon = lvl ? lvl.icon : '🏅';
      }
      badgesHtml += '<div class="mastery-badge-item">' + icon + ' ' + label + '</div>';
    });
    badgesHtml += '</div>';
  }
  document.getElementById('mastery-badges').innerHTML = badgesHtml;
}

window.renderProgressionScreen = renderProgressionScreen;

// ══════════════════════════════════════════════════════════════════════
// V8 — PET SYSTEM UI
// ══════════════════════════════════════════════════════════════════════

function renderPetZone() {
  const petType = ProfileManager.get('petType', null);
  const zone = document.getElementById('pet-zone');
  const petBtn = document.getElementById('btn-pet');

  if (!petType) {
    if (petBtn) petBtn.style.display = 'none';
    const hb = document.getElementById('pet-hunger-header');
    if (hb) hb.style.display = 'none';
    if (zone) zone.innerHTML = '<button class="btn-secondary" onclick="showPetChoice()" style="font-size:0.8rem;padding:0.4rem 1rem">🐾 Choisis ton compagnon</button>';
    return;
  }

  updatePetHunger();
  const pet = PET_TYPES[petType];
  if (!pet) return;
  const hunger = ProfileManager.get('petHunger', 100);
  const xp = ProfileManager.get('petXP', 0);
  const stage = getPetStage(xp);
  const isHungry = hunger < 25;
  const vacation = ProfileManager.get('vacationMode', false);

  // Header pet icon (left of rank)
  if (petBtn) {
    petBtn.style.display = '';
    petBtn.textContent = pet.emoji;
    petBtn.className = 'pet-icon-header' + ((isHungry || vacation) ? ' hungry' : '');
  }

  // Hunger bar in header (under XP bar)
  const hungerBar = document.getElementById('pet-hunger-header');
  const hungerFill = document.getElementById('pet-hunger-header-fill');
  if (hungerBar && hungerFill) {
    hungerBar.style.display = '';
    hungerFill.style.width = hunger + '%';
    hungerFill.className = 'pet-hunger-mini-fill' + (hunger < 30 ? ' low' : '');
  }

  // Hide pet zone in middle
  if (zone) zone.innerHTML = '';
}
window.renderPetZone = renderPetZone;

function showMyPet() {
  renderMyPetScreen();
  showScreen('screen-my-pet');
}
window.showMyPet = showMyPet;

function showPetChoice() {
  const petType = ProfileManager.get('petType', null);
  if (!petType) {
    renderPetChoiceScreen();
    showScreen('screen-pet-choice');
  } else {
    showMyPet();
  }
}
window.showPetChoice = showPetChoice;

function buyPetFood(foodId) {
  if (feedPet(foodId)) {
    renderMyPetScreen();
    renderPetZone();
    document.getElementById('home-coins').textContent = ProfileManager.get('coins', 0);
  } else {
    alert('Pas assez de pièces !');
  }
}
window.buyPetFood = buyPetFood;

function getPetBonusDesc(petType, stage) {
  const pct = Math.round(stage.bonusPct * 100);
  if (petType === 'dragon') return '1 skip / ' + stage.dragonThreshold + ' questions (max ' + stage.dragonMax + ')';
  if (petType === 'robot')  return '+' + pct + '% XP';
  if (petType === 'fox')    return '+' + pct + '% pièces';
  return '';
}

function renderMyPetScreen() {
  const petType = ProfileManager.get('petType', null);
  const content = document.getElementById('my-pet-content');
  if (!petType || !content) return;

  const pet = PET_TYPES[petType];
  const xp = ProfileManager.get('petXP', 0);
  const hunger = ProfileManager.get('petHunger', 100);
  const stage = getPetStage(xp);
  const prog = getPetStageProgress(xp);
  const pct = prog.next ? Math.round(prog.progress * 100) : 100;
  const vacation = ProfileManager.get('vacationMode', false);
  const isHungry = hunger < 25;
  const hasBonus = hunger >= 50;
  const coins = ProfileManager.get('coins', 0);

  let html = '<div style="text-align:center">' +
    '<div style="font-size:4rem;margin:0.5rem 0' + ((isHungry || vacation) ? ';filter:grayscale(0.7);opacity:0.7' : '') + '">' + pet.emoji + '</div>' +
    '<div style="font-size:1.3rem;font-weight:700">' + pet.name + '</div>' +
    '<div style="font-size:0.85rem;color:var(--accent-orange);margin:0.25rem 0">' + stage.label + '</div>' +
    (vacation ? '<div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.25rem">🏖️ En vacances — bonus désactivés</div>' :
      (hasBonus ? '<div style="font-size:0.75rem;color:var(--text-secondary)">✨ ' + getPetBonusDesc(petType, stage) + '</div>' : '')) +
    (isHungry && !vacation ? '<div style="font-size:0.85rem;color:#f44336;margin-top:0.25rem">😢 A faim !</div>' : '') +
    '</div>';

  // XP bar
  html += '<div style="margin:1rem 0">' +
    '<div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.3rem">' +
      '<span>XP</span><span>' + xp + (prog.next ? ' / ' + prog.next.minXP : ' (MAX)') + '</span></div>' +
    '<div class="mastery-bar"><div class="mastery-bar-fill" style="width:' + pct + '%;background:var(--accent)"></div></div>' +
    '</div>';

  // Hunger bar
  html += '<div style="margin:1rem 0">' +
    '<div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.3rem">' +
      '<span>Faim</span><span>' + hunger + '%</span></div>' +
    '<div class="pet-hunger-bar" style="width:100%"><div class="pet-hunger-fill' + (hunger < 30 ? ' low' : '') + '" style="width:' + hunger + '%"></div></div>' +
    '</div>';

  // Food
  html += '<h3 style="margin-top:1rem">🍖 Nourrir</h3>' +
    '<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:0.5rem">Solde : ' + coins + ' 🪙</div>' +
    '<div class="pet-food-grid">' +
    PET_FOOD.map(f => '<button class="pet-food-btn" onclick="buyPetFood(\'' + f.id + '\')">' + f.icon + ' ' + f.name + '<br><span class="food-price">' + f.price + ' 🪙</span></button>').join('') +
    '</div>';

  // Vacation + change pet
  html += '<div style="display:flex;gap:0.5rem;margin-top:1.5rem">' +
    '<button class="btn-secondary" id="btn-vacation-toggle" style="flex:1;font-size:0.85rem">' +
    (vacation ? '☀️ Fin vacances' : '🏖️ Vacances') + '</button>' +
    '<button class="btn-secondary" id="btn-change-pet" style="flex:1;font-size:0.85rem">🔄 Changer</button>' +
    '</div>';

  content.innerHTML = html;

  document.getElementById('btn-vacation-toggle')?.addEventListener('click', () => {
    ProfileManager.set('vacationMode', !vacation);
    renderMyPetScreen();
  });
  document.getElementById('btn-change-pet')?.addEventListener('click', () => {
    renderPetChoiceScreen();
    showScreen('screen-pet-choice');
  });
}
window.renderMyPetScreen = renderMyPetScreen;

function renderPetChoiceScreen() {
  const currentPet = ProfileManager.get('petType', null);
  const grid = document.getElementById('pet-choice-grid');
  let html = '';
  Object.entries(PET_TYPES).forEach(([id, pet]) => {
    const isActive = id === currentPet;
    html += '<div class="pet-choice-card ' + (isActive ? 'active' : '') + '" data-pet="' + id + '">' +
      '<span class="pet-choice-emoji">' + pet.emoji + '</span>' +
      '<div class="pet-choice-name">' + pet.name + '</div>' +
      '<div class="pet-choice-bonus">✨ ' + pet.bonusDesc + '</div>' +
      (isActive ? '<div style="color:var(--accent-orange);margin-top:0.5rem;font-weight:700">Actuel</div>' : '') +
      '</div>';
  });

  grid.innerHTML = html;

  grid.querySelectorAll('.pet-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      const petId = card.dataset.pet;
      if (petId === currentPet) return;
      if (currentPet && !confirm('Changer de compagnon remet son évolution à zéro. Continuer ?')) return;
      changePet(petId);
      if (currentPet) { renderMyPetScreen(); showScreen('screen-my-pet'); }
      else { renderPetZone(); showScreen('screen-home'); }
    });
  });
}
window.renderPetChoiceScreen = renderPetChoiceScreen;

// V8: Skip button (dragon pet ability)
function renderSkipButton() {
  let skipBtn = document.getElementById('btn-skip-question');
  if (skipBtn) skipBtn.remove();
  const skips = ProfileManager.get('skipStock', 0);
  const petType = ProfileManager.get('petType', null);
  if (petType !== 'dragon' || skips <= 0) return;

  const answerSection = document.querySelector('#screen-game .answer-section');
  if (!answerSection) return;
  skipBtn = document.createElement('button');
  skipBtn.id = 'btn-skip-question';
  skipBtn.className = 'btn-secondary';
  skipBtn.style.cssText = 'font-size:0.75rem;padding:0.3rem 0.8rem;margin-top:0.5rem;width:100%';
  skipBtn.textContent = '🐉 Skip (' + skips + ')';
  skipBtn.addEventListener('click', () => {
    if (useSkip()) {
      state.currentIndex++;
      if (state.currentIndex >= state.questionCount) {
        endGame();
      } else {
        const lastCat = state.questions[state.currentIndex - 1]?.category;
        state.questions.push(generateQuestion(state.category, getSubLevel(lastCat || state.category), lastCat));
        showQuestion();
      }
    }
  });
  answerSection.parentNode.appendChild(skipBtn);
}

// ══════════════════════════════════════════════════════════════════════
// V8 — DAILY QUESTION
// ══════════════════════════════════════════════════════════════════════

async function checkDailyQuestion() {
  const btn = document.getElementById('btn-daily-question');
  if (!btn || typeof isOnline !== 'function' || !isOnline()) { if (btn) btn.style.display = 'none'; return; }
  try {
    const data = await getDailyQuestion();
    if (data.alreadyAnswered) {
      btn.style.display = '';
      const secs = data.myAnswer?.time ? (data.myAnswer.time / 1000).toFixed(1) : null;
      btn.textContent = secs
        ? '✅ Question du jour — ⏱ ' + secs + 's'
        : '✅ Question du jour — répondu';
      btn.onclick = null;
    } else {
      btn.style.display = '';
      btn.textContent = '🌟 Question du jour';
      btn.onclick = () => openDailyQuestion(data);
    }
  } catch(e) { if (btn) btn.style.display = 'none'; }
}

function openDailyQuestion(data) {
  showScreen('screen-daily');
  const q = data.question;
  document.getElementById('daily-question-card').innerHTML =
    '<span class="category-badge" style="background:' + (CATEGORIES[q.category]?.color || '#888') + '">' +
    (CATEGORIES[q.category]?.label || q.category) + '</span>' +
    '<p class="question-text">' + q.text + '</p>' +
    (q.unit ? '<p class="question-unit">' + q.unit + '</p>' : '');

  document.getElementById('daily-answer-section').style.display = '';
  document.getElementById('daily-result').style.display = 'none';
  const input = document.getElementById('daily-answer-input');
  const isTextQuestion = q.textAnswer !== undefined || q.acceptedAnswers || ['conjugaison', 'geographie'].includes(q.category);
  input.type = isTextQuestion ? 'text' : 'number';
  input.inputMode = isTextQuestion ? 'text' : 'decimal';
  input.value = '';
  setTimeout(() => input.focus(), 100);

  const startTime = Date.now();

  const validateBtn = document.getElementById('btn-daily-validate');
  const newBtn = validateBtn.cloneNode(true);
  validateBtn.parentNode.replaceChild(newBtn, validateBtn);

  const submitHandler = async () => {
    const val = input.value.trim();
    if (!val) return;
    const elapsed = Date.now() - startTime;
    newBtn.disabled = true;
    try {
      const correct = await submitDailyAnswer(data.date, isTextQuestion ? val : Number(val), elapsed);
      document.getElementById('daily-answer-section').style.display = 'none';
      const secs = (elapsed / 1000).toFixed(1);
      let html = correct
        ? '<div style="text-align:center"><div style="font-size:2rem;margin-bottom:0.5rem">✅</div>' +
          '<div style="font-weight:700;font-size:1.2rem;color:#4caf50">Bonne réponse !</div>' +
          '<div style="margin-top:0.5rem;font-size:0.95rem;color:var(--text-secondary)">⏱ ' + secs + 's</div>' +
          '<div style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-secondary)">Classement disponible demain</div>'
        : '<div style="text-align:center"><div style="font-size:2rem;margin-bottom:0.5rem">❌</div>' +
          '<div style="font-weight:700;font-size:1.2rem;color:#f44336">Mauvaise réponse</div>' +
          '<div style="margin-top:0.5rem;color:var(--text-secondary)">Réponse : ' + (q.textAnswer !== undefined ? q.textAnswer : q.answer) + '</div>';
      if (q.explanation) html += '<div style="margin-top:1rem;font-size:0.85rem;color:var(--text-secondary)">' + q.explanation + '</div>';
      html += '</div>';
      document.getElementById('daily-result').innerHTML = html;
      document.getElementById('daily-result').style.display = '';

      if (correct) {
        ProfileManager.set('coins', ProfileManager.get('coins', 0) + 15);
        ProfileManager.set('xp', ProfileManager.get('xp', 0) + 10);
      }
      checkDailyQuestion();
    } catch(e) { alert('Erreur : ' + e.message); newBtn.disabled = false; }
  };

  newBtn.addEventListener('click', submitHandler);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitHandler(); });
}

document.getElementById('btn-daily-back')?.addEventListener('click', () => showScreen('screen-home'));

// Debug helper — accessible from browser console
window._debug = { triggerBoss, state, showBossAppear, BOSS_POOL, renderLeaderboard, renderGroupsScreen, showCreateRiddleScreen, renderAdminDashboard };
window.showScreen = showScreen;

async function addRewardToGroup(groupCode) {
  const name = prompt('Nom de la récompense (ex: 30 min de jeux, bowling...) :');
  if (!name) return;
  const icon = prompt('Emoji (ex: 🎮, 🎳, 🎬) :', '🎁') || '🎁';
  const description = prompt('Description :', name) || name;
  const priceStr = prompt('Prix en pièces :', '1000');
  const price = parseInt(priceStr);
  if (isNaN(price) || price <= 0) { alert('Prix invalide'); return; }

  try {
    await addGroupReward(groupCode, { name, icon, description, price });
    alert('Récompense "' + name + '" ajoutée !');
    renderGroupDetail(groupCode);
  } catch(e) {
    alert('Erreur : ' + e.message);
  }
}
window.addRewardToGroup = addRewardToGroup;

async function removeRewardAction(groupCode, rewardId, name) {
  if (!confirm('Supprimer la récompense "' + name + '" ?')) return;
  try {
    await removeGroupReward(groupCode, rewardId);
    showDashboard(groupCode);
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.removeRewardAction = removeRewardAction;

// ── Parent Role Actions ──

async function requestParentAction(code) {
  try {
    await requestParentRole(code);
    showToast('Demande envoyée !');
    renderGroupDetail(code);
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.requestParentAction = requestParentAction;

async function acceptParentAction(code, uid) {
  try {
    await acceptParentRequest(code, uid);
    showToast('Rôle parent accepté');
    renderGroupDetail(code);
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.acceptParentAction = acceptParentAction;

async function rejectParentAction(code, uid) {
  try {
    await rejectParentRequest(code, uid);
    renderGroupDetail(code);
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.rejectParentAction = rejectParentAction;

async function removeParentAction(code, uid) {
  if (!confirm('Retirer le rôle parent de ce joueur ?')) return;
  try {
    await removeParentRole(code, uid);
    showToast('Rôle parent retiré');
    renderGroupDetail(code);
  } catch(e) { alert('Erreur : ' + e.message); }
}
window.removeParentAction = removeParentAction;

// ── Duel Event Handlers ──

document.getElementById('btn-duel').addEventListener('click', () => {
  if (!isOnline()) { alert('Le mode duel nécessite une connexion internet'); return; }
  const choice = confirm('Créer un duel ?\n\nOK = Créer\nAnnuler = Rejoindre');
  if (choice) {
    Duel._cleanup();
    document.getElementById('duel-my-coins').textContent = ProfileManager.get('coins', 0);
    showScreen('screen-duel-create');
  } else {
    Duel._cleanup();
    document.getElementById('duel-join-info').style.display = 'none';
    document.getElementById('duel-join-code').value = '';
    showScreen('screen-duel-join');
  }
});

document.getElementById('btn-duel-launch').addEventListener('click', () => {
  const pills = document.querySelectorAll('[data-setting="duel-category"] .pill.active');
  const category = pills.length > 0 ? pills[0].dataset.value : 'all';
  const stake = parseInt(document.getElementById('duel-stake-input').value) || 10;
  Duel.create(category, stake);
});

document.getElementById('btn-duel-cancel').addEventListener('click', () => Duel.cancel());
document.getElementById('btn-duel-create-back').addEventListener('click', () => Duel.cancel());
document.getElementById('btn-duel-join-back').addEventListener('click', () => { Duel._cleanup(); showScreen('screen-home'); });

document.getElementById('btn-duel-find').addEventListener('click', async () => {
  const code = document.getElementById('duel-join-code').value;
  const duel = await Duel.find(code);
  if (!duel) return;
  const catNames = { calcul: '🧮 Calcul', logique: '🧩 Logique', geometrie: '📐 Géométrie', fractions: '🍕 Fractions', mesures: '📏 Mesures', ouvert: '💡 Problèmes', geographie: '🌍 Géographie', conjugaison: '✏️ Conjugaison', all: '🎯 Toutes' };
  document.getElementById('duel-join-category').textContent = catNames[duel.category] || duel.category;
  document.getElementById('duel-join-stake').textContent = duel.stake.a + ' 🪙';
  document.getElementById('duel-join-opponent').textContent = duel.players.a.name;
  document.getElementById('duel-join-info').style.display = '';
});

document.getElementById('btn-duel-accept').addEventListener('click', () => {
  const code = document.getElementById('duel-join-code').value.trim();
  const pills = document.querySelectorAll('[data-setting="duel-difficulty"] .pill.active');
  const difficulty = pills.length > 0 ? pills[0].dataset.value : 'medium';
  const stake = parseInt(document.getElementById('duel-join-stake-input').value) || 10;
  Duel.join(code, difficulty, stake);
});

document.getElementById('btn-duel-validate').addEventListener('click', () => {
  const input = document.getElementById('duel-answer-input');
  if (input.value === '') return;
  Duel.submitAnswer(input.value);
});

document.getElementById('duel-answer-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btn-duel-validate').click(); }
});

document.getElementById('btn-duel-rematch').addEventListener('click', () => Duel.rematch());
document.getElementById('btn-duel-home').addEventListener('click', () => { Duel._cleanup(); updateProfileHeader(); showScreen('screen-home'); });

// Pill groups for duel screens
document.querySelectorAll('#screen-duel-create .pill-group, #screen-duel-join .pill-group').forEach(group => {
  group.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// V5: Session limit buttons
document.getElementById('btn-session-continue').addEventListener('click', () => {
  document.getElementById('session-limit-overlay').style.display = 'none';
});
document.getElementById('btn-session-stop').addEventListener('click', () => {
  document.getElementById('session-limit-overlay').style.display = 'none';
  showScreen('screen-home');
});

// ── V5: Feedback & Bug Report ───────────────────────────────────────
(function initFeedback() {
  let feedbackType = 'bug';
  const fab = document.getElementById('btn-feedback');
  const overlay = document.getElementById('feedback-overlay');
  if (!fab || !overlay) return;

  fab.addEventListener('click', () => {
    overlay.style.display = 'flex';
    document.getElementById('feedback-text').value = '';
    document.getElementById('feedback-status').textContent = '';
    document.getElementById('feedback-include-screenshot').checked = feedbackType === 'bug';
    document.getElementById('feedback-screenshot-section').style.display = feedbackType === 'bug' ? '' : 'none';
  });

  // Type toggle
  overlay.querySelectorAll('.feedback-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.feedback-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      feedbackType = btn.dataset.type;
      document.getElementById('feedback-screenshot-section').style.display = feedbackType === 'bug' ? '' : 'none';
    });
  });

  document.getElementById('btn-feedback-cancel').addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  document.getElementById('btn-feedback-send').addEventListener('click', async () => {
    const text = document.getElementById('feedback-text').value.trim();
    if (!text) {
      document.getElementById('feedback-status').textContent = 'Écris quelque chose !';
      return;
    }

    const statusEl = document.getElementById('feedback-status');
    statusEl.textContent = 'Envoi en cours...';
    document.getElementById('btn-feedback-send').disabled = true;

    try {
      const data = {
        type: feedbackType,
        text: text,
        status: 'new',
        uid: firebaseUid || 'anonymous',
        profileName: ProfileManager.getActive()?.name || 'unknown',
        appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'unknown',
        screen: document.querySelector('.screen.active')?.id || 'unknown',
        userAgent: navigator.userAgent.substring(0, 200),
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      };

      // Screenshot capture (for bugs)
      if (feedbackType === 'bug' && document.getElementById('feedback-include-screenshot').checked) {
        try {
          // Hide overlay temporarily for clean screenshot
          overlay.style.display = 'none';
          await new Promise(r => setTimeout(r, 100));

          const canvas = await html2canvas(document.body, {
            scale: 0.5,
            logging: false,
            useCORS: true,
            width: window.innerWidth,
            height: window.innerHeight,
          });
          data.screenshot = canvas.toDataURL('image/jpeg', 0.5);
          overlay.style.display = 'flex';
        } catch (e) {
          // html2canvas not available — use simple DOM snapshot instead
          overlay.style.display = 'flex';
          data.screenshot = null;
          data.screenHTML = document.querySelector('.screen.active')?.innerHTML?.substring(0, 2000) || '';
        }
      }

      await db.ref('feedback').push(data);
      statusEl.textContent = 'Merci ! Ton message a été envoyé 🎉';
      statusEl.style.color = 'var(--accent-green)';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.getElementById('btn-feedback-send').disabled = false;
      }, 1500);
    } catch (e) {
      statusEl.textContent = 'Erreur — réessaie plus tard.';
      statusEl.style.color = 'var(--error)';
      document.getElementById('btn-feedback-send').disabled = false;
    }
  });
})();

// ── Homework Upload (Parent) ─────────────────────────────────────────
(function initHomeworkUpload() {
  const overlay = document.getElementById('homework-overlay');
  if (!overlay) return;

  let selectedSubject = 'maths';
  let compressedBase64 = null;

  // Subject toggle
  overlay.querySelectorAll('#homework-subject-selector .feedback-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('#homework-subject-selector .feedback-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSubject = btn.dataset.subject;
    });
  });

  // Photo preview + compression
  document.getElementById('homework-photo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      document.getElementById('homework-preview').style.display = 'none';
      compressedBase64 = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 1200px width, JPEG quality 0.6
        const MAX_W = 1200;
        let w = img.width, h = img.height;
        if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        document.getElementById('homework-preview-img').src = compressedBase64;
        document.getElementById('homework-preview').style.display = '';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Cancel
  document.getElementById('btn-homework-cancel').addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // Send
  document.getElementById('btn-homework-send').addEventListener('click', async () => {
    const title = document.getElementById('homework-title').value.trim();
    const statusEl = document.getElementById('homework-status');

    if (!title) { statusEl.textContent = 'Le titre est obligatoire.'; statusEl.style.color = 'var(--error)'; return; }
    if (!compressedBase64) { statusEl.textContent = 'Choisis une photo.'; statusEl.style.color = 'var(--error)'; return; }

    statusEl.textContent = 'Envoi en cours...';
    statusEl.style.color = '';
    document.getElementById('btn-homework-send').disabled = true;

    try {
      await uploadHomework(currentGroupCode, title, selectedSubject, compressedBase64);
      statusEl.textContent = 'Photo envoyée ! Le devoir sera disponible prochainement. 🎉';
      statusEl.style.color = 'var(--accent-green)';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.getElementById('btn-homework-send').disabled = false;
        // Reset form
        document.getElementById('homework-title').value = '';
        document.getElementById('homework-photo').value = '';
        document.getElementById('homework-preview').style.display = 'none';
        compressedBase64 = null;
        statusEl.textContent = '';
      }, 1500);
    } catch (e) {
      statusEl.textContent = 'Erreur — réessaie plus tard.';
      statusEl.style.color = 'var(--error)';
      document.getElementById('btn-homework-send').disabled = false;
    }
  });
})();

// ── User Inbox: launch popup + FAB badge ────────────────────────────
(function initInbox() {
  let unreadReplies = [];
  let popupIndex = 0;

  function showPopup(idx) {
    if (idx >= unreadReplies.length) {
      document.getElementById('inbox-popup-overlay').style.display = 'none';
      return;
    }
    const fb = unreadReplies[idx];
    const origText = fb.text.length > 80 ? fb.text.substring(0, 80) + '...' : fb.text;
    document.getElementById('inbox-popup-original').textContent = '« ' + origText + ' »';
    document.getElementById('inbox-popup-reply').textContent = fb.adminReply;
    document.getElementById('inbox-popup-overlay').style.display = 'flex';
    popupIndex = idx;
  }

  // OK button — mark read, show next
  document.getElementById('btn-inbox-popup-ok')?.addEventListener('click', async () => {
    const fb = unreadReplies[popupIndex];
    if (fb) await markFeedbackRead(fb.id);
    showPopup(popupIndex + 1);
    updateBadge();
  });

  // View all messages
  document.getElementById('btn-inbox-popup-view')?.addEventListener('click', () => {
    document.getElementById('inbox-popup-overlay').style.display = 'none';
    openInbox();
  });

  // Inbox close
  document.getElementById('btn-inbox-close')?.addEventListener('click', () => {
    document.getElementById('inbox-overlay').style.display = 'none';
  });

  // New message from inbox
  document.getElementById('btn-inbox-new')?.addEventListener('click', () => {
    document.getElementById('inbox-overlay').style.display = 'none';
    document.getElementById('feedback-overlay').style.display = 'flex';
    document.getElementById('feedback-text').value = '';
    document.getElementById('feedback-status').textContent = '';
  });

  async function openInbox() {
    const listEl = document.getElementById('inbox-list');
    let items;
    try {
      items = (await getMyFeedbacks()).filter(function(fb) { return !fb.readByUser; });
    } catch(e) {
      listEl.innerHTML = '<p style="color:var(--text-secondary)">Impossible de charger tes messages.</p>';
      document.getElementById('inbox-overlay').style.display = 'flex';
      return;
    }

    if (!items.length) {
      listEl.innerHTML = '<p style="color:var(--text-secondary)">Pas de nouveau message.</p>';
    } else {
      listEl.innerHTML = items.map(function(fb) {
        const icon = fb.type === 'bug' ? '🐛' : '💡';
        const origText = fb.text.length > 60 ? fb.text.substring(0, 60) + '...' : fb.text;
        const date = fb.adminReplyAt ? new Date(fb.adminReplyAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
        return '<div class="inbox-item inbox-item-unread" data-fb-id="' + fb.id + '">' +
          '<div class="inbox-item-header">' +
            '<span>' + icon + ' ' + escapeHtml(origText) + '</span>' +
            '<span class="inbox-item-date">' + date + '</span>' +
          '</div>' +
          '<div class="inbox-item-reply">↪ ' + escapeHtml(fb.adminReply) + '</div>' +
          '<button class="inbox-item-delete btn-small btn-danger-small">🗑️ Supprimer</button>' +
        '</div>';
      }).join('');
    }
    document.getElementById('inbox-overlay').style.display = 'flex';

    // Delete handler
    listEl.querySelectorAll('.inbox-item-delete').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        const item = btn.closest('.inbox-item');
        const fbId = item.dataset.fbId;
        await markFeedbackRead(fbId);
        item.remove();
        updateBadge();
        if (!listEl.querySelector('.inbox-item')) {
          listEl.innerHTML = '<p style="color:var(--text-secondary)">Pas de nouveau message.</p>';
        }
      });
    });
  }

  function updateBadge(count) {
    const fab = document.getElementById('btn-feedback');
    const existing = fab?.querySelector('.inbox-badge');
    if (existing) existing.remove();
    if (count === undefined) {
      getUnreadReplies().then(function(u) { updateBadge(u.length); }).catch(function() {});
      return;
    }
    if (count > 0 && fab) {
      const badge = document.createElement('span');
      badge.className = 'inbox-badge';
      badge.textContent = count;
      fab.appendChild(badge);
    }
  }

  // Override FAB click: if unread replies exist, show inbox instead of feedback form
  const fab = document.getElementById('btn-feedback');
  if (fab) {
    fab.addEventListener('click', async function(e) {
      let unreads = [];
      try { unreads = await getUnreadReplies(); } catch(err) {}
      if (unreads.length > 0) {
        e.stopImmediatePropagation();
        openInbox();
      }
    }, true); // capture phase to intercept before initFeedback handler
  }

  // Expose for startup call
  window.checkInboxOnLaunch = async function() {
    try {
      unreadReplies = await getUnreadReplies();
      if (unreadReplies.length > 0) {
        showPopup(0);
      }
      updateBadge(unreadReplies.length);
    } catch(e) {
    }
  };
})();

} // end initApp()
