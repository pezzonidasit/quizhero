/**
 * QuizHero V4 — Sync Engine
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
      // V5: Save last week's stats for ceremony
      const lastWeeklyXP = ProfileManager.get('weeklyXP', 0);
      const lastWeeklyGames = ProfileManager.get('weeklyGames', 0);
      if (lastWeeklyXP > 0 || lastWeeklyGames > 0) {
        ProfileManager.set('lastWeekStats', {
          xp: lastWeeklyXP,
          games: lastWeeklyGames,
          weekOf: lastWeek,
        });
        ProfileManager.set('showWeeklyCeremony', true);
        // V6: Snapshot catStats for progression delta
        ProfileManager.set('lastWeekCatStats', ProfileManager.get('catStats', {}));
      }
      ProfileManager.set('weekStart', weekStart);
      ProfileManager.set('weeklyXP', 0);
      ProfileManager.set('weeklyGames', 0);
      ProfileManager.set('weeklyTimeSpent', 0);
      ProfileManager.set('daysPlayedThisWeek', []);
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
      activeTitle: ProfileManager.get('activeTitle', null),
      catStats: ProfileManager.get('catStats', {}),
      weeklyTimeSpent: ProfileManager.get('weeklyTimeSpent', 0),
      contractsCompleted: ProfileManager.get('contractsCompleted', {}),
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

    // Backup profile to Firebase
    const activeId = ProfileManager.getActiveId();
    if (activeId) {
      await backupProfile(activeId);
    }
  },

  /** Called on app launch. Sign in + sync pending + refresh cache. */
  async syncOnLaunch() {
    // Only sign in to Firebase if a profile exists — avoid creating
    // phantom entries in /players for visitors who never create a profile
    const hasProfile = ProfileManager.getAll().length > 0;
    if (hasProfile) {
      await firebaseSignIn();
    }

    // Force-update: check version in Firebase, purge cache if newer
    try {
      const vSnap = await db.ref('app_version').once('value');
      const remoteVersion = vSnap.val() || 0;
      const localVersion = parseInt(localStorage.getItem('mq_app_version') || '0');
      if (remoteVersion > localVersion) {
        localStorage.setItem('mq_app_version', String(remoteVersion));
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('Force update: cache purged, reloading (v' + remoteVersion + ')');
        window.location.reload(true);
        return;
      }
    } catch(e) { /* offline, skip */ }

    // Restore profile from backup if no local profiles exist
    if (firebaseUid && ProfileManager.getAll().length === 0) {
      try {
        const restored = await restoreProfile();
        if (restored) {
          console.log('Profile restored from Firebase backup');
          // Reload the app to pick up restored profile
          window.location.reload();
          return;
        }
      } catch(e) { console.warn('Restore check failed:', e.message); }
    }

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

    // Repair group membership consistency (players/{uid}/groups may be missing after migration)
    if (firebaseUid) {
      try {
        const pGroupsSnap = await db.ref('players/' + firebaseUid + '/groups').once('value');
        if (!pGroupsSnap.exists()) {
          const allGroupsSnap = await db.ref('groups').once('value');
          if (allGroupsSnap.exists()) {
            const repairs = {};
            allGroupsSnap.forEach(child => {
              const g = child.val();
              if (g.members && g.members[firebaseUid]) {
                repairs['players/' + firebaseUid + '/groups/' + child.key] = true;
              }
            });
            if (Object.keys(repairs).length > 0) {
              await db.ref().update(repairs);
              console.log('Repaired group membership:', Object.keys(repairs).length, 'groups');
            }
          }
        }
      } catch (e) { /* offline, skip */ }
    }

    // Generate recovery code for existing profiles that don't have one
    const activeId = ProfileManager.getActiveId();
    if (activeId && !ProfileManager.get('recoveryCode', null)) {
      const profile = ProfileManager.getActive();
      if (profile && typeof generateRecoveryCode === 'function') {
        const code = generateRecoveryCode(profile.name);
        ProfileManager.set('recoveryCode', code);
        saveRecoveryCode(code).catch(() => {});
      }
    }

    // Always push current stats on launch (initial sync + pending data)
    if (activeId) {
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
