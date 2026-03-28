"""QuizHero — Screenshot feedback feature"""
import http.server, socketserver, threading

handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("127.0.0.1", 8081), handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

from playwright.sync_api import sync_playwright

SD = "screenshots"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({"width": 390, "height": 844})

    page.goto("http://127.0.0.1:8081")
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Create profile
    page.evaluate("""
        document.getElementById('btn-new-profile').click();
    """)
    page.wait_for_timeout(500)
    page.evaluate("""
        const inp = document.getElementById('profile-name-input');
        inp.value = 'TestFB';
        inp.dispatchEvent(new Event('input'));
        document.getElementById('btn-create-profile').click();
    """)
    page.wait_for_timeout(2000)

    # Dismiss login reward
    page.evaluate("""
        const btn = document.getElementById('btn-claim-login');
        if (btn && document.getElementById('login-reward-overlay')?.style.display === 'flex') btn.click();
    """)
    page.wait_for_timeout(500)

    # Screenshot 1: Home with FAB visible
    page.screenshot(path=f"{SD}/feedback_fab.png")

    # Click FAB — should open bug mode by default
    page.evaluate("document.getElementById('btn-feedback').click()")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{SD}/feedback_bug_mode.png")

    # Type some bug text
    page.evaluate("""
        document.getElementById('feedback-text').value = 'Le bouton Jouer ne marche pas quand je suis pas dans un groupe';
        document.getElementById('feedback-text').dispatchEvent(new Event('input'));
    """)
    page.wait_for_timeout(200)
    page.screenshot(path=f"{SD}/feedback_bug_filled.png")

    # Switch to suggestion mode
    page.evaluate("document.querySelector('.feedback-type-btn[data-type=\"suggestion\"]').click()")
    page.wait_for_timeout(300)
    page.evaluate("""
        document.getElementById('feedback-text').value = 'Ce serait trop bien d\\'avoir des pets comme dans Pokemon !';
    """)
    page.wait_for_timeout(200)
    page.screenshot(path=f"{SD}/feedback_suggestion_mode.png")

    # Also screenshot a wrong answer with user's response shown
    page.evaluate("document.getElementById('btn-feedback-cancel').click()")
    page.wait_for_timeout(300)

    # Start game
    page.evaluate("window.getMyGroups = async () => [{code:'T',name:'T'}]")
    page.evaluate("document.getElementById('btn-play').click()")
    page.wait_for_timeout(1500)
    # Dismiss contract
    if page.evaluate("document.querySelector('.screen.active')?.id") == "screen-contract":
        page.evaluate("document.querySelector('.contract-card')?.click()")
        page.wait_for_timeout(500)

    # Answer wrong
    page.evaluate("""
        const inp = document.getElementById('answer-input') || document.getElementById('answer-text-input');
        if (inp) { inp.value = '12345'; inp.dispatchEvent(new Event('input')); }
        document.getElementById('btn-validate')?.click();
    """)
    page.wait_for_timeout(600)
    page.screenshot(path=f"{SD}/feedback_wrong_answer_new.png")

    browser.close()

httpd.shutdown()
print("Screenshots saved!")
