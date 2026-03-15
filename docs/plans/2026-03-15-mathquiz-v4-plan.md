# MathQuiz V4 Implementation Plan — Firebase Social Features

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Firebase backend with leaderboard, groups, parent dashboard, shared riddles, and moderation to MathQuiz.

**Architecture:** Firebase Realtime DB (free tier) with anonymous auth. Two new JS files (`firebase.js` for Firebase init/helpers, `sync.js` for game-to-cloud sync). Five new HTML screens. Game remains 100% playable offline — Firebase syncs when network is available.

**Tech Stack:** Firebase JS SDK (CDN, compat mode), vanilla JS, localStorage for offline cache.

---

## Pre-requisite: Firebase Project Setup (MANUAL)

Before any code, the user must:

1. Go to https://console.firebase.google.com/
2. Create project "mathquiz-app" (disable Google Analytics)
3. Go to **Build → Realtime Database → Create Database** (start in test mode, region europe-west1)
4. Go to **Build → Authentication → Sign-in method → Anonymous → Enable**
5. Go to **Project Settings → General → Your apps → Web app** (register app "mathquiz-web")
6. Copy the `firebaseConfig` object — needed in Task 1

After setup, paste the security rules from the design doc into **Realtime Database → Rules**.

---

## Task 1: Firebase Init & Auth — `js/firebase.js`

**Files:**
- Create: `js/firebase.js`
- Modify: `index.html` (add Firebase SDK + new script)
- Modify: `sw.js` (add to cache, bump version)

**Step 1: Add Firebase SDK to `index.html`**

Add these script tags BEFORE `<script src="js/themes.js">`:

```html
<!-- Firebase SDK (compat mode — works without build tools) -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>
<script src="js/firebase.js"></script>
```

**Step 2: Create `js/firebase.js`**

```js
/**
 * MathQuiz V4 — Firebase Init & Helpers
 * Depends on: Firebase SDK loaded from CDN
 */

// ── Firebase Config (replace with your project's config) ──
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ── Init ──
const firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.database();
const auth = firebase.auth();

// ── Auth State ──
let firebaseUid = localStorage.getItem('mq_firebaseUid') || null;
let firebaseReady = false;

/**
 * Sign in anonymously. Returns uid.
 * Caches uid in localStorage for offline access.
 */
async function firebaseSignIn() {
  try {
    const cred = await auth.signInAnonymously();
    firebaseUid = cred.user.uid;
    localStorage.setItem('mq_firebaseUid', firebaseUid);
    firebaseReady = true;
    return firebaseUid;
  } catch (e) {
    console.warn('Firebase auth failed (offline?):', e.message);
    firebaseReady = false;
    return firebaseUid; // return cached uid if available
  }
}

/** Check if Firebase is connected */
function isOnline() {
  return firebaseReady && navigator.onLine;
}

// ── Player Helpers ──

/** Push player public stats to /players/{uid} and /leaderboard/weekly/{uid} */
async function pushPlayerStats(profile, stats) {
  if (!firebaseUid) return;
  const displayName = profile.name.split(' ')[0] + (profile.name.includes(' ') ? ' ' + profile.name.split(' ')[1][0] + '.' : '');
  const data = {
    name: displayName,
    rank: stats.rank,
    xp: stats.xp,
    weeklyXP: stats.weeklyXP || 0,
    weeklyGames: stats.weeklyGames || 0,
    bestStreak: stats.bestStreak || 0,
    bossesDefeated: stats.bossesDefeated || 0,
    gamesPlayed: stats.gamesPlayed || 0,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  };
  try {
    await db.ref('players/' + firebaseUid).update(data);
    // Also update weekly leaderboard
    await db.ref('leaderboard/weekly/' + firebaseUid).set({
      name: displayName,
      xp: stats.weeklyXP || 0,
      rank: stats.rank,
      bestStreak: stats.bestStreak || 0,
      bossesDefeated: stats.bossesDefeated || 0,
    });
  } catch (e) {
    console.warn('pushPlayerStats failed:', e.message);
  }
}

/** Push detailed stats to group dashboards */
async function pushDashboardStats(groups, stats) {
  if (!firebaseUid || !groups || groups.length === 0) return;
  const dashData = {
    catStats: stats.catStats || {},
    recentRate: stats.recentRate || 0,
    weakCategories: stats.weakCategories || [],
    timeSpent: stats.timeSpent || 0,
    contractsCompleted: stats.contractsCompleted || {},
    weeklyGames: stats.weeklyGames || 0,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  };
  try {
    const updates = {};
    groups.forEach(code => {
      updates['groups/' + code + '/dashboard/' + firebaseUid] = dashData;
    });
    await db.ref().update(updates);
  } catch (e) {
    console.warn('pushDashboardStats failed:', e.message);
  }
}

// ── Group Helpers ──

/** Create a new group. Returns { code, name }. */
async function createGroup(name) {
  if (!firebaseUid) throw new Error('Not signed in');
  const code = generateGroupCode();
  await db.ref('groups/' + code).set({
    name: name,
    createdBy: firebaseUid,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    members: { [firebaseUid]: true },
  });
  await db.ref('players/' + firebaseUid + '/groups/' + code).set(true);
  return { code, name };
}

/** Generate 6-char alphanumeric code */
function generateGroupCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/** Join an existing group by code. Throws if banned or not found. */
async function joinGroup(code) {
  if (!firebaseUid) throw new Error('Not signed in');
  code = code.toUpperCase().trim();
  const snap = await db.ref('groups/' + code).once('value');
  if (!snap.exists()) throw new Error('Groupe introuvable');
  const group = snap.val();
  if (group.banned && group.banned[firebaseUid]) throw new Error('Tu es banni de ce groupe');
  await db.ref('groups/' + code + '/members/' + firebaseUid).set(true);
  await db.ref('players/' + firebaseUid + '/groups/' + code).set(true);
  return { code, name: group.name };
}

/** Leave a group */
async function leaveGroup(code) {
  if (!firebaseUid) return;
  await db.ref('groups/' + code + '/members/' + firebaseUid).remove();
  await db.ref('players/' + firebaseUid + '/groups/' + code).remove();
}

/** Get group info + members list */
async function getGroupInfo(code) {
  const snap = await db.ref('groups/' + code).once('value');
  if (!snap.exists()) return null;
  const group = snap.val();
  // Fetch member names
  const memberIds = Object.keys(group.members || {});
  const members = [];
  for (const uid of memberIds) {
    const pSnap = await db.ref('players/' + uid + '/name').once('value');
    members.push({ uid, name: pSnap.val() || 'Joueur' });
  }
  return { ...group, code, membersList: members };
}

/** Get my groups list */
async function getMyGroups() {
  if (!firebaseUid) return [];
  const snap = await db.ref('players/' + firebaseUid + '/groups').once('value');
  if (!snap.exists()) return [];
  const codes = Object.keys(snap.val());
  const groups = [];
  for (const code of codes) {
    const gSnap = await db.ref('groups/' + code + '/name').once('value');
    if (gSnap.exists()) {
      groups.push({ code, name: gSnap.val() });
    }
  }
  return groups;
}

/** Get dashboard data for a group (admin only) */
async function getGroupDashboard(code) {
  const snap = await db.ref('groups/' + code + '/dashboard').once('value');
  return snap.val() || {};
}

// ── Moderation ──

async function banMember(groupCode, targetUid) {
  await db.ref('groups/' + groupCode + '/banned/' + targetUid).set(true);
  await db.ref('groups/' + groupCode + '/members/' + targetUid).remove();
}

async function unbanMember(groupCode, targetUid) {
  await db.ref('groups/' + groupCode + '/banned/' + targetUid).remove();
}

async function regenerateGroupCode(oldCode) {
  const snap = await db.ref('groups/' + oldCode).once('value');
  if (!snap.exists()) return null;
  const group = snap.val();
  if (group.createdBy !== firebaseUid) throw new Error('Not admin');
  const newCode = generateGroupCode();
  // Copy group to new code
  await db.ref('groups/' + newCode).set({ ...group });
  // Update all members' /players/{uid}/groups references
  const memberIds = Object.keys(group.members || {});
  const updates = {};
  memberIds.forEach(uid => {
    updates['players/' + uid + '/groups/' + oldCode] = null;
    updates['players/' + uid + '/groups/' + newCode] = true;
  });
  await db.ref().update(updates);
  // Delete old group
  await db.ref('groups/' + oldCode).remove();
  return newCode;
}

// ── Leaderboard ──

/** Get global weekly leaderboard (top N) */
async function getWeeklyLeaderboard(limit = 50) {
  const snap = await db.ref('leaderboard/weekly')
    .orderByChild('xp')
    .limitToLast(limit)
    .once('value');
  if (!snap.exists()) return [];
  const entries = [];
  snap.forEach(child => {
    entries.push({ uid: child.key, ...child.val() });
  });
  return entries.sort((a, b) => b.xp - a.xp);
}

/** Get group leaderboard */
async function getGroupLeaderboard(code) {
  const group = await getGroupInfo(code);
  if (!group) return [];
  const entries = [];
  for (const member of group.membersList) {
    const snap = await db.ref('leaderboard/weekly/' + member.uid).once('value');
    if (snap.exists()) {
      entries.push({ uid: member.uid, ...snap.val() });
    } else {
      entries.push({ uid: member.uid, name: member.name, xp: 0, rank: 'bronze', bestStreak: 0, bossesDefeated: 0 });
    }
  }
  return entries.sort((a, b) => b.xp - a.xp);
}

// ── Riddles ──

/** Create a community riddle */
async function createRiddle(riddle) {
  if (!firebaseUid) throw new Error('Not signed in');
  // Check limit (max 5)
  const snap = await db.ref('riddles').orderByChild('createdBy').equalTo(firebaseUid).once('value');
  const count = snap.exists() ? Object.keys(snap.val()).length : 0;
  if (count >= 5) throw new Error('Maximum 5 énigmes ! Supprime-en une d\'abord.');
  const ref = db.ref('riddles').push();
  await ref.set({
    ...riddle,
    createdBy: firebaseUid,
    plays: 0,
    successRate: 0,
    upvotes: 0,
    downvotes: 0,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  });
  return ref.key;
}

/** Get community riddles (for gameplay) */
async function getCommunityRiddles(groupCode, limit = 20) {
  let snap;
  if (groupCode) {
    snap = await db.ref('riddles').orderByChild('groupCode').equalTo(groupCode).limitToLast(limit).once('value');
  } else {
    snap = await db.ref('riddles').limitToLast(limit).once('value');
  }
  if (!snap.exists()) return [];
  const riddles = [];
  snap.forEach(child => {
    const r = child.val();
    // Skip own riddles and poorly rated ones
    if (r.createdBy !== firebaseUid) {
      const totalVotes = (r.upvotes || 0) + (r.downvotes || 0);
      if (totalVotes < 10 || (r.upvotes / totalVotes) >= 0.3) {
        riddles.push({ id: child.key, ...r });
      }
    }
  });
  return riddles;
}

/** Vote on a riddle */
async function voteRiddle(riddleId, isUpvote) {
  const field = isUpvote ? 'upvotes' : 'downvotes';
  await db.ref('riddles/' + riddleId + '/' + field).transaction(val => (val || 0) + 1);
}

/** Record a riddle play (increment plays, update success rate) */
async function recordRiddlePlay(riddleId, success) {
  const ref = db.ref('riddles/' + riddleId);
  await ref.transaction(data => {
    if (!data) return data;
    data.plays = (data.plays || 0) + 1;
    const totalSuccess = Math.round((data.successRate || 0) * (data.plays - 1)) + (success ? 1 : 0);
    data.successRate = totalSuccess / data.plays;
    return data;
  });
  // Give creator +2 coins notification
  if (success) {
    const snap = await ref.child('createdBy').once('value');
    const creatorUid = snap.val();
    if (creatorUid && creatorUid !== firebaseUid) {
      await db.ref('players/' + creatorUid + '/pendingCoins').transaction(val => (val || 0) + 2);
    }
  }
}

/** Delete own riddle */
async function deleteRiddle(riddleId) {
  await db.ref('riddles/' + riddleId).remove();
}

/** Delete riddle as admin (verify group ownership) */
async function adminDeleteRiddle(riddleId, groupCode) {
  const groupSnap = await db.ref('groups/' + groupCode + '/createdBy').once('value');
  if (groupSnap.val() !== firebaseUid) throw new Error('Not admin');
  await db.ref('riddles/' + riddleId).remove();
}
```

**Step 3: Update `sw.js`**

Add `'./js/firebase.js'` and `'./js/sync.js'` to ASSETS array. Bump `CACHE_NAME` to `mathquiz-v9`.

**Step 4: Commit**

```bash
git add js/firebase.js index.html sw.js
git commit -m "feat(v4): Firebase init, auth, player/group/leaderboard/riddle helpers"
```

---

## Task 2: Sync Engine — `js/sync.js`

**Files:**
- Create: `js/sync.js`
- Modify: `index.html` (add script tag after `firebase.js`)

**Step 1: Add script tag to `index.html`**

After `<script src="js/firebase.js"></script>`, add:
```html
<script src="js/sync.js"></script>
```

**Step 2: Create `js/sync.js`**

```js
/**
 * MathQuiz V4 — Sync Engine
 * Syncs local game stats to Firebase after each game.
 * Handles offline queue and startup refresh.
 * Depends on: firebase.js, profiles.js, progression.js
 */

const MQSync = {
  _weekStart: null,

  /** Get Monday 00:00 of current week */
  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  },

  /** Check if weekly stats need reset */
  checkWeeklyReset() {
    const weekStart = this.getWeekStart();
    const lastWeek = ProfileManager.get('weekStart', 0);
    if (lastWeek < weekStart) {
      ProfileManager.set('weekStart', weekStart);
      ProfileManager.set('weeklyXP', 0);
      ProfileManager.set('weeklyGames', 0);
    }
  },

  /** Called after every endGame(). Pushes stats to Firebase. */
  async syncAfterGame(gameXP) {
    this.checkWeeklyReset();

    // Update weekly counters
    const weeklyXP = (ProfileManager.get('weeklyXP', 0)) + gameXP;
    const weeklyGames = (ProfileManager.get('weeklyGames', 0)) + 1;
    ProfileManager.set('weeklyXP', weeklyXP);
    ProfileManager.set('weeklyGames', weeklyGames);

    if (!isOnline()) {
      ProfileManager.set('pendingSync', true);
      return;
    }

    await this._pushAll();
  },

  /** Push all current stats to Firebase */
  async _pushAll() {
    const profile = ProfileManager.getActive();
    if (!profile || !firebaseUid) return;

    const xp = ProfileManager.get('xp', 0);
    const rank = getRank(xp).id;

    await pushPlayerStats(profile, {
      rank,
      xp,
      weeklyXP: ProfileManager.get('weeklyXP', 0),
      weeklyGames: ProfileManager.get('weeklyGames', 0),
      bestStreak: ProfileManager.get('records', {}).global?.streak || 0,
      bossesDefeated: (ProfileManager.get('defeatedBosses', []) || []).length,
      gamesPlayed: ProfileManager.get('gamesPlayed', 0),
    });

    // Push to group dashboards
    const groups = await getMyGroups();
    if (groups.length > 0) {
      const catStats = ProfileManager.get('catStats', {});
      const totalCorrect = Object.values(catStats).reduce((s, c) => s + (c.correct || 0), 0);
      const totalQuestions = Object.values(catStats).reduce((s, c) => s + (c.total || 0), 0);
      const allCats = ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert'];
      const weakCats = allCats.filter(c => {
        const stat = catStats[c];
        if (!stat || stat.total < 5) return true;
        return stat.correct / stat.total < 0.5;
      });

      await pushDashboardStats(groups.map(g => g.code), {
        catStats,
        recentRate: totalQuestions > 0 ? totalCorrect / totalQuestions : 0,
        weakCategories: weakCats,
        timeSpent: ProfileManager.get('weeklyTimeSpent', 0),
        contractsCompleted: ProfileManager.get('contractsCompleted', {}),
        weeklyGames: ProfileManager.get('weeklyGames', 0),
      });
    }

    ProfileManager.set('pendingSync', false);
  },

  /** Called on app launch. Sign in + sync pending + refresh cache. */
  async syncOnLaunch() {
    await firebaseSignIn();

    // Check for pending coins from riddle plays
    if (firebaseUid) {
      try {
        const snap = await db.ref('players/' + firebaseUid + '/pendingCoins').once('value');
        const pending = snap.val() || 0;
        if (pending > 0) {
          const coins = ProfileManager.get('coins', 0);
          ProfileManager.set('coins', coins + pending);
          await db.ref('players/' + firebaseUid + '/pendingCoins').set(0);
          // Store notification for display
          ProfileManager.set('coinNotification', pending);
        }
      } catch (e) { /* offline, skip */ }
    }

    // Sync pending game data
    if (ProfileManager.get('pendingSync', false)) {
      await this._pushAll();
    }

    // Refresh leaderboard cache
    try {
      const lb = await getWeeklyLeaderboard(50);
      localStorage.setItem('mq_leaderboard_cache', JSON.stringify(lb));
      localStorage.setItem('mq_leaderboard_updated', Date.now().toString());
    } catch (e) { /* offline, use cache */ }

    // Refresh community riddles cache
    try {
      const riddles = await getCommunityRiddles(null, 30);
      localStorage.setItem('mq_riddles_cache', JSON.stringify(riddles));
    } catch (e) { /* offline */ }
  },

  /** Get cached leaderboard (for offline display) */
  getCachedLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem('mq_leaderboard_cache') || '[]');
    } catch { return []; }
  },

  /** Get cached community riddles */
  getCachedRiddles() {
    try {
      return JSON.parse(localStorage.getItem('mq_riddles_cache') || '[]');
    } catch { return []; }
  },
};
```

**Step 3: Commit**

```bash
git add js/sync.js index.html
git commit -m "feat(v4): sync engine — game stats push, weekly reset, offline queue, launch refresh"
```

---

## Task 3: HTML — New Screens

**Files:**
- Modify: `index.html` (add 5 new screen divs)

**Step 1: Add new screens before `<canvas id="confetti-canvas">`**

Insert before `<canvas id="confetti-canvas">`:

```html
  <!-- ÉCRAN CLASSEMENT -->
  <div id="screen-leaderboard" class="screen">
    <div class="leaderboard-header">
      <button id="btn-lb-back" class="btn-back">← Retour</button>
      <h2>🏆 Classement</h2>
    </div>
    <div id="lb-tabs" class="lb-tabs"></div>
    <div id="lb-list" class="lb-list"></div>
    <div id="lb-me" class="lb-me"></div>
  </div>

  <!-- ÉCRAN GROUPES -->
  <div id="screen-groups" class="screen">
    <button id="btn-groups-back" class="btn-back">← Retour</button>
    <h2>👥 Mes Groupes</h2>
    <div id="groups-list" class="groups-list"></div>
    <div class="groups-actions">
      <button id="btn-join-group" class="btn-primary">Rejoindre un groupe</button>
      <button id="btn-create-group" class="btn-secondary">Créer un groupe</button>
    </div>
  </div>

  <!-- ÉCRAN DÉTAIL GROUPE -->
  <div id="screen-group-detail" class="screen">
    <button id="btn-gd-back" class="btn-back">← Retour</button>
    <div id="gd-header" class="gd-header"></div>
    <div id="gd-leaderboard" class="lb-list"></div>
    <div id="gd-actions" class="gd-actions"></div>
  </div>

  <!-- ÉCRAN DASHBOARD PARENT -->
  <div id="screen-dashboard" class="screen">
    <button id="btn-dash-back" class="btn-back">← Retour</button>
    <h2>📊 Dashboard</h2>
    <div id="dash-content" class="dash-content"></div>
  </div>

  <!-- ÉCRAN CRÉER ÉNIGME -->
  <div id="screen-create-riddle" class="screen">
    <button id="btn-riddle-back" class="btn-back">← Retour</button>
    <h2>📝 Créer une énigme</h2>
    <div class="create-riddle-form">
      <div class="setting-group">
        <label>Catégorie</label>
        <select id="riddle-category" class="answer-input" style="width:100%">
          <option value="calcul">🧮 Calcul</option>
          <option value="logique">🧩 Logique</option>
          <option value="geometrie">📐 Géométrie</option>
          <option value="fractions">🍕 Fractions</option>
          <option value="mesures">📏 Mesures</option>
          <option value="ouvert">💡 Problèmes ouverts</option>
        </select>
      </div>
      <div class="setting-group">
        <label>Question</label>
        <textarea id="riddle-text" class="answer-input" rows="3" placeholder="Ta question..." style="width:100%"></textarea>
      </div>
      <div class="setting-group">
        <label>Réponse (nombre)</label>
        <input type="number" id="riddle-answer" class="answer-input" placeholder="La bonne réponse" style="width:100%">
      </div>
      <div class="setting-group">
        <label>Indice</label>
        <input type="text" id="riddle-hint" class="answer-input" placeholder="Un indice..." style="width:100%">
      </div>
      <div class="setting-group">
        <label>Explication</label>
        <input type="text" id="riddle-explanation" class="answer-input" placeholder="Explication de la réponse..." style="width:100%">
      </div>
      <div class="setting-group">
        <label>Partager avec</label>
        <select id="riddle-share" class="answer-input" style="width:100%">
          <option value="">🌍 Tout le monde</option>
        </select>
      </div>
      <button id="btn-submit-riddle" class="btn-primary" style="width:100%;margin-top:1rem">Publier l'énigme !</button>
    </div>
  </div>
```

**Step 2: Add leaderboard + groups + riddle buttons to home screen**

In the home screen, add after the `profile-actions` div (after the shop button):

Add a `btn-leaderboard` button next to the shop button. Modify the `profile-actions` div to include:
```html
<button id="btn-leaderboard" class="btn-icon" title="Classement">🏆</button>
```

And add a `btn-groups` in the profile detail screen, and a `btn-create-riddle-nav` on the home screen.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat(v4): HTML screens — leaderboard, groups, group-detail, dashboard, create-riddle"
```

---

## Task 4: CSS — Social Screens Styles

**Files:**
- Modify: `css/style.css` (append new section)

**Step 1: Append social styles**

Append to end of `style.css` — all styles for leaderboard, groups, dashboard, create-riddle screens. Include:
- `.lb-tabs` (pill-style tabs for Global/Group switching)
- `.lb-list` (numbered list with rank icons, player names, XP)
- `.lb-me` (sticky bottom bar showing player's own position)
- `.lb-entry`, `.lb-entry.me`, `.lb-entry.champion` (leaderboard rows)
- `.groups-list`, `.group-card` (group cards with code display)
- `.gd-header` (group detail header with name, code, member count)
- `.gd-actions` (admin action buttons)
- `.dash-content`, `.dash-member`, `.dash-bar` (dashboard per-member stats)
- `.create-riddle-form` (form layout)
- `.coin-notification` (toast for riddle coin notifications)

**Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat(v4): CSS for leaderboard, groups, dashboard, riddle creation"
```

---

## Task 5: App Integration — Leaderboard Screen

**Files:**
- Modify: `js/app.js`

**Step 1: Add leaderboard button handler + render function**

In app.js, add:
- Click handler for `btn-leaderboard` → fetch leaderboard (or use cache) → render → showScreen
- `renderLeaderboard(entries, activeTab)` function
- Tab switching (Global vs group tabs)
- Highlight current player in the list
- `btn-lb-back` handler

**Step 2: Commit**

```bash
git add js/app.js
git commit -m "feat(v4): leaderboard screen — global + group tabs, weekly XP ranking"
```

---

## Task 6: App Integration — Groups Screen

**Files:**
- Modify: `js/app.js`

**Step 1: Add groups functionality**

- `btn-groups` handler (accessible from profile detail) → render groups list → showScreen
- `renderGroupsList()` — show all joined groups as cards with code + member count
- Join group flow: prompt for code → `joinGroup()` → refresh list
- Create group flow: prompt for name → `createGroup()` → show code to share
- Group detail screen: show group leaderboard + admin actions
- Leave group button
- `btn-groups-back`, `btn-gd-back` handlers

**Step 2: Add dashboard for admin**

- In group detail, if `createdBy === firebaseUid`, show "📊 Dashboard" button
- Dashboard screen: fetch `getGroupDashboard()` → render per-member stats
- Render category bars (percentage width, colored by success rate)
- Show weak categories with ⚠️ warning
- Admin moderation: ban/unban buttons, regenerate code button

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat(v4): groups — join/create/leave, group detail, parent dashboard, moderation"
```

---

## Task 7: App Integration — Create & Play Community Riddles

**Files:**
- Modify: `js/app.js`
- Modify: `js/questions.js` (integrate community riddles into question generation)

**Step 1: Riddle creation screen**

- `btn-create-riddle-nav` handler → populate group dropdown → showScreen
- `btn-submit-riddle` handler → validate fields → `createRiddle()` → success message → back to home
- Populate `riddle-share` select with user's groups

**Step 2: Integrate community riddles into gameplay**

In `generateQuestion()` or in the question-fetching logic in app.js:
- 1 in 5 chance to serve a community riddle (if available in cache)
- Mark the question with `communityRiddle: true` and `creatorName`
- In `showQuestion()`, display "📝 Créée par {name}" badge
- After answer, show 👍/👎 vote buttons
- Call `voteRiddle()` and `recordRiddlePlay()` on answer

**Step 3: Commit**

```bash
git add js/app.js js/questions.js
git commit -m "feat(v4): community riddles — create, play, vote, passive coins"
```

---

## Task 8: App Integration — Sync in Game Flow

**Files:**
- Modify: `js/app.js`

**Step 1: Call `MQSync.syncOnLaunch()` on app start**

In `initApp()`, after profile selection setup, call:
```js
MQSync.syncOnLaunch();
```

**Step 2: Call `MQSync.syncAfterGame()` in `endGame()`**

After XP/coins are calculated in `endGame()`, add:
```js
MQSync.syncAfterGame(rewards.xp);
```

Also track weekly time spent:
```js
const elapsed = Math.round((Date.now() - state.gameStartTime) / 1000);
ProfileManager.set('weeklyTimeSpent', (ProfileManager.get('weeklyTimeSpent', 0)) + elapsed);
```

**Step 3: Show coin notification from riddles**

In `updateProfileHeader()` or on home screen render, check:
```js
const coinNotif = ProfileManager.get('coinNotification', 0);
if (coinNotif > 0) {
  // Show toast: "Tes énigmes ont rapporté +{coinNotif} 🪙 !"
  ProfileManager.set('coinNotification', 0);
}
```

**Step 4: Add groups button to profile detail**

Add a "👥 Mes Groupes" button in `renderProfileDetail()` that navigates to the groups screen.

**Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat(v4): sync integration — launch sync, endGame push, coin notifications, groups nav"
```

---

## Task 9: Service Worker + Testing + Deploy

**Files:**
- Modify: `sw.js`

**Step 1: Update service worker**

Bump `CACHE_NAME` to `mathquiz-v9`. Add new files to ASSETS:
```js
'./js/firebase.js',
'./js/sync.js',
```

Note: Firebase SDK is loaded from CDN, not cached locally (always needs latest version).

**Step 2: Run existing Playwright tests**

Run: `npx playwright test`
Expected: All 10 tests pass (no regression).

**Step 3: Manual testing checklist**

- [ ] App loads offline (Firebase fails gracefully)
- [ ] Create profile → Firebase auth anonymous succeeds (check console)
- [ ] Play a game → stats synced to Firebase (check DB console)
- [ ] Create a group → code generated, visible in groups screen
- [ ] Join a group with code → appears in groups list
- [ ] Leaderboard shows players sorted by weekly XP
- [ ] Group leaderboard shows only group members
- [ ] Dashboard shows member stats (admin only)
- [ ] Create a riddle → appears in Firebase /riddles
- [ ] Community riddle appears during gameplay (1/5 chance)
- [ ] Vote on riddle → upvote/downvote incremented
- [ ] Ban member → removed from group
- [ ] Regenerate code → old code stops working

**Step 4: Final commit + deploy**

```bash
git add -A
git commit -m "feat(v4): MathQuiz V4 — Firebase social features complete"
```

Deploy:
```bash
cd /tmp/mathquiz-deploy && cp -r /c/Users/User/Claude/MathQuiz/* . && git add -A && git commit -m "V4: Social features" && git push
```

---

## Summary of all commits

| Task | Commit |
|------|--------|
| 1 | `feat(v4): Firebase init, auth, player/group/leaderboard/riddle helpers` |
| 2 | `feat(v4): sync engine — game stats push, weekly reset, offline queue` |
| 3 | `feat(v4): HTML screens — leaderboard, groups, dashboard, create-riddle` |
| 4 | `feat(v4): CSS for leaderboard, groups, dashboard, riddle creation` |
| 5 | `feat(v4): leaderboard screen — global + group tabs, weekly XP ranking` |
| 6 | `feat(v4): groups — join/create/leave, detail, dashboard, moderation` |
| 7 | `feat(v4): community riddles — create, play, vote, passive coins` |
| 8 | `feat(v4): sync integration — launch sync, endGame push, notifications` |
| 9 | `feat(v4): service worker + testing + deploy` |

## IMPORTANT: Before starting

The user MUST first:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Realtime Database + Anonymous Auth
3. Provide the `firebaseConfig` object to replace the placeholder in `js/firebase.js`
