# Architecture

## Pattern

QuizHero is a **single-page application (SPA) with a screen-stack pattern**, built on vanilla HTML/CSS/JS with no framework or build step. All app logic lives in a single `index.html` with external script files loaded via `<script>` tags. Persistence is split between localStorage (local game state, profile data) and Firebase Realtime Database (cloud sync, leaderboard, multiplayer).

The architecture follows a **flat module pattern**: each `.js` file exposes a global object or set of functions into `window`. There is no ES module system, no bundler, and no namespace isolation beyond naming conventions (`ProfileManager`, `MQSync`, `FICHES`, etc.).

## Layers

```
┌─────────────────────────────────────────────────┐
│  index.html — static screen declarations (HTML) │
├─────────────────────────────────────────────────┤
│  css/style.css — dark theme, CSS custom props   │
├─────────────────────────────────────────────────┤
│  js/themes.js    — theme data + applyTheme()    │
│  js/profiles.js  — ProfileManager (localStorage)│
│  js/questions.js — question generators + bank   │
│  js/progression.js — XP/ranks/pets/rewards      │
│  js/fiches.js    — 28 pedagogical help sheets   │
│  js/bosses-svg.js — boss SVG art + BOSS_POOL    │
├─────────────────────────────────────────────────┤
│  js/firebase.js  — Firebase init + helpers      │
│  js/sync.js      — MQSync (online sync engine)  │
├─────────────────────────────────────────────────┤
│  js/app.js       — main app logic, state, events│
│  js/duel.js      — real-time 1v1 duel logic     │
├─────────────────────────────────────────────────┤
│  sw.js           — PWA service worker (offline) │
└─────────────────────────────────────────────────┘
```

## Data Flow

**Game loop:**
1. User selects profile → `selectProfile(id)` in `js/app.js`
2. `ProfileManager.setActive(id)` sets active profile in localStorage
3. `loadProfileData()` reads `records`, `badges`, `catStats` into `state`
4. User configures settings (category, difficulty, count) → stored in `state`
5. `startGame()` calls `generateQuestion()` (from `js/questions.js`) for each question
6. Each answer updates `state.score`, `state.streak`, `state.categoryStats`
7. `endGame()` calls `calculateRewards()` (from `js/progression.js`) → XP + coins
8. `ProfileManager.set()` persists everything back to localStorage
9. `MQSync.syncAfterGame()` pushes stats to Firebase Realtime Database

**Theme flow:**
- `THEMES` object in `js/themes.js` defines CSS variable maps
- `applyTheme(id)` writes CSS custom properties directly to `document.documentElement.style`
- Active theme stored per-profile in localStorage (`mq_p_{id}_activeTheme`)

**Firebase flow:**
- `js/firebase.js` initializes Firebase SDK (anonymous auth, Realtime DB)
- `js/sync.js` (`MQSync`) wraps sync logic: `syncOnLaunch()`, `syncAfterGame()`, `checkWeeklyReset()`
- On launch: sign in anonymously → force-update check → profile restore → push stats → cache leaderboard
- Offline: sets `pendingSync` flag in localStorage, syncs on next online launch

## Key Abstractions

**`ProfileManager`** (`js/profiles.js`)
- Singleton object managing all player profiles
- Profiles list stored at `localStorage['mq_profiles']` as JSON array
- Per-profile data namespaced as `mq_p_{id}_{field}` keys in localStorage
- Active profile tracked at `localStorage['mq_activeProfile']`
- Public API: `get(field, fallback)`, `set(field, value)`, `getAll()`, `create()`, `delete()`, `setActive()`

**`state`** (`js/app.js`)
- Plain JS object holding the entire runtime game state (not persisted directly)
- Fields: `category`, `difficulty`, `questionCount`, `questions[]`, `currentIndex`, `score`, `streak`, `bossState`, `activeBoost`, `activeContract`, etc.
- Saved to localStorage only at question boundaries via `saveGameState()` (resume support)

**`generateQuestion(category, subLevel, lastCat)`** (`js/questions.js`)
- Main entry point for question creation; dispatches to per-category generators
- Returns `{ category, text, unit, answer, hint, explanation, ficheKey? }`
- Sub-level (1–3) controls difficulty within a category
- `RIDDLE_BANK[]` provides 50+ handcrafted riddles mixed in via the `ouvert` category

**`calculateRewards(score, difficulty, xpBoostActive, coinRainActive)`** (`js/progression.js`)
- Pure function; XP = score × difficulty multiplier × boost; coins = score/2 × daily multiplier
- Daily coin diminishing returns: games 1–3 at ×1.0, game 4 at ×0.5, game 5 at ×0.3, game 6+ at ×0.1

**`MQSync`** (`js/sync.js`)
- Singleton object; wraps all Firebase writes
- Handles weekly reset detection (Monday 00:00), offline queue (`pendingSync` flag)
- Calls `pushPlayerStats()` and `pushDashboardStats()` from `js/firebase.js`

**`THEMES` / `applyTheme()`** (`js/themes.js`)
- 16 themes total: 3 free, 7 epic (purchasable), 3 legendary (expensive), 2 boss-exclusive (price: -1)
- Theme application is purely CSS custom property injection — no DOM class toggling

**`FICHES`** (`js/fiches.js`)
- `window.FICHES` object: 28 pedagogical help sheets keyed by topic
- Each sheet: `{ titre, intro, regle, exemples[], astuce, schema? }` where `schema` is inline SVG

**Pet system** (`js/progression.js`)
- `PET_TYPES`: dragon (skip bonus), robot (+10% XP), fox (+10% coins)
- `PET_STAGES` (5 stages: Oeuf → Majestueux): XP thresholds, bonus percentages
- Hunger mechanic: drains −10 per game, −10 per missed day; below 50% disables bonus
- `checkPetMajestueux()` grants one-time reward (200 coins + badge + title)

**Boss system** (`js/app.js` + `js/bosses-svg.js`)
- `BOSS_POOL[]` in `bosses-svg.js`: 6 bosses with HP, stake, loot, SVG art
- Boss appears after N games (`gamesSinceBoss` counter); player can accept or defer
- Boss fight is a separate question loop with HP bars, timer bar, fatal blow overlay
- Boss victory unlocks exclusive themed rewards (`applyBossLoot()` in `js/progression.js`)

**Duel system** (`js/duel.js`)
- Real-time 1v1 multiplayer via Firebase Realtime Database
- Creator generates a 4-digit code; joiner finds the duel by code
- Questions generated client-side but synchronized per-round via Firebase listeners
- Coins wagered and transferred on win/loss

## Entry Points

- **Browser loads `index.html`**: scripts execute in load order
- **`initApp()`** in `js/app.js` is called immediately (no DOMContentLoaded wrapper)
- `initApp()` triggers slow-device detection, event listener setup, and `MQSync.syncOnLaunch()`
- **`selectProfile(id)`** is the effective "start game" entry point after profile selection
- **Service worker** (`sw.js`) intercepts fetch events for offline PWA support; cache name is `quizhero-v38`

## Screen System

All screens are `<div id="screen-X" class="screen">` elements in `index.html`, hidden by default via CSS. The active screen gets class `.active`.

**Navigation function:** `showScreen(screenId, opts)` in `js/app.js`
- Removes `.active` from all screens, adds it to target
- Pushes to `history.pushState()` / `history.replaceState()` for browser back button support
- Internal `screenHistory[]` array as fallback stack
- `screenBackMap` object maps each screen to its back destination

**Complete screen inventory (22 screens):**

| Screen ID | Description |
|-----------|-------------|
| `screen-pin` | PIN gate (disabled in V4, kept in DOM) |
| `screen-profiles` | Profile selection |
| `screen-create-profile` | New profile creation (name + theme) |
| `screen-home` | Main hub (settings, play, daily, pet zone, records) |
| `screen-game` | Active quiz (question card, answer input, feedback) |
| `screen-end` | Game results (score, XP, coins, badges, XP bar) |
| `screen-chest` | Chest opening animation + loot reveal |
| `screen-shop` | Theme and item shop |
| `screen-profile-detail` | Profile stats and badges collection |
| `screen-progression` | Mastery bars + weekly delta + mastery badges |
| `screen-my-pet` | Pet management (feed, stats, stage) |
| `screen-pet-choice` | Pet species selection (resets XP) |
| `screen-daily` | Daily question of the day |
| `screen-boss-appear` | Boss encounter announcement |
| `screen-boss-fight` | Active boss combat (HP bars, timer bar) |
| `screen-boss-end` | Boss result + loot reveal |
| `screen-contract` | Objective contract selection pre-game |
| `screen-leaderboard` | Global weekly leaderboard |
| `screen-groups` | Group membership management |
| `screen-group-detail` | Group leaderboard + admin actions |
| `screen-dashboard` | Parent dashboard |
| `screen-create-riddle` | Community riddle submission form |
| `screen-admin` | Global admin dashboard (players/groups/riddles) |
| `screen-duel-create` | Create duel + waiting for opponent |
| `screen-duel-join` | Join duel by code |
| `screen-duel-fight` | Active duel combat |
| `screen-duel-end` | Duel result + coin transfer |
| `screen-fiche` | Help sheet viewer |

**Overlays (not screens):** `login-reward-overlay`, `weekly-ceremony-overlay`, `session-limit-overlay`, `feedback-overlay` — displayed with `style.display = 'flex'` over the active screen.

## State Management

All state is in-memory (`state` object in `js/app.js`) with explicit persistence calls:

- **Read on profile select:** `loadProfileData()` → `state.records`, `state.badges`, `state.categoryStats`
- **Write after game:** `saveProfileData()` → `ProfileManager.set()` → localStorage
- **Game resume:** `saveGameState()` serializes mid-game state; `loadGameState()` restores on next launch
- **Boss state:** `saveBossState()` / `loadBossState()` persist pending boss and game counter
- **No reactive binding** — all DOM updates are imperative via direct `element.textContent` / `innerHTML` assignments in render functions (`renderProfilesList()`, `updateProfileHeader()`, `renderRecords()`, etc.)
