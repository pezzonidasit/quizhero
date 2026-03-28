/**
 * QuizHero — Daily Quests Engine
 * Depends on: profiles.js (ProfileManager)
 */

// ── Quest Pool ──────────────────────────────────────────────────────
const QUEST_POOL = {
  easy: [
    { type: 'play_games', target: 2, text: 'Joue 2 parties', icon: '🎮' },
    { type: 'answer_count', target: 10, text: 'Réponds à 10 questions', icon: '❓' },
    { type: 'answer_count', target: 15, text: 'Réponds à 15 questions', icon: '❓' },
    { type: 'play_games', target: 3, text: 'Joue 3 parties', icon: '🎮' },
  ],
  medium: [
    { type: 'correct_streak', target: 3, text: 'Fais 3 réponses justes d\'affilée', icon: '🔥' },
    { type: 'correct_streak', target: 5, text: 'Fais 5 réponses justes d\'affilée', icon: '🔥' },
    { type: 'play_category', target: 1, text: 'Joue 1 partie de {cat}', icon: '📚', needsCat: true },
    { type: 'try_new_cat', target: 1, text: 'Essaie une nouvelle catégorie', icon: '🌟' },
  ],
  hard: [
    { type: 'perfect_game', target: 1, text: 'Fais une partie parfaite', icon: '🏆' },
    { type: 'use_hint', target: 1, text: 'Utilise un indice et réponds juste', icon: '💡' },
  ]
};

const QUEST_CATEGORIES = ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert'];

const QUEST_REWARDS = { easy: 10, medium: 12, hard: 15 };

// ── Quest Stickers (exclusive — not in shop) ────────────────────────
const QUEST_STICKERS = [
  { id: 'stk_quest_star', name: 'Étoile du jour', icon: '🎯', rarity: 'common' },
  { id: 'stk_quest_flame', name: 'Flamme de la semaine', icon: '🔥', rarity: 'rare' },
  { id: 'stk_quest_diamond', name: 'Diamant du mois', icon: '💎', rarity: 'legendary' },
  { id: 'stk_quest_shooting', name: 'Étoile filante', icon: '⭐', rarity: 'rare' },
];

// ── Seeded RNG ──────────────────────────────────────────────────────
function questSeedHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededPick(arr, seed) {
  return arr[seed % arr.length];
}

// ── Core: Get or Generate Today's Quests ────────────────────────────
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyQuests() {
  const today = getTodayStr();
  const stored = ProfileManager.get('dailyQuests', null);

  if (stored && stored.date === today) return stored;

  // Generate new quests for today
  const profileId = ProfileManager.getActiveId() || 'default';
  const seed = questSeedHash(today + profileId);

  const easyQuest = seededPick(QUEST_POOL.easy, seed);
  const medQuest = seededPick(QUEST_POOL.medium, seed >> 4);
  const hardQuest = seededPick(QUEST_POOL.hard, seed >> 8);

  // Resolve category placeholder
  function resolveQuest(template, difficulty, seedOffset) {
    const quest = { ...template, progress: 0, reward: QUEST_REWARDS[difficulty], done: false };
    if (quest.needsCat) {
      const cat = seededPick(QUEST_CATEGORIES, seed + seedOffset);
      const catLabels = { calcul: 'Calcul', logique: 'Logique', geometrie: 'Géométrie', fractions: 'Fractions', mesures: 'Mesures', ouvert: 'Problèmes ouverts' };
      quest.text = quest.text.replace('{cat}', catLabels[cat] || cat);
      quest.category = cat;
    }
    delete quest.needsCat;
    return quest;
  }

  const data = {
    date: today,
    quests: [
      resolveQuest(easyQuest, 'easy', 1),
      resolveQuest(medQuest, 'medium', 2),
      resolveQuest(hardQuest, 'hard', 3),
    ],
    allDone: false,
    chestClaimed: false,
  };

  ProfileManager.set('dailyQuests', data);
  return data;
}

// ── Streak ──────────────────────────────────────────────────────────
function getDailyStreak() {
  return ProfileManager.get('dailyStreak', { lastDate: '', count: 0 });
}

function updateDailyStreak() {
  const today = getTodayStr();
  const streak = getDailyStreak();

  if (streak.lastDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (streak.lastDate === yesterdayStr) {
    streak.count++;
  } else {
    streak.count = 1;
  }
  streak.lastDate = today;
  ProfileManager.set('dailyStreak', streak);
  return streak;
}

// ── Quest Progress Updates ──────────────────────────────────────────
function updateQuestProgress(type, value, extra) {
  const data = getDailyQuests();
  let changed = false;

  for (const quest of data.quests) {
    if (quest.done) continue;
    if (quest.type !== type) continue;

    if (type === 'play_category' && quest.category && extra?.category !== quest.category) continue;

    if (type === 'correct_streak' || type === 'perfect_game' || type === 'use_hint') {
      // These are "best value" — take the max
      quest.progress = Math.max(quest.progress, value);
    } else {
      // These are cumulative
      quest.progress += value;
    }

    if (quest.progress >= quest.target && !quest.done) {
      quest.done = true;
      // Award coins
      const coins = ProfileManager.get('coins', 0);
      ProfileManager.set('coins', coins + quest.reward);
      changed = true;
    }
  }

  // Check if all done
  if (data.quests.every(q => q.done) && !data.allDone) {
    data.allDone = true;
    changed = true;
  }

  ProfileManager.set('dailyQuests', data);
  return changed;
}

// ── Daily Chest (3/3 bonus) ─────────────────────────────────────────
function claimDailyChest() {
  const data = getDailyQuests();
  if (!data.allDone || data.chestClaimed) return null;

  data.chestClaimed = true;
  ProfileManager.set('dailyQuests', data);

  // Update streak
  const streak = updateDailyStreak();

  // Track quest chests opened
  const chestsCount = ProfileManager.get('questChestsOpened', 0) + 1;
  ProfileManager.set('questChestsOpened', chestsCount);

  // Determine chest tier + sticker rewards
  let tier = 'small';
  const stickerRewards = [];

  // Streak 7 → big chest + flame sticker
  if (streak.count > 0 && streak.count % 7 === 0) {
    tier = 'big';
    const owned = ProfileManager.get('ownedStickers', []);
    if (!owned.includes('stk_quest_flame')) {
      stickerRewards.push(QUEST_STICKERS.find(s => s.id === 'stk_quest_flame'));
      owned.push('stk_quest_flame');
      ProfileManager.set('ownedStickers', owned);
    }
  }

  // Streak 30 → diamond sticker
  if (streak.count > 0 && streak.count % 30 === 0) {
    const owned = ProfileManager.get('ownedStickers', []);
    if (!owned.includes('stk_quest_diamond')) {
      stickerRewards.push(QUEST_STICKERS.find(s => s.id === 'stk_quest_diamond'));
      owned.push('stk_quest_diamond');
      ProfileManager.set('ownedStickers', owned);
    }
  }

  // 10 quest chests → shooting star sticker
  if (chestsCount >= 10) {
    const owned = ProfileManager.get('ownedStickers', []);
    if (!owned.includes('stk_quest_shooting')) {
      stickerRewards.push(QUEST_STICKERS.find(s => s.id === 'stk_quest_shooting'));
      owned.push('stk_quest_shooting');
      ProfileManager.set('ownedStickers', owned);
    }
  }

  // Star sticker has chance from daily chest (20% chance)
  const owned = ProfileManager.get('ownedStickers', []);
  if (!owned.includes('stk_quest_star') && Math.random() < 0.2) {
    stickerRewards.push(QUEST_STICKERS.find(s => s.id === 'stk_quest_star'));
    owned.push('stk_quest_star');
    ProfileManager.set('ownedStickers', owned);
  }

  return { tier, streak, stickerRewards };
}
