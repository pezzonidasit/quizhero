/**
 * MathQuiz V4 — Firebase Init & Helpers
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

// ── Admin Global ──

/** Set current user as global admin */
async function setGlobalAdmin() {
  if (!firebaseUid) return;
  await db.ref('players/' + firebaseUid + '/isAdmin').set(true);
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
