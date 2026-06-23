/**
 * QuizHero V2 — Progression Engine
 * XP, ranks, coins, chest milestones, loot tables
 * Depends on: questions.js (rand, pick), themes.js (PALETTES, VISUAL_THEMES), profiles.js (ProfileManager)
 */

// ─── Ranks ──────────────────────────────────────────────────────────
const RANKS = [
  { id: 'bronze',  name: 'Bronze',  xp: 0,     icon: '🥉', color: '#cd7f32' },
  { id: 'argent',  name: 'Argent',  xp: 500,   icon: '🥈', color: '#c0c0c0' },
  { id: 'or',      name: 'Or',      xp: 1500,  icon: '🥇', color: '#ffd700' },
  { id: 'diamant', name: 'Diamant', xp: 3500,  icon: '💎', color: '#00bcd4' },
  { id: 'maitre',  name: 'Maître',  xp: 7000,  icon: '👑', color: '#ff9800' },
  { id: 'legende', name: 'Légende', xp: 15000, icon: '⭐', color: '#e040fb' },
  { id: 'divin',   name: 'Divin',   xp: 50000, icon: '🔱', color: '#26c6da' },
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
function calculateRewards(score, catLevelValue, xpBoostActive, coinRainActive) {
  let xp = score;
  if (catLevelValue === 3) xp = Math.round(xp * 1.5);
  if (catLevelValue === 1) xp = Math.round(xp * 0.75);
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

/** Returns unowned paid palettes + visuals as epic loot items */
function getEpicLoot(ownedPalettes, ownedVisuals) {
  const epic = [];
  for (const [id, palette] of Object.entries(PALETTES)) {
    if (palette.price > 0 && !ownedPalettes.includes(id)) {
      epic.push({
        id: `palette_${id}`,
        name: palette.name,
        type: 'palette',
        icon: palette.preview,
        rarity: 'epic',
        paletteId: id,
      });
    }
  }
  for (const [id, visual] of Object.entries(VISUAL_THEMES)) {
    if (visual.price > 0 && !ownedVisuals.includes(id)) {
      epic.push({
        id: `visual_${id}`,
        name: visual.name,
        type: 'visual',
        icon: visual.preview,
        rarity: 'epic',
        visualId: id,
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
function generateChestLoot(tier, ownedPalettes, ownedVisuals) {
  const items = [];
  const epicPool = getEpicLoot(ownedPalettes || [], ownedVisuals || []);

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
    case 'palette': {
      const owned = pm.get('ownedPalettes') || [];
      if (item.paletteId && !owned.includes(item.paletteId)) {
        pm.set('ownedPalettes', [...owned, item.paletteId]);
      }
      break;
    }
    case 'visual': {
      const owned = pm.get('ownedVisuals') || [];
      if (item.visualId && !owned.includes(item.visualId)) {
        pm.set('ownedVisuals', [...owned, item.visualId]);
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
  dresseur_legendaire: 'Dresseur Légendaire 🐾',
  ascendant: 'Ascendant 👑',
};

// ─── Boss Titles Catalogue (équipables) ─────────────────────────────
// Les titres de boss étaient attribués dans 3 stockages séparés mais jamais
// rendus comme catalogue unifié (GD #7 : valeur dormante). Source de vérité :
//   • arène   → BOSS_POOL (questions.js) + TITLE_NAMES, stockés dans `bossTitles`
//   • compagnon → dresseur_legendaire / ascendant, stockés dans `unlockedTitles`
//   • aventure → ADVENTURE_ZONES[*].bossTitle (adventure.js), stockés dans `titles`
// On ne duplique aucune définition : les noms/conditions sont DÉRIVÉS de ces sources.

const PET_TITLE_CONDITIONS = {
  dresseur_legendaire: 'Faire évoluer ton compagnon au stade Majestueux',
  ascendant: 'Faire évoluer ton compagnon au stade Légendaire',
};

/**
 * Construit le catalogue complet des titres équipables. Fonction PURE : toutes
 * les sources externes sont injectées (testable sans navigateur ni storage).
 * @param {Array}  bossPool       BOSS_POOL (arène) — entrées avec un TITLE_NAMES match
 * @param {Object} adventureZones ADVENTURE_ZONES { zone: { name, bossName, bossTitle } }
 * @param {Object} titleNames     TITLE_NAMES (id → nom affiché)
 * @returns {Array<{id,name,condition,source,zone?}>}
 */
function buildTitleCatalog(bossPool, adventureZones, titleNames) {
  const names = titleNames || {};
  const cat = [];

  // Titres d'arène : un titre par boss vaincu (cf. endBossFight → bossTitles).
  (bossPool || []).forEach(b => {
    const id = 'boss_' + b.id;
    if (names[id]) {
      cat.push({ id, name: names[id], condition: 'Vaincre ' + b.name + " dans l'Arène", source: 'arena' });
    }
  });

  // Titres de compagnon.
  ['dresseur_legendaire', 'ascendant'].forEach(id => {
    if (names[id]) {
      cat.push({ id, name: names[id], condition: PET_TITLE_CONDITIONS[id] || '', source: 'pet' });
    }
  });

  // Titres de zone d'aventure : id = adv_<zone>, nom = bossTitle de la zone.
  Object.entries(adventureZones || {}).forEach(([zone, def]) => {
    if (def && def.bossTitle) {
      cat.push({
        id: 'adv_' + zone,
        name: def.bossTitle,
        condition: 'Vaincre ' + def.bossName + ' (' + def.name + ')',
        source: 'adventure',
        zone,
      });
    }
  });

  return cat;
}

/**
 * Agrège les 3 clés de stockage fragmentées en un ensemble d'ids débloqués.
 * Fonction PURE : l'état stocké est injecté.
 * @param {Array}  catalog buildTitleCatalog(...)
 * @param {Object} stored  { bossTitles:[ids], unlockedTitles:[ids], titles:[strings] }
 * @returns {Set<string>} ids du catalogue réellement débloqués (aucun fantôme)
 */
function resolveUnlockedTitleIds(catalog, stored) {
  const s = stored || {};
  const bossTitles = s.bossTitles || [];        // ids d'arène : boss_golem…
  const unlockedTitles = s.unlockedTitles || []; // ids compagnon : ascendant…
  const advNames = s.titles || [];               // aventure : strings bossTitle bruts
  const owned = new Set();
  (catalog || []).forEach(t => {
    if (t.source === 'arena' && bossTitles.includes(t.id)) owned.add(t.id);
    else if (t.source === 'pet' && unlockedTitles.includes(t.id)) owned.add(t.id);
    else if (t.source === 'adventure' && advNames.includes(t.name)) owned.add(t.id);
  });
  return owned;
}

// ─── Wrappers liés à ProfileManager (testés via Playwright) ──────────

/** Catalogue complet, branché sur les vraies sources globales. */
function getTitleCatalog() {
  return buildTitleCatalog(
    typeof BOSS_POOL !== 'undefined' ? BOSS_POOL : [],
    typeof ADVENTURE_ZONES !== 'undefined' ? ADVENTURE_ZONES : {},
    TITLE_NAMES
  );
}

/** Set des ids de titres débloqués pour le profil courant. */
function getUnlockedTitleIds() {
  return resolveUnlockedTitleIds(getTitleCatalog(), {
    bossTitles: ProfileManager.get('bossTitles', []) || [],
    unlockedTitles: ProfileManager.get('unlockedTitles', []) || [],
    titles: ProfileManager.get('titles', []) || [],
  });
}

/** Nom affichable d'un id de titre (toutes sources). */
function getTitleName(id) {
  if (!id) return null;
  const t = getTitleCatalog().find(x => x.id === id);
  return t ? t.name : (TITLE_NAMES[id] || null);
}

/**
 * Équipe un titre. null/'' = retirer le titre. Refuse les titres non débloqués
 * (pas de titre fantôme). Retourne true si l'opération a abouti.
 */
function equipTitle(id) {
  if (id === null || id === undefined || id === '') {
    ProfileManager.set('activeTitle', null);
    return true;
  }
  if (!getUnlockedTitleIds().has(id)) return false;
  ProfileManager.set('activeTitle', id);
  return true;
}

/** Titre actuellement équipé { id, name } ou null (garde contre titre périmé). */
function getEquippedTitle() {
  const id = ProfileManager.get('activeTitle', null);
  if (!id) return null;
  if (!getUnlockedTitleIds().has(id)) return null;
  return { id, name: getTitleName(id) };
}

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
// All playable categories (matches the category pills, excludes 'revision').
// Used for per-category mastery on "Toutes" games AND the cross-category
// "Maître absolu" badge — which now requires geo + conjugaison too.
const CAT_KEYS = ['calcul', 'logique', 'geometrie', 'fractions', 'mesures', 'ouvert', 'geographie', 'conjugaison'];

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

const PET_LEGENDARY_EMOJI = { dragon: '🐲', robot: '👾', fox: '🦄' };

/**
 * Returns the pet emoji to display for a given type + stage.
 * At stage 6 (Légendaire), uses the exclusive legendary emoji per type.
 */
function getPetEmoji(petType, stage) {
  if (stage >= 6 && PET_LEGENDARY_EMOJI[petType]) {
    return PET_LEGENDARY_EMOJI[petType];
  }
  return PET_TYPES[petType]?.emoji || '🐾';
}

const PET_STAGES = [
  { stage: 1, label: 'Œuf',        minXP: 0,    bonusPct: 0.05, dragonThreshold: 25, dragonMax: 1 },
  { stage: 2, label: 'Bébé',       minXP: 100,  bonusPct: 0.10, dragonThreshold: 20, dragonMax: 2 },
  { stage: 3, label: 'Jeune',      minXP: 350,  bonusPct: 0.15, dragonThreshold: 15, dragonMax: 3 },
  { stage: 4, label: 'Adulte',     minXP: 800,  bonusPct: 0.20, dragonThreshold: 12, dragonMax: 4 },
  { stage: 5, label: 'Majestueux', minXP: 1500, bonusPct: 0.25, dragonThreshold: 10, dragonMax: 5 },
  { stage: 6, label: 'Légendaire', minXP: 5000, bonusPct: 0.35, dragonThreshold: 8,  dragonMax: 6 },
];

const PET_FOOD = [
  { id: 'kibble',    name: 'Croquettes',       price: 40, hunger: 25, icon: '🍖' },
  { id: 'feast',     name: 'Festin',           price: 100, hunger: 100, icon: '🍗' },
  { id: 'treat',     name: 'Friandise dorée',  price: 60, hunger: 25, icon: '🍬', xpBoost: 3 },
];

function getPetStage(petXP) {
  for (let i = PET_STAGES.length - 1; i >= 0; i--) {
    if (petXP >= PET_STAGES[i].minXP) return PET_STAGES[i];
  }
  return PET_STAGES[0];
}

function getPetStageProgress(petXP) {
  const current = getPetStage(petXP);
  if (current.stage >= 6) return { current, next: null, progress: 1 };
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
    const newHunger = Math.max(0, hunger - (daysMissed * 20));
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
  if (ProfileManager.get('vacationMode', false)) return null;
  const hunger = ProfileManager.get('petHunger', 100);
  if (hunger < 50) return null;
  return PET_TYPES[petType]?.bonus || null;
}

/** Returns the bonus multiplier (0.05–0.25) based on current pet stage. 0 if no pet, hungry, or vacation. */
function getPetBonusPct() {
  const petType = ProfileManager.get('petType', null);
  if (!petType) return 0;
  if (ProfileManager.get('vacationMode', false)) return 0;
  const hunger = ProfileManager.get('petHunger', 100);
  if (hunger < 50) return 0;
  const xp = ProfileManager.get('petXP', 0);
  return getPetStage(xp).bonusPct;
}

/** Returns dragon skip config {threshold, max} based on current pet stage. */
function getPetDragonConfig() {
  const xp = ProfileManager.get('petXP', 0);
  const stage = getPetStage(xp);
  return { threshold: stage.dragonThreshold, max: stage.dragonMax };
}

/**
 * Checks if the pet just reached Majestueux for the first time.
 * Grants +200 coins, badge, and title. Returns reward info or null.
 */
function checkPetMajestueux() {
  const petType = ProfileManager.get('petType', null);
  if (!petType) return null;
  const xp = ProfileManager.get('petXP', 0);
  if (getPetStage(xp).stage < 5) return null;

  const key = 'petMajestueuxRewarded_' + petType;
  if (ProfileManager.get(key, false)) return null;

  ProfileManager.set(key, true);
  ProfileManager.set('coins', (ProfileManager.get('coins', 0)) + 200);

  const badgeId = 'pet_majestueux_' + petType;
  const badges = ProfileManager.get('badges', []);
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    ProfileManager.set('badges', badges);
  }

  const titles = ProfileManager.get('unlockedTitles', []);
  if (!titles.includes('dresseur_legendaire')) {
    titles.push('dresseur_legendaire');
    ProfileManager.set('unlockedTitles', titles);
  }

  return { petType, emoji: getPetEmoji(petType, 5), name: PET_TYPES[petType]?.name || petType };
}

/**
 * Checks if the pet just reached Légendaire (stage 6) for the first time.
 * Grants +1000 coins, badge, and title 'ascendant'. Returns reward info or null.
 */
function checkPetLegendaire() {
  const petType = ProfileManager.get('petType', null);
  if (!petType) return null;
  const xp = ProfileManager.get('petXP', 0);
  if (getPetStage(xp).stage < 6) return null;

  const key = 'petLegendaireRewarded_' + petType;
  if (ProfileManager.get(key, false)) return null;

  ProfileManager.set(key, true);
  ProfileManager.set('coins', (ProfileManager.get('coins', 0)) + 1000);

  const badgeId = 'pet_legendaire_' + petType;
  const badges = ProfileManager.get('badges', []);
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    ProfileManager.set('badges', badges);
  }

  const titles = ProfileManager.get('unlockedTitles', []);
  if (!titles.includes('ascendant')) {
    titles.push('ascendant');
    ProfileManager.set('unlockedTitles', titles);
  }

  return { petType, emoji: getPetEmoji(petType, 6), name: PET_TYPES[petType]?.name || petType };
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
  const { threshold, max } = getPetDragonConfig();
  let counter = ProfileManager.get('questionsForSkip', 0) + questionsAnswered;
  let skips = ProfileManager.get('skipStock', 0);
  while (counter >= threshold && skips < max) {
    skips++;
    counter -= threshold;
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

function generateContracts(category, catLevelValue, questionCount, catStats) {
  const cats = category === 'all'
    ? Object.values(catStats)
    : [catStats[category] || { correct: 0, total: 0 }];
  const totalCorrect = cats.reduce((s, c) => s + (c.correct || 0), 0);
  const totalQuestions = cats.reduce((s, c) => s + (c.total || 0), 0);

  let recentRate;
  if (totalQuestions >= 10) {
    recentRate = totalCorrect / totalQuestions;
  } else {
    recentRate = catLevelValue === 1 ? 0.8 : catLevelValue === 3 ? 0.6 : 0.7;
  }

  const bronzeRate = Math.max(0.2, recentRate - 0.1);
  const silverRate = recentRate;
  const goldRate = Math.min(1.0, recentRate + 0.15);

  const bronzeCount = Math.min(questionCount - 2, Math.max(1, Math.round(bronzeRate * questionCount)));
  const silverCount = Math.min(questionCount - 1, Math.max(bronzeCount + 1, Math.round(silverRate * questionCount)));
  const goldCount = Math.min(questionCount, Math.max(silverCount + 1, Math.round(goldRate * questionCount)));

  const conditionPool = [
    { id: 'no_hint', label: 'sans indice', check: (r) => r.hintsUsed === 0 },
    { id: 'no_consec_wrong', label: 'sans 2 erreurs d\'affilée', check: (r) => r.maxConsecWrong < 2 },
    { id: 'one_fast', label: 'au moins 1 réponse rapide (< 10s)', check: (r) => r.fastAnswers >= 1 },
    { id: 'streak_3', label: 'série de 3 minimum', check: (r) => r.bestStreak >= 3 },
  ];

  const shuffled = shuffleArray([...conditionPool]);
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
