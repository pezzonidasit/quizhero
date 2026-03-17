/**
 * QuizHero V2 — Progression Engine
 * XP, ranks, coins, chest milestones, loot tables
 * Depends on: questions.js (rand, pick), themes.js (THEMES), profiles.js (ProfileManager)
 */

// ─── Ranks ──────────────────────────────────────────────────────────
const RANKS = [
  { id: 'bronze',  name: 'Bronze',  xp: 0,     icon: '🥉', color: '#cd7f32' },
  { id: 'argent',  name: 'Argent',  xp: 500,   icon: '🥈', color: '#c0c0c0' },
  { id: 'or',      name: 'Or',      xp: 1500,  icon: '🥇', color: '#ffd700' },
  { id: 'diamant', name: 'Diamant', xp: 3500,  icon: '💎', color: '#00bcd4' },
  { id: 'maitre',  name: 'Maître',  xp: 7000,  icon: '👑', color: '#ff9800' },
  { id: 'legende', name: 'Légende', xp: 15000, icon: '⭐', color: '#e040fb' },
];

/** Returns highest rank where xp >= rank.xp */
function getRank(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xp) return RANKS[i];
  }
  return RANKS[0];
}

/** Returns first rank where xp < rank.xp, or null if max rank */
function getNextRank(xp) {
  for (const rank of RANKS) {
    if (xp < rank.xp) return rank;
  }
  return null;
}

/** Returns progress info: {current, next, progress (0-1), xpInLevel, xpNeeded} */
function getRankProgress(xp) {
  const current = getRank(xp);
  const next = getNextRank(xp);
  if (!next) {
    return { current, next: null, progress: 1, xpInLevel: 0, xpNeeded: 0 };
  }
  const xpInLevel = xp - current.xp;
  const xpNeeded = next.xp - current.xp;
  return {
    current,
    next,
    progress: xpInLevel / xpNeeded,
    xpInLevel,
    xpNeeded,
  };
}

// ─── Rewards ────────────────────────────────────────────────────────

/**
 * Calculate rewards for a quiz session.
 * XP = score (x1.5 if hard, x2 if boost). Coins = Math.round(score/2) × daily multiplier.
 */
function calculateRewards(score, difficulty, xpBoostActive, coinRainActive) {
  let xp = score;
  if (difficulty === 'hard') xp = Math.round(xp * 1.5);
  if (xpBoostActive) xp *= 2;
  const rawCoins = Math.round(score / 2);
  const coinMult = coinRainActive ? 1.0 : getDailyCoinMultiplier();
  const coins = Math.max(1, Math.round(rawCoins * coinMult));
  return { xp, coins };
}

/**
 * Diminishing returns on coins per day.
 * Games 1-3: ×1.0, game 4: ×0.5, game 5: ×0.3, game 6+: ×0.1
 * Resets at midnight.
 */
function getDailyCoinMultiplier() {
  const pm = ProfileManager;
  const today = new Date().toISOString().slice(0, 10);
  const storedDate = pm.get('dailyCoinDate', '');
  let count = pm.get('dailyGameCount', 0);
  if (storedDate !== today) count = 0;
  if (count < 3) return 1.0;
  if (count === 3) return 0.5;
  if (count === 4) return 0.3;
  return 0.1;
}

/** Increment daily game counter (call at end of each game). */
function incrementDailyGameCount() {
  const pm = ProfileManager;
  const today = new Date().toISOString().slice(0, 10);
  const storedDate = pm.get('dailyCoinDate', '');
  let count = pm.get('dailyGameCount', 0);
  if (storedDate !== today) { count = 0; pm.set('dailyCoinDate', today); }
  pm.set('dailyGameCount', count + 1);
}

// ─── Chest Milestones ───────────────────────────────────────────────

const GAME_MILESTONES = [5, 10, 25, 50, 100, 200, 500];
const XP_MILESTONES = [500, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 10000, 15000];

/**
 * Returns array of {id, type, tier} for unclaimed milestones.
 * chestsOpened is an array of already-claimed milestone ids.
 */
function checkChestMilestones(gamesPlayed, xp, chestsOpened) {
  const unclaimed = [];

  for (const m of GAME_MILESTONES) {
    const id = `games_${m}`;
    if (gamesPlayed >= m && !chestsOpened.includes(id)) {
      unclaimed.push({ id, type: 'games', tier: m >= 200 ? 'big' : 'small' });
    }
  }

  for (const m of XP_MILESTONES) {
    const id = `xp_${m}`;
    if (xp >= m && !chestsOpened.includes(id)) {
      unclaimed.push({ id, type: 'xp', tier: m >= 10000 ? 'big' : 'small' });
    }
  }

  return unclaimed;
}

/** V5: Check if daily chest cap is reached (max 3/day) */
function canOpenChestToday() {
  const today = new Date().toISOString().slice(0, 10);
  const daily = ProfileManager.get('dailyChestCount', { date: '', count: 0 });
  if (daily.date !== today) return true;
  return daily.count < 3;
}

/** V5: Increment daily chest counter */
function recordChestOpened() {
  const today = new Date().toISOString().slice(0, 10);
  const daily = ProfileManager.get('dailyChestCount', { date: '', count: 0 });
  if (daily.date !== today) {
    ProfileManager.set('dailyChestCount', { date: today, count: 1 });
  } else {
    daily.count++;
    ProfileManager.set('dailyChestCount', daily);
  }
}

// ─── Loot Tables ────────────────────────────────────────────────────

const LOOT_COMMON = [
  { id: 'xp_boost',   name: 'Boost XP ×2',    type: 'xpBoost',  icon: '🚀', rarity: 'common' },
  { id: 'free_hints', name: '3 indices gratuits', type: 'freeHints', icon: '💡', rarity: 'common', amount: 3 },
];

const LOOT_RARE = [
  { id: 'shield',          name: 'Bouclier',        type: 'shield', icon: '🛡️', rarity: 'rare', description: "Protège ton streak si mauvaise partie" },
  { id: 'badge_collector', name: 'Badge Collector',  type: 'badge',  icon: '🏅', rarity: 'rare', badgeId: 'collector', description: "Badge exclusif de coffre" },
  { id: 'badge_lucky',     name: 'Badge Lucky',      type: 'badge',  icon: '🍀', rarity: 'rare', badgeId: 'lucky', description: "Badge exclusif de coffre" },
];

/** Returns unowned paid themes as epic loot items */
function getEpicLoot(ownedThemes) {
  const epic = [];
  for (const [id, theme] of Object.entries(THEMES)) {
    if (theme.price > 0 && !ownedThemes.includes(id)) {
      epic.push({
        id: `theme_${id}`,
        name: theme.name,
        type: 'theme',
        icon: theme.preview,
        rarity: 'epic',
        themeId: id,
      });
    }
  }
  return epic;
}

/** Weighted random selection from [{weight, pool}] entries */
function pickWeighted(pools) {
  const totalWeight = pools.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const { weight, pool } of pools) {
    r -= weight;
    if (r <= 0) return pick(pool);
  }
  return pick(pools[pools.length - 1].pool);
}

/**
 * Generate chest loot.
 * Big chest: coins(50-100) + 3-4 items (guaranteed rare+).
 * Small chest: coins(10-25) + 1 common item.
 */
function generateChestLoot(tier, ownedThemes) {
  const items = [];
  const epicPool = getEpicLoot(ownedThemes || []);

  if (tier === 'big') {
    // Coins
    items.push({ id: 'coins', name: 'Pièces', type: 'coins', icon: '🪙', rarity: 'common', amount: rand(50, 100) });

    // Build weighted pools for big chest (guaranteed rare+)
    const pools = [{ weight: 3, pool: LOOT_RARE }];
    if (epicPool.length > 0) pools.push({ weight: 1, pool: epicPool });

    // 3-4 items
    const count = rand(3, 4);
    for (let i = 0; i < count; i++) {
      items.push(pickWeighted(pools));
    }
  } else {
    // Small chest
    items.push({ id: 'coins', name: 'Pièces', type: 'coins', icon: '🪙', rarity: 'common', amount: rand(10, 25) });
    items.push(pick(LOOT_COMMON));
  }

  return items;
}

/** Apply a loot item effect via ProfileManager */
function applyLootItem(item) {
  const pm = ProfileManager;
  if (!pm.getActiveId()) return;

  switch (item.type) {
    case 'coins': {
      const current = pm.get('coins') || 0;
      pm.set('coins', current + item.amount);
      break;
    }
    case 'xpBoost':
      pm.set('xpBoostActive', true);
      break;
    case 'freeHints': {
      const hints = pm.get('freeHints') || 0;
      pm.set('freeHints', hints + (item.amount || 3));
      break;
    }
    case 'shield': {
      const shields = pm.get('shields') || 0;
      pm.set('shields', shields + 1);
      break;
    }
    case 'theme': {
      const owned = pm.get('ownedThemes') || [];
      if (item.themeId && !owned.includes(item.themeId)) {
        pm.set('ownedThemes', [...owned, item.themeId]);
      }
      break;
    }
    case 'badge': {
      const badges = pm.get('badges') || [];
      if (item.badgeId && !badges.includes(item.badgeId)) {
        pm.set('badges', [...badges, item.badgeId]);
      }
      break;
    }
  }
}

// ─── Boss Fight Rewards ──────────────────────────────────────────────

function applyBossLoot(boss) {
  const pm = ProfileManager;
  const item = { id: boss.lootId, name: boss.lootName, type: boss.lootType, boss: boss.id };

  switch (boss.lootType) {
    case 'theme': {
      const owned = pm.get('ownedThemes') || [];
      if (!owned.includes(boss.lootId)) {
        pm.set('ownedThemes', [...owned, boss.lootId]);
      }
      break;
    }
    case 'title': {
      const titles = pm.get('bossTitles') || [];
      if (!titles.includes(boss.lootId)) {
        pm.set('bossTitles', [...titles, boss.lootId]);
      }
      break;
    }
    case 'sticker': {
      const stickers = pm.get('ownedStickers') || [];
      if (!stickers.includes(boss.lootId)) {
        pm.set('ownedStickers', [...stickers, boss.lootId]);
      }
      break;
    }
    case 'badge': {
      const badges = pm.get('badges') || [];
      if (!badges.includes(boss.lootId)) {
        pm.set('badges', [...badges, boss.lootId]);
      }
      break;
    }
    case 'effect': {
      const effects = pm.get('bossEffects') || [];
      if (!effects.includes(boss.lootId)) {
        pm.set('bossEffects', [...effects, boss.lootId]);
      }
      break;
    }
  }

  return item;
}

const TITLE_NAMES = {
  boss_dragon: 'Tueur de Dragon',
  boss_golem: 'Briseur de Golem',
  boss_sorcier: 'Chasseur de Sorcier',
  boss_sphinx: 'Déchiffreur du Sphinx',
  boss_alchimiste: 'Maître Alchimiste',
  boss_kraken: 'Dompteur de Kraken',
};

// ─── Mastery Levels ─────────────────────────────────────────────────

const MASTERY_LEVELS = [
  { level: 1, label: 'Novice',    icon: '🌱', minTotal: 0,   minRate: 0 },
  { level: 2, label: 'Apprenti',  icon: '📘', minTotal: 10,  minRate: 0.40 },
  { level: 3, label: 'Confirmé',  icon: '⚔️', minTotal: 25,  minRate: 0.55 },
  { level: 4, label: 'Expert',    icon: '💎', minTotal: 50,  minRate: 0.70 },
  { level: 5, label: 'Légende',   icon: '👑', minTotal: 100, minRate: 0.85 },
];

function getMasteryLevel(cat) {
  const stats = ProfileManager.get('catStats', {})[cat] || { correct: 0, total: 0 };
  const rate = stats.total > 0 ? stats.correct / stats.total : 0;
  const total = stats.total;
  for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
    if (total >= MASTERY_LEVELS[i].minTotal && rate >= MASTERY_LEVELS[i].minRate) {
      return MASTERY_LEVELS[i];
    }
  }
  return MASTERY_LEVELS[0];
}

function getMasteryProgress(cat) {
  const stats = ProfileManager.get('catStats', {})[cat] || { correct: 0, total: 0 };
  const rate = stats.total > 0 ? stats.correct / stats.total : 0;
  const current = getMasteryLevel(cat);
  if (current.level >= 5) return { current, next: null, progressTotal: 1, progressRate: 1 };
  const next = MASTERY_LEVELS[current.level];
  const progressTotal = next.minTotal > 0 ? Math.min(1, stats.total / next.minTotal) : 1;
  const progressRate = next.minRate > 0 ? Math.min(1, rate / next.minRate) : 1;
  return { current, next, progressTotal, progressRate, totalQuestions: stats.total, rate };
}

// ─── Mastery Badge Check ────────────────────────────────────────────

const MASTERY_BADGE_LEVELS = ['apprenti', 'confirme', 'expert', 'legende'];
const MASTERY_BADGE_LEVEL_NUMS = { apprenti: 2, confirme: 3, expert: 4, legende: 5 };
const CAT_KEYS = ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert'];

function checkMasteryUp(playedCategory) {
  const cats = playedCategory === 'all' ? CAT_KEYS : [playedCategory];
  const oldLevels = ProfileManager.get('masteryLevels', {});
  const newLevels = { ...oldLevels };
  const newBadges = [];

  cats.forEach(cat => {
    const ml = getMasteryLevel(cat);
    const oldLevel = oldLevels[cat] || 1;
    newLevels[cat] = ml.level;

    if (ml.level > oldLevel) {
      MASTERY_BADGE_LEVELS.forEach(blabel => {
        const bnum = MASTERY_BADGE_LEVEL_NUMS[blabel];
        if (bnum > oldLevel && bnum <= ml.level) {
          const badgeId = 'mastery_' + cat + '_' + blabel;
          const badges = ProfileManager.get('badges', []);
          if (!badges.includes(badgeId)) {
            badges.push(badgeId);
            ProfileManager.set('badges', badges);
            const catLabel = typeof CATEGORIES !== 'undefined' ? (CATEGORIES[cat]?.label || cat) : cat;
            newBadges.push({ id: badgeId, icon: ml.icon, name: catLabel + ' ' + MASTERY_LEVELS[bnum - 1].label });
          }
        }
      });
    }
  });

  // Cross-category badges
  const allLevels = CAT_KEYS.map(c => newLevels[c] || getMasteryLevel(c).level);
  const minLevel = Math.min(...allLevels);
  const crossBadges = [
    { minLevel: 2, id: 'mastery_all_apprenti', name: 'Polyvalent', icon: '📘' },
    { minLevel: 3, id: 'mastery_all_confirme', name: 'Touche-à-tout', icon: '⚔️' },
    { minLevel: 4, id: 'mastery_all_expert', name: 'Maître absolu', icon: '💎' },
  ];
  crossBadges.forEach(cb => {
    if (minLevel >= cb.minLevel) {
      const badges = ProfileManager.get('badges', []);
      if (!badges.includes(cb.id)) {
        badges.push(cb.id);
        ProfileManager.set('badges', badges);
        newBadges.push(cb);
      }
    }
  });

  ProfileManager.set('masteryLevels', newLevels);
  return newBadges;
}

// ─── Pet System ─────────────────────────────────────────────────────

const PET_TYPES = {
  dragon: { name: 'Dragon', emoji: '🐉', bonus: 'skip', bonusDesc: '1 skip / 20 questions (max 3)' },
  robot:  { name: 'Robot',  emoji: '🤖', bonus: 'xp',   bonusDesc: '+10% XP' },
  fox:    { name: 'Renard', emoji: '🦊', bonus: 'coins', bonusDesc: '+10% pièces' },
};

const PET_STAGES = [
  { stage: 1, label: 'Œuf',        minXP: 0 },
  { stage: 2, label: 'Bébé',       minXP: 100 },
  { stage: 3, label: 'Jeune',      minXP: 350 },
  { stage: 4, label: 'Adulte',     minXP: 800 },
  { stage: 5, label: 'Majestueux', minXP: 1500 },
];

const PET_FOOD = [
  { id: 'kibble',    name: 'Croquettes',       price: 20, hunger: 25, icon: '🍖' },
  { id: 'feast',     name: 'Festin',           price: 50, hunger: 100, icon: '🍗' },
  { id: 'treat',     name: 'Friandise dorée',  price: 30, hunger: 25, icon: '🍬', xpBoost: 3 },
];

function getPetStage(petXP) {
  for (let i = PET_STAGES.length - 1; i >= 0; i--) {
    if (petXP >= PET_STAGES[i].minXP) return PET_STAGES[i];
  }
  return PET_STAGES[0];
}

function getPetStageProgress(petXP) {
  const current = getPetStage(petXP);
  if (current.stage >= 5) return { current, next: null, progress: 1 };
  const next = PET_STAGES[current.stage];
  const progress = (petXP - current.minXP) / (next.minXP - current.minXP);
  return { current, next, progress: Math.min(1, progress) };
}

function updatePetHunger() {
  if (ProfileManager.get('vacationMode', false)) return;
  const lastLogin = ProfileManager.get('petLastLogin', Date.now());
  const daysMissed = Math.floor((Date.now() - lastLogin) / (1000 * 60 * 60 * 24));
  if (daysMissed > 0) {
    const hunger = ProfileManager.get('petHunger', 100);
    const newHunger = Math.max(0, hunger - (daysMissed * 10));
    ProfileManager.set('petHunger', newHunger);
  }
  ProfileManager.set('petLastLogin', Date.now());
}

function feedPet(foodId) {
  const food = PET_FOOD.find(f => f.id === foodId);
  if (!food) return false;
  const coins = ProfileManager.get('coins', 0);
  if (coins < food.price) return false;
  ProfileManager.set('coins', coins - food.price);
  const hunger = ProfileManager.get('petHunger', 100);
  ProfileManager.set('petHunger', Math.min(100, hunger + food.hunger));
  if (food.xpBoost) {
    ProfileManager.set('petFriandiseBoost', (ProfileManager.get('petFriandiseBoost', 0) || 0) + food.xpBoost);
  }
  return true;
}

function addPetXP(score) {
  const petType = ProfileManager.get('petType', null);
  if (!petType) return;
  let xp = Math.round(score * 0.5);
  const boost = ProfileManager.get('petFriandiseBoost', 0);
  if (boost > 0) {
    xp *= 2;
    ProfileManager.set('petFriandiseBoost', boost - 1);
  }
  ProfileManager.set('petXP', (ProfileManager.get('petXP', 0) || 0) + xp);
}

function getPetBonus() {
  const petType = ProfileManager.get('petType', null);
  if (!petType) return null;
  const hunger = ProfileManager.get('petHunger', 100);
  if (hunger < 50) return null;
  return PET_TYPES[petType]?.bonus || null;
}

function onBossLost() {
  const hunger = ProfileManager.get('petHunger', 100);
  ProfileManager.set('petHunger', Math.max(0, hunger - 20));
}

function changePet(newType) {
  ProfileManager.set('petType', newType);
  ProfileManager.set('petXP', 0);
  ProfileManager.set('petHunger', 100);
  ProfileManager.set('petFriandiseBoost', 0);
  ProfileManager.set('skipStock', 0);
  ProfileManager.set('questionsForSkip', 0);
  ProfileManager.set('petLastLogin', Date.now());
}

function checkDragonSkip(questionsAnswered) {
  const petType = ProfileManager.get('petType', null);
  if (petType !== 'dragon' || getPetBonus() !== 'skip') return;
  let counter = ProfileManager.get('questionsForSkip', 0) + questionsAnswered;
  let skips = ProfileManager.get('skipStock', 0);
  while (counter >= 20 && skips < 3) {
    skips++;
    counter -= 20;
  }
  ProfileManager.set('questionsForSkip', counter);
  ProfileManager.set('skipStock', skips);
}

function useSkip() {
  const skips = ProfileManager.get('skipStock', 0);
  if (skips <= 0) return false;
  ProfileManager.set('skipStock', skips - 1);
  return true;
}

function calculateBossReward(boss, playerHP, maxPlayerHP) {
  const baseReward = boss.stake * 3;
  const flawlessBonus = (playerHP === maxPlayerHP) ? 50 : 0;
  return { coins: baseReward + flawlessBonus, xp: baseReward, flawless: flawlessBonus > 0 };
}

// ─── Contrat d'Objectif ──────────────────────────────────────────────

function generateContracts(category, difficulty, questionCount, catStats) {
  const cats = category === 'all'
    ? Object.values(catStats)
    : [catStats[category] || { correct: 0, total: 0 }];
  const totalCorrect = cats.reduce((s, c) => s + (c.correct || 0), 0);
  const totalQuestions = cats.reduce((s, c) => s + (c.total || 0), 0);

  let recentRate;
  if (totalQuestions >= 10) {
    recentRate = totalCorrect / totalQuestions;
  } else {
    recentRate = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 0.6 : 0.7;
  }

  const bronzeRate = Math.max(0.2, recentRate - 0.1);
  const silverRate = recentRate;
  const goldRate = Math.min(1.0, recentRate + 0.15);

  const bronzeCount = Math.max(1, Math.round(bronzeRate * questionCount));
  const silverCount = Math.max(bronzeCount + 1, Math.round(silverRate * questionCount));
  const goldCount = Math.max(silverCount + 1, Math.min(questionCount, Math.round(goldRate * questionCount)));

  const conditionPool = [
    { id: 'no_hint', label: 'sans indice', check: (r) => r.hintsUsed === 0 },
    { id: 'no_consec_wrong', label: 'sans 2 erreurs d\'affilée', check: (r) => r.maxConsecWrong < 2 },
    { id: 'one_fast', label: 'au moins 1 réponse rapide (< 10s)', check: (r) => r.fastAnswers >= 1 },
    { id: 'streak_3', label: 'série de 3 minimum', check: (r) => r.bestStreak >= 3 },
  ];

  const shuffled = conditionPool.sort(() => Math.random() - 0.5);
  const silverCondition = shuffled[0];
  const goldConditions = [shuffled[0], shuffled[1] || shuffled[0]];
  if (!goldConditions.find(c => c.id === 'no_hint')) {
    goldConditions[1] = conditionPool.find(c => c.id === 'no_hint');
  }

  return [
    {
      tier: 'bronze',
      icon: '🥉',
      label: `${bronzeCount}/${questionCount} correct`,
      conditions: [],
      bonus: 10,
      check: (r) => r.correct >= bronzeCount,
    },
    {
      tier: 'silver',
      icon: '🥈',
      label: `${silverCount}/${questionCount} correct`,
      conditions: [silverCondition],
      bonus: 30,
      check: (r) => r.correct >= silverCount && silverCondition.check(r),
    },
    {
      tier: 'gold',
      icon: '🥇',
      label: `${goldCount}/${questionCount} correct`,
      conditions: goldConditions,
      bonus: 60,
      check: (r) => r.correct >= goldCount && goldConditions.every(c => c.check(r)),
    },
  ];
}
