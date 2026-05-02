# Testing

## Test Framework

- **Primary**: [Playwright](https://playwright.dev/) via the Python `playwright` sync API.
- **Test runner**: Plain Python scripts — no pytest, no unittest. Tests are hand-rolled assertions using a local `test(name, passed, detail)` helper that collects pass/fail lists and exits with code `1` on any failure.
- **Config file**: `C:\Users\User\Claude\MathQuiz\playwright.config.js` exists (likely from an earlier npm-based Playwright setup).
- **npm package**: `package.json` is present — Playwright is likely also available as a Node package, but active tests use the Python binding.
- **Local server**: Each test file spins up `http.server.SimpleHTTPRequestHandler` in a background thread to serve the PWA locally before launching the browser.

## Test Files

### `test_v5.py` — Smoke test suite (feature parity checks)
Path: `C:\Users\User\Claude\MathQuiz\test_v5.py`

Covers:
- **T1**: Wrong-answer feedback text ("Pas encore !" not "Incorrect"), CSS class (`incorrect`), and orange colour check.
- **T3**: "Almost there" element present on end screen.
- **T4**: `TITLE_NAMES` global object is defined with correct content.
- **T5**: Daily login reward overlay — visibility, 7 streak dots, amount text, dismiss on claim.
- **T6**: Weekly ceremony overlay is in the DOM (not triggered on fresh profile).
- **T7**: Session limit overlay is in the DOM.
- **T8**: `canOpenChestToday()` and `recordChestOpened()` functions exist in global scope.
- **T9**: Regularity streak widget — container exists, 7 dots rendered, header contains "semaine".
- **General**: Home screen activates after profile creation, game starts (`screen-game` active), end screen appears after 5 questions.

### `test_feedback.py` — Screenshot capture script
Path: `C:\Users\User\Claude\MathQuiz\test_feedback.py`

Not an assertion test — visual regression / manual review tool. Captures screenshots to `screenshots/`:
- `feedback_fab.png` — Home with FAB (feedback button) visible.
- `feedback_bug_mode.png` — Feedback overlay in bug mode.
- `feedback_bug_filled.png` — Bug report with text filled.
- `feedback_suggestion_mode.png` — Feedback overlay in suggestion mode.
- `feedback_wrong_answer_new.png` — Wrong answer display in-game.

### `tests/` directory
Path: `C:\Users\User\Claude\MathQuiz\tests\`
Exists but contents not inspected (likely Playwright test files from an npm-based setup). Also a `test-results/` directory is present for Playwright output.

## Testing Approach

1. **Black-box browser automation**: Tests drive the real app in a headless Chromium browser via Playwright. No unit tests on JS functions in isolation.
2. **Fresh state per run**: Each test clears `localStorage` and `sessionStorage` via `page.evaluate("localStorage.clear(); sessionStorage.clear()")` followed by a page reload.
3. **Profile setup in evaluate**: Profile creation is driven by `page.evaluate(...)` calls that click buttons and fill inputs by ID — same path as a real user.
4. **Group check bypass**: The V4 group requirement for playing is bypassed in tests with `page.evaluate("window.getMyGroups = async () => [{code:'TEST',name:'Test'}]")`.
5. **Contract screen dismiss**: Tests detect and dismiss the contract screen before asserting game state.
6. **`_debug` object**: `js/app.js` exposes a `window._debug` object giving tests access to the internal `state` object — used to set `category`, `difficulty`, and `questionCount` for test games.
7. **Screenshots on key steps**: `test_v5.py` saves screenshots at `screenshots/` for visual confirmation of each major screen transition.
8. **Viewport**: Tests simulate a mobile viewport — 390×844 (iPhone 14 dimensions).

## How to Run Tests

Prerequisite: Playwright for Python must be installed.

```bash
cd /c/Users/User/Claude/MathQuiz
python -m playwright install chromium   # one-time
python test_v5.py
python test_feedback.py
```

- `test_v5.py` exits `0` on full pass, `1` on any failure. Prints a summary table.
- `test_feedback.py` always exits `0` — it only saves screenshots.
- Screenshots land in `C:\Users\User\Claude\MathQuiz\screenshots\`.

## Manual Testing Notes

- **PWA install**: Test by opening `https://pezzonidasit.github.io/quizhero/` on Android/iOS Chrome and using "Add to Home Screen". No automated check for this.
- **Offline mode**: Service worker caching strategy is network-first with cache fallback (`sw.js` line 36-40). Cache version is `quizhero-v38` — increment `CACHE_NAME` on every deploy to bust stale assets.
- **Multi-profile isolation**: Verify with browser devtools that `localStorage` keys are correctly namespaced as `mq_p_{id}_*`. Deleting a profile should leave no orphan keys.
- **Theme switching**: Each theme injects CSS custom property overrides — test in browser with devtools to verify no token bleed between profiles.
- **Daily/weekly resets**: Use `page.evaluate` to manually set `dailyCoinDate`, `lastLoginDate`, `loginStreak` to stale values to trigger reset logic without waiting.
- **Deploy smoke check**: After `git push` to `main`, visit `https://pezzonidasit.github.io/quizhero/` and verify the page loads and a game can be started.
