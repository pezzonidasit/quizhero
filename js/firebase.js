/**
 * QuizHero V4 — Firebase Init & Helpers
 * Depends on: Firebase SDK loaded from CDN
 */

// ── Firebase Config (replace with your project's config) ──
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCnimtEdVQ6PBiN2kIwqctMTiFkN4YCuOY",
  authDomain: "quiz-app-e738b.firebaseapp.com",
  databaseURL: "https://quiz-app-e738b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quiz-app-e738b",
  storageBucket: "quiz-app-e738b.firebasestorage.app",
  messagingSenderId: "314766385085",
  appId: "1:314766385085:web:226b1dfd04e63f1c8e3cd4"
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
    activeTitle: stats.activeTitle || null,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  };
  if (stats.catStats) data.catStats = stats.catStats;
  if (stats.weeklyTimeSpent !== undefined) data.weeklyTimeSpent = stats.weeklyTimeSpent;
  if (stats.contractsCompleted) data.contractsCompleted = stats.contractsCompleted;
  try {
    await db.ref('players/' + firebaseUid).update(data);
    // Also update weekly leaderboard
    await db.ref('leaderboard/weekly/' + firebaseUid).set({
      name: displayName,
      xp: stats.xp || 0,
      rank: stats.rank,
      bestStreak: stats.bestStreak || 0,
      bossesDefeated: stats.bossesDefeated || 0,
      gamesPlayed: stats.gamesPlayed || 0,
      activeTitle: stats.activeTitle || null,
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
    parents: { [firebaseUid]: true },
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
  await db.ref('groups/' + code + '/parents/' + firebaseUid).remove();
  await db.ref('groups/' + code + '/parentRequests/' + firebaseUid).remove();
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
      const mSnap = await db.ref('groups/' + code + '/members').once('value');
      const memberCount = mSnap.exists() ? Object.keys(mSnap.val()).length : 0;
      groups.push({ code, name: gSnap.val(), memberCount });
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
  await db.ref('groups/' + groupCode + '/parents/' + targetUid).remove();
  await db.ref('groups/' + groupCode + '/parentRequests/' + targetUid).remove();
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

// ── Admin Global ──

/** Set current user as global admin. Only works if NO admin exists yet. */
async function setGlobalAdmin() {
  if (!firebaseUid) return false;
  // Check if any admin already exists
  const snap = await db.ref('admin_uid').once('value');
  if (snap.exists()) return false; // admin already set
  // Set this user as the global admin
  await db.ref('admin_uid').set(firebaseUid);
  await db.ref('players/' + firebaseUid + '/isAdmin').set(true);
  return true;
}

/** Check if current user is global admin */
async function checkIsGlobalAdmin() {
  if (!firebaseUid) return false;
  try {
    const snap = await db.ref('players/' + firebaseUid + '/isAdmin').once('value');
    return snap.val() === true;
  } catch(e) { return false; }
}

/** Get ALL players (admin only) */
async function getAllPlayers() {
  const snap = await db.ref('players').once('value');
  if (!snap.exists()) return [];
  const players = [];
  snap.forEach(child => {
    players.push({ uid: child.key, ...child.val() });
  });
  return players;
}

/** Get ALL groups (admin only) */
async function getAllGroups() {
  const snap = await db.ref('groups').once('value');
  if (!snap.exists()) return [];
  const groups = [];
  snap.forEach(child => {
    groups.push({ code: child.key, ...child.val() });
  });
  return groups;
}

/** Get ALL riddles (admin only) */
async function getAllRiddles() {
  const snap = await db.ref('riddles').once('value');
  if (!snap.exists()) return [];
  const riddles = [];
  snap.forEach(child => {
    riddles.push({ id: child.key, ...child.val() });
  });
  return riddles;
}

/** Admin delete any riddle */
async function adminDeleteAnyRiddle(riddleId) {
  await db.ref('riddles/' + riddleId).remove();
}

/** Admin ban from any group */
async function adminBanFromGroup(groupCode, targetUid) {
  await db.ref('groups/' + groupCode + '/banned/' + targetUid).set(true);
  await db.ref('groups/' + groupCode + '/members/' + targetUid).remove();
}

// ── Profile Backup/Restore ──

/** Backup full profile data to Firebase */
async function backupProfile(profileId) {
  if (!firebaseUid) return;
  const pm = ProfileManager;
  const fields = ['xp', 'coins', 'gamesPlayed', 'goodGamesStreak', 'records', 'badges',
    'catStats', 'ownedThemes', 'activeTheme', 'ownedStickers', 'boosts', 'chestsOpened',
    'freeHints', 'shields', 'defeatedBosses', 'contractsCompleted', 'weeklyXP', 'weeklyGames', 'recoveryCode', 'bossTitles', 'activeTitle'];

  const data = {};
  fields.forEach(f => {
    data[f] = pm._getData(profileId, f, null);
  });

  // Also save profile metadata
  const profile = pm.getAll().find(p => p.id === profileId);
  if (profile) {
    data._meta = { name: profile.name, theme: profile.theme, createdAt: profile.createdAt };
  }

  data.backedUpAt = firebase.database.ServerValue.TIMESTAMP;

  try {
    await db.ref('players/' + firebaseUid + '/backup').set(data);
  } catch(e) {
    console.warn('Backup failed:', e.message);
  }
}

// ── Recovery Code ──

/** Generate a recovery code: NAME-4digits */
function generateRecoveryCode(name) {
  const cleanName = name.trim().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6);
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return cleanName + '-' + digits;
}

/** Save recovery code mapping in Firebase */
async function saveRecoveryCode(code) {
  if (!firebaseUid) return;
  await db.ref('recovery/' + code).set({ uid: firebaseUid, createdAt: firebase.database.ServerValue.TIMESTAMP });
}

/** Restore profile using a recovery code. Returns the created profile. */
async function restoreFromCode(code) {
  code = code.trim().toUpperCase();
  const snap = await db.ref('recovery/' + code).once('value');
  if (!snap.exists()) throw new Error('Code introuvable');

  const { uid } = snap.val();

  // Fetch backup from that UID
  const backupSnap = await db.ref('players/' + uid + '/backup').once('value');
  if (!backupSnap.exists()) throw new Error('Aucun backup trouvé pour ce code');

  const data = backupSnap.val();
  if (!data._meta || !data._meta.name) throw new Error('Backup corrompu');

  const pm = ProfileManager;

  // Check if profile already exists locally
  const existing = pm.getAll();
  if (existing.some(p => p.name === data._meta.name)) {
    throw new Error('Ce profil existe déjà sur cet appareil');
  }

  // Create the profile
  const profile = pm.create(data._meta.name, data._meta.theme || 'nuit');

  // Restore all fields
  const fields = ['xp', 'coins', 'gamesPlayed', 'goodGamesStreak', 'records', 'badges',
    'catStats', 'ownedThemes', 'activeTheme', 'ownedStickers', 'boosts', 'chestsOpened',
    'freeHints', 'shields', 'defeatedBosses', 'contractsCompleted', 'weeklyXP', 'weeklyGames', 'bossTitles', 'activeTitle'];

  fields.forEach(f => {
    if (data[f] !== null && data[f] !== undefined) {
      pm._setData(profile.id, f, data[f]);
    }
  });

  // Update recovery code to point to NEW uid (this device)
  if (firebaseUid && firebaseUid !== uid) {
    await db.ref('recovery/' + code).update({ uid: firebaseUid });
    // Copy backup to new uid
    await db.ref('players/' + firebaseUid + '/backup').set(data);
  }

  return profile;
}

/** Admin: delete a player and remove from all their groups */
async function adminDeletePlayer(uid) {
  // Get player's groups
  const pSnap = await db.ref('players/' + uid + '/groups').once('value');
  const groups = pSnap.exists() ? Object.keys(pSnap.val()) : [];

  // Remove from each group
  const updates = {};
  groups.forEach(code => {
    updates['groups/' + code + '/members/' + uid] = null;
    updates['groups/' + code + '/dashboard/' + uid] = null;
    updates['groups/' + code + '/parents/' + uid] = null;
    updates['groups/' + code + '/parentRequests/' + uid] = null;
  });

  // Delete player data
  updates['players/' + uid] = null;
  updates['leaderboard/weekly/' + uid] = null;

  // Delete their riddles
  const riddleSnap = await db.ref('riddles').orderByChild('createdBy').equalTo(uid).once('value');
  if (riddleSnap.exists()) {
    riddleSnap.forEach(child => {
      updates['riddles/' + child.key] = null;
    });
  }

  // Delete their recovery code(s)
  const recSnap = await db.ref('recovery').orderByChild('uid').equalTo(uid).once('value');
  if (recSnap.exists()) {
    recSnap.forEach(child => {
      updates['recovery/' + child.key] = null;
    });
  }

  // Execute updates per top-level path to avoid root-level permission issues
  const byPath = {};
  for (const [key, val] of Object.entries(updates)) {
    const top = key.split('/')[0];
    if (!byPath[top]) byPath[top] = {};
    byPath[top][key.slice(top.length + 1)] = val;
  }
  await Promise.all(Object.entries(byPath).map(([top, sub]) => db.ref(top).update(sub)));
}

/** Admin: delete a group and remove it from all members */
async function adminDeleteGroup(code) {
  const gSnap = await db.ref('groups/' + code).once('value');
  if (!gSnap.exists()) return;
  const group = gSnap.val();

  const updates = {};
  // Remove group reference from all members
  const memberIds = Object.keys(group.members || {});
  memberIds.forEach(uid => {
    updates['players/' + uid + '/groups/' + code] = null;
  });

  // Delete group itself
  updates['groups/' + code] = null;

  // Execute updates per top-level path to avoid root-level permission issues
  const byPath = {};
  for (const [key, val] of Object.entries(updates)) {
    const top = key.split('/')[0];
    if (!byPath[top]) byPath[top] = {};
    byPath[top][key.slice(top.length + 1)] = val;
  }
  await Promise.all(Object.entries(byPath).map(([top, sub]) => db.ref(top).update(sub)));
}

/** Admin: get all recovery codes with player names */
async function getAllRecoveryCodes() {
  const snap = await db.ref('recovery').once('value');
  if (!snap.exists()) return [];
  const codes = [];
  const promises = [];
  snap.forEach(child => {
    const data = child.val();
    codes.push({ code: child.key, uid: data.uid, name: null });
    promises.push(db.ref('players/' + data.uid + '/name').once('value'));
  });
  const names = await Promise.all(promises);
  names.forEach((nSnap, i) => {
    codes[i].name = nSnap.val() || 'Inconnu';
  });
  return codes;
}

// ── Parent Role ──

/** Request to become a parent in a group */
async function requestParentRole(groupCode) {
  if (!firebaseUid) throw new Error('Not signed in');
  const profile = ProfileManager.getActive();
  const name = profile ? profile.name.split(' ')[0] : 'Joueur';
  await db.ref('groups/' + groupCode + '/parentRequests/' + firebaseUid).set({
    name: name,
    requestedAt: firebase.database.ServerValue.TIMESTAMP,
  });
}

/** Accept a parent request (admin only) */
async function acceptParentRequest(groupCode, uid) {
  await db.ref('groups/' + groupCode + '/parents/' + uid).set(true);
  await db.ref('groups/' + groupCode + '/parentRequests/' + uid).remove();
}

/** Reject a parent request (admin only) */
async function rejectParentRequest(groupCode, uid) {
  await db.ref('groups/' + groupCode + '/parentRequests/' + uid).remove();
}

/** Remove parent role */
async function removeParentRole(groupCode, uid) {
  await db.ref('groups/' + groupCode + '/parents/' + uid).remove();
}

/** Check if current user is parent in a group */
function isParentInGroup(group) {
  return !!(group.parents && group.parents[firebaseUid]);
}

// ── Group Rewards ──

/** Add a reward to a group */
async function addGroupReward(groupCode, reward) {
  const ref = db.ref('groups/' + groupCode + '/rewards').push();
  await ref.set(reward);
  return ref.key;
}

/** Remove a reward from a group */
async function removeGroupReward(groupCode, rewardId) {
  await db.ref('groups/' + groupCode + '/rewards/' + rewardId).remove();
}

/** Get rewards for a group */
async function getGroupRewards(groupCode) {
  const snap = await db.ref('groups/' + groupCode + '/rewards').once('value');
  if (!snap.exists()) return [];
  const rewards = [];
  snap.forEach(child => {
    rewards.push({ id: child.key, groupCode, ...child.val() });
  });
  return rewards;
}

/** Get rewards from ALL groups a player belongs to */
async function getAllMyRewards() {
  const groups = await getMyGroups();
  const allRewards = [];
  for (const g of groups) {
    const rewards = await getGroupRewards(g.code);
    rewards.forEach(r => {
      r.groupName = g.name;
    });
    allRewards.push(...rewards);
  }
  return allRewards;
}

// ─── Daily Question ──────────────────────────────────────────────────

async function getDailyQuestion() {
  const today = new Date().toISOString().slice(0, 10);
  const ref = db.ref('dailyQuestion/' + today);
  let snap = await ref.child('question').once('value');

  if (!snap.exists()) {
    const q = generateQuestion('all', 2, null);
    await ref.child('question').set({
      text: q.text, answer: q.answer, unit: q.unit || '',
      hint: q.hint || '', explanation: q.explanation || '',
      category: q.category, generatedAt: firebase.database.ServerValue.TIMESTAMP,
    });
    snap = await ref.child('question').once('value');
  }

  const answerSnap = await ref.child('answers/' + firebaseUid).once('value');
  const alreadyAnswered = answerSnap.exists();
  const myAnswer = alreadyAnswered ? answerSnap.val() : null;

  return { question: snap.val(), alreadyAnswered, myAnswer, date: today };
}

async function submitDailyAnswer(date, value, time) {
  const ref = db.ref('dailyQuestion/' + date + '/answers/' + firebaseUid);
  const snap = await ref.once('value');
  if (snap.exists()) throw new Error('Déjà répondu');

  const questionSnap = await db.ref('dailyQuestion/' + date + '/question/answer').once('value');
  const correctAnswer = questionSnap.val();
  const correct = Math.abs(Number(value) - correctAnswer) < 0.01;

  await ref.set({
    correct, time, answeredAt: firebase.database.ServerValue.TIMESTAMP,
  });

  return correct;
}

async function getDailyRank(date) {
  const snap = await db.ref('dailyQuestion/' + date + '/answers').once('value');
  if (!snap.exists()) return { rank: 0, total: 0 };
  const answers = snap.val();
  const total = Object.keys(answers).length;
  const myAnswer = answers[firebaseUid];
  if (!myAnswer || !myAnswer.correct) return { rank: 0, total };

  const correctAnswers = Object.values(answers).filter(a => a.correct);
  correctAnswers.sort((a, b) => a.time - b.time);
  const rank = correctAnswers.findIndex(a => a.time === myAnswer.time && a.answeredAt === myAnswer.answeredAt) + 1;
  return { rank, total };
}

/** Restore profile from Firebase backup. Returns true if restored. */
async function restoreProfile() {
  if (!firebaseUid) return false;
  try {
    const snap = await db.ref('players/' + firebaseUid + '/backup').once('value');
    if (!snap.exists()) return false;

    const data = snap.val();
    if (!data._meta || !data._meta.name) return false;

    const pm = ProfileManager;

    // Check if this profile already exists locally
    const existing = pm.getAll();
    const alreadyExists = existing.some(p => p.name === data._meta.name);
    if (alreadyExists) return false; // don't duplicate

    // Create the profile
    const profile = pm.create(data._meta.name, data._meta.theme || 'nuit');

    // Restore all fields
    const fields = ['xp', 'coins', 'gamesPlayed', 'goodGamesStreak', 'records', 'badges',
      'catStats', 'ownedThemes', 'activeTheme', 'ownedStickers', 'boosts', 'chestsOpened',
      'freeHints', 'shields', 'defeatedBosses', 'contractsCompleted', 'weeklyXP', 'weeklyGames', 'bossTitles', 'activeTitle'];

    fields.forEach(f => {
      if (data[f] !== null && data[f] !== undefined) {
        pm._setData(profile.id, f, data[f]);
      }
    });

    return true;
  } catch(e) {
    console.warn('Restore failed:', e.message);
    return false;
  }
}

// ── Revision Sets ──

/** Get active revision sets for the current player's groups */
async function getActiveRevisionSets() {
  if (!firebaseUid) return [];
  const groups = await getMyGroups();
  if (groups.length === 0) return [];

  const setIds = new Set();
  for (const g of groups) {
    const snap = await db.ref('groups/' + g.code + '/activeRevisions').once('value');
    if (snap.exists()) {
      Object.keys(snap.val()).forEach(id => setIds.add(id));
    }
  }

  const sets = [];
  for (const setId of setIds) {
    const snap = await db.ref('revisionSets/' + setId).once('value');
    if (snap.exists()) {
      sets.push({ id: setId, ...snap.val() });
    }
  }
  return sets;
}

/** Get questions for a specific revision set */
async function getRevisionQuestions(setId) {
  const snap = await db.ref('revisionSets/' + setId + '/questions').once('value');
  if (!snap.exists()) return [];
  const questions = [];
  snap.forEach(child => {
    questions.push({ id: child.key, ...child.val() });
  });
  return questions;
}

/** Get the current player's score on a revision set */
async function getRevisionScore(setId) {
  if (!firebaseUid) return null;
  const snap = await db.ref('revisionScores/' + setId + '/' + firebaseUid).once('value');
  return snap.exists() ? snap.val() : null;
}

/** Save score after completing a revision set. Manages perfectStreak and cooldown. */
async function saveRevisionScore(setId, score, total, pct) {
  if (!firebaseUid) return;
  const ref = db.ref('revisionScores/' + setId + '/' + firebaseUid);
  const snap = await ref.once('value');
  const existing = snap.exists() ? snap.val() : {};

  const bestScore = Math.max(score, existing.bestScore || 0);
  const bestPct = Math.max(pct, existing.bestPct || 0);
  const attempts = (existing.attempts || 0) + 1;

  let perfectStreak = existing.perfectStreak || 0;
  let cooldownUntil = existing.cooldownUntil || null;

  if (pct === 100) {
    perfectStreak++;
    if (perfectStreak >= 3) {
      cooldownUntil = Date.now() + 7200000; // 2 hours
    }
  } else {
    perfectStreak = 0;
  }

  await ref.set({
    bestScore,
    bestPct,
    attempts,
    perfectStreak,
    cooldownUntil,
    lastPlayed: firebase.database.ServerValue.TIMESTAMP,
  });
}
