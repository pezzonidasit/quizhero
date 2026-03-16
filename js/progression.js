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
 * XP = score (x1.5 if hard, x2 if boost). Coins = Math.round(score/2).
 */
function calculateRewards(score, difficulty, xpBoostActive) {
  let xp = score;
  if (difficulty === 'hard') xp = Math.round(xp * 1.5);
  if (xpBoostActive) xp *= 2;
  const coins = Math.round(score / 2);
  return { xp, coins };
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
  boss_golem: 'Briseur de Golem',
};

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
