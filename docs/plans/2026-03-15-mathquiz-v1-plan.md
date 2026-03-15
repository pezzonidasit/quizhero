# MathQuiz V1 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static math quiz web app for a 10-year-old (CM2) with 6 question categories, adaptive difficulty, gamification (score, streak, badges), dark theme with animations.

**Architecture:** Single-page app with 3 screens (Accueil, Jeu, Fin). Questions generated algorithmically in JS + artisanal riddle bank in JSON. State persisted in localStorage. Zero dependencies — vanilla HTML/CSS/JS only.

**Tech Stack:** HTML5, CSS3 (animations, grid, flexbox), Vanilla JS (ES6+), localStorage

**Design doc:** `docs/plans/2026-03-15-math-quiz-design.md`

---

### Task 1: Project skeleton + HTML structure

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/questions.js`
- Create: `js/app.js`

**Step 1: Create `index.html` with all 3 screens**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mathématiques & Énigmes</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- ÉCRAN ACCUEIL -->
  <div id="screen-home" class="screen active">
    <h1>Mathématiques &amp; Énigmes</h1>

    <div class="settings-card">
      <div class="setting-group">
        <label>Catégorie</label>
        <div class="pill-group" data-setting="category">
          <button class="pill active" data-value="all">Toutes</button>
          <button class="pill" data-value="calcul">Calcul</button>
          <button class="pill" data-value="logique">Logique</button>
          <button class="pill" data-value="geometrie">Géométrie</button>
          <button class="pill" data-value="fractions">Fractions</button>
          <button class="pill" data-value="mesures">Mesures</button>
          <button class="pill" data-value="ouvert">Problèmes ouverts</button>
        </div>
      </div>

      <div class="setting-group">
        <label>Difficulté</label>
        <div class="pill-group" data-setting="difficulty">
          <button class="pill" data-value="easy">Facile</button>
          <button class="pill active" data-value="medium">Moyen</button>
          <button class="pill" data-value="hard">Difficile</button>
        </div>
      </div>

      <div class="setting-group">
        <label>Questions</label>
        <div class="pill-group" data-setting="count">
          <button class="pill active" data-value="5">5</button>
          <button class="pill" data-value="10">10</button>
          <button class="pill" data-value="20">20</button>
        </div>
      </div>

      <div class="setting-group">
        <label class="toggle-label">
          <span>Chronomètre</span>
          <input type="checkbox" id="timer-toggle">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <button id="btn-play" class="btn-primary">Jouer !</button>

    <div id="records-display" class="records-section">
      <!-- Filled by JS -->
    </div>
  </div>

  <!-- ÉCRAN JEU -->
  <div id="screen-game" class="screen">
    <div class="game-header">
      <div class="stat">
        <span class="stat-label">Question</span>
        <span id="question-counter" class="stat-value">1 / 5</span>
      </div>
      <div class="stat">
        <span class="stat-label">Score</span>
        <span id="score-display" class="stat-value">0</span>
      </div>
      <div class="stat">
        <span class="stat-label">Série</span>
        <span id="streak-display" class="stat-value">0 <span id="streak-flame"></span></span>
      </div>
      <div class="stat" id="timer-stat" style="display:none">
        <span class="stat-label">Temps</span>
        <span id="timer-display" class="stat-value">0:00</span>
      </div>
    </div>

    <div id="question-card" class="question-card">
      <span id="category-badge" class="category-badge">Calcul</span>
      <p id="question-text" class="question-text"></p>
      <p id="question-unit" class="question-unit"></p>

      <button id="btn-hint" class="btn-hint">Afficher l'indice</button>
      <p id="hint-text" class="hint-text"></p>

      <div id="answer-section" class="answer-section">
        <input type="number" id="answer-input" class="answer-input" placeholder="Ta réponse...">
        <button id="btn-validate" class="btn-primary">Valider</button>
      </div>

      <div id="feedback-section" class="feedback-section" style="display:none">
        <p id="feedback-result" class="feedback-result"></p>
        <p id="feedback-explanation" class="feedback-explanation"></p>
        <button id="btn-next" class="btn-primary">Suivant</button>
      </div>
    </div>
  </div>

  <!-- ÉCRAN FIN -->
  <div id="screen-end" class="screen">
    <h2>Partie terminée !</h2>
    <div id="final-score" class="final-score"></div>
    <div id="new-record" class="new-record" style="display:none">🏆 Nouveau record !</div>
    <div id="badges-unlocked" class="badges-unlocked"></div>
    <div class="end-buttons">
      <button id="btn-replay" class="btn-primary">Rejouer</button>
      <button id="btn-menu" class="btn-secondary">Menu</button>
    </div>
  </div>

  <canvas id="confetti-canvas"></canvas>

  <script src="js/questions.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

**Step 2: Create empty `css/style.css`, `js/questions.js`, `js/app.js`**

Create placeholder files so the HTML loads without errors.

**Step 3: Verify in browser**

Open `index.html` in browser. Should show raw unstyled HTML with all 3 screens visible (no CSS yet to hide them). No JS errors in console.

**Step 4: Commit**

```bash
git add MathQuiz/index.html MathQuiz/css/style.css MathQuiz/js/questions.js MathQuiz/js/app.js
git commit -m "feat(mathquiz): project skeleton with HTML structure for 3 screens"
```

---

### Task 2: Dark theme CSS + responsive layout

**Files:**
- Modify: `css/style.css`

**Step 1: Write the full CSS**

Core design tokens and layout:

```css
/* === DESIGN TOKENS === */
:root {
  --bg-dark: #1a1a2e;
  --bg-card: #25253e;
  --bg-card-hover: #2d2d4e;
  --text-primary: #e8e8f0;
  --text-secondary: #a0a0b8;
  --accent-blue: #4a9eff;
  --accent-green: #4ecdc4;
  --accent-orange: #ff8c42;
  --accent-violet: #a855f7;
  --accent-red: #ff6b6b;
  --accent-yellow: #ffd93d;
  --success: #4ecdc4;
  --error: #ff6b6b;
  --radius: 12px;
  --radius-sm: 8px;
  --transition: 0.3s ease;

  /* Category colors */
  --cat-calcul: var(--accent-blue);
  --cat-logique: var(--accent-green);
  --cat-geometrie: var(--accent-orange);
  --cat-fractions: var(--accent-violet);
  --cat-mesures: var(--accent-red);
  --cat-ouvert: var(--accent-yellow);
}

/* === RESET & BASE === */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* === SCREENS === */
.screen { display: none; width: 100%; max-width: 500px; flex-direction: column; align-items: center; gap: 24px; }
.screen.active { display: flex; }

/* === TYPOGRAPHY === */
h1 { font-size: 1.8rem; font-weight: 700; text-align: center; }
h2 { font-size: 1.5rem; font-weight: 700; text-align: center; }

/* === SETTINGS CARD === */
.settings-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* === PILL BUTTONS === */
.pill-group { display: flex; flex-wrap: wrap; gap: 8px; }

.pill {
  background: var(--bg-dark);
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition);
}
.pill:hover { background: var(--bg-card-hover); color: var(--text-primary); }
.pill.active { background: var(--accent-blue); color: #fff; border-color: var(--accent-blue); }

/* === TOGGLE === */
.toggle-label {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-transform: none !important;
  font-size: 1rem !important;
  color: var(--text-primary) !important;
}
.toggle-label input { display: none; }
.toggle-slider {
  width: 48px; height: 26px;
  background: var(--bg-dark);
  border-radius: 13px;
  position: relative;
  transition: background var(--transition);
}
.toggle-slider::after {
  content: '';
  position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  background: var(--text-secondary);
  border-radius: 50%;
  transition: all var(--transition);
}
.toggle-label input:checked + .toggle-slider { background: var(--accent-blue); }
.toggle-label input:checked + .toggle-slider::after { left: 25px; background: #fff; }

/* === BUTTONS === */
.btn-primary {
  background: var(--accent-blue);
  color: #fff;
  border: none;
  padding: 14px 32px;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  min-height: 48px;
}
.btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
  padding: 14px 32px;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all var(--transition);
  min-height: 48px;
}
.btn-secondary:hover { background: var(--bg-card-hover); }

/* === GAME HEADER === */
.game-header {
  display: flex;
  justify-content: space-around;
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
}
.stat { text-align: center; }
.stat-label { display: block; font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; }
.stat-value { display: block; font-size: 1.4rem; font-weight: 700; margin-top: 4px; }

/* === QUESTION CARD === */
.question-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-badge {
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: var(--cat-calcul);
}
.category-badge[data-cat="calcul"]    { background: var(--cat-calcul); }
.category-badge[data-cat="logique"]   { background: var(--cat-logique); }
.category-badge[data-cat="geometrie"] { background: var(--cat-geometrie); }
.category-badge[data-cat="fractions"] { background: var(--cat-fractions); }
.category-badge[data-cat="mesures"]   { background: var(--cat-mesures); }
.category-badge[data-cat="ouvert"]    { background: var(--cat-ouvert); }

.question-text { font-size: 1.15rem; line-height: 1.6; }
.question-unit { font-size: 0.85rem; color: var(--text-secondary); }

/* === HINT === */
.btn-hint {
  background: none;
  border: 1px solid var(--text-secondary);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  align-self: flex-start;
  transition: all var(--transition);
}
.btn-hint:hover { border-color: var(--accent-yellow); color: var(--accent-yellow); }
.btn-hint.used { border-color: var(--accent-yellow); color: var(--accent-yellow); cursor: default; }
.hint-text { color: var(--accent-yellow); font-style: italic; display: none; }
.hint-text.visible { display: block; }

/* === ANSWER === */
.answer-section { display: flex; gap: 12px; align-items: center; }
.answer-input {
  flex: 1;
  background: var(--bg-dark);
  border: 2px solid transparent;
  color: var(--text-primary);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  outline: none;
  transition: border-color var(--transition);
}
.answer-input:focus { border-color: var(--accent-blue); }

/* === FEEDBACK === */
.feedback-section { display: flex; flex-direction: column; gap: 12px; }
.feedback-result { font-size: 1.2rem; font-weight: 700; }
.feedback-result.correct { color: var(--success); }
.feedback-result.incorrect { color: var(--error); }
.feedback-explanation { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; }

/* === END SCREEN === */
.final-score { font-size: 3rem; font-weight: 700; color: var(--accent-blue); }
.new-record { font-size: 1.3rem; color: var(--accent-yellow); font-weight: 600; }
.badges-unlocked { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.badge-card {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  text-align: center;
  font-size: 0.85rem;
}
.badge-card .badge-icon { font-size: 1.5rem; display: block; margin-bottom: 4px; }
.end-buttons { display: flex; gap: 12px; }

/* === RECORDS SECTION === */
.records-section {
  width: 100%;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px;
}
.records-section h3 { font-size: 1rem; margin-bottom: 12px; color: var(--text-secondary); }
.record-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; }
.record-row .record-value { color: var(--accent-blue); font-weight: 600; }

/* === CONFETTI CANVAS === */
#confetti-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1000;
}

/* === ANIMATIONS === */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
.shake { animation: shake 0.5s ease; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-in { animation: slideIn 0.4s ease; }

@keyframes popIn {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
.pop-in { animation: popIn 0.5s ease; }

@keyframes flamePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* Streak flame sizes */
.flame-small::after  { content: '🔥'; font-size: 1rem; }
.flame-medium::after { content: '🔥'; font-size: 1.4rem; animation: flamePulse 0.8s infinite; }
.flame-big::after    { content: '🔥🔥'; font-size: 1.2rem; animation: flamePulse 0.6s infinite; }
.flame-ultra::after  { content: '🔥🔥🔥'; font-size: 1.1rem; animation: flamePulse 0.4s infinite; }

/* === RESPONSIVE === */
@media (max-width: 480px) {
  body { padding: 12px; }
  h1 { font-size: 1.4rem; }
  .settings-card { padding: 16px; }
  .pill { padding: 6px 12px; font-size: 0.8rem; }
  .game-header { padding: 12px; gap: 8px; }
  .stat-value { font-size: 1.1rem; }
  .question-text { font-size: 1rem; }
}
```

**Step 2: Verify in browser**

Open `index.html`. Should show dark-themed home screen with styled pill selectors, toggle, and "Jouer !" button. Only home screen visible (others hidden). Check mobile view at 375px width.

**Step 3: Commit**

```bash
git add MathQuiz/css/style.css
git commit -m "feat(mathquiz): dark theme CSS with responsive layout and animations"
```

---

### Task 3: Question engine — all 6 category generators

**Files:**
- Modify: `js/questions.js`

**Step 1: Write the question generator engine**

Each generator function takes a `subLevel` (1-3) and returns `{ category, text, unit, answer, hint, explanation }`.

```javascript
// js/questions.js — Question generation engine

const CATEGORIES = {
  calcul:    { label: 'Calcul',           color: 'calcul' },
  logique:   { label: 'Logique',          color: 'logique' },
  geometrie: { label: 'Géométrie',        color: 'geometrie' },
  fractions: { label: 'Fractions',        color: 'fractions' },
  mesures:   { label: 'Mesures',          color: 'mesures' },
  ouvert:    { label: 'Problèmes ouverts', color: 'ouvert' },
};

// --- Utility ---
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- CALCUL ---
function generateCalcul(subLevel) {
  const contexts = [
    { item: 'livres', place: 'bibliothèque', container: 'étagère', containerPlural: 'étagères' },
    { item: 'pommes', place: 'marché', container: 'caisse', containerPlural: 'caisses' },
    { item: 'billes', place: 'cour de récréation', container: 'sac', containerPlural: 'sacs' },
    { item: 'bonbons', place: 'confiserie', container: 'boîte', containerPlural: 'boîtes' },
    { item: 'crayons', place: 'papeterie', container: 'paquet', containerPlural: 'paquets' },
    { item: 'fleurs', place: 'jardin', container: 'rangée', containerPlural: 'rangées' },
  ];
  const ctx = pick(contexts);

  if (subLevel <= 1) {
    // Simple: multiplication + addition or subtraction
    const n = rand(3, 6);
    const perUnit = rand(5, 15);
    const extra = rand(1, 20);
    const add = Math.random() > 0.5;
    const total = add ? n * perUnit + extra : n * perUnit - extra;
    const op = add ? `On en ajoute ${extra}` : `On en retire ${extra}`;
    return {
      category: 'calcul',
      text: `Une ${ctx.place} a ${n} ${ctx.containerPlural}. Chaque ${ctx.container} contient ${perUnit} ${ctx.item}. ${op}. Combien de ${ctx.item} y a-t-il au total ?`,
      unit: ctx.item,
      answer: total,
      hint: `Calcule d'abord ${n} × ${perUnit}, puis ${add ? 'ajoute' : 'retire'} ${extra}.`,
      explanation: `${n} × ${perUnit} = ${n * perUnit}, ${add ? '+' : '−'} ${extra} = ${total}.`,
    };
  } else if (subLevel <= 2) {
    // Medium: two operations
    const n1 = rand(4, 8);
    const per1 = rand(10, 25);
    const n2 = rand(2, 5);
    const per2 = rand(5, 15);
    const total = n1 * per1 + n2 * per2;
    return {
      category: 'calcul',
      text: `Au ${ctx.place}, il y a ${n1} ${ctx.containerPlural} de ${per1} ${ctx.item} et ${n2} ${ctx.containerPlural} de ${per2} ${ctx.item}. Combien de ${ctx.item} en tout ?`,
      unit: ctx.item,
      answer: total,
      hint: `Calcule chaque groupe séparément, puis additionne.`,
      explanation: `${n1} × ${per1} = ${n1 * per1}, ${n2} × ${per2} = ${n2 * per2}. Total = ${n1 * per1} + ${n2 * per2} = ${total}.`,
    };
  } else {
    // Hard: three steps
    const initial = rand(100, 300);
    const given = rand(20, 60);
    const received = rand(30, 80);
    const lost = rand(5, 25);
    const answer = initial - given + received - lost;
    return {
      category: 'calcul',
      text: `Tu as ${initial} ${ctx.item}. Tu en donnes ${given} à un ami, tu en reçois ${received} de ta ${ctx.container}, puis tu en perds ${lost}. Combien t'en reste-t-il ?`,
      unit: ctx.item,
      answer: answer,
      hint: `Fais les opérations dans l'ordre : −${given}, +${received}, −${lost}.`,
      explanation: `${initial} − ${given} = ${initial - given}, + ${received} = ${initial - given + received}, − ${lost} = ${answer}.`,
    };
  }
}

// --- LOGIQUE ---
function generateLogique(subLevel) {
  const templates = [];

  // Suite numérique
  if (subLevel <= 1) {
    const start = rand(2, 10);
    const step = rand(2, 5);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const answer = start + 4 * step;
    templates.push({
      text: `Quelle est la suite logique ? ${seq.join(', ')}, ?`,
      unit: '',
      answer,
      hint: `Regarde la différence entre chaque nombre.`,
      explanation: `On ajoute ${step} à chaque fois. ${seq[3]} + ${step} = ${answer}.`,
    });
  } else if (subLevel <= 2) {
    const start = rand(1, 5);
    const factor = rand(2, 3);
    const seq = [start, start * factor, start * factor ** 2, start * factor ** 3];
    const answer = start * factor ** 4;
    templates.push({
      text: `Quelle est la suite logique ? ${seq.join(', ')}, ?`,
      unit: '',
      answer,
      hint: `Chaque nombre est multiplié par le même chiffre.`,
      explanation: `On multiplie par ${factor} à chaque fois. ${seq[3]} × ${factor} = ${answer}.`,
    });
  } else {
    const a = rand(1, 5);
    const b = rand(2, 4);
    // alternating +a, *b pattern
    const s0 = rand(2, 6);
    const s1 = s0 + a;
    const s2 = s1 * b;
    const s3 = s2 + a;
    const answer = s3 * b;
    templates.push({
      text: `Quelle est la suite logique ? ${s0}, ${s1}, ${s2}, ${s3}, ?`,
      unit: '',
      answer,
      hint: `Les opérations alternent entre +${a} et ×${b}.`,
      explanation: `+${a} → ${s1}, ×${b} → ${s2}, +${a} → ${s3}, ×${b} → ${answer}.`,
    });
  }

  // Qui suis-je
  const n = rand(10, 50);
  const double = n * 2;
  const half = Math.floor(n / 2);
  if (n % 2 === 0) {
    templates.push({
      text: `Je suis un nombre. Mon double est ${double} et ma moitié est ${half}. Qui suis-je ?`,
      unit: '',
      answer: n,
      hint: `Divise ${double} par 2.`,
      explanation: `${double} ÷ 2 = ${n}, et ${n} ÷ 2 = ${half}. ✓`,
    });
  }

  return { category: 'logique', ...pick(templates) };
}

// --- GÉOMÉTRIE ---
function generateGeometrie(subLevel) {
  if (subLevel <= 1) {
    // Périmètre rectangle
    const l = rand(3, 15);
    const w = rand(2, 10);
    const answer = 2 * (l + w);
    return {
      category: 'geometrie',
      text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quel est son périmètre ?`,
      unit: 'cm',
      answer,
      hint: `Périmètre = 2 × (longueur + largeur).`,
      explanation: `2 × (${l} + ${w}) = 2 × ${l + w} = ${answer} cm.`,
    };
  } else if (subLevel <= 2) {
    // Aire rectangle
    const l = rand(4, 12);
    const w = rand(3, 10);
    const answer = l * w;
    return {
      category: 'geometrie',
      text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quelle est son aire ?`,
      unit: 'cm²',
      answer,
      hint: `Aire = longueur × largeur.`,
      explanation: `${l} × ${w} = ${answer} cm².`,
    };
  } else {
    // Aire composée : rectangle + carré collé
    const l = rand(5, 10);
    const w = rand(3, 8);
    const side = rand(2, Math.min(w, 5));
    const answer = l * w + side * side;
    return {
      category: 'geometrie',
      text: `Une forme est composée d'un rectangle de ${l} cm × ${w} cm avec un carré de ${side} cm collé dessus. Quelle est l'aire totale ?`,
      unit: 'cm²',
      answer,
      hint: `Calcule l'aire du rectangle et du carré séparément, puis additionne.`,
      explanation: `Rectangle : ${l} × ${w} = ${l * w}. Carré : ${side} × ${side} = ${side * side}. Total : ${l * w} + ${side * side} = ${answer} cm².`,
    };
  }
}

// --- FRACTIONS ---
function generateFractions(subLevel) {
  if (subLevel <= 1) {
    // Parts de pizza
    const total = pick([4, 6, 8]);
    const eaten = rand(1, total - 1);
    const answer = total - eaten;
    return {
      category: 'fractions',
      text: `Une pizza est coupée en ${total} parts égales. Tu en manges ${eaten}. Combien de parts reste-t-il ?`,
      unit: 'parts',
      answer,
      hint: `Soustrais les parts mangées du total.`,
      explanation: `${total} − ${eaten} = ${answer} parts.`,
    };
  } else if (subLevel <= 2) {
    // Fraction d'un nombre
    const denom = pick([2, 3, 4, 5]);
    const num = 1;
    const whole = denom * rand(3, 10);
    const answer = whole / denom;
    return {
      category: 'fractions',
      text: `Combien vaut ${num}/${denom} de ${whole} ?`,
      unit: '',
      answer,
      hint: `Divise ${whole} par ${denom}.`,
      explanation: `${whole} ÷ ${denom} = ${answer}.`,
    };
  } else {
    // Addition de fractions simples
    const denom = pick([4, 6, 8, 10]);
    const a = rand(1, denom / 2);
    const b = rand(1, denom / 2);
    const answer = a + b;
    return {
      category: 'fractions',
      text: `${a}/${denom} + ${b}/${denom} = ?/${denom}. Quel est le numérateur manquant ?`,
      unit: '',
      answer,
      hint: `Quand le dénominateur est le même, additionne les numérateurs.`,
      explanation: `${a} + ${b} = ${answer}. Donc ${a}/${denom} + ${b}/${denom} = ${answer}/${denom}.`,
    };
  }
}

// --- MESURES ---
function generateMesures(subLevel) {
  if (subLevel <= 1) {
    // cm → m or m → cm
    const toMeters = Math.random() > 0.5;
    if (toMeters) {
      const cm = rand(1, 9) * 100;
      const answer = cm / 100;
      return {
        category: 'mesures',
        text: `Combien font ${cm} cm en mètres ?`,
        unit: 'm',
        answer,
        hint: `1 m = 100 cm.`,
        explanation: `${cm} ÷ 100 = ${answer} m.`,
      };
    } else {
      const m = rand(1, 10);
      const answer = m * 100;
      return {
        category: 'mesures',
        text: `Combien font ${m} m en centimètres ?`,
        unit: 'cm',
        answer,
        hint: `1 m = 100 cm.`,
        explanation: `${m} × 100 = ${answer} cm.`,
      };
    }
  } else if (subLevel <= 2) {
    // Durées
    const hours = rand(1, 3);
    const minutes = rand(10, 50);
    const answer = hours * 60 + minutes;
    return {
      category: 'mesures',
      text: `Combien de minutes y a-t-il dans ${hours}h${minutes.toString().padStart(2, '0')} ?`,
      unit: 'minutes',
      answer,
      hint: `1 heure = 60 minutes.`,
      explanation: `${hours} × 60 = ${hours * 60}, + ${minutes} = ${answer} minutes.`,
    };
  } else {
    // Mixed conversions
    const kg = rand(1, 5);
    const g = rand(100, 900);
    const answer = kg * 1000 + g;
    return {
      category: 'mesures',
      text: `Combien de grammes font ${kg} kg et ${g} g ?`,
      unit: 'g',
      answer,
      hint: `1 kg = 1000 g.`,
      explanation: `${kg} × 1000 = ${kg * 1000}, + ${g} = ${answer} g.`,
    };
  }
}

// --- PROBLÈMES OUVERTS ---
function generateOuvert(subLevel) {
  if (subLevel <= 1) {
    // Combinaisons pièces
    const target = pick([10, 15, 20]);
    // Pièces de 5 et de 2
    let count = 0;
    for (let a = 0; a <= Math.floor(target / 5); a++) {
      for (let b = 0; b <= Math.floor(target / 2); b++) {
        if (5 * a + 2 * b === target) count++;
      }
    }
    return {
      category: 'ouvert',
      text: `De combien de façons peut-on faire ${target} centimes avec des pièces de 5 et de 2 centimes ? (l'ordre ne compte pas)`,
      unit: 'façons',
      answer: count,
      hint: `Essaie toutes les combinaisons possibles de pièces de 5, puis complète avec des pièces de 2.`,
      explanation: `Il faut tester chaque nombre de pièces de 5 (0, 1, 2...) et vérifier si le reste est divisible par 2. Il y a ${count} façon(s).`,
    };
  } else if (subLevel <= 2) {
    // Tenues vestimentaires
    const tops = rand(2, 4);
    const bottoms = rand(2, 4);
    const answer = tops * bottoms;
    return {
      category: 'ouvert',
      text: `Tu as ${tops} t-shirts et ${bottoms} pantalons différents. Combien de tenues différentes peux-tu faire ?`,
      unit: 'tenues',
      answer,
      hint: `Pour chaque t-shirt, tu peux porter n'importe quel pantalon.`,
      explanation: `${tops} × ${bottoms} = ${answer} tenues possibles.`,
    };
  } else {
    // Poignées de main
    const people = rand(4, 7);
    const answer = (people * (people - 1)) / 2;
    return {
      category: 'ouvert',
      text: `${people} personnes se rencontrent et chacune serre la main de toutes les autres une seule fois. Combien de poignées de main au total ?`,
      unit: 'poignées de main',
      answer,
      hint: `Chaque personne serre la main de ${people - 1} autres, mais attention à ne pas compter en double !`,
      explanation: `${people} × ${people - 1} = ${people * (people - 1)}, divisé par 2 (pour ne pas compter en double) = ${answer}.`,
    };
  }
}

// --- ARTISANAL RIDDLE BANK ---
const RIDDLE_BANK = [
  {
    category: 'logique',
    text: "Je suis un nombre à deux chiffres. La somme de mes chiffres est 10 et leur différence est 4. Mon chiffre des dizaines est plus grand. Qui suis-je ?",
    unit: '', answer: 73,
    hint: "Deux chiffres qui s'additionnent à 10 et se soustraient à 4...",
    explanation: "Si a + b = 10 et a − b = 4, alors 2a = 14, a = 7, b = 3. Le nombre est 73.",
  },
  {
    category: 'logique',
    text: "Un escargot grimpe un mur de 10 mètres. Chaque jour il monte de 3 mètres, mais chaque nuit il glisse de 2 mètres. En combien de jours atteint-il le sommet ?",
    unit: 'jours', answer: 8,
    hint: "Il progresse de 1 mètre par jour, mais le dernier jour il ne glisse plus.",
    explanation: "Chaque jour net = +1m. Après 7 jours il est à 7m. Le 8e jour il monte à 10m et sort. 8 jours.",
  },
  {
    category: 'calcul',
    text: "Dans un bus, il y a 45 passagers. Au premier arrêt, 12 descendent et 8 montent. Au deuxième arrêt, 15 descendent et 3 montent. Combien de passagers dans le bus ?",
    unit: 'passagers', answer: 29,
    hint: "Fais les opérations arrêt par arrêt.",
    explanation: "45 − 12 + 8 = 41, puis 41 − 15 + 3 = 29 passagers.",
  },
  {
    category: 'logique',
    text: "Un fermier a des poules et des lapins. Il compte 20 têtes et 56 pattes. Combien a-t-il de lapins ?",
    unit: 'lapins', answer: 8,
    hint: "Les poules ont 2 pattes, les lapins en ont 4.",
    explanation: "Si tout le monde avait 2 pattes : 20 × 2 = 40. Il manque 56 − 40 = 16 pattes. Chaque lapin apporte 2 pattes de plus : 16 ÷ 2 = 8 lapins.",
  },
  {
    category: 'calcul',
    text: "Tu achètes 3 cahiers à 2€50 et 2 stylos à 1€75. Tu paies avec un billet de 20€. Combien te rend-on ?",
    unit: '€', answer: 9,
    hint: "Calcule le total de tes achats d'abord.",
    explanation: "3 × 2.50 = 7.50, 2 × 1.75 = 3.50. Total = 11€. Rendu = 20 − 11 = 9€.",
  },
  {
    category: 'geometrie',
    text: "Un carré a un périmètre de 36 cm. Quelle est son aire ?",
    unit: 'cm²', answer: 81,
    hint: "Trouve d'abord la longueur d'un côté.",
    explanation: "Côté = 36 ÷ 4 = 9 cm. Aire = 9 × 9 = 81 cm².",
  },
  {
    category: 'fractions',
    text: "Marie a mangé 1/4 d'un gâteau, et Pierre en a mangé 2/4. Quelle fraction du gâteau reste-t-il ? Donne le numérateur (sur 4).",
    unit: '', answer: 1,
    hint: "Additionne ce qu'ils ont mangé, puis soustrais de 4/4.",
    explanation: "1/4 + 2/4 = 3/4 mangé. Reste = 4/4 − 3/4 = 1/4. Numérateur = 1.",
  },
  {
    category: 'mesures',
    text: "Un film dure 1h45. Il commence à 14h30. À quelle heure se termine-t-il ? (réponse en heures, ex: 16.25 pour 16h15)",
    unit: '', answer: 16.25,
    hint: "14h30 + 1h = 15h30. Puis ajoute 45 min − les 30 premières = ...",
    explanation: "14h30 + 1h45 = 16h15. En décimal : 16.25.",
  },
  {
    category: 'ouvert',
    text: "Avec les chiffres 1, 2, 3, combien de nombres à 2 chiffres différents peux-tu écrire ? (les deux chiffres doivent être différents)",
    unit: 'nombres', answer: 6,
    hint: "Liste-les systématiquement : 12, 13, 21...",
    explanation: "12, 13, 21, 23, 31, 32 = 6 nombres. (3 choix pour le premier chiffre × 2 pour le second)",
  },
  {
    category: 'logique',
    text: "Trois amis se classent dans une course. Léo n'est pas dernier. Emma est devant Léo. Hugo n'est pas premier. Qui est 2ème ?",
    unit: '', answer: 0, // Special: text answer handled differently
    hint: "Commence par placer Emma, puis Léo, puis Hugo.",
    explanation: "Emma est devant Léo → Emma 1re ou 2e. Léo pas dernier → Léo 1er ou 2e. Hugo pas premier. Donc Emma 1re, Léo 2e, Hugo 3e.",
    textAnswer: 'léo',
  },
];

// --- MAIN GENERATOR ---
function generateQuestion(category, subLevel) {
  // Chance to pick from riddle bank (20% if category matches or 'all')
  if (Math.random() < 0.2) {
    const eligible = RIDDLE_BANK.filter(r =>
      category === 'all' || r.category === category
    );
    if (eligible.length > 0) {
      return pick(eligible);
    }
  }

  const cat = category === 'all'
    ? pick(Object.keys(CATEGORIES))
    : category;

  switch (cat) {
    case 'calcul':    return generateCalcul(subLevel);
    case 'logique':   return generateLogique(subLevel);
    case 'geometrie': return generateGeometrie(subLevel);
    case 'fractions': return generateFractions(subLevel);
    case 'mesures':   return generateMesures(subLevel);
    case 'ouvert':    return generateOuvert(subLevel);
    default:          return generateCalcul(subLevel);
  }
}
```

**Step 2: Verify in browser console**

Open browser console and run:
```javascript
console.log(generateQuestion('calcul', 1));
console.log(generateQuestion('logique', 2));
console.log(generateQuestion('all', 3));
```
Each should return an object with `category, text, unit, answer, hint, explanation`.

**Step 3: Commit**

```bash
git add MathQuiz/js/questions.js
git commit -m "feat(mathquiz): question engine — 6 categories + artisanal riddle bank"
```

---

### Task 4: App logic — game state, screens, scoring, badges

**Files:**
- Modify: `js/app.js`

**Step 1: Write the full app logic**

```javascript
// js/app.js — Game state, UI logic, scoring, badges, persistence

// === STATE ===
const state = {
  // Settings
  category: 'all',
  difficulty: 'medium',
  questionCount: 5,
  timerEnabled: false,

  // Game
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreakThisGame: 0,
  hintUsed: false,
  answered: false,
  subLevel: 2,          // 1-3 within chosen difficulty
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  badgesUnlocked: [],
  noHintCount: 0,
  questionStartTime: 0,
  gameStartTime: 0,
  timerInterval: null,

  // Persistence
  records: {},
  badges: [],
  categoryStats: {},
};

// === DIFFICULTY MAPPING ===
const DIFFICULTY_BASE = { easy: 1, medium: 2, hard: 3 };

function getSubLevel() {
  // base (1/2/3) + internal adaptation (-1 to +1) → clamp to 1-3
  const base = DIFFICULTY_BASE[state.difficulty];
  const adapted = base + (state.subLevel - 2); // subLevel 1→-1, 2→0, 3→+1
  return Math.max(1, Math.min(3, adapted));
}

// === PERSISTENCE ===
function loadData() {
  try {
    state.records = JSON.parse(localStorage.getItem('mq_records') || '{}');
    state.badges = JSON.parse(localStorage.getItem('mq_badges') || '[]');
    state.categoryStats = JSON.parse(localStorage.getItem('mq_catStats') || '{}');
  } catch { /* ignore */ }
}

function saveData() {
  localStorage.setItem('mq_records', JSON.stringify(state.records));
  localStorage.setItem('mq_badges', JSON.stringify(state.badges));
  localStorage.setItem('mq_catStats', JSON.stringify(state.categoryStats));
}

// === SCREEN NAVIGATION ===
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// === PILL SELECTION ===
document.querySelectorAll('.pill-group').forEach(group => {
  group.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const setting = group.dataset.setting;
    const value = pill.dataset.value;
    if (setting === 'category') state.category = value;
    if (setting === 'difficulty') state.difficulty = value;
    if (setting === 'count') state.questionCount = parseInt(value);
  });
});

// Timer toggle
document.getElementById('timer-toggle').addEventListener('change', e => {
  state.timerEnabled = e.target.checked;
});

// === RECORDS DISPLAY ===
function renderRecords() {
  const container = document.getElementById('records-display');
  if (Object.keys(state.records).length === 0) {
    container.innerHTML = '<h3>Pas encore de records — lance une partie !</h3>';
    return;
  }
  let html = '<h3>🏆 Tes records</h3>';
  for (const [key, val] of Object.entries(state.records)) {
    const label = key === 'global' ? 'Global' : (CATEGORIES[key]?.label || key);
    html += `<div class="record-row"><span>${label}</span><span class="record-value">${val.score || 0} pts | série ${val.streak || 0}</span></div>`;
  }
  container.innerHTML = html;
}

// === START GAME ===
document.getElementById('btn-play').addEventListener('click', startGame);

function startGame() {
  state.currentIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreakThisGame = 0;
  state.subLevel = 2;
  state.consecutiveCorrect = 0;
  state.consecutiveWrong = 0;
  state.badgesUnlocked = [];
  state.noHintCount = 0;
  state.gameStartTime = Date.now();

  // Generate questions
  state.questions = [];
  for (let i = 0; i < state.questionCount; i++) {
    state.questions.push(generateQuestion(state.category, getSubLevel()));
  }

  showScreen('screen-game');
  document.getElementById('timer-stat').style.display = state.timerEnabled ? '' : 'none';
  if (state.timerEnabled) startTimer();
  showQuestion();
}

// === TIMER ===
function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.gameStartTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${min}:${sec}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
}

// === SHOW QUESTION ===
function showQuestion() {
  const q = state.questions[state.currentIndex];
  state.hintUsed = false;
  state.answered = false;
  state.questionStartTime = Date.now();

  document.getElementById('question-counter').textContent = `${state.currentIndex + 1} / ${state.questionCount}`;
  document.getElementById('score-display').textContent = state.score;
  updateStreak();

  const badge = document.getElementById('category-badge');
  badge.textContent = CATEGORIES[q.category]?.label || q.category;
  badge.setAttribute('data-cat', q.category);

  document.getElementById('question-text').textContent = q.text;
  document.getElementById('question-unit').textContent = q.unit ? `(réponse en ${q.unit})` : '';

  // Reset hint
  document.getElementById('btn-hint').classList.remove('used');
  document.getElementById('btn-hint').style.display = '';
  document.getElementById('hint-text').textContent = '';
  document.getElementById('hint-text').classList.remove('visible');

  // Reset answer section
  document.getElementById('answer-section').style.display = '';
  document.getElementById('feedback-section').style.display = 'none';
  document.getElementById('answer-input').value = '';
  document.getElementById('answer-input').focus();

  // Animation
  const card = document.getElementById('question-card');
  card.classList.remove('slide-in');
  void card.offsetWidth; // force reflow
  card.classList.add('slide-in');
}

// === HINT ===
document.getElementById('btn-hint').addEventListener('click', () => {
  if (state.hintUsed || state.answered) return;
  state.hintUsed = true;
  const q = state.questions[state.currentIndex];
  document.getElementById('hint-text').textContent = q.hint;
  document.getElementById('hint-text').classList.add('visible');
  document.getElementById('btn-hint').classList.add('used');
  document.getElementById('btn-hint').textContent = 'Indice utilisé';
});

// === VALIDATE ANSWER ===
document.getElementById('btn-validate').addEventListener('click', validateAnswer);
document.getElementById('answer-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') validateAnswer();
});

function validateAnswer() {
  if (state.answered) return;
  const input = document.getElementById('answer-input');
  const userAnswer = input.value.trim();
  if (userAnswer === '') return;

  state.answered = true;
  const q = state.questions[state.currentIndex];
  const elapsed = (Date.now() - state.questionStartTime) / 1000;

  // Check answer
  let correct = false;
  if (q.textAnswer) {
    correct = userAnswer.toLowerCase().replace(/[éèê]/g, 'e') === q.textAnswer;
  } else {
    correct = parseFloat(userAnswer) === q.answer;
  }

  // Score
  if (correct) {
    let points = 10;
    if (!state.hintUsed) {
      points += 5;
      state.noHintCount++;
    }
    if (state.timerEnabled) {
      if (elapsed < 10) points += 3;
      else if (elapsed < 20) points += 1;
    }
    state.score += points;
    state.streak++;
    state.bestStreakThisGame = Math.max(state.bestStreakThisGame, state.streak);
    state.consecutiveCorrect++;
    state.consecutiveWrong = 0;

    // Adaptive difficulty
    if (state.consecutiveCorrect >= 3) {
      state.subLevel = Math.min(3, state.subLevel + 1);
      state.consecutiveCorrect = 0;
    }

    // Category stats
    if (!state.categoryStats[q.category]) state.categoryStats[q.category] = 0;
    state.categoryStats[q.category]++;
  } else {
    state.streak = 0;
    state.consecutiveWrong++;
    state.consecutiveCorrect = 0;

    if (state.consecutiveWrong >= 2) {
      state.subLevel = Math.max(1, state.subLevel - 1);
      state.consecutiveWrong = 0;
    }
  }

  // Update display
  document.getElementById('score-display').textContent = state.score;
  updateStreak();

  // Feedback
  const feedback = document.getElementById('feedback-result');
  feedback.textContent = correct ? '✓ Bonne réponse !' : `✗ Raté ! La réponse était ${q.textAnswer || q.answer}${q.unit ? ' ' + q.unit : ''}.`;
  feedback.className = 'feedback-result ' + (correct ? 'correct' : 'incorrect');
  document.getElementById('feedback-explanation').textContent = q.explanation;
  document.getElementById('answer-section').style.display = 'none';
  document.getElementById('feedback-section').style.display = '';

  // Last question? Change button text
  if (state.currentIndex >= state.questionCount - 1) {
    document.getElementById('btn-next').textContent = 'Voir les résultats';
  } else {
    document.getElementById('btn-next').textContent = 'Suivant';
  }

  // Animations
  const card = document.getElementById('question-card');
  if (correct) {
    launchMiniConfetti();
  } else {
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 500);
  }
}

// === STREAK DISPLAY ===
function updateStreak() {
  const flame = document.getElementById('streak-flame');
  flame.className = '';
  if (state.streak >= 10) flame.className = 'flame-ultra';
  else if (state.streak >= 7) flame.className = 'flame-big';
  else if (state.streak >= 3) flame.className = 'flame-medium';
  else if (state.streak >= 1) flame.className = 'flame-small';

  document.getElementById('streak-display').innerHTML =
    `${state.streak} <span id="streak-flame" class="${flame.className}"></span>`;
}

// === NEXT QUESTION ===
document.getElementById('btn-next').addEventListener('click', () => {
  state.currentIndex++;
  if (state.currentIndex >= state.questionCount) {
    endGame();
  } else {
    // Regenerate next question with current subLevel for adaptive difficulty
    state.questions[state.currentIndex] = generateQuestion(state.category, getSubLevel());
    showQuestion();
  }
});

// === END GAME ===
function endGame() {
  stopTimer();

  // Check records
  const recordKey = state.category;
  if (!state.records[recordKey]) state.records[recordKey] = { score: 0, streak: 0 };
  if (!state.records.global) state.records.global = { score: 0, streak: 0 };

  const isNewScoreRecord = state.score > (state.records[recordKey].score || 0);
  const isNewStreakRecord = state.bestStreakThisGame > (state.records[recordKey].streak || 0);
  const isGlobalScoreRecord = state.score > (state.records.global.score || 0);

  if (isNewScoreRecord) state.records[recordKey].score = state.score;
  if (isNewStreakRecord) state.records[recordKey].streak = state.bestStreakThisGame;
  if (isGlobalScoreRecord) state.records.global.score = state.score;
  if (state.bestStreakThisGame > (state.records.global.streak || 0)) {
    state.records.global.streak = state.bestStreakThisGame;
  }

  // Check badges
  checkBadges();

  // Save
  saveData();

  // Display
  document.getElementById('final-score').textContent = `${state.score} points`;
  document.getElementById('final-score').className = 'final-score pop-in';

  const newRecordEl = document.getElementById('new-record');
  if (isNewScoreRecord || isGlobalScoreRecord) {
    newRecordEl.style.display = '';
    newRecordEl.className = 'new-record pop-in';
    launchBigConfetti();
  } else {
    newRecordEl.style.display = 'none';
  }

  // Show badges unlocked this game
  const badgesContainer = document.getElementById('badges-unlocked');
  if (state.badgesUnlocked.length > 0) {
    badgesContainer.innerHTML = state.badgesUnlocked.map(b =>
      `<div class="badge-card pop-in"><span class="badge-icon">${b.icon}</span>${b.name}</div>`
    ).join('');
  } else {
    badgesContainer.innerHTML = '';
  }

  showScreen('screen-end');
}

// === BADGES ===
const BADGE_DEFS = [
  { id: 'first_game',  name: 'Première partie',  icon: '🎮', check: () => true },
  { id: 'perfect',     name: 'Sans faute',        icon: '💯', check: () => state.bestStreakThisGame >= state.questionCount },
  { id: 'on_fire',     name: 'En feu',            icon: '🔥', check: () => state.bestStreakThisGame >= 10 },
  { id: 'no_hints',    name: 'Sans filet',         icon: '🎯', check: () => state.noHintCount >= 5 },
  { id: 'speedster',   name: 'Speedster',          icon: '⚡', check: () => state.timerEnabled && (Date.now() - state.gameStartTime) < 120000 },
  { id: 'hard_mode',   name: 'Difficile !',        icon: '💪', check: () => state.difficulty === 'hard' },
  { id: 'explorer',    name: 'Explorateur',         icon: '🧭', check: () => Object.keys(state.categoryStats).length >= 6 },
  { id: 'master_calcul',    name: 'Maître du calcul',     icon: '🧮', check: () => (state.categoryStats.calcul || 0) >= 50 },
  { id: 'master_logique',   name: 'Maître de la logique', icon: '🧩', check: () => (state.categoryStats.logique || 0) >= 50 },
  { id: 'master_geometrie', name: 'Maître géométrie',     icon: '📐', check: () => (state.categoryStats.geometrie || 0) >= 50 },
];

function checkBadges() {
  for (const def of BADGE_DEFS) {
    if (!state.badges.includes(def.id) && def.check()) {
      state.badges.push(def.id);
      state.badgesUnlocked.push(def);
    }
  }
}

// === REPLAY / MENU ===
document.getElementById('btn-replay').addEventListener('click', startGame);
document.getElementById('btn-menu').addEventListener('click', () => {
  renderRecords();
  showScreen('screen-home');
});

// === CONFETTI ===
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function launchMiniConfetti() {
  const particles = [];
  const colors = ['#4a9eff', '#4ecdc4', '#ff8c42', '#a855f7', '#ffd93d'];
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      size: rand(4, 8),
      color: pick(colors),
      life: 1,
    });
  }
  animateConfetti(particles);
}

function launchBigConfetti() {
  const particles = [];
  const colors = ['#4a9eff', '#4ecdc4', '#ff8c42', '#a855f7', '#ffd93d', '#ff6b6b'];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      size: rand(5, 10),
      color: pick(colors),
      life: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    });
  }
  animateConfetti(particles);
}

function animateConfetti(particles) {
  function frame() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= 0.015;
      if (p.life <= 0) continue;
      alive = true;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  requestAnimationFrame(frame);
}

// === INIT ===
loadData();
renderRecords();
showScreen('screen-home');
```

**Step 2: Verify in browser**

1. Open `index.html` — home screen should display with styled pills, records section
2. Select category, difficulty, count — pills should toggle
3. Click "Jouer !" — game screen appears with a question
4. Answer, validate — feedback shows with correct/incorrect + explanation
5. Complete a game — end screen with score, replay works
6. Check localStorage has `mq_records` after first game

**Step 3: Commit**

```bash
git add MathQuiz/js/app.js
git commit -m "feat(mathquiz): full game logic — state, scoring, badges, confetti, localStorage"
```

---

### Task 5: Polish & final touches

**Files:**
- Modify: `index.html` (add favicon emoji)
- Modify: `css/style.css` (small tweaks if needed)

**Step 1: Add favicon and meta tags**

In `index.html` `<head>`, add:
```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧮</text></svg>">
<meta name="theme-color" content="#1a1a2e">
<meta name="description" content="Jeu de mathématiques et énigmes pour enfants">
```

**Step 2: Full browser test**

Test checklist:
- [ ] Home screen renders correctly on mobile (375px) and desktop
- [ ] All 6 categories generate questions without errors
- [ ] All 3 difficulty levels work
- [ ] Timer starts/stops correctly
- [ ] Hints show and affect scoring
- [ ] Streak counter and flame animation work
- [ ] Confetti on correct answer
- [ ] End screen shows score, record detection works
- [ ] Badges unlock correctly
- [ ] "Rejouer" restarts with same settings
- [ ] "Menu" goes back to home with updated records
- [ ] localStorage persists across page refreshes
- [ ] Enter key submits answer

**Step 3: Commit**

```bash
git add MathQuiz/
git commit -m "feat(mathquiz): V1 complete — quiz app with 6 categories, adaptive difficulty, gamification"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | HTML skeleton — 3 screens, all UI elements | `index.html`, empty CSS/JS |
| 2 | Dark theme CSS — responsive, animations, pills | `css/style.css` |
| 3 | Question engine — 6 category generators + riddle bank | `js/questions.js` |
| 4 | App logic — state, scoring, badges, confetti, localStorage | `js/app.js` |
| 5 | Polish — favicon, full test pass | minor tweaks |
