/**
 * QuizHero — Theme Engine (Split Architecture)
 * Two independent axes: PALETTES (colors) + VISUAL_THEMES (patterns/decorations)
 */

// ============================================================
// PALETTES — Color-only themes (CSS custom properties)
// ============================================================

const PALETTES = {
  // === FREE PALETTES ===
  nuit: {
    id: 'nuit',
    name: 'Nuit étoilée',
    price: 0,
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
      '--accent-yellow': '#ffd93d'
    }
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
      '--accent-green': '#48d1a0',
      '--accent-orange': '#f0a050',
      '--accent-violet': '#b08cff',
      '--accent-red': '#ff6b8a',
      '--accent-yellow': '#ffe066'
    }
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
      '--text-secondary': '#98b898',
      '--accent-blue': '#5abfbf',
      '--accent-green': '#7ddf64',
      '--accent-orange': '#d4a04a',
      '--accent-violet': '#b388e8',
      '--accent-red': '#e06060',
      '--accent-yellow': '#e8d44d'
    }
  },

  // === PAID PALETTES (epic) ===
  galaxie: {
    id: 'galaxie',
    name: 'Galaxie',
    price: 150,
    rarity: 'epic',
    preview: '🌌',
    vars: {
      '--bg-dark': '#0d0221',
      '--bg-card': '#190535',
      '--bg-card-hover': '#250848',
      '--text-primary': '#e8d5f5',
      '--text-secondary': '#a080c0',
      '--accent-blue': '#7b5ea7',
      '--accent-green': '#58d68d',
      '--accent-orange': '#f0a860',
      '--accent-violet': '#cc77ff',
      '--accent-red': '#ff5588',
      '--accent-yellow': '#ffd54f'
    }
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
      '--bg-card-hover': '#3d1e1e',
      '--text-primary': '#f0d8d0',
      '--text-secondary': '#b08878',
      '--accent-blue': '#5090c0',
      '--accent-green': '#70c070',
      '--accent-orange': '#ff6b35',
      '--accent-violet': '#c878e0',
      '--accent-red': '#ff4040',
      '--accent-yellow': '#ffb830'
    }
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
      '--bg-card-hover': '#dce8f0',
      '--text-primary': '#1a2a3a',
      '--text-secondary': '#4a6070',
      '--accent-blue': '#2080c0',
      '--accent-green': '#20a070',
      '--accent-orange': '#d07020',
      '--accent-violet': '#7040b0',
      '--accent-red': '#d03040',
      '--accent-yellow': '#c09010'
    }
  },
  neon: {
    id: 'neon',
    name: 'Néon',
    price: 200,
    rarity: 'epic',
    preview: '💡',
    vars: {
      '--bg-dark': '#0a0a0a',
      '--bg-card': '#141414',
      '--bg-card-hover': '#1e1e1e',
      '--text-primary': '#f0f0f0',
      '--text-secondary': '#888888',
      '--accent-blue': '#00f0ff',
      '--accent-green': '#39ff14',
      '--accent-orange': '#ff8800',
      '--accent-violet': '#ff00ff',
      '--accent-red': '#ff0055',
      '--accent-yellow': '#ffff00'
    }
  },
  couchant: {
    id: 'couchant',
    name: 'Coucher de soleil',
    price: 100,
    rarity: 'epic',
    preview: '🌅',
    vars: {
      '--bg-dark': '#1a1025',
      '--bg-card': '#281838',
      '--bg-card-hover': '#35204a',
      '--text-primary': '#f0e0f0',
      '--text-secondary': '#b090b8',
      '--accent-blue': '#6088d0',
      '--accent-green': '#58c8a0',
      '--accent-orange': '#f0a060',
      '--accent-violet': '#d080e0',
      '--accent-red': '#ff7eb3',
      '--accent-yellow': '#ffc870'
    }
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
      '--bg-card-hover': '#5a3450',
      '--text-primary': '#fbf236',
      '--text-secondary': '#d0c060',
      '--accent-blue': '#5fcde4',
      '--accent-green': '#6abe30',
      '--accent-orange': '#df7126',
      '--accent-violet': '#9b59b6',
      '--accent-red': '#ac3232',
      '--accent-yellow': '#fbf236'
    }
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
      '--bg-card-hover': '#ffe0ec',
      '--text-primary': '#4a2040',
      '--text-secondary': '#805070',
      '--accent-blue': '#60a0e0',
      '--accent-green': '#58c088',
      '--accent-orange': '#e08850',
      '--accent-violet': '#b060d0',
      '--accent-red': '#e04080',
      '--accent-yellow': '#d0a030'
    }
  },

  // === PRESTIGE PALETTES (legendary) ===
  aurore: {
    id: 'aurore',
    name: 'Aurore boréale',
    price: 500,
    rarity: 'legendary',
    preview: '🏔️',
    vars: {
      '--bg-dark': '#020118',
      '--bg-card': '#0a0830',
      '--bg-card-hover': '#120e48',
      '--text-primary': '#d0f0e8',
      '--text-secondary': '#70b8a0',
      '--accent-blue': '#00e5ff',
      '--accent-green': '#00e676',
      '--accent-orange': '#ff9100',
      '--accent-violet': '#aa00ff',
      '--accent-red': '#ff1744',
      '--accent-yellow': '#eeff41'
    }
  },
  cosmique: {
    id: 'cosmique',
    name: 'Cosmique',
    price: 650,
    rarity: 'legendary',
    preview: '✨',
    vars: {
      '--bg-dark': '#0a0015',
      '--bg-card': '#150028',
      '--bg-card-hover': '#200040',
      '--text-primary': '#f0e0ff',
      '--text-secondary': '#a080c8',
      '--accent-blue': '#8040ff',
      '--accent-green': '#00ffa0',
      '--accent-orange': '#ff6040',
      '--accent-violet': '#e040ff',
      '--accent-red': '#ff2080',
      '--accent-yellow': '#ffe040'
    }
  },
  or_massif: {
    id: 'or_massif',
    name: 'Or massif',
    price: 800,
    rarity: 'legendary',
    preview: '👑',
    vars: {
      '--bg-dark': '#1a1400',
      '--bg-card': '#2e2400',
      '--bg-card-hover': '#3d3200',
      '--text-primary': '#fff8e0',
      '--text-secondary': '#c8b060',
      '--accent-blue': '#60a8d0',
      '--accent-green': '#80c840',
      '--accent-orange': '#ffa000',
      '--accent-violet': '#c890e0',
      '--accent-red': '#e05040',
      '--accent-yellow': '#ffd700'
    }
  }
};

// ============================================================
// VISUAL_THEMES — Patterns, decorations, visual identity
// ============================================================

const VISUAL_THEMES = {
  // === FREE VISUAL ===
  chat: {
    id: 'chat',
    name: 'Royaume du Chat',
    price: 0,
    rarity: 'common',
    preview: '🐱',
    pattern: 'paws',
    defaultVars: {
      '--bg-dark': '#2a1f1a',
      '--bg-card': '#3d2e24',
      '--bg-card-hover': '#4a382c',
      '--text-primary': '#f5ebe0',
      '--text-secondary': '#c4a882',
      '--accent-blue': '#7eb8c9',
      '--accent-green': '#6fbf73',
      '--accent-orange': '#e8944c',
      '--accent-violet': '#c48db8',
      '--accent-red': '#e06858',
      '--accent-yellow': '#f0c060'
    }
  },

  // === EPIC VISUAL ===
  onepiece: {
    id: 'onepiece',
    name: 'Grand Line',
    price: 900,
    rarity: 'epic',
    preview: '🏴‍☠️',
    pattern: 'onepiece',
    defaultVars: {
      '--bg-dark': '#0a1628',
      '--bg-card': '#142238',
      '--bg-card-hover': '#1c3050',
      '--text-primary': '#f0e6d0',
      '--text-secondary': '#7ab0d4',
      '--accent-blue': '#2196f3',
      '--accent-green': '#4caf50',
      '--accent-orange': '#ff6d00',
      '--accent-violet': '#9c27b0',
      '--accent-red': '#d32f2f',
      '--accent-yellow': '#ffd600'
    }
  },

  // === RARE VISUAL ===
  splatoon: {
    id: 'splatoon',
    name: 'Inkopolis',
    price: 300,
    rarity: 'rare',
    preview: '🦑',
    pattern: 'splatoon',
    defaultVars: {
      '--bg-dark': '#1a1a2a',
      '--bg-card': '#252535',
      '--bg-card-hover': '#303045',
      '--text-primary': '#f0f0f0',
      '--text-secondary': '#a0a0c0',
      '--accent-blue': '#04d9ff',
      '--accent-green': '#a0ff00',
      '--accent-orange': '#ff6700',
      '--accent-violet': '#c83dff',
      '--accent-red': '#ff2070',
      '--accent-yellow': '#ffe400'
    }
  },

  // === LEGENDARY VISUALS ===
  dbz: {
    id: 'dbz',
    name: 'Saiyan',
    price: 3000,
    rarity: 'legendary',
    preview: '🟠',
    pattern: 'dbz',
    defaultVars: {
      '--bg-dark': '#0a0a14',
      '--bg-card': '#1a1a2e',
      '--bg-card-hover': '#252540',
      '--text-primary': '#fff0d0',
      '--text-secondary': '#c0a060',
      '--accent-blue': '#00b0ff',
      '--accent-green': '#76ff03',
      '--accent-orange': '#ff6d00',
      '--accent-violet': '#aa00ff',
      '--accent-red': '#ff1744',
      '--accent-yellow': '#ffd600'
    }
  },

  // === BOSS-EXCLUSIVE VISUALS (not purchasable) ===
  boss_dragon: {
    id: 'boss_dragon',
    name: 'Antre du Dragon',
    price: -1,
    rarity: 'legendary',
    preview: '🐉',
    pattern: 'boss_dragon',
    defaultVars: {
      '--bg-dark': '#1a0505',
      '--bg-card': '#2e0a0a',
      '--bg-card-hover': '#3d1212',
      '--text-primary': '#ffd0b0',
      '--text-secondary': '#c08060',
      '--accent-blue': '#ff6030',
      '--accent-green': '#ffb020',
      '--accent-orange': '#ff4500',
      '--accent-violet': '#ff6090',
      '--accent-red': '#ff2020',
      '--accent-yellow': '#ffa000'
    }
  },
  boss_kraken: {
    id: 'boss_kraken',
    name: 'Abysses',
    price: -1,
    rarity: 'legendary',
    preview: '🌀',
    pattern: 'boss_kraken',
    defaultVars: {
      '--bg-dark': '#050a1a',
      '--bg-card': '#0a1530',
      '--bg-card-hover': '#102048',
      '--text-primary': '#b0d0ff',
      '--text-secondary': '#6080b0',
      '--accent-blue': '#2060ff',
      '--accent-green': '#00d4aa',
      '--accent-orange': '#4090ff',
      '--accent-violet': '#6040ff',
      '--accent-red': '#3060c0',
      '--accent-yellow': '#40b0ff'
    }
  }
};

// ============================================================
// Constants
// ============================================================

const FREE_PALETTES = ['nuit', 'ocean', 'foret'];
const FREE_VISUALS = ['chat'];
const PALETTE_IDS = new Set(Object.keys(PALETTES));
const VISUAL_IDS = new Set(Object.keys(VISUAL_THEMES));

// Backward-compatible alias
const FREE_THEMES = ['nuit', 'ocean', 'foret', 'chat'];

// Backward-compatible merged object
const THEMES = {};
for (const [id, p] of Object.entries(PALETTES)) {
  THEMES[id] = { id: p.id, name: p.name, price: p.price, rarity: p.rarity, preview: p.preview, vars: p.vars };
}
for (const [id, v] of Object.entries(VISUAL_THEMES)) {
  THEMES[id] = { id: v.id, name: v.name, price: v.price, rarity: v.rarity, preview: v.preview, vars: v.defaultVars, pattern: v.pattern };
}

// ============================================================
// SVG Templates — parameterized by palette colors
// ============================================================

const SVG_TEMPLATES = {
  onepiece: (p, s, a) => `<svg xmlns='http://www.w3.org/2000/svg' width='340' height='340' viewBox='0 0 340 340'><g transform='translate(268,70) rotate(-10)' opacity='0.45'><circle cx='0' cy='-24' r='8' fill='none' stroke='${p}' stroke-width='3'/><line x1='0' y1='-16' x2='0' y2='26' stroke='${p}' stroke-width='3' stroke-linecap='round'/><line x1='-18' y1='4' x2='18' y2='4' stroke='${p}' stroke-width='3' stroke-linecap='round'/><path d='M0,26 Q-24,28 -20,10' fill='none' stroke='${p}' stroke-width='3' stroke-linecap='round'/><path d='M0,26 Q24,28 20,10' fill='none' stroke='${p}' stroke-width='3' stroke-linecap='round'/><path d='M-22,12 L-18,6 L-16,14 Z' fill='${p}' opacity='0.5'/><path d='M22,12 L18,6 L16,14 Z' fill='${p}' opacity='0.5'/></g><g fill='none' stroke='${a}' stroke-linecap='round'><path d='M-15,260 Q20,244 55,260 Q90,276 125,260 Q160,244 195,260 Q230,276 265,260 Q300,244 335,260' stroke-width='2.5' opacity='0.3'/><path d='M-25,276 Q10,264 45,276 Q80,288 115,276 Q150,264 185,276 Q220,288 255,276 Q290,264 325,276' stroke-width='2' opacity='0.25'/><path d='M0,290 Q30,282 60,290 Q90,298 120,290 Q150,282 180,290 Q210,298 240,290 Q270,282 300,290' stroke-width='1.5' opacity='0.2'/></g><g transform='translate(270,220)' fill='${p}' opacity='0.35'><polygon points='0,-16 3,-4 0,0 -3,-4'/><polygon points='0,16 3,4 0,0 -3,4'/><polygon points='-16,0 -4,-3 0,0 -4,3'/><polygon points='16,0 4,-3 0,0 4,3'/><circle cx='0' cy='0' r='3'/><circle cx='0' cy='0' r='18' fill='none' stroke='${p}' stroke-width='0.8' opacity='0.4'/></g><g transform='translate(55,245) rotate(15) scale(0.5)' opacity='0.25'><circle cx='0' cy='-24' r='8' fill='none' stroke='${p}' stroke-width='3'/><line x1='0' y1='-16' x2='0' y2='26' stroke='${p}' stroke-width='3' stroke-linecap='round'/><line x1='-18' y1='4' x2='18' y2='4' stroke='${p}' stroke-width='3' stroke-linecap='round'/><path d='M0,26 Q-24,28 -20,10' fill='none' stroke='${p}' stroke-width='3' stroke-linecap='round'/><path d='M0,26 Q24,28 20,10' fill='none' stroke='${p}' stroke-width='3' stroke-linecap='round'/></g><g fill='${p}'><circle cx='230' cy='30' r='2' opacity='0.18'/><circle cx='310' cy='155' r='1.8' opacity='0.15'/><circle cx='25' cy='195' r='1.8' opacity='0.15'/><circle cx='200' cy='305' r='2' opacity='0.13'/><circle cx='170' cy='215' r='1.5' opacity='0.12'/></g></svg>`,

  splatoon: (p, s, a) => `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='380' viewBox='0 0 420 380'><g fill='${a}' opacity='0.6'><path d='M320,60 Q340,40 355,55 Q365,70 350,80 Q340,90 325,85 Q310,75 320,60Z'/><circle cx='360' cy='45' r='6'/><circle cx='310' cy='52' r='4'/><circle cx='345' cy='90' r='3'/></g><g fill='${s}' opacity='0.5'><path d='M60,190 Q80,170 100,180 Q115,195 100,210 Q85,220 65,210 Q50,200 60,190Z'/><circle cx='45' cy='180' r='5'/><circle cx='110' cy='215' r='4'/><circle cx='55' cy='220' r='3'/></g><g fill='${p}' opacity='0.5'><path d='M340,300 Q360,285 375,295 Q385,310 370,320 Q355,325 340,315 Q330,305 340,300Z'/><circle cx='380' cy='285' r='5'/><circle cx='330' cy='310' r='3'/><circle cx='375' cy='328' r='4'/></g><g fill='${a}' opacity='0.45'><path d='M180,30 Q195,20 205,30 Q210,45 198,50 Q185,48 180,30Z'/><circle cx='210' cy='22' r='3'/><circle cx='175' cy='40' r='2.5'/></g><g fill='${s}' opacity='0.35'><circle cx='250' cy='170' r='3'/><circle cx='253' cy='180' r='2'/><circle cx='251' cy='188' r='1.5'/><circle cx='150' cy='320' r='3'/><circle cx='148' cy='330' r='2'/></g></svg>`,

  dbz: (p, s, a) => `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='380' viewBox='0 0 420 380'><g stroke='${p}' stroke-width='1.8' stroke-linecap='round' opacity='0.4'><line x1='20' y1='15' x2='12' y2='2'/><line x1='55' y1='8' x2='58' y2='-5'/><line x1='85' y1='15' x2='95' y2='3'/><line x1='10' y1='80' x2='0' y2='72'/><line x1='100' y1='70' x2='110' y2='62'/></g><g stroke='${a}' stroke-width='1.5' stroke-linecap='round' opacity='0.3'><line x1='310' y1='42' x2='315' y2='30'/><line x1='340' y1='48' x2='352' y2='38'/><line x1='285' y1='55' x2='275' y2='45'/><line x1='370' y1='80' x2='382' y2='72'/></g><g fill='none' stroke='${s}' stroke-width='1.2' opacity='0.25'><path d='M140,240 Q130,220 145,210'/><path d='M260,240 Q270,225 255,215'/><path d='M160,365 Q145,370 140,355'/><path d='M250,360 Q265,365 260,350'/></g><g fill='${p}' opacity='0.3'><polygon points='380,170 383,178 391,178 385,183 387,191 380,186 373,191 375,183 369,178 377,178' transform='scale(0.6) translate(250,100)'/><polygon points='380,170 383,178 391,178 385,183 387,191 380,186 373,191 375,183 369,178 377,178' transform='scale(0.4) translate(100,650)'/></g><g fill='${p}'><circle cx='180' cy='30' r='1.5' opacity='0.2'/><circle cx='400' cy='200' r='2' opacity='0.15'/><circle cx='120' cy='190' r='1.5' opacity='0.18'/><circle cx='350' cy='320' r='1.8' opacity='0.15'/><circle cx='20' cy='350' r='1.5' opacity='0.12'/></g></svg>`,

  paws: (p, s, a) => `<svg xmlns='http://www.w3.org/2000/svg' width='380' height='360' viewBox='0 0 380 360'><g transform='translate(300,40) rotate(20)' fill='${p}' opacity='0.5'><ellipse cx='0' cy='8' rx='10' ry='12'/><ellipse cx='-10' cy='-6' rx='5' ry='6'/><ellipse cx='-2' cy='-10' rx='5' ry='6'/><ellipse cx='7' cy='-8' rx='5' ry='6'/><ellipse cx='13' cy='-2' rx='4.5' ry='5.5'/></g><g transform='translate(55,200) rotate(-15)' fill='${p}' opacity='0.4'><ellipse cx='0' cy='6' rx='8' ry='10'/><ellipse cx='-8' cy='-5' rx='4' ry='5'/><ellipse cx='-1' cy='-8' rx='4' ry='5'/><ellipse cx='6' cy='-6' rx='4' ry='5'/><ellipse cx='10' cy='-1' rx='3.5' ry='4.5'/></g><g transform='translate(320,290) rotate(35)' fill='${p}' opacity='0.35'><ellipse cx='0' cy='5' rx='6' ry='8'/><ellipse cx='-6' cy='-4' rx='3' ry='4'/><ellipse cx='-1' cy='-6' rx='3' ry='4'/><ellipse cx='5' cy='-5' rx='3' ry='4'/><ellipse cx='8' cy='-1' rx='2.5' ry='3.5'/></g><g transform='translate(190,55)' opacity='0.3'><circle cx='0' cy='0' r='10' fill='none' stroke='${a}' stroke-width='1.5'/><path d='M-8,4 Q-2,-8 8,-2' fill='none' stroke='${a}' stroke-width='1'/><path d='M-5,-6 Q4,0 2,8' fill='none' stroke='${a}' stroke-width='1'/><line x1='8' y1='6' x2='22' y2='18' stroke='${a}' stroke-width='1' stroke-dasharray='3,4'/></g><g transform='translate(40,320) rotate(-10)' fill='${s}' opacity='0.3'><ellipse cx='0' cy='0' rx='12' ry='6'/><polygon points='12,-1 20,-6 20,6'/></g><g stroke='${p}' stroke-width='0.8' stroke-linecap='round' opacity='0.2'><line x1='160' y1='170' x2='180' y2='168'/><line x1='160' y1='175' x2='180' y2='177'/><line x1='260' y1='330' x2='275' y2='328'/><line x1='260' y1='335' x2='275' y2='337'/></g></svg>`
};

// SVG tile sizes per pattern (must match CSS background-size)
const SVG_SIZES = {
  onepiece: '340px 340px',
  splatoon: '420px 380px',
  dbz: '420px 380px',
  paws: '380px 360px'
};

/**
 * Generate a data URI from an SVG template using current palette colors
 */
function generateSvgDataUri(pattern, vars) {
  const template = SVG_TEMPLATES[pattern];
  if (!template) return null;
  const primary = vars['--text-primary'] || '#e8e8f0';
  const secondary = vars['--accent-blue'] || '#4a9eff';
  const accent = vars['--accent-orange'] || '#ff8c42';
  const svg = template(primary, secondary, accent);
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}

// ============================================================
// Functions
// ============================================================

/**
 * Apply palette colors (CSS custom properties) on :root
 * @param {string|null} paletteId — key from PALETTES, or 'none'/null
 * @param {Object} [fallbackVars] — CSS vars to use when paletteId is 'none'/null
 */
function applyPalette(paletteId, fallbackVars) {
  let vars;
  if (paletteId && paletteId !== 'none' && PALETTES[paletteId]) {
    vars = PALETTES[paletteId].vars;
  } else if (fallbackVars) {
    vars = fallbackVars;
  } else {
    vars = PALETTES.nuit.vars;
  }

  const root = document.documentElement.style;
  for (const [prop, value] of Object.entries(vars)) {
    root.setProperty(prop, value);
  }
}

/**
 * Apply visual theme — toggle pattern classes on body + set decorations
 * @param {string|null} visualId — key from VISUAL_THEMES, or null/'none'
 */
function applyVisual(visualId, activeVars) {
  const visual = (visualId && visualId !== 'none') ? VISUAL_THEMES[visualId] : null;
  const pat = visual ? visual.pattern : '';

  // Toggle all pattern classes
  const allPatterns = ['paws', 'onepiece', 'splatoon', 'dbz', 'boss_dragon', 'boss_kraken'];
  for (const p of allPatterns) {
    document.body.classList.toggle('theme-pattern-' + p, pat === p);
  }

  // Generate dynamic SVG overlay with palette colors
  let styleEl = document.getElementById('theme-svg-override');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'theme-svg-override';
    document.head.appendChild(styleEl);
  }
  if (pat && SVG_TEMPLATES[pat] && activeVars) {
    const dataUri = generateSvgDataUri(pat, activeVars);
    const svgSize = SVG_SIZES[pat];
    const pngBgs = {
      paws: { url: 'url("icons/cat-tile.png")', size: '380px 360px' },
      onepiece: { url: 'url("icons/mugiwara.png")', size: '140px' },
      splatoon: { url: 'url("icons/splatoon-tile.png")', size: '420px 380px' },
      dbz: { url: 'url("icons/dbz-tile.png")', size: '420px 380px' }
    };
    const png = pngBgs[pat];
    if (png) {
      styleEl.textContent = `body.theme-pattern-${pat}::after { background-image: ${dataUri}, ${png.url} !important; background-size: ${svgSize}, ${png.size} !important; }`;
    } else {
      styleEl.textContent = '';
    }
  } else {
    styleEl.textContent = '';
  }

  // Theme decorations on static elements
  const kameIcon = '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:2px solid currentColor;border-radius:50%;font-size:16px;font-weight:900;vertical-align:middle;margin-right:4px">亀</span>';
  const decos = {
    paws: ['😼', '🐱', '😸'],
    onepiece: ['🏴‍☠️', '🏴‍☠️', '☠️'],
    splatoon: ['🦑', '🦑', '🎨'],
    dbz: ['★', kameIcon, '⚡']
  };
  const d = decos[pat];

  const shopBtn = document.getElementById('btn-shop');
  if (shopBtn) shopBtn.textContent = d ? d[0] : '🛒';

  const homeTitle = document.querySelector('#screen-home > h1');
  if (homeTitle) homeTitle.innerHTML = d ? d[1] + ' QuizHero' : 'QuizHero';

  const endTitle = document.querySelector('#screen-end > h2');
  if (endTitle) endTitle.textContent = d ? d[2] + ' Partie terminée !' : '🎉 Partie terminée !';
}

/**
 * Apply a full theme combo (palette + visual)
 * @param {string|null} paletteId — palette key or 'none'/null
 * @param {string|null} visualId — visual theme key or 'none'/null
 */
function applyThemeCombo(paletteId, visualId) {
  const visual = (visualId && visualId !== 'none') ? VISUAL_THEMES[visualId] : null;
  // Determine which color vars are active
  const activeVars = (paletteId && paletteId !== 'none' && PALETTES[paletteId])
    ? PALETTES[paletteId].vars
    : (visual ? visual.defaultVars : PALETTES.nuit.vars);
  applyPalette(paletteId, visual ? visual.defaultVars : null);
  applyVisual(visualId, activeVars);
}

/**
 * Backward-compatible wrapper — apply a theme by its old single ID
 * Checks if themeId is a visual or palette and routes accordingly
 * @param {string} themeId — key from either PALETTES or VISUAL_THEMES
 */
function applyTheme(themeId) {
  if (VISUAL_IDS.has(themeId)) {
    // Visual theme: apply its defaultVars as palette + its pattern
    applyThemeCombo(null, themeId);
  } else if (PALETTE_IDS.has(themeId)) {
    // Palette only: apply colors, clear any visual
    applyThemeCombo(themeId, null);
  }
  // Unknown themeId: do nothing
}

/**
 * Get all palettes as an array
 * @returns {Array}
 */
function getPaletteList() {
  return Object.values(PALETTES);
}

/**
 * Get all visual themes as an array
 * @returns {Array}
 */
function getVisualList() {
  return Object.values(VISUAL_THEMES);
}

/**
 * Get all themes as an array (backward compat — palettes + visuals combined)
 * @returns {Array}
 */
function getThemeList() {
  return Object.values(THEMES);
}
