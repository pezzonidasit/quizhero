# Conventions

## Code Style

- **Language**: Vanilla JavaScript (ES6+), no framework, no build step.
- **File headers**: Block comment at the top of each file naming the module and its dependencies, e.g. `/* QuizHero V2 — App Logic (profile-aware) */` and `/** QuizHero V2 — Progression Engine … Depends on: questions.js … */`.
- **Semicolons**: Used consistently throughout.
- **Quotes**: Single quotes for JS strings; template literals for multi-value or multi-line HTML interpolation.
- **Arrow functions**: Used for callbacks and short inline functions; named `function` declarations for top-level game functions.
- **`const` / `let`**: `const` for objects, arrays, and fixed values. `let` for reassignable scalars inside functions.
- **IIFE**: Used once in `js/app.js` for the slow-device detection side-effect block (`(function detectSlowDevice() { ... })()`).
- **Version tags in comments**: Inline comments like `// V3:`, `// V4:`, `// V5:`, `// V8:` annotate when a feature was introduced.

## Naming Patterns

- **Constants**: `SCREAMING_SNAKE_CASE` — `RANKS`, `GAME_MILESTONES`, `XP_MILESTONES`, `LOOT_COMMON`, `PET_TYPES`, `PET_STAGES`, `TITLE_NAMES`, `BADGE_DEFS`, `BOSS_POOL`, `LOGIN_REWARDS`.
- **Functions**: `camelCase` verbs — `getRank()`, `calculateRewards()`, `generateChestLoot()`, `applyLootItem()`, `checkMasteryUp()`, `feedPet()`, `drainPetHunger()`.
- **Private methods** (on `ProfileManager`): Prefixed with `_` — `_key()`, `_setData()`, `_getData()`, `_saveList()`.
- **Event handlers**: Inline `addEventListener` closures rather than named handler functions.
- **Screen IDs**: `screen-{name}` in HTML, referenced by string in `showScreen('screen-home')`.
- **Element IDs**: `kebab-case` — `profile-name-input`, `btn-create-profile`, `login-reward-overlay`.
- **CSS classes**: `kebab-case` — `.pill-group`, `.pill`, `.settings-card`, `.reg-dot`, `.contract-indicator`.
- **State object keys**: `camelCase` — `categoryStats`, `bestStreakThisGame`, `consecutiveCorrect`, `timerPausedAt`.
- **localStorage field names**: short `camelCase` strings — `xp`, `coins`, `gamesPlayed`, `catStats`, `ownedThemes`, `chestsOpened`, `dailyCoinDate`.

## State Management

- A single mutable `state` object defined at the top of `js/app.js` (inside `initApp()`) holds all in-session game state:
  - Quiz config: `category`, `difficulty`, `questionCount`, `timerEnabled`
  - In-game runtime: `questions[]`, `currentIndex`, `score`, `streak`, `answered`, `subLevel`, `consecutiveCorrect/Wrong`
  - Feature flags: `shieldActive`, `coinRainActive`, `activeBoost`, `timerPaused`
  - Persistent mirrors: `records`, `badges`, `categoryStats` (loaded from `ProfileManager` at session start)
- `state` is never serialised directly — `saveGameState()` extracts a subset into `ProfileManager.set('gameState', ...)`.
- `loadProfileData()` / `saveProfileData()` sync the persistent subset between `state` and `ProfileManager`.
- Boss persistence uses a separate `loadBossState()` / `saveBossState()` pair.
- `ProfileManager` (in `js/profiles.js`) is the single source of truth for all persisted player data. All writes go through `ProfileManager.set(field, value)` and `ProfileManager.get(field, fallback)`.

## CSS Conventions

- **Design tokens**: All palette, spacing, and radii values are CSS custom properties on `:root`. Token naming: `--bg-{variant}`, `--text-{role}`, `--accent-{color}`, `--cat-{category}`, `--gradient-*`, `--shadow-*`, `--radius`, `--radius-sm`, `--transition`.
- **Theme override**: `js/themes.js` injects per-theme custom property overrides at runtime on `:root` (or `body`); base tokens in `css/style.css` are the dark-mode defaults.
- **No BEM**: Classes use flat `kebab-case` — `.settings-card`, `.pill`, `.reg-dot`, `.profile-card-select`. Modifier states are added as additional classes (`.pill.active`, `.settings-card.open`, `.screen.active`, `.reg-dot.played`).
- **Screen visibility**: `.screen { display: none }` / `.screen.active { display: flex }` — toggled by `showScreen()`.
- **Animations**: Named `@keyframes` with `camelCase` identifiers — `shake`, `slideIn`, `popIn`, `flamePulse`, `gradientShift`, `pulse`, `shimmer`, `float`, `cardEntrance`, `correctGlow`, `incorrectGlow`.
- **Responsive**: Single-column flex layout, `max-width: 500px`, `padding: 24px 16px` on `body`. No media queries for breakpoints — layout is inherently mobile-first.
- **Low-perf mode**: `body.low-perf-mode` class reduces animations for slow devices (detected via `rAF` timing).
- **Section comments**: CSS sections separated by `/* --- Section Name --- */` banners.

## localStorage Patterns

- **Namespace prefix**: `mq_` for all keys.
- **Profile list**: Single key `mq_profiles` stores a JSON array of `{id, name, theme, createdAt}` objects.
- **Active profile pointer**: `mq_activeProfile` stores the active profile's `id`.
- **Per-profile data**: Namespaced as `mq_p_{id}_{field}`, e.g. `mq_p_abc123_xp`. The helper `ProfileManager._key(id, field)` builds this.
- **All values** are JSON-serialised (`JSON.stringify` / `JSON.parse`). Reads fall back to a `fallback` parameter on parse error.
- **Field conventions**:
  - Scalars: `xp` (number), `coins` (number), `gamesPlayed` (number), `petHunger` (number 0–100)
  - Arrays: `badges` (string ids), `ownedThemes`, `chestsOpened`, `bossTitles`, `ownedStickers`, `unlockedTitles`
  - Objects: `records` (keyed by category), `catStats` (keyed by category: `{correct, total}`), `masteryLevels`, `boosts`
  - Date strings: ISO `YYYY-MM-DD` sliced via `new Date().toISOString().slice(0, 10)`
  - Flags: `xpBoostActive` (boolean), `vacationMode` (boolean)
- **Deletion**: `ProfileManager.delete(id)` iterates `localStorage` to remove all `mq_p_{id}_*` keys.

## Error Handling

- **localStorage reads**: All `JSON.parse` calls are wrapped in `try/catch` returning the fallback value (e.g. `[]`, `0`, `null`). See `ProfileManager._getData()` and `ProfileManager.getAll()`.
- **Firebase calls**: Wrapped in `try/catch` or `.catch(() => {})` chains — failures are silent (offline-tolerant design). Example: `firebaseSignIn().then(...).catch(() => {})`.
- **DOM lookups**: Guarded with `if (!el) return;` before operating on potentially absent elements (e.g. `renderBoostSelector`, `renderNextGoals`).
- **Missing data**: `ProfileManager.get(field, fallback)` always returns the fallback on absent or corrupt data — never throws.
- **HTML injection**: User-generated strings (profile names) are escaped via `escapeHtml()` which uses a DOM text node (`div.textContent = str; return div.innerHTML`).
- **No global error handler**: No `window.onerror` or `unhandledrejection` listener is present.

## Comments & Docs

- **Section banners**: `// ── Section Name ──────────────` separates logical sections within `js/app.js` and `js/progression.js`.
- **JSDoc-style**: Functions with non-obvious logic have a `/** … */` block comment above them describing parameters and return value (e.g. `getRankProgress`, `calculateRewards`, `generateChestLoot`, `checkChestMilestones`).
- **Inline comments**: Short `// comment` on lines explaining intent — especially for game-balance numbers and version-tagged additions.
- **No external docs**: No JSDoc tooling configured; comments are informal but consistently placed.
