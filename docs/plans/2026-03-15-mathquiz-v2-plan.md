# MathQuiz V2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add gamification to MathQuiz V1 — multi-profile system, XP/ranks, coins, chests with loot tables, skins/themes shop, all persisted in localStorage per profile.

**Architecture:** Extend the existing single-page app with 4 new screens (profiles, chest, shop, profile detail). New JS modules: `profiles.js` (profile CRUD + namespaced storage), `themes.js` (10 theme definitions + CSS variable injection), `progression.js` (XP, ranks, coins, chests, loot tables). Refactor `app.js` to be profile-aware.

**Tech Stack:** Vanilla HTML/CSS/JS (same as V1), localStorage with per-profile namespacing (`mq_p_{id}_*`)

**Design doc:** `docs/plans/2026-03-15-mathquiz-v2-design.md`

---

### Task 1: Theme engine — definitions + CSS variable injection

**Files:**
- Create: `js/themes.js`

**Context:** Themes are the foundation for profile creation (user picks a theme) and the shop. Each theme is an object of CSS custom property overrides. Applied by setting properties on `document.documentElement.style`.

**Step 1: Write `js/themes.js`**

```javascript
// js/themes.js — Theme definitions and application

const THEMES = {
  nuit: {
    id: 'nuit',
    name: 'Nuit étoilée',
    price: 0, // free
    rarity: 'common',
    preview: '🌙',
    vars: {
      '--bg-dark': '#1a1a2e',
      '--bg-card': '#25253e',
      '--bg-card-hover': '#2d2d4e',
      '--text-primary': '#e8e8f0',
      '--text-secondary': '#a0a0b8',
      '--accent-blue': '#4a9eff',
      '--accent-green': '#4ecdc4',
      '--accent-orange': '#ff8c42',
      '--accent-violet': '#a855f7',
      '--accent-red': '#ff6b6b',
      '--accent-yellow': '#ffd93d',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Océan',
    price: 0,
    rarity: 'common',
    preview: '🌊',
    vars: {
      '--bg-dark': '#0a192f',
      '--bg-card': '#112240',
      '--bg-card-hover': '#1a3358',
      '--text-primary': '#ccd6f6',
      '--text-secondary': '#8892b0',
      '--accent-blue': '#64ffda',
      '--accent-green': '#64ffda',
      '--accent-orange': '#f0a500',
      '--accent-violet': '#bd93f9',
      '--accent-red': '#ff6b6b',
      '--accent-yellow': '#ffd93d',
    },
  },
  foret: {
    id: 'foret',
    name: 'Forêt',
    price: 0,
    rarity: 'common',
    preview: '🌲',
    vars: {
      '--bg-dark': '#1a2e1a',
      '--bg-card': '#253e25',
      '--bg-card-hover': '#2d4e2d',
      '--text-primary': '#e0f0e0',
      '--text-secondary': '#a0b8a0',
      '--accent-blue': '#4ecdc4',
      '--accent-green': '#7ddf64',
      '--accent-orange': '#f0a500',
      '--accent-violet': '#c4a6ff',
      '--accent-red': '#ff7b7b',
      '--accent-yellow': '#e8d44d',
    },
  },
  galaxie: {
    id: 'galaxie',
    name: 'Galaxie',
    price: 150,
    rarity: 'epic',
    preview: '🌌',
    vars: {
      '--bg-dark': '#0d0221',
      '--bg-card': '#1a0a3e',
      '--bg-card-hover': '#2a1254',
      '--text-primary': '#e8d5ff',
      '--text-secondary': '#b89ce0',
      '--accent-blue': '#cc77ff',
      '--accent-green': '#00e5ff',
      '--accent-orange': '#ff6ec7',
      '--accent-violet': '#cc77ff',
      '--accent-red': '#ff4081',
      '--accent-yellow': '#ffab40',
    },
  },
  lave: {
    id: 'lave',
    name: 'Lave',
    price: 120,
    rarity: 'epic',
    preview: '🌋',
    vars: {
      '--bg-dark': '#1a0a0a',
      '--bg-card': '#2e1515',
      '--bg-card-hover': '#3e2020',
      '--text-primary': '#ffd5c2',
      '--text-secondary': '#c49080',
      '--accent-blue': '#ff6b35',
      '--accent-green': '#ffab40',
      '--accent-orange': '#ff6b35',
      '--accent-violet': '#ff4081',
      '--accent-red': '#ff1744',
      '--accent-yellow': '#ffd740',
    },
  },
  arctique: {
    id: 'arctique',
    name: 'Arctique',
    price: 120,
    rarity: 'epic',
    preview: '❄️',
    vars: {
      '--bg-dark': '#e8f0f8',
      '--bg-card': '#ffffff',
      '--bg-card-hover': '#f0f4fa',
      '--text-primary': '#1a2a3a',
      '--text-secondary': '#5a7a9a',
      '--accent-blue': '#0088cc',
      '--accent-green': '#00bfa5',
      '--accent-orange': '#ff8f00',
      '--accent-violet': '#7c4dff',
      '--accent-red': '#ff5252',
      '--accent-yellow': '#ffc400',
    },
  },
  neon: {
    id: 'neon',
    name: 'Néon',
    price: 200,
    rarity: 'epic',
    preview: '💡',
    vars: {
      '--bg-dark': '#0a0a0a',
      '--bg-card': '#1a1a1a',
      '--bg-card-hover': '#252525',
      '--text-primary': '#ffffff',
      '--text-secondary': '#888888',
      '--accent-blue': '#00f0ff',
      '--accent-green': '#39ff14',
      '--accent-orange': '#ff6600',
      '--accent-violet': '#ff00ff',
      '--accent-red': '#ff073a',
      '--accent-yellow': '#ffff00',
    },
  },
  couchant: {
    id: 'couchant',
    name: 'Coucher de soleil',
    price: 100,
    rarity: 'epic',
    preview: '🌅',
    vars: {
      '--bg-dark': '#1a1025',
      '--bg-card': '#2a1a3a',
      '--bg-card-hover': '#3a2a4a',
      '--text-primary': '#ffe0d0',
      '--text-secondary': '#c0a090',
      '--accent-blue': '#ff7eb3',
      '--accent-green': '#7afdd6',
      '--accent-orange': '#ff6b35',
      '--accent-violet': '#c77dff',
      '--accent-red': '#ff5252',
      '--accent-yellow': '#ffc93c',
    },
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel retro',
    price: 150,
    rarity: 'epic',
    preview: '👾',
    vars: {
      '--bg-dark': '#222034',
      '--bg-card': '#45283c',
      '--bg-card-hover': '#5a3a50',
      '--text-primary': '#fbf236',
      '--text-secondary': '#99e550',
      '--accent-blue': '#6abe30',
      '--accent-green': '#99e550',
      '--accent-orange': '#df7126',
      '--accent-violet': '#76428a',
      '--accent-red': '#ac3232',
      '--accent-yellow': '#fbf236',
    },
  },
  bonbon: {
    id: 'bonbon',
    name: 'Bonbon',
    price: 100,
    rarity: 'epic',
    preview: '🍬',
    vars: {
      '--bg-dark': '#fff0f5',
      '--bg-card': '#ffffff',
      '--bg-card-hover': '#fff5fa',
      '--text-primary': '#4a2040',
      '--text-secondary': '#9a6080',
      '--accent-blue': '#ff69b4',
      '--accent-green': '#90ee90',
      '--accent-orange': '#ffa07a',
      '--accent-violet': '#dda0dd',
      '--accent-red': '#ff6b81',
      '--accent-yellow': '#ffd700',
    },
  },
};

const FREE_THEMES = ['nuit', 'ocean', 'foret'];

function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
}

function getThemeList() {
  return Object.values(THEMES);
}
```

**Step 2: Add `<script src="js/themes.js"></script>` in `index.html` before `questions.js`**

**Step 3: Verify in browser console**

```javascript
applyTheme('ocean'); // Page should turn deep blue
applyTheme('nuit');  // Back to default
```

**Step 4: Commit**

```bash
cd /c/Users/User/Claude && git add MathQuiz/js/themes.js MathQuiz/index.html
git commit -m "feat(mathquiz): theme engine — 10 themes with CSS variable injection"
```

---

### Task 2: Profile system — CRUD + namespaced storage

**Files:**
- Create: `js/profiles.js`

**Context:** Profiles namespace all localStorage data. Each profile has a unique ID (timestamp). The active profile ID is stored in `mq_activeProfile`. All V1 storage keys (`mq_records`, `mq_badges`, etc.) get prefixed with `mq_p_{id}_`.

**Step 1: Write `js/profiles.js`**

```javascript
// js/profiles.js — Profile management with namespaced localStorage

const ProfileManager = {
  // Get all profiles (array of {id, name, theme, createdAt})
  getAll() {
    try {
      return JSON.parse(localStorage.getItem('mq_profiles') || '[]');
    } catch { return []; }
  },

  // Save profiles list
  _saveList(profiles) {
    localStorage.setItem('mq_profiles', JSON.stringify(profiles));
  },

  // Create a new profile
  create(name, themeId) {
    const profiles = this.getAll();
    const id = Date.now().toString(36);
    const profile = { id, name, theme: themeId, createdAt: Date.now() };
    profiles.push(profile);
    this._saveList(profiles);

    // Initialize profile data
    this._setData(id, 'xp', 0);
    this._setData(id, 'coins', 0);
    this._setData(id, 'gamesPlayed', 0);
    this._setData(id, 'goodGamesStreak', 0);
    this._setData(id, 'records', {});
    this._setData(id, 'badges', []);
    this._setData(id, 'catStats', {});
    this._setData(id, 'ownedThemes', [...FREE_THEMES]);
    this._setData(id, 'activeTheme', themeId);
    this._setData(id, 'inventory', []);       // items from chests
    this._setData(id, 'chestsOpened', []);     // milestone IDs already claimed
    this._setData(id, 'xpBoostActive', false);
    this._setData(id, 'freeHints', 0);
    this._setData(id, 'shields', 0);

    return profile;
  },

  // Delete a profile
  delete(id) {
    let profiles = this.getAll();
    profiles = profiles.filter(p => p.id !== id);
    this._saveList(profiles);
    // Clean up localStorage keys for this profile
    const prefix = 'mq_p_' + id + '_';
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) localStorage.removeItem(key);
    });
    if (this.getActiveId() === id) {
      localStorage.removeItem('mq_activeProfile');
    }
  },

  // Get/set active profile
  getActiveId() {
    return localStorage.getItem('mq_activeProfile');
  },

  setActive(id) {
    localStorage.setItem('mq_activeProfile', id);
  },

  getActive() {
    const id = this.getActiveId();
    if (!id) return null;
    return this.getAll().find(p => p.id === id) || null;
  },

  // Namespaced data access
  _key(id, field) {
    return 'mq_p_' + id + '_' + field;
  },

  _setData(id, field, value) {
    localStorage.setItem(this._key(id, field), JSON.stringify(value));
  },

  _getData(id, field, fallback) {
    try {
      const raw = localStorage.getItem(this._key(id, field));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },

  // Convenience getters/setters for active profile
  get(field, fallback) {
    const id = this.getActiveId();
    if (!id) return fallback;
    return this._getData(id, field, fallback);
  },

  set(field, value) {
    const id = this.getActiveId();
    if (!id) return;
    this._setData(id, field, value);
  },

  // Update profile metadata (name, theme)
  updateMeta(id, updates) {
    const profiles = this.getAll();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return;
    Object.assign(profiles[idx], updates);
    this._saveList(profiles);
  },
};
```

**Step 2: Add `<script src="js/profiles.js"></script>` in `index.html` after `themes.js` and before `questions.js`**

**Step 3: Verify in browser console**

```javascript
const p = ProfileManager.create('Test', 'nuit');
console.log(ProfileManager.getAll()); // Should show [{ id, name: 'Test', ... }]
ProfileManager.setActive(p.id);
ProfileManager.set('xp', 100);
console.log(ProfileManager.get('xp', 0)); // 100
ProfileManager.delete(p.id);
console.log(ProfileManager.getAll()); // []
```

**Step 4: Commit**

```bash
cd /c/Users/User/Claude && git add MathQuiz/js/profiles.js MathQuiz/index.html
git commit -m "feat(mathquiz): profile system — CRUD with namespaced localStorage"
```

---

### Task 3: Progression engine — XP, ranks, coins, chests

**Files:**
- Create: `js/progression.js`

**Context:** Handles all progression logic. Called from `endGame()` in app.js. Depends on `profiles.js` (ProfileManager) and `themes.js` (THEMES).

**Step 1: Write `js/progression.js`**

```javascript
// js/progression.js — XP, ranks, coins, chests, loot tables

// ── Ranks ────────────────────────────────────────────────────────
const RANKS = [
  { id: 'bronze',  name: 'Bronze',  xp: 0,     icon: '🥉', color: '#cd7f32' },
  { id: 'argent',  name: 'Argent',  xp: 500,   icon: '🥈', color: '#c0c0c0' },
  { id: 'or',      name: 'Or',      xp: 1500,  icon: '🥇', color: '#ffd700' },
  { id: 'diamant', name: 'Diamant', xp: 3500,  icon: '💎', color: '#00bcd4' },
  { id: 'maitre',  name: 'Maître',  xp: 7000,  icon: '👑', color: '#ff9800' },
  { id: 'legende', name: 'Légende', xp: 15000, icon: '⭐', color: '#e040fb' },
];

function getRank(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.xp) rank = r;
    else break;
  }
  return rank;
}

function getNextRank(xp) {
  for (const r of RANKS) {
    if (xp < r.xp) return r;
  }
  return null; // max rank
}

function getRankProgress(xp) {
  const current = getRank(xp);
  const next = getNextRank(xp);
  if (!next) return { current, next: null, progress: 1, xpInLevel: 0, xpNeeded: 0 };
  const xpInLevel = xp - current.xp;
  const xpNeeded = next.xp - current.xp;
  return { current, next, progress: xpInLevel / xpNeeded, xpInLevel, xpNeeded };
}

// ── XP & Coins Calculation ──────────────────────────────────────
function calculateRewards(score, difficulty, xpBoostActive) {
  let xp = score;
  if (difficulty === 'hard') xp = Math.round(xp * 1.5);
  if (xpBoostActive) xp *= 2;
  const coins = Math.round(score / 2);
  return { xp, coins };
}

// ── Chest Milestones ────────────────────────────────────────────
const GAME_MILESTONES = [5, 10, 25, 50, 100, 200, 500]; // streak milestones
const XP_MILESTONES = [500, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 10000, 15000]; // palier milestones

function checkChestMilestones(gamesPlayed, xp, chestsOpened) {
  const newChests = [];

  // Game streak milestones
  GAME_MILESTONES.forEach(m => {
    const chestId = 'games_' + m;
    if (gamesPlayed >= m && !chestsOpened.includes(chestId)) {
      newChests.push({ id: chestId, type: 'streak', tier: m >= 25 ? 'big' : 'small' });
    }
  });

  // XP palier milestones
  XP_MILESTONES.forEach(m => {
    const chestId = 'xp_' + m;
    if (xp >= m && !chestsOpened.includes(chestId)) {
      newChests.push({ id: chestId, type: 'palier', tier: 'big' });
    }
  });

  return newChests;
}

// ── Loot Tables ─────────────────────────────────────────────────
const LOOT_COMMON = [
  { type: 'xp_boost', name: 'Boost XP ×2', icon: '⚡', rarity: 'common', description: 'Double tes XP pendant 1 partie' },
  { type: 'free_hints', name: '3 indices gratuits', icon: '💡', rarity: 'common', description: '3 indices sans perte de points', amount: 3 },
];

const LOOT_RARE = [
  { type: 'shield', name: 'Bouclier', icon: '🛡️', rarity: 'rare', description: 'Protège ton streak si mauvaise partie' },
  { type: 'badge', name: 'Collectionneur', icon: '🏅', rarity: 'rare', badgeId: 'collector' },
  { type: 'badge', name: 'Chanceux', icon: '🍀', rarity: 'rare', badgeId: 'lucky' },
];

// Epic loot = themes (generated from THEMES that are not free)
function getEpicLoot(ownedThemes) {
  return Object.values(THEMES)
    .filter(t => t.price > 0 && !ownedThemes.includes(t.id))
    .map(t => ({
      type: 'theme',
      name: t.name,
      icon: t.preview,
      rarity: 'epic',
      themeId: t.id,
    }));
}

function generateChestLoot(tier, ownedThemes) {
  const items = [];
  const coinAmount = tier === 'big' ? rand(30, 60) : rand(10, 25);
  items.push({ type: 'coins', name: coinAmount + ' pièces', icon: '🪙', rarity: 'common', amount: coinAmount });

  if (tier === 'big') {
    // 1-2 items, guaranteed rare+
    items.push(pickWeighted([
      { weight: 50, pool: LOOT_RARE },
      { weight: 30, pool: getEpicLoot(ownedThemes) },
      { weight: 20, pool: LOOT_COMMON },
    ]));
    if (Math.random() < 0.4) {
      items.push(pick(LOOT_COMMON));
    }
  } else {
    // 1 item, mostly common
    items.push(pickWeighted([
      { weight: 70, pool: LOOT_COMMON },
      { weight: 25, pool: LOOT_RARE },
      { weight: 5, pool: getEpicLoot(ownedThemes) },
    ]));
  }

  return items;
}

function pickWeighted(pools) {
  const totalWeight = pools.reduce((s, p) => s + (p.pool.length > 0 ? p.weight : 0), 0);
  if (totalWeight === 0) return pick(LOOT_COMMON);
  let r = Math.random() * totalWeight;
  for (const p of pools) {
    if (p.pool.length === 0) continue;
    r -= p.weight;
    if (r <= 0) return pick(p.pool);
  }
  return pick(LOOT_COMMON);
}

// ── Apply Loot Item ─────────────────────────────────────────────
function applyLootItem(item) {
  switch (item.type) {
    case 'coins':
      ProfileManager.set('coins', ProfileManager.get('coins', 0) + item.amount);
      break;
    case 'xp_boost':
      ProfileManager.set('xpBoostActive', true);
      break;
    case 'free_hints':
      ProfileManager.set('freeHints', ProfileManager.get('freeHints', 0) + item.amount);
      break;
    case 'shield':
      ProfileManager.set('shields', ProfileManager.get('shields', 0) + 1);
      break;
    case 'theme': {
      const owned = ProfileManager.get('ownedThemes', []);
      if (!owned.includes(item.themeId)) {
        owned.push(item.themeId);
        ProfileManager.set('ownedThemes', owned);
      }
      break;
    }
    case 'badge': {
      const badges = ProfileManager.get('badges', []);
      if (!badges.includes(item.badgeId)) {
        badges.push(item.badgeId);
        ProfileManager.set('badges', badges);
      }
      break;
    }
  }
}
```

**Step 2: Add `<script src="js/progression.js"></script>` in `index.html` after `profiles.js`**

**Step 3: Verify in browser console**

```javascript
console.log(getRank(0));       // Bronze
console.log(getRank(1500));    // Or
console.log(getRankProgress(800)); // { current: Argent, next: Or, progress: 0.3, ... }
console.log(calculateRewards(75, 'hard', false)); // { xp: 113, coins: 38 }
```

**Step 4: Commit**

```bash
cd /c/Users/User/Claude && git add MathQuiz/js/progression.js MathQuiz/index.html
git commit -m "feat(mathquiz): progression engine — XP, ranks, coins, chests, loot tables"
```

---

### Task 4: Profile selection & creation screens (HTML + CSS)

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`

**Context:** Two new screens injected before the existing screens in the HTML. The profile selection screen is the new entry point. Profile creation is a sub-screen with name input + theme picker.

**Step 1: Add profile screens HTML in `index.html`**

Insert after `<body>` and before the `<!-- ÉCRAN ACCUEIL -->` comment:

```html
<!-- ÉCRAN SÉLECTION PROFIL -->
<div id="screen-profiles" class="screen">
  <h1>Mathématiques &amp; Énigmes</h1>
  <p class="subtitle">Qui joue ?</p>

  <div id="profiles-list" class="profiles-list">
    <!-- Filled by JS -->
  </div>

  <button id="btn-new-profile" class="btn-primary">+ Nouveau joueur</button>
</div>

<!-- ÉCRAN CRÉATION PROFIL -->
<div id="screen-create-profile" class="screen">
  <h2>Nouveau joueur</h2>

  <div class="create-profile-card">
    <div class="setting-group">
      <label>Ton prénom</label>
      <input type="text" id="profile-name-input" class="answer-input" placeholder="Entre ton prénom..." maxlength="20">
    </div>

    <div class="setting-group">
      <label>Choisis ton thème</label>
      <div id="theme-picker" class="theme-picker">
        <!-- Filled by JS: 3 free themes -->
      </div>
    </div>
  </div>

  <div class="end-buttons">
    <button id="btn-create-profile" class="btn-primary">C'est parti !</button>
    <button id="btn-cancel-profile" class="btn-secondary">Retour</button>
  </div>
</div>
```

Also add new screens for chest, shop, and profile detail **after** the end screen:

```html
<!-- ÉCRAN COFFRE -->
<div id="screen-chest" class="screen">
  <h2>Coffre trouvé !</h2>
  <div id="chest-animation" class="chest-container">
    <div id="chest-box" class="chest-box">🎁</div>
  </div>
  <div id="chest-items" class="chest-items"></div>
  <button id="btn-chest-close" class="btn-primary" style="display:none">Continuer</button>
</div>

<!-- ÉCRAN BOUTIQUE -->
<div id="screen-shop" class="screen">
  <div class="shop-header">
    <button id="btn-shop-back" class="btn-back">← Retour</button>
    <h2>Boutique</h2>
    <div class="coins-display">🪙 <span id="shop-coins">0</span></div>
  </div>
  <div id="shop-grid" class="shop-grid">
    <!-- Filled by JS -->
  </div>
</div>

<!-- ÉCRAN PROFIL DÉTAIL -->
<div id="screen-profile-detail" class="screen">
  <button id="btn-profile-back" class="btn-back">← Retour</button>
  <div id="profile-card" class="profile-detail-card">
    <!-- Filled by JS -->
  </div>
  <div id="profile-badges-list" class="profile-badges-list">
    <!-- Filled by JS -->
  </div>
  <button id="btn-delete-profile" class="btn-danger">Supprimer ce profil</button>
</div>
```

Also modify the home screen — add a profile header bar before the settings card:

```html
<!-- Insert at top of screen-home, before settings-card -->
<div id="profile-header" class="profile-header">
  <div class="profile-info" id="btn-profile-detail">
    <span id="profile-rank-icon" class="rank-icon">🥉</span>
    <div class="profile-text">
      <span id="profile-name-display" class="profile-name"></span>
      <div class="xp-bar-container">
        <div id="xp-bar" class="xp-bar"></div>
        <span id="xp-text" class="xp-text"></span>
      </div>
    </div>
  </div>
  <div class="profile-actions">
    <button id="btn-shop" class="btn-icon" title="Boutique">🛒</button>
    <div class="coins-display">🪙 <span id="home-coins">0</span></div>
  </div>
</div>
```

Remove the `active` class from `screen-home` (profiles screen is now the entry point):

Change `<div id="screen-home" class="screen active">` to `<div id="screen-home" class="screen">`.

Also modify the end screen — add XP/coins earned section before the end-buttons:

```html
<!-- Insert before end-buttons in screen-end -->
<div id="rewards-section" class="rewards-section">
  <div class="reward-row">
    <span>XP gagnés</span>
    <span id="xp-earned" class="reward-value">+0</span>
  </div>
  <div class="reward-row">
    <span>Pièces gagnées</span>
    <span id="coins-earned" class="reward-value">+0</span>
  </div>
  <div id="rank-up-display" class="rank-up" style="display:none">
    <span id="rank-up-text"></span>
  </div>
  <div id="xp-bar-end" class="xp-bar-container" style="width:100%">
    <div id="xp-bar-end-fill" class="xp-bar"></div>
    <span id="xp-bar-end-text" class="xp-text"></span>
  </div>
</div>
```

**Step 2: Add CSS for all new components in `css/style.css`**

Append to the end of `style.css` (before the responsive media query):

```css
/* --- Profile Selection --- */
.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.profiles-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-card-select {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all var(--transition);
  border: 2px solid transparent;
}

.profile-card-select:hover {
  border-color: var(--accent-blue);
  background: var(--bg-card-hover);
}

.profile-card-select .rank-icon {
  font-size: 1.8rem;
}

.profile-card-select .profile-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.profile-card-select .profile-rank-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.profile-card-select .profile-xp {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* --- Profile Creation --- */
.create-profile-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.theme-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-option {
  background: var(--bg-dark);
  border: 2px solid transparent;
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition);
}

.theme-option:hover {
  border-color: var(--text-secondary);
}

.theme-option.selected {
  border-color: var(--accent-blue);
  background: var(--bg-card-hover);
}

.theme-option .theme-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 6px;
}

.theme-option .theme-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* --- Profile Header (Home) --- */
.profile-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 12px 16px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.rank-icon {
  font-size: 1.5rem;
}

.profile-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-name {
  font-weight: 600;
  font-size: 1rem;
}

.xp-bar-container {
  position: relative;
  width: 120px;
  height: 8px;
  background: var(--bg-dark);
  border-radius: 4px;
  overflow: hidden;
}

.xp-bar {
  height: 100%;
  background: var(--accent-blue);
  border-radius: 4px;
  transition: width 0.5s ease;
  width: 0%;
}

.xp-text {
  position: absolute;
  top: -16px;
  right: 0;
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 4px;
  transition: transform var(--transition);
}

.btn-icon:hover {
  transform: scale(1.2);
}

.coins-display {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accent-yellow);
}

/* --- Rewards Section (End Screen) --- */
.rewards-section {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reward-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.reward-value {
  font-weight: 700;
  color: var(--accent-green);
}

.rank-up {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent-yellow);
  animation: popIn 0.5s ease;
}

/* --- Chest Screen --- */
.chest-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.chest-box {
  font-size: 5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.chest-box:hover {
  transform: scale(1.1);
}

.chest-box.shaking {
  animation: shake 0.5s ease infinite;
}

.chest-box.opened {
  animation: popIn 0.5s ease;
  font-size: 3rem;
  opacity: 0.5;
}

.chest-items {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chest-item {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  animation: slideIn 0.4s ease both;
  border-left: 4px solid;
}

.chest-item[data-rarity="common"]  { border-left-color: var(--text-secondary); }
.chest-item[data-rarity="rare"]    { border-left-color: var(--accent-blue); }
.chest-item[data-rarity="epic"]    { border-left-color: var(--accent-violet); }

.chest-item .item-icon { font-size: 1.8rem; }
.chest-item .item-info { flex: 1; }
.chest-item .item-name { font-weight: 600; }
.chest-item .item-desc { font-size: 0.8rem; color: var(--text-secondary); }
.chest-item .item-rarity {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 10px;
}

.chest-item[data-rarity="common"] .item-rarity  { background: rgba(160,160,184,0.15); color: var(--text-secondary); }
.chest-item[data-rarity="rare"] .item-rarity     { background: rgba(74,158,255,0.15); color: var(--accent-blue); }
.chest-item[data-rarity="epic"] .item-rarity     { background: rgba(168,85,247,0.15); color: var(--accent-violet); }

/* --- Shop --- */
.shop-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-back {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  padding: 8px;
}

.btn-back:hover {
  color: var(--text-primary);
}

.shop-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.shop-item {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition);
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.shop-item:hover {
  border-color: var(--accent-blue);
}

.shop-item.owned {
  opacity: 0.6;
  cursor: default;
}

.shop-item.owned:hover {
  border-color: transparent;
}

.shop-item .shop-icon { font-size: 2rem; }
.shop-item .shop-name { font-size: 0.85rem; font-weight: 600; }
.shop-item .shop-price { font-size: 0.8rem; color: var(--accent-yellow); }
.shop-item.owned .shop-price { color: var(--success); }

/* --- Profile Detail --- */
.profile-detail-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-detail-card .rank-icon { font-size: 3rem; }
.profile-detail-card .profile-name { font-size: 1.4rem; }
.profile-detail-card .rank-name { color: var(--text-secondary); }
.profile-detail-card .stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.profile-detail-card .stat-box {
  background: var(--bg-dark);
  border-radius: var(--radius-sm);
  padding: 12px;
  text-align: center;
}

.profile-detail-card .stat-box .stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  display: block;
}

.profile-detail-card .stat-box .stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.profile-badges-list {
  width: 100%;
}

.profile-badges-list h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.btn-danger {
  background: transparent;
  border: 1px solid var(--error);
  color: var(--error);
  border-radius: var(--radius);
  padding: 10px 24px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.1);
}
```

Also update the responsive media query to include new elements:

```css
/* Add to @media (max-width: 480px) block */
.theme-picker {
  grid-template-columns: repeat(2, 1fr);
}

.shop-grid {
  grid-template-columns: 1fr;
}

.xp-bar-container {
  width: 90px;
}

.profile-detail-card .stat-grid {
  grid-template-columns: repeat(2, 1fr);
}
```

**Step 3: Verify in browser**

Open index.html — should see an empty profiles screen (since no profiles exist). Visual inspection of layout.

**Step 4: Commit**

```bash
cd /c/Users/User/Claude && git add MathQuiz/index.html MathQuiz/css/style.css
git commit -m "feat(mathquiz): V2 screens — profiles, chest, shop, profile detail + CSS"
```

---

### Task 5: Refactor app.js — profile-aware game logic

**Files:**
- Modify: `js/app.js`

**Context:** This is the biggest change. `app.js` needs to:
1. Start with profile selection instead of home screen
2. Load/save data through `ProfileManager` instead of direct localStorage
3. Award XP + coins at end of game
4. Check for chest milestones
5. Handle all new screen navigation (profiles, shop, chest, profile detail)
6. Use free hints from inventory
7. Apply/consume XP boost

**Step 1: Rewrite `js/app.js`**

The full rewritten file is large. Key changes:

**Replace `loadData()` and `saveData()`:**
```javascript
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
```

**Replace `saveGameState()` / `loadGameState()` / `clearGameState()` to be profile-namespaced:**
```javascript
function saveGameState() {
  const gs = { /* same fields */ };
  ProfileManager.set('gameState', gs);
}

function clearGameState() {
  ProfileManager.set('gameState', null);
}

function loadGameState() {
  return ProfileManager.get('gameState', null);
}
```

**Add profile screen handlers:**
```javascript
// ── Profile Selection ─────────────────────────────────────────
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
      <div>
        <div class="profile-name">${p.name}</div>
        <div class="profile-rank-name">${rank.name}</div>
      </div>
      <span class="profile-xp">${xp} XP</span>
    </div>`;
  }).join('');

  container.querySelectorAll('.profile-card-select').forEach(card => {
    card.addEventListener('click', () => selectProfile(card.dataset.id));
  });
}

function selectProfile(id) {
  ProfileManager.setActive(id);
  const profile = ProfileManager.getActive();
  applyTheme(ProfileManager.get('activeTheme', 'nuit'));
  loadProfileData();
  updateProfileHeader();
  renderRecords();

  // Check for saved game
  const savedGame = loadGameState();
  if (savedGame) {
    // Restore game... (same logic as V1)
  } else {
    showScreen('screen-home');
  }
}

function updateProfileHeader() {
  const profile = ProfileManager.getActive();
  if (!profile) return;
  const xp = ProfileManager.get('xp', 0);
  const coins = ProfileManager.get('coins', 0);
  const rank = getRankProgress(xp);

  document.getElementById('profile-name-display').textContent = profile.name;
  document.getElementById('profile-rank-icon').textContent = rank.current.icon;
  document.getElementById('home-coins').textContent = coins;
  document.getElementById('xp-bar').style.width = (rank.progress * 100) + '%';
  document.getElementById('xp-text').textContent = rank.next
    ? rank.xpInLevel + '/' + rank.xpNeeded
    : 'MAX';
}

// Profile creation
document.getElementById('btn-new-profile').addEventListener('click', () => {
  renderThemePicker();
  document.getElementById('profile-name-input').value = '';
  showScreen('screen-create-profile');
});

document.getElementById('btn-cancel-profile').addEventListener('click', () => {
  showScreen('screen-profiles');
});

let selectedTheme = 'nuit';

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
      applyTheme(selectedTheme); // live preview
    });
  });
}

document.getElementById('btn-create-profile').addEventListener('click', () => {
  const name = document.getElementById('profile-name-input').value.trim();
  if (!name) return;
  const profile = ProfileManager.create(name, selectedTheme);
  selectProfile(profile.id);
});
```

**Modify `endGame()` to award XP, coins, check chests:**
```javascript
function endGame() {
  stopTimer();
  clearGameState();

  // ... existing record/badge logic ...

  // Calculate and apply rewards
  const xpBoost = ProfileManager.get('xpBoostActive', false);
  const { xp: earnedXP, coins: earnedCoins } = calculateRewards(state.score, state.difficulty, xpBoost);

  const oldXP = ProfileManager.get('xp', 0);
  const newXP = oldXP + earnedXP;
  ProfileManager.set('xp', newXP);
  ProfileManager.set('coins', ProfileManager.get('coins', 0) + earnedCoins);

  // Consume XP boost
  if (xpBoost) ProfileManager.set('xpBoostActive', false);

  // Game streak tracking (for chest milestones)
  const correctCount = state.questions.filter((_, i) => {
    // Count correct answers from categoryStats changes
    return i <= state.currentIndex;
  }).length;
  const correctRatio = state.score > 0 ? (state.bestStreakThisGame / state.questionCount) : 0;
  let gamesPlayed = ProfileManager.get('gamesPlayed', 0);
  let goodStreak = ProfileManager.get('goodGamesStreak', 0);

  gamesPlayed++;
  ProfileManager.set('gamesPlayed', gamesPlayed);

  // Good game = 70%+ correct (score >= 70% of max possible)
  const maxPossible = state.questionCount * 15; // 10 + 5 bonus per question
  const isGoodGame = state.score >= maxPossible * 0.5; // relaxed threshold
  if (isGoodGame) {
    goodStreak++;
  } else {
    // Use shield if available
    const shields = ProfileManager.get('shields', 0);
    if (shields > 0) {
      ProfileManager.set('shields', shields - 1);
      // streak preserved
    } else {
      goodStreak = 0;
    }
  }
  ProfileManager.set('goodGamesStreak', goodStreak);

  // Check for chest milestones
  const chestsOpened = ProfileManager.get('chestsOpened', []);
  const newChests = checkChestMilestones(gamesPlayed, newXP, chestsOpened);

  // Check rank up
  const oldRank = getRank(oldXP);
  const newRank = getRank(newXP);
  const rankedUp = newRank.id !== oldRank.id;

  // Display rewards
  document.getElementById('xp-earned').textContent = '+' + earnedXP + ' XP';
  document.getElementById('coins-earned').textContent = '+' + earnedCoins;

  const rankUpEl = document.getElementById('rank-up-display');
  if (rankedUp) {
    rankUpEl.style.display = '';
    document.getElementById('rank-up-text').textContent =
      oldRank.icon + ' → ' + newRank.icon + ' ' + newRank.name + ' !';
    launchBigConfetti();
  } else {
    rankUpEl.style.display = 'none';
  }

  // XP bar on end screen
  const progress = getRankProgress(newXP);
  document.getElementById('xp-bar-end-fill').style.width = (progress.progress * 100) + '%';
  document.getElementById('xp-bar-end-text').textContent = progress.next
    ? progress.xpInLevel + '/' + progress.xpNeeded
    : 'MAX';

  saveProfileData();

  // Show end screen, then chest if available
  state.pendingChests = newChests;

  // ... existing display logic ...

  showScreen('screen-end');
}
```

**Add shop screen handlers:**
```javascript
// ── Shop ──────────────────────────────────────────────────────
document.getElementById('btn-shop').addEventListener('click', () => {
  renderShop();
  showScreen('screen-shop');
});

document.getElementById('btn-shop-back').addEventListener('click', () => {
  updateProfileHeader();
  showScreen('screen-home');
});

function renderShop() {
  const coins = ProfileManager.get('coins', 0);
  const owned = ProfileManager.get('ownedThemes', []);
  document.getElementById('shop-coins').textContent = coins;

  const container = document.getElementById('shop-grid');
  container.innerHTML = getThemeList()
    .filter(t => t.price > 0)
    .map(t => {
      const isOwned = owned.includes(t.id);
      return `<div class="shop-item ${isOwned ? 'owned' : ''}" data-theme="${t.id}">
        <span class="shop-icon">${t.preview}</span>
        <span class="shop-name">${t.name}</span>
        <span class="shop-price">${isOwned ? '✓ Possédé' : '🪙 ' + t.price}</span>
      </div>`;
    }).join('');

  container.querySelectorAll('.shop-item:not(.owned)').forEach(item => {
    item.addEventListener('click', () => {
      const themeId = item.dataset.theme;
      const theme = THEMES[themeId];
      if (coins >= theme.price) {
        ProfileManager.set('coins', coins - theme.price);
        const newOwned = ProfileManager.get('ownedThemes', []);
        newOwned.push(themeId);
        ProfileManager.set('ownedThemes', newOwned);
        ProfileManager.set('activeTheme', themeId);
        ProfileManager.updateMeta(ProfileManager.getActiveId(), { theme: themeId });
        applyTheme(themeId);
        renderShop(); // refresh
      }
    });
  });
}
```

**Add chest screen handlers:**
```javascript
// ── Chest ─────────────────────────────────────────────────────
function showChest(chest) {
  const owned = ProfileManager.get('ownedThemes', []);
  const loot = generateChestLoot(chest.tier, owned);

  showScreen('screen-chest');
  const box = document.getElementById('chest-box');
  const itemsContainer = document.getElementById('chest-items');
  const closeBtn = document.getElementById('btn-chest-close');

  box.className = 'chest-box';
  box.textContent = '🎁';
  itemsContainer.innerHTML = '';
  closeBtn.style.display = 'none';

  // Click to open
  box.onclick = () => {
    box.classList.add('shaking');
    setTimeout(() => {
      box.classList.remove('shaking');
      box.classList.add('opened');
      box.textContent = '🎉';

      // Reveal items with delay
      loot.forEach((item, i) => {
        applyLootItem(item);
        setTimeout(() => {
          itemsContainer.innerHTML += `<div class="chest-item" data-rarity="${item.rarity}" style="animation-delay:${i * 0.15}s">
            <span class="item-icon">${item.icon}</span>
            <div class="item-info">
              <div class="item-name">${item.name}</div>
              <div class="item-desc">${item.description || ''}</div>
            </div>
            <span class="item-rarity">${item.rarity}</span>
          </div>`;
        }, 300 + i * 400);
      });

      // Show close button after all items revealed
      setTimeout(() => {
        closeBtn.style.display = '';
      }, 300 + loot.length * 400 + 200);

      // Mark chest as opened
      const chestsOpened = ProfileManager.get('chestsOpened', []);
      chestsOpened.push(chest.id);
      ProfileManager.set('chestsOpened', chestsOpened);
    }, 800);
  };
}

document.getElementById('btn-chest-close').addEventListener('click', () => {
  // Check for more pending chests
  if (state.pendingChests && state.pendingChests.length > 0) {
    showChest(state.pendingChests.shift());
  } else {
    updateProfileHeader();
    showScreen('screen-home');
  }
});
```

**Add profile detail screen:**
```javascript
// ── Profile Detail ────────────────────────────────────────────
document.getElementById('btn-profile-detail').addEventListener('click', () => {
  renderProfileDetail();
  showScreen('screen-profile-detail');
});

document.getElementById('btn-profile-back').addEventListener('click', () => {
  showScreen('screen-home');
});

function renderProfileDetail() {
  const profile = ProfileManager.getActive();
  const xp = ProfileManager.get('xp', 0);
  const coins = ProfileManager.get('coins', 0);
  const gamesPlayed = ProfileManager.get('gamesPlayed', 0);
  const rank = getRankProgress(xp);
  const badges = ProfileManager.get('badges', []);

  const card = document.getElementById('profile-card');
  card.innerHTML = `
    <span class="rank-icon">${rank.current.icon}</span>
    <span class="profile-name">${profile.name}</span>
    <span class="rank-name">${rank.current.name}</span>
    <div class="xp-bar-container" style="width:100%;height:12px">
      <div class="xp-bar" style="width:${rank.progress * 100}%"></div>
      <span class="xp-text" style="top:-18px">${rank.next ? rank.xpInLevel + '/' + rank.xpNeeded + ' XP' : 'MAX'}</span>
    </div>
    <div class="stat-grid">
      <div class="stat-box"><span class="stat-value">${xp}</span><span class="stat-label">XP</span></div>
      <div class="stat-box"><span class="stat-value">🪙 ${coins}</span><span class="stat-label">Pièces</span></div>
      <div class="stat-box"><span class="stat-value">${gamesPlayed}</span><span class="stat-label">Parties</span></div>
    </div>
  `;

  // Badges
  const badgesList = document.getElementById('profile-badges-list');
  const allBadges = [...BADGE_DEFS,
    { id: 'collector', name: 'Collectionneur', icon: '🏅' },
    { id: 'lucky', name: 'Chanceux', icon: '🍀' },
  ];
  badgesList.innerHTML = '<h3>Badges</h3><div class="badges-grid">' +
    allBadges.map(b => {
      const unlocked = badges.includes(b.id);
      return `<div class="badge-item" style="${unlocked ? '' : 'opacity:0.3;filter:grayscale(1)'}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${unlocked ? b.name : '???'}</span>
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
```

**Modify menu button to add "change player" option, and update btn-replay / btn-menu in end screen:**
```javascript
document.getElementById('btn-menu').addEventListener('click', () => {
  // Check pending chests first
  if (state.pendingChests && state.pendingChests.length > 0) {
    showChest(state.pendingChests.shift());
  } else {
    updateProfileHeader();
    renderRecords();
    showScreen('screen-home');
  }
});
```

**Modify init to start with profiles screen:**
```javascript
// ── Init ───────────────────────────────────────────────────────
const activeId = ProfileManager.getActiveId();
if (activeId && ProfileManager.getActive()) {
  selectProfile(activeId);
} else {
  renderProfilesList();
  showScreen('screen-profiles');
}
```

**Step 2: Verify in browser**

1. Open page → profiles selection screen (empty)
2. Click "+", enter name, pick theme → creates profile, lands on home
3. Profile header shows name, rank icon (Bronze), XP bar, coins
4. Play a game → end screen shows XP earned, coins earned
5. Click Menu → check coins/XP updated in header
6. Click shop → themes displayed with prices
7. Accumulate coins, buy a theme → theme applies
8. Click profile icon → detail screen with stats/badges
9. Refresh → should return to home (profile remembered)
10. Click delete profile → returns to profile selection

**Step 3: Commit**

```bash
cd /c/Users/User/Claude && git add MathQuiz/js/app.js
git commit -m "feat(mathquiz): V2 game logic — profiles, XP, coins, chests, shop"
```

---

### Task 6: Integration testing & polish

**Files:**
- Possibly minor fixes to any file

**Step 1: Full test pass**

- [ ] Profile creation works — name + theme choice
- [ ] Multiple profiles — each has separate data
- [ ] Theme applies on profile selection
- [ ] Game plays correctly with all V1 features intact
- [ ] XP and coins awarded at end of game (visible in rewards section)
- [ ] Rank up animation when XP threshold crossed
- [ ] Chest milestones trigger after enough games/XP
- [ ] Chest opening animation works — click to open, items revealed
- [ ] Loot items apply correctly (coins added, themes unlocked, etc.)
- [ ] Shop displays themes with correct prices and owned status
- [ ] Buying a theme deducts coins, applies theme, marks as owned
- [ ] Profile detail shows stats, XP bar, badges
- [ ] Delete profile works and returns to selection
- [ ] Free hints work (from chest loot)
- [ ] XP boost works (double XP for 1 game)
- [ ] Shield protects game streak
- [ ] Enter key works in all screens
- [ ] Responsive on mobile (375px)
- [ ] No console errors

**Step 2: Fix any issues found**

**Step 3: Commit**

```bash
cd /c/Users/User/Claude && git add MathQuiz/
git commit -m "feat(mathquiz): V2 complete — gamification with profiles, XP, chests, shop"
```

---

## Summary

| Task | Description | Dependencies | Parallel? |
|------|-------------|-------------|-----------|
| 1 | Theme engine (10 themes) | None | Yes |
| 2 | Profile system (CRUD + storage) | None | Yes with Task 1 |
| 3 | Progression engine (XP, ranks, coins, chests) | None | Yes with Tasks 1-2 |
| 4 | HTML + CSS for all new screens | Tasks 1-2-3 (for script tags) | No |
| 5 | Refactor app.js (profile-aware) | Tasks 1-2-3-4 | No |
| 6 | Integration testing & polish | Task 5 | No |

**Tasks 1, 2, 3 can run in parallel.** Task 4 depends on all three (for script tags). Task 5 is the big refactor. Task 6 is verification.
