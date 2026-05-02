# Integrations

## External APIs

### Firebase Realtime Database
- **Project:** `quiz-app-e738b` (europe-west1 region)
- **URL:** `https://quiz-app-e738b-default-rtdb.europe-west1.firebasedatabase.app`
- **SDK:** Firebase compat v10.12.0 loaded from `https://www.gstatic.com/firebasejs/10.12.0/`
- **Config file:** `js/firebase.js` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId hardcoded)
- **Sync layer:** `js/sync.js` — `MQSync` object handles post-game push, launch sync, offline queue, force-update check

**RTDB data tree:**

| Path | Purpose |
|---|---|
| `/players/{uid}` | Public player stats (XP, rank, weekly XP, streak, bosses defeated) + backup |
| `/players/{uid}/backup` | Full profile backup (all fields) for cross-device restore |
| `/leaderboard/weekly/{uid}` | Weekly leaderboard entries (XP-ordered) |
| `/groups/{code}` | Group metadata, members, parents, parentRequests, dashboard, banned, rewards |
| `/duels/{code}` | Real-time 1v1 duel state — rounds, scores, winner |
| `/riddles/{id}` | Community-created riddles with play stats and vote counts |
| `/dailyQuestion/{date}` | Daily question + per-user answers and timing |
| `/recovery/{code}` | Recovery code → UID mapping for cross-device profile restore |
| `/admin_uid` | Global admin UID (write-once) |
| `/app_version` | Integer version for force-update mechanism (admin-writable) |

**Security rules file:** `database.rules.json` — deployed separately to Firebase console.

### Google Fonts
- **URL:** `https://fonts.googleapis.com`
- **Fonts loaded:** `Fredoka` and `Quicksand` (both wght 400–700)
- **Loaded in:** `index.html` `<head>` via `<link rel="preconnect">` + stylesheet link
- No fallback defined if CDN is unavailable (offline PWA will use system fonts)

### jsDelivr CDN
- **qrcode-generator** 1.4.4 — `https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js`
  - Used for generating QR codes on profile recovery screens
- **html2canvas** 1.4.1 — `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js` (`defer`)
  - Used for capturing screenshots in the feedback overlay (FAB button)

## Databases & Storage

### Firebase Realtime Database (primary)
See External APIs section above. Used for all multiplayer and cross-device features.

### localStorage (primary offline store)
- All single-player game state, profile data, settings, and progression live in `localStorage`
- Managed by `ProfileManager` in `js/profiles.js` — namespaced per profile ID
- Acts as source of truth; Firebase is a sync/backup layer
- Leaderboard and riddle data are cached to localStorage for offline display

### Service Worker Cache (PWA offline)
- Cache name: `quizhero-v38` (versioned — bumped on deploy)
- Caches 13 static assets: `index.html`, `css/style.css`, all `js/*.js` files
- Strategy: network-first, fallback to cache on failure
- Managed in `sw.js`; invalidated via `MQSync.syncOnLaunch()` force-update check

## Auth Providers

### Firebase Anonymous Authentication
- **Method:** `auth.signInAnonymously()` (Firebase Auth compat v10.12.0)
- **Trigger:** Called on app launch via `MQSync.syncOnLaunch()` — only if at least one local profile exists (prevents phantom entries)
- **UID persistence:** Cached in `localStorage` key `mq_firebaseUid` for offline access
- **No email/password, no OAuth, no social login**
- Anonymous UID is the sole identity token; recovery codes (`NAME-XXXX` format) map codes to UIDs in `/recovery/`

## CDN / Hosting

### GitHub Pages
- **URL:** https://pezzonidasit.github.io/quizhero/
- **Repo:** `pezzonidasit/quizhero`
- **Branch:** `main` (auto-deploy on push)
- **No build pipeline** — raw static files served directly
- **PWA installable** via `manifest.json` + service worker

### Google Static Content (gstatic.com)
- Firebase JS SDK served from `https://www.gstatic.com/firebasejs/10.12.0/`
- 3 scripts: `firebase-app-compat.js`, `firebase-auth-compat.js`, `firebase-database-compat.js`

## Other Services

### Playwright (dev/testing only)
- `@playwright/test` ^1.58.2 installed as devDependency
- Used for E2E tests (`tests/` directory, `playwright.config.js`)
- Not part of the deployed app; not referenced in any production JS

### Feedback System (internal, no external service)
- FAB button (`#btn-feedback`) opens overlay for bug reports and suggestions
- Screenshot captured via `html2canvas` (jsDelivr CDN)
- **No external submission endpoint** — feedback data handling is UI-only in current implementation (submit handler in `js/app.js`)

### Share Score (Web Share API)
- Uses native `navigator.share()` browser API where available
- No third-party sharing SDK
- Fallback: clipboard copy or direct URL share
