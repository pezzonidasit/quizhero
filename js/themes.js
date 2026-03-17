/**
 * QuizHero V2 — Theme Engine
 * 10 themes with CSS custom property injection
 */

const THEMES = {
  // === FREE THEMES ===
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

  // === PAID THEMES (epic rarity) ===
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

  // === PRESTIGE THEMES (very expensive) ===
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
  },

  // === BOSS-EXCLUSIVE THEMES (not purchasable) ===
  boss_dragon: {
    id: 'boss_dragon',
    name: 'Antre du Dragon',
    price: -1,
    rarity: 'legendary',
    preview: '🐉',
    vars: {
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
    vars: {
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

const FREE_THEMES = ['nuit', 'ocean', 'foret'];

/**
 * Apply a theme by setting CSS custom properties on :root
 * @param {string} themeId — key from THEMES object
 */
function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement.style;
  for (const [prop, value] of Object.entries(theme.vars)) {
    root.setProperty(prop, value);
  }
}

/**
 * Get all themes as an array
 * @returns {Array} — array of theme objects
 */
function getThemeList() {
  return Object.values(THEMES);
}
