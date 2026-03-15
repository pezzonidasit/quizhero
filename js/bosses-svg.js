/**
 * QuizHero V3 — Boss Pixel Art SVGs
 * Each boss has an SVG string that replaces the emoji in boss fights.
 * All bosses use viewBox="0 0 32 30" with crispEdges for pixel art look.
 */
const BOSS_SVG = {

  dragon: `<svg class="boss-pixel" viewBox="0 0 32 28" shape-rendering="crispEdges">
    <!-- Wings — spread WIDE, jagged edges (behind body) -->
    <g class="wing-l">
      <rect x="0" y="5" width="1" height="1" fill="#8b1a1a"/>
      <rect x="1" y="4" width="1" height="1" fill="#8b1a1a"/>
      <rect x="2" y="3" width="1" height="1" fill="#8b1a1a"/>
      <rect x="3" y="4" width="1" height="1" fill="#c83028"/>
      <rect x="0" y="6" width="2" height="1" fill="#c83028"/>
      <rect x="1" y="7" width="2" height="1" fill="#c83028"/>
      <rect x="2" y="8" width="2" height="1" fill="#e04030"/>
      <rect x="3" y="5" width="2" height="1" fill="#e04030"/>
      <rect x="4" y="6" width="2" height="1" fill="#e04030"/>
      <rect x="5" y="7" width="2" height="1" fill="#c83028"/>
      <rect x="3" y="9" width="3" height="1" fill="#c83028"/>
      <rect x="4" y="10" width="3" height="1" fill="#8b1a1a"/>
      <rect x="0" y="7" width="1" height="1" fill="#e04030"/>
      <rect x="1" y="8" width="1" height="1" fill="#e04030"/>
    </g>
    <g class="wing-r">
      <rect x="31" y="5" width="1" height="1" fill="#8b1a1a"/>
      <rect x="30" y="4" width="1" height="1" fill="#8b1a1a"/>
      <rect x="29" y="3" width="1" height="1" fill="#8b1a1a"/>
      <rect x="28" y="4" width="1" height="1" fill="#c83028"/>
      <rect x="30" y="6" width="2" height="1" fill="#c83028"/>
      <rect x="29" y="7" width="2" height="1" fill="#c83028"/>
      <rect x="28" y="8" width="2" height="1" fill="#e04030"/>
      <rect x="27" y="5" width="2" height="1" fill="#e04030"/>
      <rect x="26" y="6" width="2" height="1" fill="#e04030"/>
      <rect x="25" y="7" width="2" height="1" fill="#c83028"/>
      <rect x="25" y="9" width="3" height="1" fill="#c83028"/>
      <rect x="25" y="10" width="3" height="1" fill="#8b1a1a"/>
      <rect x="31" y="7" width="1" height="1" fill="#e04030"/>
      <rect x="30" y="8" width="1" height="1" fill="#e04030"/>
    </g>
    <!-- Horns — sharp curved -->
    <rect x="8" y="0" width="1" height="1" fill="#f0a050"/>
    <rect x="9" y="0" width="1" height="1" fill="#f0a050"/>
    <rect x="9" y="1" width="1" height="1" fill="#f0a050"/>
    <rect x="10" y="1" width="1" height="1" fill="#e04030"/>
    <rect x="22" y="0" width="1" height="1" fill="#f0a050"/>
    <rect x="23" y="0" width="1" height="1" fill="#f0a050"/>
    <rect x="22" y="1" width="1" height="1" fill="#f0a050"/>
    <rect x="21" y="1" width="1" height="1" fill="#e04030"/>
    <!-- Spikes along head — jagged crown -->
    <rect x="13" y="0" width="1" height="1" fill="#ff4020"/>
    <rect x="15" y="0" width="1" height="1" fill="#ff4020"/>
    <rect x="16" y="0" width="1" height="1" fill="#ff4020"/>
    <rect x="18" y="0" width="1" height="1" fill="#ff4020"/>
    <rect x="14" y="1" width="1" height="1" fill="#e04030"/>
    <rect x="17" y="1" width="1" height="1" fill="#e04030"/>
    <!-- Head — massive -->
    <rect x="11" y="1" width="10" height="1" fill="#e04030"/>
    <rect x="10" y="2" width="12" height="1" fill="#e04030"/>
    <rect x="9" y="3" width="14" height="1" fill="#e04030"/>
    <rect x="8" y="4" width="16" height="1" fill="#c83028"/>
    <rect x="8" y="5" width="16" height="1" fill="#e04030"/>
    <!-- Angry brow ridges -->
    <rect x="10" y="2" width="3" height="1" fill="#8b1a1a"/>
    <rect x="19" y="2" width="3" height="1" fill="#8b1a1a"/>
    <!-- Eyes — furious, pupils at BOTTOM glaring down -->
    <rect x="10" y="3" width="3" height="2" fill="#ffff80"/>
    <rect x="19" y="3" width="3" height="2" fill="#ffff80"/>
    <rect x="11" y="4" width="2" height="1" fill="#1a0505"/>
    <rect x="20" y="4" width="2" height="1" fill="#1a0505"/>
    <rect class="eye-glow" x="10" y="3" width="3" height="2" fill="#ff4020" opacity="0.35"/>
    <rect class="eye-glow" x="19" y="3" width="3" height="2" fill="#ff4020" opacity="0.35"/>
    <!-- Snout — wide, nostrils flaring -->
    <rect x="9" y="6" width="14" height="1" fill="#c83028"/>
    <rect x="12" y="6" width="1" height="1" fill="#8b1a1a"/>
    <rect x="19" y="6" width="1" height="1" fill="#8b1a1a"/>
    <!-- Mouth — WIDE open, teeth bared -->
    <rect x="9" y="7" width="14" height="1" fill="#8b1a1a"/>
    <rect x="10" y="8" width="12" height="1" fill="#500a0a"/>
    <rect x="11" y="9" width="10" height="1" fill="#500a0a"/>
    <!-- Upper teeth — jagged row -->
    <rect x="10" y="7" width="1" height="1" fill="#f0e8d0"/>
    <rect x="12" y="7" width="1" height="1" fill="#f0e8d0"/>
    <rect x="14" y="7" width="1" height="1" fill="#f0e8d0"/>
    <rect x="16" y="7" width="1" height="1" fill="#f0e8d0"/>
    <rect x="17" y="7" width="1" height="1" fill="#f0e8d0"/>
    <rect x="19" y="7" width="1" height="1" fill="#f0e8d0"/>
    <rect x="21" y="7" width="1" height="1" fill="#f0e8d0"/>
    <!-- Lower teeth — second row -->
    <rect x="11" y="8" width="1" height="1" fill="#f0e8d0"/>
    <rect x="13" y="8" width="1" height="1" fill="#f0e8d0"/>
    <rect x="15" y="8" width="1" height="1" fill="#f0e8d0"/>
    <rect x="18" y="8" width="1" height="1" fill="#f0e8d0"/>
    <rect x="20" y="8" width="1" height="1" fill="#f0e8d0"/>
    <!-- Fire breath — pouring DOWN from mouth -->
    <g class="fire-breath">
      <rect x="12" y="9" width="2" height="1" fill="#ff8020" opacity="0.9"/>
      <rect x="18" y="9" width="2" height="1" fill="#ff8020" opacity="0.9"/>
      <rect x="11" y="10" width="3" height="1" fill="#ff8020" opacity="0.8"/>
      <rect x="18" y="10" width="3" height="1" fill="#ff6010" opacity="0.8"/>
      <rect x="12" y="11" width="2" height="1" fill="#ff6010" opacity="0.65"/>
      <rect x="18" y="11" width="2" height="1" fill="#ff4000" opacity="0.55"/>
      <rect x="13" y="12" width="1" height="1" fill="#ff4000" opacity="0.4"/>
      <rect x="18" y="12" width="1" height="1" fill="#ff4000" opacity="0.35"/>
    </g>
    <g class="fire-breath-2">
      <rect x="14" y="9" width="4" height="1" fill="#ff6010" opacity="0.85"/>
      <rect x="14" y="10" width="4" height="1" fill="#ff4000" opacity="0.7"/>
      <rect x="15" y="11" width="2" height="1" fill="#ff8020" opacity="0.55"/>
      <rect x="15" y="12" width="2" height="1" fill="#ff6010" opacity="0.4"/>
      <rect x="15" y="13" width="2" height="1" fill="#ff4000" opacity="0.25"/>
    </g>
    <!-- Neck -->
    <rect x="10" y="10" width="12" height="1" fill="#e04030"/>
    <rect x="10" y="11" width="12" height="1" fill="#c83028"/>
    <!-- Back spikes -->
    <rect x="15" y="11" width="2" height="1" fill="#ff4020"/>
    <rect x="14" y="12" width="1" height="1" fill="#ff4020"/>
    <rect x="17" y="12" width="1" height="1" fill="#ff4020"/>
    <!-- Body — massive torso -->
    <rect x="8" y="12" width="16" height="1" fill="#e04030"/>
    <rect x="7" y="13" width="18" height="1" fill="#e04030"/>
    <rect x="7" y="14" width="18" height="1" fill="#c83028"/>
    <rect x="7" y="15" width="18" height="1" fill="#e04030"/>
    <rect x="7" y="16" width="18" height="1" fill="#c83028"/>
    <rect x="8" y="17" width="16" height="1" fill="#e04030"/>
    <rect x="9" y="18" width="14" height="1" fill="#c83028"/>
    <!-- Belly scales -->
    <rect x="11" y="13" width="10" height="1" fill="#f0a050"/>
    <rect x="10" y="14" width="12" height="1" fill="#f0a050"/>
    <rect x="10" y="15" width="12" height="1" fill="#f0a050"/>
    <rect x="10" y="16" width="12" height="1" fill="#f0a050"/>
    <rect x="11" y="17" width="10" height="1" fill="#f0a050"/>
    <rect x="12" y="14" width="8" height="0.4" fill="#e08830"/>
    <rect x="11" y="15" width="10" height="0.4" fill="#e08830"/>
    <rect x="12" y="16" width="8" height="0.4" fill="#e08830"/>
    <!-- Arms extended with 3-claw hands -->
    <rect x="5" y="14" width="2" height="1" fill="#c83028"/>
    <rect x="4" y="15" width="2" height="1" fill="#c83028"/>
    <rect x="3" y="16" width="2" height="1" fill="#c83028"/>
    <rect x="2" y="17" width="2" height="1" fill="#e04030"/>
    <rect x="1" y="18" width="1" height="1" fill="#f0a050"/>
    <rect x="2" y="18" width="1" height="1" fill="#f0a050"/>
    <rect x="3" y="18" width="1" height="1" fill="#f0a050"/>
    <rect x="25" y="14" width="2" height="1" fill="#c83028"/>
    <rect x="26" y="15" width="2" height="1" fill="#c83028"/>
    <rect x="27" y="16" width="2" height="1" fill="#c83028"/>
    <rect x="28" y="17" width="2" height="1" fill="#e04030"/>
    <rect x="28" y="18" width="1" height="1" fill="#f0a050"/>
    <rect x="29" y="18" width="1" height="1" fill="#f0a050"/>
    <rect x="30" y="18" width="1" height="1" fill="#f0a050"/>
    <!-- Legs — powerful -->
    <rect x="9" y="19" width="3" height="1" fill="#c83028"/>
    <rect x="20" y="19" width="3" height="1" fill="#c83028"/>
    <rect x="8" y="20" width="4" height="1" fill="#c83028"/>
    <rect x="20" y="20" width="4" height="1" fill="#c83028"/>
    <rect x="8" y="21" width="4" height="1" fill="#8b1a1a"/>
    <rect x="20" y="21" width="4" height="1" fill="#8b1a1a"/>
    <!-- Feet with claws -->
    <rect x="7" y="22" width="1" height="1" fill="#f0a050"/>
    <rect x="8" y="22" width="1" height="1" fill="#f0a050"/>
    <rect x="10" y="22" width="1" height="1" fill="#f0a050"/>
    <rect x="11" y="22" width="1" height="1" fill="#f0a050"/>
    <rect x="20" y="22" width="1" height="1" fill="#f0a050"/>
    <rect x="21" y="22" width="1" height="1" fill="#f0a050"/>
    <rect x="23" y="22" width="1" height="1" fill="#f0a050"/>
    <rect x="24" y="22" width="1" height="1" fill="#f0a050"/>
    <!-- Tail — spiked -->
    <rect x="24" y="17" width="1" height="1" fill="#e04030"/>
    <rect x="25" y="16" width="1" height="1" fill="#e04030"/>
    <rect x="26" y="17" width="1" height="1" fill="#c83028"/>
    <rect x="27" y="18" width="1" height="1" fill="#c83028"/>
    <rect x="28" y="19" width="1" height="1" fill="#8b1a1a"/>
    <rect x="29" y="19" width="1" height="1" fill="#ff4020"/>
    <rect x="30" y="20" width="1" height="1" fill="#ff4020"/>
    <rect x="29" y="20" width="1" height="1" fill="#8b1a1a"/>
  </svg>`,

  golem: `<svg class="boss-pixel" viewBox="0 0 32 28" shape-rendering="crispEdges">
    <!-- Floating rocks -->
    <g class="bubble"><rect x="3" y="2" width="2" height="2" fill="#5a5a5a"/></g>
    <g class="bubble" style="animation-delay:0.7s"><rect x="27" y="4" width="2" height="2" fill="#8a8a8a"/></g>
    <g class="bubble" style="animation-delay:1.3s"><rect x="1" y="14" width="1" height="1" fill="#5a5a5a"/><rect x="2" y="13" width="1" height="1" fill="#5a5a5a"/></g>
    <!-- Head -->
    <rect x="10" y="1" width="12" height="10" fill="#5a5a5a"/>
    <rect x="10" y="1" width="12" height="1" fill="#8a8a8a"/>
    <rect x="21" y="2" width="1" height="9" fill="#2a2a2a"/>
    <!-- Eye sockets -->
    <rect x="12" y="4" width="3" height="3" fill="#2a2a2a"/>
    <rect x="17" y="4" width="3" height="3" fill="#2a2a2a"/>
    <rect class="eye-glow" x="12" y="6" width="3" height="1" fill="#40ff40"/>
    <rect class="eye-glow" x="17" y="6" width="3" height="1" fill="#40ff40"/>
    <!-- Jaw -->
    <rect x="13" y="9" width="6" height="1" fill="#2a2a2a"/>
    <!-- Neck -->
    <rect x="13" y="11" width="6" height="1" fill="#5a5a5a"/>
    <!-- Body massive -->
    <rect x="8" y="12" width="16" height="12" fill="#5a5a5a"/>
    <rect x="8" y="12" width="16" height="1" fill="#8a8a8a"/>
    <rect x="23" y="13" width="1" height="11" fill="#2a2a2a"/>
    <rect x="8" y="23" width="16" height="1" fill="#2a2a2a"/>
    <!-- Core -->
    <rect x="13" y="14" width="6" height="5" fill="#2a2a2a"/>
    <rect x="14" y="15" width="4" height="3" fill="#8a8a8a"/>
    <!-- Left arm -->
    <rect x="4" y="12" width="4" height="11" fill="#5a5a5a"/>
    <rect x="4" y="12" width="4" height="1" fill="#8a8a8a"/>
    <rect x="4" y="22" width="4" height="1" fill="#2a2a2a"/>
    <rect x="3" y="23" width="5" height="3" fill="#5a5a5a"/>
    <rect x="3" y="25" width="5" height="1" fill="#2a2a2a"/>
    <!-- Right arm -->
    <rect x="24" y="12" width="4" height="11" fill="#5a5a5a"/>
    <rect x="24" y="12" width="4" height="1" fill="#8a8a8a"/>
    <rect x="27" y="13" width="1" height="10" fill="#2a2a2a"/>
    <rect x="24" y="23" width="5" height="3" fill="#5a5a5a"/>
    <rect x="24" y="25" width="5" height="1" fill="#2a2a2a"/>
    <!-- Legs -->
    <rect x="9" y="24" width="5" height="4" fill="#5a5a5a"/>
    <rect x="9" y="27" width="5" height="1" fill="#2a2a2a"/>
    <rect x="18" y="24" width="5" height="4" fill="#5a5a5a"/>
    <rect x="18" y="27" width="5" height="1" fill="#2a2a2a"/>
    <!-- Cracks -->
    <rect x="11" y="3" width="1" height="2" fill="#2a2a2a"/>
    <rect x="20" y="16" width="1" height="2" fill="#2a2a2a"/>
    <rect x="10" y="19" width="1" height="2" fill="#2a2a2a"/>
    <rect x="25" y="17" width="1" height="1" fill="#2a2a2a"/>
  </svg>`,

  sorcier: `<svg class="boss-pixel" viewBox="0 0 32 28" shape-rendering="crispEdges">
    <!-- Hat tip — gentle curve -->
    <rect x="17" y="0" width="1" height="1" fill="#5a3a8a"/>
    <rect x="16" y="1" width="2" height="1" fill="#5a3a8a"/>
    <rect x="15" y="2" width="3" height="1" fill="#2a1a4a"/>
    <!-- Star on hat -->
    <rect x="16" y="1" width="1" height="1" fill="#f0d060"/>
    <!-- Hat body — flowing curve -->
    <rect x="14" y="3" width="5" height="1" fill="#5a3a8a"/>
    <rect x="13" y="4" width="7" height="1" fill="#2a1a4a"/>
    <rect x="12" y="5" width="8" height="1" fill="#5a3a8a"/>
    <rect x="11" y="6" width="10" height="1" fill="#2a1a4a"/>
    <!-- Gold band with gems -->
    <rect x="11" y="7" width="10" height="1" fill="#f0d060"/>
    <rect x="14" y="7" width="1" height="1" fill="#ffe090"/>
    <rect x="17" y="7" width="1" height="1" fill="#ffe090"/>
    <!-- Stars on hat -->
    <rect x="14" y="4" width="1" height="1" fill="#ffe090"/>
    <rect x="17" y="5" width="1" height="1" fill="#f0d060"/>
    <rect x="13" y="6" width="1" height="1" fill="#ffe090"/>
    <!-- Hat brim — elegant wide -->
    <rect x="7" y="8" width="18" height="1" fill="#5a3a8a"/>
    <rect x="6" y="9" width="20" height="1" fill="#2a1a4a"/>
    <!-- Face — warm shadow under hat -->
    <rect x="10" y="10" width="12" height="1" fill="#3a2848"/>
    <rect x="10" y="11" width="12" height="1" fill="#4a3858"/>
    <rect x="10" y="12" width="12" height="1" fill="#3a2848"/>
    <!-- Eyes — ethereal purple glow, looking DOWN -->
    <rect x="11" y="10" width="3" height="2" fill="#b490dd"/>
    <rect x="18" y="10" width="3" height="2" fill="#b490dd"/>
    <!-- Pupils at bottom of eyes -->
    <rect x="12" y="11" width="2" height="1" fill="#1a0a2a"/>
    <rect x="19" y="11" width="2" height="1" fill="#1a0a2a"/>
    <!-- Eye glow overlay -->
    <rect class="eye-glow" x="11" y="10" width="3" height="2" fill="#cc77ff" opacity="0.45"/>
    <rect class="eye-glow" x="18" y="10" width="3" height="2" fill="#cc77ff" opacity="0.45"/>
    <!-- Nose hint -->
    <rect x="15" y="12" width="2" height="1" fill="#4a3060"/>
    <!-- Beard — long, flowing, ethereal white-lavender -->
    <rect x="10" y="13" width="12" height="1" fill="#d8c8e8"/>
    <rect x="9" y="14" width="14" height="1" fill="#e8daf0"/>
    <rect x="10" y="15" width="12" height="1" fill="#d0bce0"/>
    <rect x="11" y="16" width="10" height="1" fill="#e0d0ee"/>
    <rect x="12" y="17" width="8" height="1" fill="#d8c8e8"/>
    <rect x="13" y="18" width="6" height="1" fill="#e8daf0"/>
    <rect x="14" y="19" width="4" height="1" fill="#d0bce0"/>
    <rect x="15" y="20" width="2" height="1" fill="#e0d0ee"/>
    <!-- Beard wispy ends -->
    <rect x="9" y="15" width="1" height="1" fill="#e0d0ee"/>
    <rect x="22" y="15" width="1" height="1" fill="#e0d0ee"/>
    <rect x="11" y="17" width="1" height="1" fill="#d8c8e8"/>
    <rect x="20" y="17" width="1" height="1" fill="#d8c8e8"/>
    <!-- Robe — rich purple with subtle pattern -->
    <rect x="8" y="14" width="2" height="1" fill="#2a1a4a"/>
    <rect x="22" y="14" width="2" height="1" fill="#2a1a4a"/>
    <rect x="7" y="15" width="2" height="1" fill="#5a3a8a"/>
    <rect x="23" y="15" width="2" height="1" fill="#5a3a8a"/>
    <rect x="7" y="16" width="3" height="1" fill="#2a1a4a"/>
    <rect x="22" y="16" width="3" height="1" fill="#2a1a4a"/>
    <rect x="7" y="17" width="4" height="1" fill="#5a3a8a"/>
    <rect x="21" y="17" width="4" height="1" fill="#5a3a8a"/>
    <rect x="8" y="18" width="4" height="1" fill="#2a1a4a"/>
    <rect x="20" y="18" width="4" height="1" fill="#2a1a4a"/>
    <rect x="8" y="19" width="5" height="1" fill="#5a3a8a"/>
    <rect x="19" y="19" width="5" height="1" fill="#5a3a8a"/>
    <rect x="9" y="20" width="5" height="1" fill="#2a1a4a"/>
    <rect x="18" y="20" width="5" height="1" fill="#2a1a4a"/>
    <rect x="9" y="21" width="14" height="1" fill="#5a3a8a"/>
    <rect x="10" y="22" width="12" height="1" fill="#2a1a4a"/>
    <!-- Robe gold trim -->
    <rect x="9" y="21" width="1" height="1" fill="#f0d060"/>
    <rect x="22" y="21" width="1" height="1" fill="#f0d060"/>
    <rect x="10" y="22" width="1" height="1" fill="#ffe090"/>
    <rect x="21" y="22" width="1" height="1" fill="#ffe090"/>
    <!-- Robe pattern — subtle stars -->
    <rect x="8" y="17" width="1" height="1" fill="#8a6abb"/>
    <rect x="23" y="17" width="1" height="1" fill="#8a6abb"/>
    <rect x="9" y="19" width="1" height="1" fill="#8a6abb"/>
    <rect x="22" y="19" width="1" height="1" fill="#8a6abb"/>
    <!-- Staff — ornate, right side -->
    <rect x="27" y="4" width="1" height="19" fill="#c4a050"/>
    <rect x="26" y="6" width="1" height="1" fill="#f0d060"/>
    <rect x="28" y="6" width="1" height="1" fill="#f0d060"/>
    <rect x="26" y="10" width="1" height="1" fill="#f0d060"/>
    <rect x="28" y="10" width="1" height="1" fill="#f0d060"/>
    <!-- Staff crystal orb — glowing -->
    <rect x="26" y="1" width="3" height="3" fill="#8a6abb"/>
    <rect x="27" y="0" width="1" height="1" fill="#b490dd"/>
    <rect x="27" y="2" width="1" height="1" fill="#cc77ff"/>
    <rect x="26" y="2" width="1" height="1" fill="#b490dd"/>
    <rect class="eye-glow" x="26" y="1" width="3" height="3" fill="#cc77ff" opacity="0.35"/>
    <!-- Magic sparkles — ethereal floating particles -->
    <g class="sparkle">
      <rect x="1" y="3" width="1" height="1" fill="#cc77ff"/>
    </g>
    <g class="sparkle" style="animation-delay: 0.4s">
      <rect x="30" y="6" width="1" height="1" fill="#f0d060"/>
    </g>
    <g class="sparkle" style="animation-delay: 0.8s">
      <rect x="4" y="8" width="1" height="1" fill="#cc77ff"/>
    </g>
    <g class="sparkle" style="animation-delay: 1.2s">
      <rect x="29" y="12" width="1" height="1" fill="#f0d060"/>
    </g>
    <g class="sparkle" style="animation-delay: 1.6s">
      <rect x="2" y="14" width="1" height="1" fill="#cc77ff"/>
    </g>
  </svg>`,

  sphinx: `<svg class="boss-pixel" viewBox="0 0 32 28" shape-rendering="crispEdges">
    <!-- Nemes headdress top — dark ancient stone -->
    <rect x="13" y="0" width="6" height="1" fill="#302810"/>
    <rect x="12" y="1" width="8" height="1" fill="#1a1508"/>
    <rect x="11" y="2" width="10" height="1" fill="#302810"/>
    <rect x="10" y="3" width="12" height="1" fill="#1a1508"/>
    <!-- Headdress stripes — faint gold glints -->
    <rect x="12" y="1" width="2" height="1" fill="#504020"/>
    <rect x="16" y="1" width="2" height="1" fill="#504020"/>
    <rect x="11" y="2" width="1" height="1" fill="#504020"/>
    <rect x="14" y="2" width="2" height="1" fill="#504020"/>
    <rect x="19" y="2" width="1" height="1" fill="#504020"/>
    <rect x="10" y="3" width="1" height="1" fill="#504020"/>
    <rect x="15" y="3" width="2" height="1" fill="#504020"/>
    <rect x="21" y="3" width="1" height="1" fill="#504020"/>
    <!-- Nemes sides hanging down — deep shadow -->
    <rect x="8" y="4" width="2" height="1" fill="#302810"/>
    <rect x="22" y="4" width="2" height="1" fill="#302810"/>
    <rect x="7" y="5" width="2" height="1" fill="#1a1508"/>
    <rect x="23" y="5" width="2" height="1" fill="#1a1508"/>
    <rect x="6" y="6" width="2" height="2" fill="#302810"/>
    <rect x="24" y="6" width="2" height="2" fill="#302810"/>
    <rect x="5" y="8" width="2" height="2" fill="#1a1508"/>
    <rect x="25" y="8" width="2" height="2" fill="#1a1508"/>
    <rect x="5" y="10" width="2" height="1" fill="#302810"/>
    <rect x="25" y="10" width="2" height="1" fill="#302810"/>
    <!-- Face — mostly in deep shadow -->
    <rect x="10" y="4" width="12" height="1" fill="#1a1508"/>
    <rect x="9" y="5" width="14" height="1" fill="#1a1508"/>
    <rect x="9" y="6" width="14" height="1" fill="#1a1508"/>
    <rect x="9" y="7" width="14" height="1" fill="#1a1508"/>
    <rect x="10" y="8" width="12" height="1" fill="#1a1508"/>
    <!-- Eyes — piercing gold looking DOWN at player -->
    <rect x="11" y="5" width="3" height="2" fill="#ffd700"/>
    <rect x="18" y="5" width="3" height="2" fill="#ffd700"/>
    <!-- Pupils at bottom of eyes — looking DOWN -->
    <rect x="12" y="6" width="2" height="1" fill="#1a1508"/>
    <rect x="19" y="6" width="2" height="1" fill="#1a1508"/>
    <!-- Eye glow overlay -->
    <rect class="eye-glow" x="11" y="5" width="3" height="2" fill="#ffa000" opacity="0.35"/>
    <rect class="eye-glow" x="18" y="5" width="3" height="2" fill="#ffa000" opacity="0.35"/>
    <!-- Faint nose shadow -->
    <rect x="15" y="7" width="2" height="1" fill="#302810"/>
    <!-- Mouth — thin stern line in shadow -->
    <rect x="13" y="8" width="6" height="1" fill="#302810"/>
    <!-- Neck — dark -->
    <rect x="12" y="9" width="8" height="1" fill="#1a1508"/>
    <rect x="11" y="10" width="10" height="1" fill="#302810"/>
    <!-- Body — crouching lion, very dark -->
    <rect x="7" y="11" width="18" height="1" fill="#1a1508"/>
    <rect x="6" y="12" width="20" height="1" fill="#302810"/>
    <rect x="5" y="13" width="22" height="1" fill="#1a1508"/>
    <rect x="5" y="14" width="22" height="1" fill="#302810"/>
    <rect x="5" y="15" width="22" height="1" fill="#1a1508"/>
    <rect x="6" y="16" width="20" height="1" fill="#302810"/>
    <rect x="7" y="17" width="18" height="1" fill="#1a1508"/>
    <!-- Hieroglyph-like single pixels on body -->
    <rect x="10" y="13" width="1" height="1" fill="#504020"/>
    <rect x="12" y="14" width="1" height="1" fill="#504020"/>
    <rect x="11" y="15" width="1" height="1" fill="#504020"/>
    <rect x="20" y="13" width="1" height="1" fill="#504020"/>
    <rect x="19" y="14" width="1" height="1" fill="#504020"/>
    <rect x="21" y="15" width="1" height="1" fill="#504020"/>
    <rect x="15" y="14" width="1" height="1" fill="#806830"/>
    <rect x="16" y="15" width="1" height="1" fill="#504020"/>
    <rect x="15" y="16" width="1" height="1" fill="#504020"/>
    <!-- Small angular wings folded back -->
    <g class="wing-l">
      <rect x="3" y="11" width="2" height="1" fill="#302810"/>
      <rect x="2" y="12" width="2" height="1" fill="#1a1508"/>
      <rect x="1" y="13" width="3" height="1" fill="#302810"/>
      <rect x="2" y="14" width="2" height="1" fill="#1a1508"/>
      <rect x="3" y="15" width="1" height="1" fill="#302810"/>
    </g>
    <g class="wing-r">
      <rect x="27" y="11" width="2" height="1" fill="#302810"/>
      <rect x="28" y="12" width="2" height="1" fill="#1a1508"/>
      <rect x="28" y="13" width="3" height="1" fill="#302810"/>
      <rect x="28" y="14" width="2" height="1" fill="#1a1508"/>
      <rect x="28" y="15" width="1" height="1" fill="#302810"/>
    </g>
    <!-- Front paws — crouching -->
    <rect x="7" y="18" width="3" height="1" fill="#302810"/>
    <rect x="22" y="18" width="3" height="1" fill="#302810"/>
    <rect x="7" y="19" width="3" height="1" fill="#1a1508"/>
    <rect x="22" y="19" width="3" height="1" fill="#1a1508"/>
    <rect x="6" y="20" width="4" height="1" fill="#302810"/>
    <rect x="22" y="20" width="4" height="1" fill="#302810"/>
    <!-- Claws — faint gold -->
    <rect x="6" y="21" width="1" height="1" fill="#504020"/>
    <rect x="8" y="21" width="1" height="1" fill="#504020"/>
    <rect x="23" y="21" width="1" height="1" fill="#504020"/>
    <rect x="25" y="21" width="1" height="1" fill="#504020"/>
    <!-- Back legs -->
    <rect x="12" y="18" width="3" height="1" fill="#1a1508"/>
    <rect x="17" y="18" width="3" height="1" fill="#1a1508"/>
    <rect x="12" y="19" width="3" height="1" fill="#302810"/>
    <rect x="17" y="19" width="3" height="1" fill="#302810"/>
    <!-- Tail — curving up, dark -->
    <rect x="25" y="16" width="1" height="1" fill="#302810"/>
    <rect x="26" y="15" width="1" height="1" fill="#1a1508"/>
    <rect x="27" y="14" width="1" height="1" fill="#302810"/>
    <rect x="28" y="13" width="1" height="1" fill="#1a1508"/>
    <rect x="29" y="12" width="1" height="1" fill="#504020"/>
  </svg>`,

  alchimiste: `<svg class="boss-pixel" viewBox="0 0 32 28" shape-rendering="crispEdges">
    <!-- Cork -->
    <rect x="13" y="0" width="6" height="1" fill="#8B4513"/>
    <rect x="12" y="1" width="8" height="1" fill="#A0522D"/>
    <rect x="13" y="2" width="6" height="1" fill="#8B4513"/>
    <!-- Flask neck -->
    <rect x="14" y="3" width="4" height="1" fill="#1a3a3a"/>
    <rect x="14" y="4" width="1" height="1" fill="#2a6a6a"/>
    <rect x="15" y="4" width="2" height="1" fill="#00ffaa"/>
    <rect x="17" y="4" width="1" height="1" fill="#2a6a6a"/>
    <rect x="13" y="5" width="1" height="1" fill="#1a3a3a"/>
    <rect x="14" y="5" width="1" height="1" fill="#2a6a6a"/>
    <rect x="15" y="5" width="2" height="1" fill="#ff00ff"/>
    <rect x="17" y="5" width="1" height="1" fill="#2a6a6a"/>
    <rect x="18" y="5" width="1" height="1" fill="#1a3a3a"/>
    <!-- Flask shoulder -->
    <rect x="12" y="6" width="1" height="1" fill="#1a3a3a"/>
    <rect x="13" y="6" width="1" height="1" fill="#2a6a6a"/>
    <rect x="14" y="6" width="4" height="1" fill="#ffff00"/>
    <rect x="18" y="6" width="1" height="1" fill="#2a6a6a"/>
    <rect x="19" y="6" width="1" height="1" fill="#1a3a3a"/>
    <rect x="11" y="7" width="1" height="1" fill="#1a3a3a"/>
    <rect x="12" y="7" width="1" height="1" fill="#2a6a6a"/>
    <rect x="13" y="7" width="6" height="1" fill="#00ffff"/>
    <rect x="19" y="7" width="1" height="1" fill="#2a6a6a"/>
    <rect x="20" y="7" width="1" height="1" fill="#1a3a3a"/>
    <!-- Flask body widening with neon swirls -->
    <rect x="10" y="8" width="1" height="1" fill="#1a3a3a"/>
    <rect x="11" y="8" width="1" height="1" fill="#2a6a6a"/>
    <rect x="12" y="8" width="8" height="1" fill="#00ffaa"/>
    <rect x="20" y="8" width="1" height="1" fill="#2a6a6a"/>
    <rect x="21" y="8" width="1" height="1" fill="#1a3a3a"/>
    <!-- Eyes row — mismatched: magenta left, cyan right -->
    <rect x="9" y="9" width="1" height="1" fill="#1a3a3a"/>
    <rect x="10" y="9" width="1" height="1" fill="#2a6a6a"/>
    <rect x="11" y="9" width="3" height="2" fill="#ff00ff"/>
    <rect x="14" y="9" width="4" height="1" fill="#ffff00"/>
    <rect x="18" y="9" width="3" height="2" fill="#00ffff"/>
    <rect x="21" y="9" width="1" height="1" fill="#2a6a6a"/>
    <rect x="22" y="9" width="1" height="1" fill="#1a3a3a"/>
    <!-- Pupils DOWN -->
    <rect x="12" y="10" width="2" height="1" fill="#1a0a1a"/>
    <rect x="19" y="10" width="2" height="1" fill="#1a0a1a"/>
    <rect class="eye-glow" x="11" y="9" width="3" height="2" fill="#ff00ff" opacity="0.3"/>
    <rect class="eye-glow" x="18" y="9" width="3" height="2" fill="#00ffff" opacity="0.3"/>
    <!-- Mouth -->
    <rect x="8" y="11" width="1" height="1" fill="#1a3a3a"/>
    <rect x="9" y="11" width="14" height="1" fill="#1a3a3a"/>
    <rect x="23" y="11" width="1" height="1" fill="#1a3a3a"/>
    <rect x="12" y="11" width="1" height="1" fill="#ff00ff"/>
    <rect x="15" y="11" width="2" height="1" fill="#00ffaa"/>
    <rect x="19" y="11" width="1" height="1" fill="#00ffff"/>
    <!-- Swirling neon body -->
    <rect x="7" y="12" width="1" height="1" fill="#1a3a3a"/>
    <rect x="8" y="12" width="2" height="1" fill="#ff00ff"/>
    <rect x="10" y="12" width="2" height="1" fill="#00ffaa"/>
    <rect x="12" y="12" width="2" height="1" fill="#ffff00"/>
    <rect x="14" y="12" width="2" height="1" fill="#00ffff"/>
    <rect x="16" y="12" width="2" height="1" fill="#ff00ff"/>
    <rect x="18" y="12" width="2" height="1" fill="#00ffaa"/>
    <rect x="20" y="12" width="2" height="1" fill="#ffff00"/>
    <rect x="22" y="12" width="2" height="1" fill="#2a6a6a"/>
    <rect x="24" y="12" width="1" height="1" fill="#1a3a3a"/>
    <rect x="7" y="13" width="1" height="1" fill="#1a3a3a"/>
    <rect x="8" y="13" width="2" height="1" fill="#00ffff"/>
    <rect x="10" y="13" width="2" height="1" fill="#ffff00"/>
    <rect x="12" y="13" width="2" height="1" fill="#ff00ff"/>
    <rect x="14" y="13" width="2" height="1" fill="#00ffaa"/>
    <rect x="16" y="13" width="2" height="1" fill="#ffff00"/>
    <rect x="18" y="13" width="2" height="1" fill="#00ffff"/>
    <rect x="20" y="13" width="2" height="1" fill="#ff00ff"/>
    <rect x="22" y="13" width="2" height="1" fill="#2a6a6a"/>
    <rect x="24" y="13" width="1" height="1" fill="#1a3a3a"/>
    <rect x="7" y="14" width="1" height="1" fill="#1a3a3a"/>
    <rect x="8" y="14" width="2" height="1" fill="#ff00ff"/>
    <rect x="10" y="14" width="2" height="1" fill="#00ffaa"/>
    <rect x="12" y="14" width="2" height="1" fill="#00ffff"/>
    <rect x="14" y="14" width="2" height="1" fill="#ffff00"/>
    <rect x="16" y="14" width="2" height="1" fill="#ff00ff"/>
    <rect x="18" y="14" width="2" height="1" fill="#00ffaa"/>
    <rect x="20" y="14" width="2" height="1" fill="#00ffff"/>
    <rect x="22" y="14" width="2" height="1" fill="#2a6a6a"/>
    <rect x="24" y="14" width="1" height="1" fill="#1a3a3a"/>
    <!-- Bottom rows -->
    <rect x="7" y="15" width="18" height="1" fill="#1a3a3a"/>
    <rect x="8" y="15" width="16" height="1" fill="#2a6a6a"/>
    <rect x="9" y="15" width="2" height="1" fill="#ffff00"/>
    <rect x="13" y="15" width="2" height="1" fill="#ff00ff"/>
    <rect x="17" y="15" width="2" height="1" fill="#00ffaa"/>
    <rect x="21" y="15" width="2" height="1" fill="#00ffff"/>
    <rect x="8" y="16" width="16" height="1" fill="#1a3a3a"/>
    <rect x="9" y="16" width="14" height="1" fill="#2a6a6a"/>
    <rect x="10" y="16" width="2" height="1" fill="#00ffff"/>
    <rect x="14" y="16" width="2" height="1" fill="#ffff00"/>
    <rect x="18" y="16" width="2" height="1" fill="#ff00ff"/>
    <rect x="9" y="17" width="14" height="1" fill="#1a3a3a"/>
    <rect x="10" y="17" width="12" height="1" fill="#2a6a6a"/>
    <!-- Base -->
    <rect x="8" y="18" width="16" height="1" fill="#1a3a3a"/>
    <rect x="9" y="19" width="14" height="1" fill="#2a6a6a"/>
    <!-- Animated bubbles -->
    <g class="bubble">
      <rect x="11" y="13" width="1" height="1" fill="#ffff00" opacity="0.8"/>
      <rect x="20" y="12" width="1" height="1" fill="#00ffff" opacity="0.8"/>
    </g>
    <g class="bubble" style="animation-delay:0.6s">
      <rect x="5" y="7" width="1" height="1" fill="#ff00ff" opacity="0.7"/>
      <rect x="26" y="5" width="1" height="1" fill="#00ffff" opacity="0.7"/>
    </g>
    <g class="bubble" style="animation-delay:1.2s">
      <rect x="3" y="3" width="1" height="1" fill="#00ffaa" opacity="0.5"/>
      <rect x="28" y="2" width="1" height="1" fill="#ffff00" opacity="0.5"/>
    </g>
    <!-- Dripping neon liquid -->
    <g class="fire-breath">
      <rect x="11" y="20" width="1" height="1" fill="#00ffaa" opacity="0.8"/>
      <rect x="15" y="20" width="1" height="1" fill="#ff00ff" opacity="0.8"/>
      <rect x="15" y="21" width="1" height="1" fill="#ff00ff" opacity="0.5"/>
      <rect x="19" y="20" width="1" height="1" fill="#ffff00" opacity="0.8"/>
      <rect x="19" y="21" width="1" height="1" fill="#ffff00" opacity="0.4"/>
    </g>
  </svg>`,

  kraken: `<svg class="boss-pixel" viewBox="0 0 32 28" shape-rendering="crispEdges">
    <!-- Head — massive abyssal dome -->
    <rect x="13" y="0" width="6" height="1" fill="#151540"/>
    <rect x="11" y="1" width="10" height="1" fill="#0a0a20"/>
    <rect x="10" y="2" width="12" height="1" fill="#151540"/>
    <rect x="9" y="3" width="14" height="1" fill="#0a0a20"/>
    <rect x="8" y="4" width="16" height="1" fill="#151540"/>
    <rect x="8" y="5" width="16" height="1" fill="#0a0a20"/>
    <rect x="8" y="6" width="16" height="1" fill="#151540"/>
    <rect x="8" y="7" width="16" height="1" fill="#0a0a20"/>
    <rect x="9" y="8" width="14" height="1" fill="#151540"/>
    <rect x="10" y="9" width="12" height="1" fill="#0a0a20"/>
    <!-- Bioluminescent spots on dome -->
    <g class="sparkle">
      <rect x="14" y="2" width="1" height="1" fill="#00ccff" opacity="0.8"/>
    </g>
    <g class="sparkle" style="animation-delay: 0.5s">
      <rect x="18" y="3" width="1" height="1" fill="#00ffaa" opacity="0.7"/>
    </g>
    <g class="sparkle" style="animation-delay: 1.0s">
      <rect x="11" y="4" width="1" height="1" fill="#0066ff" opacity="0.8"/>
    </g>
    <g class="sparkle" style="animation-delay: 1.5s">
      <rect x="20" y="5" width="1" height="1" fill="#00ccff" opacity="0.6"/>
    </g>
    <!-- Eyes — piercing cyan, looking DOWN at player -->
    <rect x="10" y="6" width="3" height="2" fill="#00ffff"/>
    <rect x="19" y="6" width="3" height="2" fill="#00ffff"/>
    <rect x="11" y="7" width="2" height="1" fill="#0a0a20"/>
    <rect x="20" y="7" width="2" height="1" fill="#0a0a20"/>
    <rect class="eye-glow" x="10" y="6" width="3" height="2" fill="#00ffff" opacity="0.5"/>
    <rect class="eye-glow" x="19" y="6" width="3" height="2" fill="#00ffff" opacity="0.5"/>
    <!-- Beak / maw -->
    <rect x="13" y="8" width="6" height="1" fill="#202060"/>
    <rect x="14" y="9" width="4" height="1" fill="#0a0a20"/>
    <rect x="14" y="8" width="1" height="1" fill="#00ccff" opacity="0.4"/>
    <rect x="17" y="8" width="1" height="1" fill="#00ccff" opacity="0.4"/>
    <!-- Body mass -->
    <rect x="10" y="10" width="12" height="1" fill="#151540"/>
    <rect x="9" y="11" width="14" height="1" fill="#0a0a20"/>
    <rect x="10" y="12" width="12" height="1" fill="#151540"/>
    <!-- Tentacle 1 — left outer (longest) -->
    <g class="tentacle">
      <rect x="6" y="8" width="2" height="1" fill="#0a0a20"/>
      <rect x="5" y="9" width="2" height="1" fill="#151540"/>
      <rect x="4" y="10" width="2" height="1" fill="#0a0a20"/>
      <rect x="3" y="11" width="2" height="1" fill="#151540"/>
      <rect x="2" y="12" width="2" height="2" fill="#0a0a20"/>
      <rect x="1" y="14" width="2" height="2" fill="#151540"/>
      <rect x="0" y="16" width="2" height="2" fill="#0a0a20"/>
      <rect x="0" y="18" width="1" height="1" fill="#4040ff"/>
      <!-- Suction cups -->
      <rect x="5" y="10" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="3" y="12" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="2" y="15" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="1" y="17" width="1" height="1" fill="#202060" opacity="0.7"/>
    </g>
    <!-- Tentacle 2 — left medium -->
    <g class="tentacle-2">
      <rect x="8" y="12" width="2" height="1" fill="#0a0a20"/>
      <rect x="7" y="13" width="2" height="1" fill="#151540"/>
      <rect x="6" y="14" width="2" height="2" fill="#0a0a20"/>
      <rect x="5" y="16" width="2" height="2" fill="#151540"/>
      <rect x="4" y="18" width="2" height="1" fill="#0a0a20"/>
      <rect x="4" y="19" width="1" height="1" fill="#4040ff"/>
      <!-- Suction cups -->
      <rect x="8" y="13" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="7" y="15" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="6" y="17" width="1" height="1" fill="#202060" opacity="0.7"/>
    </g>
    <!-- Tentacle 3 — left center (short) -->
    <g class="tentacle">
      <rect x="12" y="13" width="2" height="1" fill="#0a0a20"/>
      <rect x="11" y="14" width="2" height="1" fill="#151540"/>
      <rect x="11" y="15" width="2" height="2" fill="#0a0a20"/>
      <rect x="11" y="17" width="1" height="1" fill="#4040ff"/>
      <!-- Suction cups -->
      <rect x="12" y="15" width="1" height="1" fill="#202060" opacity="0.7"/>
    </g>
    <!-- Tentacle 4 — right center (short) -->
    <g class="tentacle-2">
      <rect x="18" y="13" width="2" height="1" fill="#0a0a20"/>
      <rect x="19" y="14" width="2" height="1" fill="#151540"/>
      <rect x="19" y="15" width="2" height="2" fill="#0a0a20"/>
      <rect x="20" y="17" width="1" height="1" fill="#4040ff"/>
      <!-- Suction cups -->
      <rect x="19" y="15" width="1" height="1" fill="#202060" opacity="0.7"/>
    </g>
    <!-- Tentacle 5 — right medium -->
    <g class="tentacle">
      <rect x="22" y="12" width="2" height="1" fill="#0a0a20"/>
      <rect x="23" y="13" width="2" height="1" fill="#151540"/>
      <rect x="24" y="14" width="2" height="2" fill="#0a0a20"/>
      <rect x="25" y="16" width="2" height="2" fill="#151540"/>
      <rect x="26" y="18" width="2" height="1" fill="#0a0a20"/>
      <rect x="27" y="19" width="1" height="1" fill="#4040ff"/>
      <!-- Suction cups -->
      <rect x="23" y="13" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="24" y="15" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="25" y="17" width="1" height="1" fill="#202060" opacity="0.7"/>
    </g>
    <!-- Tentacle 6 — right outer (longest) -->
    <g class="tentacle-2">
      <rect x="24" y="8" width="2" height="1" fill="#0a0a20"/>
      <rect x="25" y="9" width="2" height="1" fill="#151540"/>
      <rect x="26" y="10" width="2" height="1" fill="#0a0a20"/>
      <rect x="27" y="11" width="2" height="1" fill="#151540"/>
      <rect x="28" y="12" width="2" height="2" fill="#0a0a20"/>
      <rect x="29" y="14" width="2" height="2" fill="#151540"/>
      <rect x="30" y="16" width="2" height="2" fill="#0a0a20"/>
      <rect x="31" y="18" width="1" height="1" fill="#4040ff"/>
      <!-- Suction cups -->
      <rect x="26" y="10" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="28" y="12" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="29" y="15" width="1" height="1" fill="#202060" opacity="0.7"/>
      <rect x="30" y="17" width="1" height="1" fill="#202060" opacity="0.7"/>
    </g>
  </svg>`

};
