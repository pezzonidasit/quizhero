# Concerns

## Technical Debt

### God File — `js/app.js` (4198 lines)
`js/app.js` is a monolith that contains game logic, UI rendering, badge definitions, boost definitions, sticker catalog, confetti engine, boss fight system, contract system, duel handlers, shop logic, pet system, daily question, admin dashboard, feedback system, and navigation history — all in one file wrapped in a single `initApp()` IIFE. There is no module system. Adding any new feature requires finding the right area in a ~4200-line file by scanning manually.

### `APP_VERSION = '5.0'` vs. service worker `CACHE_NAME = 'quizhero-v38'`
The app declares version `5.0` in `js/app.js` line 3 but the service worker uses a separate manual counter (`quizhero-v38` in `sw.js` line 1). These two versioning systems are decoupled and regularly drift. A developer who bumps `APP_VERSION` without bumping `CACHE_NAME` will silently serve stale assets to existing users, since the SW cache is keyed only by `CACHE_NAME`.

### Orphan files in `js/`
Three question-file variants (`js/questions_final.js`, `js/questions_part_a.js`, `js/questions_with_chf.js`) exist in the repository but are not listed in `sw.js` `ASSETS` and are not loaded by `index.html`. They represent abandoned drafts that are never cleaned up and confuse the codebase structure.

### Inline `onclick` strings in dynamically built HTML
`js/app.js` builds many HTML strings with `onclick="functionName(arg)"` patterns — 22 occurrences counted. Functions needed by these handlers are manually exported to `window.*` (at least 15 such exports, lines 3524–3745). This is fragile: renaming a function will silently break the handler without any compile-time warning.

### Boost double-application bug
In `js/app.js` lines 1341–1373, `calculateRewards()` already applies `xpBoostActive` flag and `hard` difficulty multipliers. Immediately after, the active boost (`xp_boost`, `coin_boost`, `score_boost`) also adds bonus XP/coins on top of the already-multiplied rewards. The final XP is written to storage at line 1346, then potentially written again at lines 1360, 1370, 1409. Three separate `ProfileManager.set('xp', ...)` calls exist within a single `endGame()` — the reads interleave with the writes, meaning the reward display (`rewards.xp`) shown to the user diverges from the value actually persisted.

### Pet XP and daily-question rewards bypass sync
At `js/app.js` lines 1405–1414, pet passive bonuses mutate `ProfileManager` XP/coins **after** `MQSync.syncAfterGame()` is called (line 1532). The daily question reward (lines 3944–3947) also directly mutates XP and coins after the game sync has already fired. These increments are never synced to Firebase in the same pass; they will only appear on the next `syncOnLaunch()`.

### `getMyGroups()` called on every home-screen render
`updateProfileHeader()` calls `getMyGroups()` on every call (line 496). `updateProfileHeader()` is itself called at the end of every game, every chest open, every shop back-navigation, etc. Each `getMyGroups()` call in `js/firebase.js` makes N+1 Firebase reads (one `players/{uid}/groups` + one `groups/{code}/name` + one `groups/{code}/members` per group). On a home screen with 3 groups, that is 7 sequential round-trips on every navigation back to home.

---

## Known Bugs / Fragile Areas

### Daily question creation race condition
`getDailyQuestion()` in `js/firebase.js` lines 668–688 reads `dailyQuestion/{today}/question`, and if absent, calls `generateQuestion()` locally and writes it. If two different clients open the app simultaneously before the question exists, both will generate and attempt to write different questions. The Firebase rule for this path (`".write": "auth != null && !data.exists()"`) does prevent double-write at the DB level, but the second writer will get a permission error that is silently swallowed — and the second client will then re-read the first client's question on the follow-up read. The displayed question text is therefore non-deterministic between the two users for a brief window.

### Duel code collision via recursion
`Duel.create()` in `js/duel.js` lines 26–29: on a code collision, the function calls `this.create(category, stake)` recursively without a depth limit. With a 4-digit code space (9000 possible codes) and moderate usage, collisions become likely and the recursion will stack. There is also no cleanup of the checked-but-rejected code in Firebase.

### `state.bossState`, `state.activeBoost`, `state.activeContract` not persisted on mid-game close
`saveGameState()` in `js/app.js` lines 100–118 persists core question-state, but does not persist `bossState`, `activeBoost`, `activeContract`, or `shieldActive`. If the page is closed during a boss fight or while a boost is active, the game is resumed correctly but boost/shield/contract state is lost silently.

### `totalCorrect()` reads `state.categoryStats` not `ProfileManager`
`totalCorrect()` at line 1088 sums `state.categoryStats`, which is loaded from `ProfileManager` at game start via `loadProfileData()`. However, `state.categoryStats` is only saved at `endGame()` via `saveProfileData()`. Badge progress callbacks (used in `renderNextGoals()`) call `totalCorrect()` during home-screen rendering when `state.categoryStats` may reflect the profile data from the most recent game load, not the true persisted all-time stats.

### `checkDailyQuestion()` silently hides button when offline
`js/app.js` line 3883: if `isOnline()` returns false (including during initial app load before `firebaseSignIn()` resolves), the button is hidden with no fallback state. A child on a slow connection will never see the daily question button even if Firebase is reachable.

### Timer resumes incorrectly after fiche
At `js/app.js` lines 912–916, `gameStartTime` is shifted forward by `pauseDuration` to compensate for fiche reading time. However, the confetti check `Date.now() - state.gameStartTime < 30000` for the `speed_demon` hidden badge, and the `speedster`/`flash` badge checks, use `gameStartTime` as the reference. Pausing for a long fiche read artificially inflates apparent game speed and can unlock speed badges unfairly.

---

## Security

### Firebase API key exposed in source
`js/firebase.js` lines 7–15 contain the project's API key, auth domain, database URL, project ID, and app ID in plain text, committed to the repository. While Firebase API keys for client-side apps are not secret in the same way server keys are, this key is tied to a specific Firebase project with real user data (children's stats), and the `authDomain` and `databaseURL` being public means the project is trivially discoverable.

### Database rules allow any authenticated user to create/write daily questions
`database.rules.json` lines 104–105: `"question": { ".write": "auth != null && !data.exists()" }` — any anonymous authenticated user can create the daily question for any date, including future dates or arbitrary past dates. A malicious client could pre-populate months of daily questions with wrong or inappropriate content.

### Group names and player names injected unescaped into innerHTML
`js/app.js` lines 2943, 3094, 3110, 3145, 3369, 3439 inject `group.name`, `member.name`, and `p.name` fetched from Firebase directly into `innerHTML` strings without calling `escapeHtml()`. An attacker who creates a group or player with a name containing `<script>` or `<img onerror=...>` would achieve stored XSS, executed in every member's browser who views the group detail or leaderboard. `escapeHtml()` is defined at line 6 but is not applied consistently. The victims are children.

### Group code uses `Math.random()` (not cryptographically secure)
`generateGroupCode()` at `js/firebase.js` line 131 uses `Math.floor(Math.random() * ...)`. Group codes are 6 characters from a 32-character alphabet = ~10^9 combinations, which is reasonable, but `Math.random()` is not cryptographically secure (`crypto.getRandomValues()` should be used). Recovery codes (line 447) also use `Math.random()`.

### Recovery codes stored world-readable
`database.rules.json` lines 117–120: each individual recovery code node `recovery/{code}` has `.read: "auth != null"`. Any authenticated user who knows or guesses a code can read the `uid` it maps to and then fetch that user's full backup from `players/{uid}/backup`. Backup data includes XP, coins, owned themes, contracts, and bosses — essentially the full player profile. The backup path itself has `.read: "$uid === auth.uid"` so coins can't be directly stolen, but UID enumeration is possible.

### `screen-pin` exists but is disabled
`index.html` lines 19–32 contain a full PIN-entry screen (`screen-pin`) with 4 digit inputs. In `js/app.js` line 14–16, the PIN (`PIN_CODE = '2609'`) is hardcoded but the gate is bypassed (`initApp()` called directly without checking). The PIN screen is dead UI that a developer might re-enable by mistake, thinking it's intentional parental control — it is not.

### Feedback screenshots stored in Firebase
`js/app.js` lines 4158–4179: when reporting a bug, the app captures a `html2canvas` screenshot as a JPEG data URL (base64) and stores it in `db.ref('feedback').push(data)`. Feedback nodes have no read restrictions in `database.rules.json` (absent — falls through to deny-by-default, but the `feedback` path is also not explicitly defined, meaning it inherits root defaults which effectively block reads for non-admins). However, screenshots of a child's session are being stored in a third-party cloud database. Screenshots may contain the child's name and stats.

---

## Performance

### Service worker caches Firebase SDK responses
`sw.js` lines 34–42: the fetch handler intercepts ALL requests — including Firebase Realtime Database WebSocket upgrades and CDN-served Firebase SDK scripts — and attempts to `cache.put()` every response. Non-cacheable responses (opaque, no-store) silently fail, but the code opens the cache for every single network response. Firebase SDK is loaded from CDN (`https://www.gstatic.com/...`) and these requests will be stored as opaque responses with unknown size.

### `getGroupLeaderboard()` makes N sequential Firebase reads
`js/firebase.js` lines 248–259: iterates over `group.membersList` and calls `db.ref('leaderboard/weekly/' + member.uid).once('value')` one at a time in a `for...of` loop (sequential awaits). For a class group of 25 kids, this is 25 + N (from `getGroupInfo` member fetches) sequential round-trips to Firebase on every group detail view.

### `getMyGroups()` also makes sequential reads
`js/firebase.js` lines 179–188: iterates group codes with sequential `await` calls for name and member count. Called on every home-screen render (see Technical Debt above).

### Canvas confetti on every correct answer
`launchMiniConfetti()` fires on every correct answer. On a 20-question game, that is up to 20 canvas animation loops. The `confettiAnimating` flag prevents overlap by dropping subsequent calls, but a sequence of rapid correct answers on a mid-range device will cause the animation to skip repeatedly with no feedback to the user.

### `renderProfileDetail()` rebuilds entire `profile-card` innerHTML 5+ times
`js/app.js` function `renderProfileDetail()` calls `document.getElementById('profile-card').innerHTML += ...` five times in sequence (lines 1854, 1901, 1924, 1937, 1941), forcing the browser to re-parse and re-render the DOM sub-tree on each `+=`. This is a classic innerHTML accumulation anti-pattern.

---

## Scalability

### localStorage is the sole persistence layer for game state
All player data (XP, coins, badges, category stats, contracts, boosts, pet state, etc.) lives in `localStorage` under `mq_p_{profileId}_{field}` keys. Each field is a separate key. A profile with full data generates ~40 distinct localStorage entries. With 3 profiles, that is ~120 keys plus leaderboard/riddle caches. `localStorage` has a 5–10 MB quota on most browsers. The chestsOpened array and badge array grow unboundedly — a long-term player will accumulate hundreds of entries in these arrays serialized as JSON strings, each adding to the quota.

### Weekly leaderboard is never pruned
`leaderboard/weekly/{uid}` in Firebase is updated by `pushPlayerStats()` but the "weekly" reset in `MQSync.checkWeeklyReset()` only resets local counters — it never deletes or archives the Firebase `leaderboard/weekly` tree. As the player base grows, `getWeeklyLeaderboard(50)` will always scan a growing tree sorted by XP (total, not weekly), making the "weekly" label misleading and the fetch increasingly expensive.

### Daily question accumulates indefinitely in Firebase
`dailyQuestion/{date}` nodes are created daily and never deleted. Over one year this produces 365 nodes, each potentially containing dozens of answer entries (one per player per day). There is no TTL or cleanup job.

### Group code regeneration is O(members)
`regenerateGroupCode()` in `js/firebase.js` lines 209–228 reads all member data, constructs an update object, and makes a bulk write. For a large class this is an unbounded write. More critically, the old group is deleted and a new one is created — there is no transaction, so a crash between the write of the new group and the deletion of the old one leaves both codes pointing to the same data.

---

## Maintainability

### `js/questions.js` is 3051 lines with no tests
The question engine contains 6 generators (calcul, logique, géométrie, fractions, mesures, ouvert) × 3 sub-levels each, plus a 50+ item `RIDDLE_BANK`. Math correctness in generated questions (answer values, hint text, explanation text) is entirely unverified — there are no unit tests. A copy-paste error in a generator (e.g. wrong formula for area) will silently produce wrong answers for children.

### `css/style.css` is 3430 lines with no variables for spacing
`css/style.css` uses CSS custom properties for colors and radii but hard-codes margin/padding values throughout. There is significant duplication of padding/gap rules (e.g., `0.75rem`, `1rem`, `1.5rem` appear hundreds of times). Theming (`js/themes.js`) overrides a large set of CSS variables, meaning the effective style of any element requires tracing both the base stylesheet and the active theme.

### Version comments are inconsistent
Code comments reference V1 through V8, but the file header says `V2` (`/* QuizHero V2 — App Logic */`). Section comments like `// V3 — Boss Fight`, `// V4: Firebase sync`, `// V8: Pet XP` are scattered inline throughout `endGame()`, making the function's overall flow difficult to follow.

### `window._debug` exposes live state to the console
`js/app.js` line 3959: `window._debug = { triggerBoss, state, showBossAppear, BOSS_POOL, ... }` — the mutable `state` object, boss pool, and several navigation functions are permanently attached to `window` in production. This is a development aid left in the shipping build.

### `node_modules/` is in the repository
`package.json` declares `@playwright/test` as a dev dependency and `node_modules/` exists in the repo (directory visible in git status). Only the `.bin` folder appears to be present (likely Playwright runner). This is test tooling committed to a production-deployed PWA repository.

---

## Recommendations

1. **XSS fix (high priority):** Wrap all Firebase-sourced strings (group names, player names, riddle text, reward names) in `escapeHtml()` before injecting into `innerHTML`. Apply globally, not case-by-case.

2. **Decouple SW version from app version:** Automate `CACHE_NAME` bumping (e.g. use a build step or tie it to a git commit hash) so cache invalidation is not a manual operation.

3. **Fix the `endGame()` XP double-write:** Compute all XP contributions (base, difficulty, boost, pet bonus) into a single delta, write once, then sync.

4. **Batch Firebase reads:** Replace sequential `for...of` with `await` inside `getMyGroups()` and `getGroupLeaderboard()` with `Promise.all()` to parallelize reads.

5. **Delete stale files:** Remove `js/questions_final.js`, `js/questions_part_a.js`, `js/questions_with_chf.js` from the repository.

6. **Add unit tests for question generators:** Even a minimal test that calls each generator 100 times and asserts `answer === eval(explanation_formula)` would catch silent math errors.

7. **Weekly leaderboard cleanup:** On weekly reset in `MQSync.checkWeeklyReset()`, also reset (zero out) the Firebase `leaderboard/weekly/{uid}` node for the current player so the leaderboard reflects actual weekly XP.

8. **Replace `Math.random()` with `crypto.getRandomValues()`** for group codes and recovery codes.

9. **Remove `window._debug`** from production or guard it behind a dev-only flag.

10. **Add Firebase rules for `feedback` path** explicitly, and add TTL/cleanup logic for `dailyQuestion` nodes.
