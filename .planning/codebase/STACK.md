# Stack

## Languages & Runtime

- **HTML5** — single-page app structure (`index.html`), 25+ named screens as `<div id="screen-*">` blocks
- **CSS3** — dark theme, CSS custom properties (variables) for theming, responsive layout (`css/style.css`)
- **Vanilla JavaScript (ES2020+)** — zero framework, async/await throughout, no transpilation
- **Service Worker** — `sw.js`, cache-first with network fallback, versioned as `quizhero-v38`

No build step. No bundler. No transpiler. Files are served as-is.

## Frameworks & Libraries

All loaded via CDN at runtime — no local npm bundles:

| Library | Version | Source | Purpose |
|---|---|---|---|
| Firebase App (compat) | 10.12.0 | `gstatic.com` | SDK init |
| Firebase Auth (compat) | 10.12.0 | `gstatic.com` | Anonymous auth |
| Firebase Realtime DB (compat) | 10.12.0 | `gstatic.com` | Real-time sync, leaderboard, duels |
| qrcode-generator | 1.4.4 | `cdn.jsdelivr.net` | QR code generation (profile recovery) |
| html2canvas | 1.4.1 | `cdn.jsdelivr.net` | Screenshot for feedback/share feature (`defer`) |

Google Fonts loaded at runtime:
- `Fredoka` (wght 400–700)
- `Quicksand` (wght 400–700)

## Dependencies

**Production:** zero npm dependencies — all libraries loaded from CDN.

**Development only** (`package.json` devDependencies):
- `@playwright/test` ^1.58.2 — E2E testing (test files in `tests/`)

`node_modules/` exists locally for Playwright but is not deployed.

## Configuration

| File | Purpose |
|---|---|
| `manifest.json` | PWA manifest — `display: standalone`, portrait orientation, `theme_color: #1a1a2e`, SVG icon |
| `sw.js` | Service worker — cache name `quizhero-v38`, pre-caches 13 assets, network-first with offline fallback |
| `database.rules.json` | Firebase RTDB security rules — deployed to Firebase project `quiz-app-e738b` |
| `js/firebase.js` | Firebase project config (apiKey, projectId, databaseURL, etc.) — hardcoded, public |
| `package.json` | Node manifest for dev tooling only (`@playwright/test`), `type: commonjs` |

**localStorage keys** (client-side persistence, namespaced per profile by `ProfileManager`):
- `mq_firebaseUid` — cached anonymous Firebase UID
- `mq_app_version` — remote version integer for force-update check
- `mq_leaderboard_cache` / `mq_leaderboard_updated` — offline leaderboard cache
- `mq_riddles_cache` — offline community riddles cache
- Profile data namespaced as `mq_{profileId}_{field}`

## Build & Deploy

- **No build step** — static files deployed directly
- **GitHub Pages** — https://pezzonidasit.github.io/quizhero/ (auto-deploy on push to `main`)
- **Deploy command:**
  ```bash
  cd /tmp/mathquiz-deploy && cp -r /c/Users/User/Claude/MathQuiz/* . && git add -A && git commit -m "update" && git push
  ```
- **Repo:** `pezzonidasit/quizhero`
- **Force-update mechanism:** admin writes integer to Firebase `/app_version`; clients compare on launch, purge SW cache and reload if remote > local

## JS Module Load Order (critical — no module system)

`themes.js` → `bosses-svg.js` → `profiles.js` → `questions.js` → `progression.js` → `fiches.js` → `app.js` → `duel.js`

Firebase SDK scripts load before all app scripts: `firebase.js` → `sync.js` → then app modules.
