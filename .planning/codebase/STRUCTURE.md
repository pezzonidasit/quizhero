# Structure

## Directory Layout

```
MathQuiz/
├── index.html                  — Single HTML file; all 27 screens declared here
├── manifest.json               — PWA manifest (name, icons, theme color)
├── sw.js                       — Service worker; cache name quizhero-v38; offline support
├── css/
│   └── style.css               — All styles; dark theme; CSS custom properties for theming
├── js/
│   ├── themes.js               — THEMES data object + applyTheme() + getThemeList()
│   ├── bosses-svg.js           — BOSS_POOL array with boss definitions + SVG artwork
│   ├── profiles.js             — ProfileManager singleton (localStorage CRUD)
│   ├── questions.js            — Question generators + RIDDLE_BANK[] + generateQuestion()
│   ├── progression.js          — XP, ranks, coins, chests, loot, pets, mastery, contracts
│   ├── fiches.js               — window.FICHES: 28 pedagogical help sheets
│   ├── firebase.js             — Firebase init + all async helpers (players, groups, duels, etc.)
│   ├── sync.js                 — MQSync: weekly reset, syncAfterGame(), syncOnLaunch()
│   ├── app.js                  — Main app: state, initApp(), showScreen(), all game logic
│   └── duel.js                 — Real-time 1v1 duel logic via Firebase
├── docs/
│   └── plans/                  — Design docs and implementation plans (V1–V8 + duel + boss)
├── .planning/
│   └── codebase/               — Architectural documentation (this folder)
├── .claude/
│   └── skills/
│       └── db-audit/           — Local skill: db-audit (audit.py + SKILL.md)
├── screenshots/                — QA screenshots + test scripts
├── tests/
│   └── mathquiz.spec.js        — Playwright end-to-end tests
├── node_modules/               — Playwright only (no build tools)
├── playwright.config.js        — Playwright configuration
├── test_v5.py                  — Python QA script (V5 features)
├── test_feedback.py            — Python QA script (feedback FAB)
├── CLAUDE.md                   — Project instructions for Claude Code
│
│   (Unused/draft question files — NOT loaded by index.html)
├── js/questions_part_a.js
├── js/questions_with_chf.js
├── js/questions_final.js
│
│   (Boss UI prototypes — standalone HTML files, not part of the app)
├── boss-compare-all.html
├── boss-style-compare.html
└── boss-style-v2.html
```

## Key Files

| File | Role |
|------|------|
| `index.html` | Entry point; declares all screens as `<div id="screen-X" class="screen">`; loads scripts in dependency order |
| `css/style.css` | Single stylesheet; uses CSS custom properties (`--bg-dark`, `--accent-blue`, etc.) injected by `applyTheme()` |
| `js/themes.js` | Defines `THEMES` object (16 themes) and `FREE_THEMES` constant; `applyTheme()` writes to `document.documentElement.style` |
| `js/profiles.js` | `ProfileManager` singleton; localStorage schema `mq_p_{id}_{field}`; profile list at `mq_profiles`; active profile at `mq_activeProfile` |
| `js/questions.js` | 6 category generators (`generateCalcul`, `generateLogique`, `generateGeometrie`, `generateFractions`, `generateMesures`, `generateOuvert`) + `RIDDLE_BANK[]` + `generateQuestion()` dispatcher |
| `js/progression.js` | `RANKS[]`, `getRank()`, `calculateRewards()`, `checkChestMilestones()`, `generateChestLoot()`, `applyLootItem()`, `MASTERY_LEVELS[]`, `getMasteryLevel()`, `checkMasteryUp()`, `PET_TYPES`, `PET_STAGES`, `PET_FOOD`, all pet functions, `generateContracts()` |
| `js/fiches.js` | `window.FICHES` with 28 entries covering: calcul, fractions, géométrie, mesures, nombres, problèmes — each with `titre`, `intro`, `regle`, `exemples[]`, `astuce`, optional `schema` (inline SVG) |
| `js/bosses-svg.js` | `BOSS_POOL` array with 6 bosses; each boss has `id`, `name`, `emoji`, `hp`, `stake`, `category`, `lootId`, `lootType`, `lootName` + SVG art data |
| `js/firebase.js` | Firebase compat SDK init; `firebaseSignIn()`, `pushPlayerStats()`, `pushDashboardStats()`, `createGroup()`, `joinGroup()`, `getWeeklyLeaderboard()`, `createRiddle()`, `getDailyQuestion()`, `submitDailyAnswer()`, `backupProfile()`, `restoreFromCode()`, admin helpers |
| `js/sync.js` | `MQSync` singleton: `syncOnLaunch()` (sign in + force-update check + pending sync + leaderboard cache), `syncAfterGame(gameXP)` (weekly counters + Firebase push), `checkWeeklyReset()` |
| `js/app.js` | Everything else: `initApp()`, `state` object, `showScreen()`, screen navigation map, all event listeners, game flow functions (`startGame()`, `showQuestion()`, `validateAnswer()`, `endGame()`), boss fight flow, chest flow, shop, profile detail, leaderboard, admin, daily question, pet zone render, confetti, feedback FAB |
| `js/duel.js` | Duel create/join/fight/end flows; Firebase listeners for real-time round sync; coin stake logic |
| `sw.js` | Service worker v38; cache-first with network update strategy; caches all core JS/CSS/HTML |

## Naming Conventions

**localStorage keys:**
- `mq_profiles` — JSON array of profile metadata `[{id, name, theme, createdAt}]`
- `mq_activeProfile` — string ID of active profile
- `mq_firebaseUid` — anonymous Firebase UID (persisted for offline continuity)
- `mq_app_version` — integer for force-update comparison
- `mq_leaderboard_cache` — JSON array cached weekly leaderboard
- `mq_riddles_cache` — JSON array cached community riddles
- `mq_p_{id}_{field}` — all per-profile data (namespaced by profile ID)

**Per-profile fields (stored as `mq_p_{id}_{field}`):**
- `xp`, `coins`, `gamesPlayed`, `goodGamesStreak`
- `records` — `{ [category]: { score, streak }, global: { score, streak } }`
- `badges` — `string[]` of badge IDs
- `catStats` — `{ [category]: { correct, total } }`
- `ownedThemes`, `activeTheme`
- `inventory`, `chestsOpened`, `boosts`
- `xpBoostActive`, `freeHints`, `shields`, `ownedStickers`
- `weeklyXP`, `weeklyGames`, `weekStart`, `weeklyTimeSpent`
- `defeatedBosses`, `pendingBoss`, `gamesSinceBoss`
- `bossTitles`, `activeTitle`, `unlockedTitles`
- `petType`, `petXP`, `petHunger`, `petLastLogin`, `petFriandiseBoost`
- `skipStock`, `questionsForSkip`
- `contractsCompleted`, `masteryLevels`
- `dailyCoinDate`, `dailyGameCount`
- `dailyChestCount` — `{ date, count }`
- `recoveryCode`, `loginStreak`, `lastLoginDate`, `loginStreakCoins`
- `pendingSync`, `gameState`
- `showWeeklyCeremony`, `lastWeekStats`, `lastWeekCatStats`

**Firebase paths:**
- `/players/{uid}` — public player stats
- `/leaderboard/weekly/{uid}` — weekly XP ranking
- `/groups/{code}` — group data (members, parents, dashboard, rewards)
- `/riddles/{id}` — community riddles
- `/dailyQuestion/{date}/question` — daily question of the day
- `/dailyQuestion/{date}/answers/{uid}` — player answers
- `/recovery/{code}` — recovery code → UID mapping
- `/admin_uid` — global admin UID
- `/app_version` — integer for force-update

**JS global naming:**
- Constants: `ALL_CAPS` (e.g., `RANKS`, `THEMES`, `BOSS_POOL`, `FICHES`)
- Singletons: PascalCase (e.g., `ProfileManager`, `MQSync`)
- Functions: camelCase (e.g., `generateQuestion`, `applyTheme`, `checkMasteryUp`)
- Screen IDs: `screen-kebab-case` (e.g., `screen-boss-fight`, `screen-profile-detail`)
- Button IDs: `btn-kebab-case` (e.g., `btn-play`, `btn-boss-fight`)
- Display elements: `{name}-display` or `{name}-text` (e.g., `score-display`, `xp-text`)

**CSS conventions:**
- Custom properties: `--bg-dark`, `--bg-card`, `--bg-card-hover`, `--text-primary`, `--text-secondary`, `--accent-blue/green/orange/violet/red/yellow`
- Screen containers: `.screen` (hidden) / `.screen.active` (visible)
- Card components: `.question-card`, `.profile-card`, `.settings-card`
- Button variants: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-back`, `.btn-icon`

## Script Load Order

Defined in `index.html` (lines 657–673). Order is critical — each file depends on globals from prior files:

```
1. Firebase SDK (CDN: firebase-app-compat, firebase-auth-compat, firebase-database-compat)
2. js/firebase.js     — requires Firebase SDK; exposes: db, auth, firebaseUid, all async helpers
3. js/sync.js         — requires firebase.js + profiles.js + progression.js; exposes: MQSync
4. js/themes.js       — no deps; exposes: THEMES, FREE_THEMES, applyTheme(), getThemeList()
5. js/bosses-svg.js   — no deps; exposes: BOSS_POOL
6. js/profiles.js     — requires themes.js (FREE_THEMES); exposes: ProfileManager
7. js/questions.js    — no deps; exposes: CATEGORIES, rand(), pick(), generateQuestion()
8. js/progression.js  — requires questions.js (rand, pick), themes.js (THEMES), profiles.js; exposes: RANKS, getRank(), calculateRewards(), all pet/chest/mastery functions
9. js/fiches.js       — no deps; exposes: window.FICHES
10. js/app.js          — requires all of the above; main app entry: calls initApp() immediately
11. js/duel.js         — requires app.js (showScreen, state), firebase.js, questions.js, progression.js
```

Note: `js/sync.js` is loaded before `js/profiles.js` and `js/progression.js` in `index.html` (lines 663–664), but its functions are only called at runtime after those files are loaded. This works because `MQSync.syncOnLaunch()` is called inside `initApp()` which executes after all scripts have loaded.
