/**
 * QuizHero V8a — Adventure Mode Engine
 * Depends on: profiles.js (ProfileManager), questions.js (generateQuestion)
 */

// ── Zone Definitions ───────────────────────────────────────────────
const ADVENTURE_ZONES = {
  calcul:      { name: 'Citadelle des Nombres',   icon: '🏰', bossName: 'Le Colosse de Chiffres',   bossHp: 8,  bossTitle: 'Vainqueur du Colosse' },
  logique:     { name: "Labyrinthe de l'Esprit",   icon: '🌀', bossName: 'Le Sphinx Tordu',          bossHp: 10, bossTitle: 'Vainqueur du Sphinx' },
  geometrie:   { name: 'Temple des Formes',        icon: '🔺', bossName: 'Le Gardien Angulaire',     bossHp: 9,  bossTitle: 'Vainqueur du Gardien' },
  fractions:   { name: 'Forêt Fractale',           icon: '🌲', bossName: "L'Hydre Fractale",         bossHp: 10, bossTitle: "Vainqueur de l'Hydre" },
  mesures:     { name: 'Volcan des Mesures',       icon: '🌋', bossName: 'Le Dragon des Unités',     bossHp: 11, bossTitle: 'Vainqueur du Dragon' },
  ouvert:      { name: 'Île Mystère',              icon: '🏝️', bossName: 'Le Kraken Énigmatique',    bossHp: 12, bossTitle: 'Vainqueur du Kraken' },
  geographie:  { name: 'Océan des Cartes',         icon: '🌊', bossName: 'La Sirène Perdue',         bossHp: 9,  bossTitle: 'Vainqueur de la Sirène' },
  conjugaison: { name: 'Tour des Mots',            icon: '📜', bossName: 'Le Sorcier Verbal',        bossHp: 10, bossTitle: 'Vainqueur du Sorcier' },
};

// Adjacency graph: beating a zone unlocks these
const ZONE_GRAPH = {
  calcul:      ['geometrie', 'fractions'],
  logique:     ['geographie', 'conjugaison'],
  geometrie:   ['mesures'],
  fractions:   [],
  mesures:     ['ouvert'],
  ouvert:      [],
  geographie:  ['conjugaison'],
  conjugaison: [],
};

const EXPEDITION_LENGTH = 7;
const STARS_FOR_BOSS = 5;
const EXPEDITION_PASS_THRESHOLD = 4; // out of 7
const RIDDLE_CHANCE = 0.15;
const MAX_BOSS_ERRORS = 3;
const DAILY_EXPEDITION_LIMIT = 3;
const DECAY_DAYS = 3; // lose 1 star after N days of inactivity

// Critical thresholds (seconds) per category
const CRITICAL_THRESHOLDS = {
  calcul: 2, logique: 4, geometrie: 3, fractions: 3,
  mesures: 3, ouvert: 5, geographie: 4, conjugaison: 4,
};

// ── State ──────────────────────────────────────────────────────────
let _adventureBoss = null; // current boss fight state

function _defaultZone() {
  return { unlocked: false, stars: 0, expeditions: 0, bossUnlocked: false, bossAttempts: 0, bossDefeated: false, bossTitle: null };
}

function initAdventure() {
  let adv = ProfileManager.get('adventure', null);
  if (adv && adv.zones) return adv;
  adv = { zones: {} };
  for (const key of Object.keys(ADVENTURE_ZONES)) {
    adv.zones[key] = _defaultZone();
  }
  // Unlock starting zones
  adv.zones.calcul.unlocked = true;
  adv.zones.logique.unlocked = true;
  ProfileManager.set('adventure', adv);
  return adv;
}

function getAdventure() {
  return ProfileManager.get('adventure', null) || initAdventure();
}

function _saveAdventure(adv) {
  ProfileManager.set('adventure', adv);
}

function getUnlockedZones() {
  const adv = getAdventure();
  return Object.keys(adv.zones).filter(k => adv.zones[k].unlocked);
}

// ── Daily Limit ────────────────────────────────────────────────────
function _today() {
  return new Date().toISOString().slice(0, 10);
}

function getExpeditionsToday() {
  const adv = getAdventure();
  if (adv.dailyDate !== _today()) return 0;
  return adv.dailyExpeditions || 0;
}

function getRemainingExpeditions() {
  return Math.max(0, DAILY_EXPEDITION_LIMIT - getExpeditionsToday());
}

function _trackExpedition() {
  const adv = getAdventure();
  const today = _today();
  if (adv.dailyDate !== today) {
    adv.dailyDate = today;
    adv.dailyExpeditions = 0;
  }
  adv.dailyExpeditions++;
  adv.lastActivityDate = today;
  _saveAdventure(adv);
}

// ── Star Decay ─────────────────────────────────────────────────────
function checkStarDecay() {
  const adv = getAdventure();
  if (!adv.lastActivityDate) {
    adv.lastActivityDate = _today();
    _saveAdventure(adv);
    return [];
  }
  const last = new Date(adv.lastActivityDate);
  const now = new Date(_today());
  const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (daysSince < DECAY_DAYS) return [];

  // Lose 1 star per DECAY_DAYS period in the most advanced non-defeated zone
  const decayCount = Math.floor(daysSince / DECAY_DAYS);
  const decayed = [];

  for (let d = 0; d < decayCount; d++) {
    // Find most advanced non-defeated zone with stars > 0
    let bestZone = null;
    let bestStars = 0;
    for (const [id, zone] of Object.entries(adv.zones)) {
      if (!zone.bossDefeated && zone.stars > 0 && zone.stars > bestStars) {
        bestZone = id;
        bestStars = zone.stars;
      }
    }
    if (bestZone) {
      adv.zones[bestZone].stars--;
      if (adv.zones[bestZone].bossUnlocked && adv.zones[bestZone].stars < STARS_FOR_BOSS) {
        adv.zones[bestZone].bossUnlocked = false;
      }
      decayed.push({ zone: bestZone, name: ADVENTURE_ZONES[bestZone].name });
    }
  }

  adv.lastActivityDate = _today();
  _saveAdventure(adv);
  return decayed;
}

// ── Expeditions ────────────────────────────────────────────────────
let _currentExpedition = null;

function startExpedition(zoneId) {
  const subLevel = typeof getSubLevel === 'function' ? getSubLevel(zoneId) : 2;
  const questions = [];
  for (let i = 0; i < EXPEDITION_LENGTH; i++) {
    questions.push(generateQuestion(zoneId, subLevel, null));
  }
  _currentExpedition = { zoneId, questions };
  return _currentExpedition;
}

function completeExpedition(correct, total, zoneId) {
  const adv = getAdventure();
  const id = zoneId || (_currentExpedition && _currentExpedition.zoneId);
  if (!id) return { starAwarded: false, stars: 0, bossUnlocked: false };
  const zone = adv.zones[id];
  zone.expeditions++;
  const starAwarded = correct >= EXPEDITION_PASS_THRESHOLD;
  if (starAwarded) {
    zone.stars++;
    if (zone.stars >= STARS_FOR_BOSS && !zone.bossDefeated) {
      zone.bossUnlocked = true;
    }
  }
  // Track daily limit BEFORE save (mutate same adv object)
  const today = _today();
  if (adv.dailyDate !== today) {
    adv.dailyDate = today;
    adv.dailyExpeditions = 0;
  }
  adv.dailyExpeditions++;
  adv.lastActivityDate = today;
  _saveAdventure(adv);
  _currentExpedition = null;
  return { starAwarded, stars: zone.stars, bossUnlocked: zone.bossUnlocked };
}

// ── Boss Fights ────────────────────────────────────────────────────
function startAdventureBoss(zoneId) {
  const adv = getAdventure();
  const zone = adv.zones[zoneId];
  const def = ADVENTURE_ZONES[zoneId];
  const attempt = zone.bossAttempts + 1;
  const errorsMax = Math.min(attempt, MAX_BOSS_ERRORS);
  _adventureBoss = {
    zoneId,
    hp: def.bossHp,
    maxHp: def.bossHp,
    errors: 0,
    errorsMax,
    attempt,
    defeated: false,
    victory: false,
  };
  return _adventureBoss;
}

function bossDamage(critical) {
  const dmg = critical ? 2 : 1;
  _adventureBoss.hp = Math.max(0, _adventureBoss.hp - dmg);
  if (_adventureBoss.hp <= 0) {
    _adventureBoss.victory = true;
    _finishBoss(true);
  }
  return { damage: dmg, critical, hp: _adventureBoss.hp, victory: _adventureBoss.victory };
}

function bossError() {
  _adventureBoss.errors++;
  const defeated = _adventureBoss.errors >= _adventureBoss.errorsMax;
  if (defeated) {
    _adventureBoss.defeated = true;
    _finishBoss(false);
  }
  return { errors: _adventureBoss.errors, defeated };
}

function _finishBoss(victory) {
  const adv = getAdventure();
  const zone = adv.zones[_adventureBoss.zoneId];
  zone.bossAttempts = _adventureBoss.attempt;
  if (victory) {
    zone.bossDefeated = true;
    zone.bossTitle = ADVENTURE_ZONES[_adventureBoss.zoneId].bossTitle;
    // Unlock adjacent zones
    const adj = ZONE_GRAPH[_adventureBoss.zoneId] || [];
    for (const z of adj) {
      adv.zones[z].unlocked = true;
    }
  } else {
    // Defeat: lock boss, require re-earning stars (need 4→3→2→1, min 1)
    zone.bossUnlocked = false;
    const starsToKeep = Math.min(zone.bossAttempts, STARS_FOR_BOSS - 1);
    zone.stars = starsToKeep;
  }
  _saveAdventure(adv);
}

function getAdventureBoss() {
  return _adventureBoss;
}

function getCriticalThreshold(category) {
  return CRITICAL_THRESHOLDS[category] || 3;
}
