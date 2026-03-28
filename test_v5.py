"""QuizHero V5 — Playwright Smoke Tests"""
import sys, http.server, socketserver, threading

handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("127.0.0.1", 8080), handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

URL = "http://127.0.0.1:8080"
SD = "screenshots"
errors, passes = [], []

def test(name, passed, detail=""):
    (passes if passed else errors).append(name if passed else f"{name}: {detail}")
    print(f"  {'PASS' if passed else 'FAIL'}: {name}" + ("" if passed else f" — {detail}"))

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 390, "height": 844})

    # Fresh state
    page.goto(URL)
    page.evaluate("localStorage.clear(); sessionStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Create profile
    page.evaluate("document.getElementById('btn-new-profile').click()")
    page.wait_for_timeout(500)
    page.evaluate("""
        const inp = document.getElementById('profile-name-input');
        inp.value = 'TestV5';
        inp.dispatchEvent(new Event('input'));
    """)
    page.evaluate("document.getElementById('btn-create-profile').click()")
    page.wait_for_timeout(2000)

    # ═══ T5: Login reward ═══
    login_vis = page.evaluate("document.getElementById('login-reward-overlay')?.style.display === 'flex'")
    test("T5: Login reward popup", login_vis)
    if login_vis:
        page.screenshot(path=f"{SD}/t5_login_reward.png")
        dots = page.evaluate("document.querySelectorAll('.login-dot').length")
        test("T5: 7 streak dots", dots == 7, f"got {dots}")
        amt = page.evaluate("document.getElementById('login-reward-amount')?.textContent?.trim() || ''")
        test("T5: Shows amount", len(amt) > 0, amt)
        page.evaluate("document.getElementById('btn-claim-login').click()")
        page.wait_for_timeout(500)
        test("T5: Dismissed after claim",
             page.evaluate("document.getElementById('login-reward-overlay')?.style.display !== 'flex'"))

    # ═══ T6: Weekly ceremony (not triggered on fresh profile) ═══
    test("T6: Ceremony overlay in DOM",
         page.evaluate("document.getElementById('weekly-ceremony-overlay') !== null"))

    # ═══ Home screen ═══
    page.wait_for_timeout(300)
    active = page.evaluate("document.querySelector('.screen.active')?.id")
    test("Home screen active", active == "screen-home", f"got {active}")
    page.screenshot(path=f"{SD}/home.png")

    # ═══ T9: Regularity streak ═══
    test("T9: Container exists", page.evaluate("document.getElementById('regularity-streak') !== null"))
    test("T9: 7 dots", page.evaluate("document.querySelectorAll('.reg-dot').length") == 7)
    test("T9: Header text", "semaine" in (page.evaluate(
        "document.querySelector('.regularity-header')?.textContent || ''") or "").lower())

    # ═══ Start game (bypass group requirement via _debug) ═══
    page.evaluate("""
        _debug.state.category = 'calcul';
        _debug.state.difficulty = 'easy';
        _debug.state.questionCount = 5;
        _debug.state.timerEnabled = false;
        // startGame is not exposed, simulate the play button without group check
        // Trigger showContractScreen or call startGame via the debug interface
    """)
    # The game functions are in closure — use the pill UI + override getMyGroups
    page.evaluate("window.getMyGroups = async () => [{code:'TEST',name:'Test'}]")
    page.evaluate("document.getElementById('btn-play').click()")
    page.wait_for_timeout(1500)

    # Dismiss contract if shown
    if page.evaluate("document.querySelector('.screen.active')?.id") == "screen-contract":
        page.evaluate("document.querySelector('.contract-card')?.click()")
        page.wait_for_timeout(500)

    active2 = page.evaluate("document.querySelector('.screen.active')?.id")
    test("Game started", active2 == "screen-game", f"got {active2}")
    page.screenshot(path=f"{SD}/game.png")

    # ═══ Answer questions: wrong on Q1 (T1), rest attempt correct ═══
    if active2 == "screen-game":
        for i in range(5):
            page.wait_for_timeout(300)
            if not page.evaluate("document.querySelector('#screen-game.active')"):
                break

            val = "99999" if i == 0 else "42"
            page.evaluate(f"""
                const inp = document.getElementById('answer-input') || document.getElementById('answer-text-input');
                if (inp) {{ inp.value = '{val}'; inp.dispatchEvent(new Event('input')); }}
            """)
            page.evaluate("document.getElementById('btn-validate')?.click()")
            page.wait_for_timeout(600)

            # ═══ T1: Positive feedback ═══
            if i == 0:
                text = page.evaluate("document.getElementById('feedback-result')?.textContent || ''")
                cls = page.evaluate("document.getElementById('feedback-result')?.className || ''")
                test("T1: 'Pas encore !'", "Pas encore" in text, f"got: {text[:80]}")
                test("T1: No 'Incorrect'", "Incorrect" not in text, f"got: {text[:80]}")
                test("T1: incorrect class", "incorrect" in cls, cls)
                page.screenshot(path=f"{SD}/t1_wrong_answer.png")

            page.evaluate("document.getElementById('btn-next')?.click()")
            page.wait_for_timeout(300)

        # ═══ End screen ═══
        page.wait_for_timeout(500)
        active3 = page.evaluate("document.querySelector('.screen.active')?.id")
        test("End screen", active3 == "screen-end", f"got {active3}")
        page.screenshot(path=f"{SD}/end_screen.png")

        # ═══ T3: Almost-there ═══
        test("T3: Element exists", page.evaluate("document.getElementById('almost-there') !== null"))

    # ═══ T7: Session limit overlay ═══
    test("T7: Overlay in DOM", page.evaluate("document.getElementById('session-limit-overlay') !== null"))

    # ═══ T4: TITLE_NAMES ═══
    test("T4: TITLE_NAMES defined", page.evaluate("typeof TITLE_NAMES === 'object' && TITLE_NAMES.boss_golem === 'Briseur de Golem'"))

    # ═══ T8: Chest cap functions ═══
    test("T8: canOpenChestToday()", page.evaluate("typeof canOpenChestToday === 'function'"))
    test("T8: recordChestOpened()", page.evaluate("typeof recordChestOpened === 'function'"))

    # ═══ T1: CSS color is orange ═══
    color = page.evaluate("""(() => {
        const el = document.createElement('span');
        el.className = 'feedback-result incorrect';
        document.body.appendChild(el);
        const c = getComputedStyle(el).color;
        el.remove();
        return c;
    })()""")
    test("T1: CSS orange not red", "107, 107" not in color, f"color={color}")

    page.screenshot(path=f"{SD}/final.png")
    browser.close()

httpd.shutdown()

print(f"\n{'='*50}")
print(f"RESULTS: {len(passes)} passed, {len(errors)} failed")
print(f"{'='*50}")
if errors:
    print("\nFAILURES:")
    for e in errors:
        print(f"  x {e}")
    sys.exit(1)
else:
    print("\nAll tests passed!")
    sys.exit(0)
