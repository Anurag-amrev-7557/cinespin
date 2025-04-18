import re
import time
import tempfile
import json
import os
import threading
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.service import Service

movie_links_cache = {}
js_path = os.path.join(os.path.dirname(__file__), "src", "utils", "movieDownloadLinks.js")

# Load existing file into the cache
if os.path.exists(js_path):
    import re

    with open(js_path, "r", encoding="utf-8") as f:
        content = f.read()
        try:
            json_match = re.search(r"{.*?}", content, re.DOTALL)
            if json_match:
                raw_json = json_match.group(0)
                raw_json = re.sub(r",\s*}", "}", raw_json)  # Remove trailing commas
                movie_links_cache = json.loads(raw_json)
            else:
                print("Could not find valid JSON object in JS file. Starting with empty cache.")
                movie_links_cache = {}
        except json.JSONDecodeError as e:
            print(f"Error decoding JS content: {e}. Starting with empty cache.")
            movie_links_cache = {}

def process_article(article_link, driver, actions):
    try:
        driver.execute_script("window.open(arguments[0], '_blank');", article_link)
        time.sleep(1)
        new_tabs = driver.window_handles
        driver.switch_to.window(new_tabs[-1])
        print("Switched to new article tab.")

        # Extract content name from h1
        try:
            h1_text = driver.find_element(By.TAG_NAME, "h1").text
            print(f"h1 Text: {h1_text}")
            match = re.match(r'^(.*?)\s*\(', h1_text)
            if match:
                content_name = match.group(1).strip()
                print(f"Extracted Content Name: {content_name}")
            else:
                print("Could not extract content name from h1.")
                return
        except Exception as e:
            print(f"Error extracting content name from h1: {e}")
            return

        print("Current URL:", driver.current_url)
        with open("debug_page.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("Saved page source to debug_page.html")

        iframes = driver.find_elements(By.TAG_NAME, "iframe")
        print(f"Found {len(iframes)} iframes on the page.")
        if iframes:
            driver.switch_to.frame(iframes[0])
            print("Switched into iframe.")
            try:
                wait = WebDriverWait(driver, 5)
                download_button = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "btn")))
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", download_button)
                time.sleep(1)
                download_button.click()
                print("Clicked on download button inside iframe.")
            except Exception as e:
                print("Failed to click download button inside iframe:", e)
            finally:
                driver.switch_to.default_content()
        else:
            print("No iframes found on the page.")

        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".download-links-div .downloads-btns-div"))
        )
        download_btn_containers = driver.find_elements(By.CSS_SELECTOR, ".download-links-div .downloads-btns-div")
        clicked = False
        for container in download_btn_containers:
            try:
                btn = container.find_element(By.CSS_SELECTOR, ".btn")
                print("Found a download button.")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", btn)
                print("Clicked on download button.")
                clicked = True
                break
            except Exception as inner_e:
                print(f"Skipping a container due to error: {inner_e}")
        if not clicked:
            raise Exception("No downloadable .btn found in .downloads-btns-div containers.")

        driver.switch_to.default_content()  # Exit iframe if entered
    except Exception as e:
        print(f"Failed to click download button: {e}")
        raise

    # Switch to the new tab that opens
    all_tabs = driver.window_handles
    new_download_tab = all_tabs[-1]
    article_tab = all_tabs[-2]
    driver.switch_to.window(new_download_tab)
    print("Switched to newly opened download tab.")
    
    try:
        driver.switch_to.window(article_tab)
        driver.close()  # Close the article tab
        driver.switch_to.window(new_download_tab)

        # Look for h4 elements and find the one that says "1080p" and not "HEVC"
        h4s = driver.find_elements(By.CSS_SELECTOR, ".download-links-div h4")
        if not h4s:
            print("No h4 elements found in .download-links-div")
            return

        for h4 in h4s:
            try:
                text = h4.text.strip()
            except Exception as e:
                print(f"Skipping an h4 element due to error: {e}")
                continue
            
            if "1080p" in text and "HEVC" not in text:
                try:
                    container = h4.find_element(By.XPATH, "following-sibling::div[contains(@class, 'downloads-btns-div')]")
                    btns = container.find_elements(By.CSS_SELECTOR, ".btn")
                    print(f"Found {len(btns)} buttons under 1080p section.")
                    if btns:
                        btn_to_click = None
                        for b in btns:
                            try:
                                if "🚀 G-Drive [No-Login]" in b.text:
                                    btn_to_click = b
                                    break
                            except Exception as btn_err:
                                print(f"Error reading button text: {btn_err}")

                        if btn_to_click:
                            WebDriverWait(driver, 5).until(EC.element_to_be_clickable(btn_to_click))
                            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn_to_click)
                            time.sleep(1)
                            driver.execute_script("arguments[0].click();", btn_to_click)
                            print('Clicked on "🚀 G-Drive [No-Login]" button using JavaScript')
                        else:
                            print('No button with text "🚀 G-Drive [No-Login]" found. Trying "🚀 GDFlix" button instead.')
                            # Fallback to "🚀 GDFlix" button
                            btn_to_click = None
                            for b in btns:
                                try:
                                    if "🚀 GDFlix" in b.text:
                                        btn_to_click = b
                                        break
                                except Exception as btn_err:
                                    print(f"Error reading button text: {btn_err}")

                            if btn_to_click:
                                WebDriverWait(driver, 5).until(EC.element_to_be_clickable(btn_to_click))
                                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn_to_click)
                                time.sleep(1)
                                driver.execute_script("arguments[0].click();", btn_to_click)
                                print('Clicked on "🚀 GDFlix" button using JavaScript')
                            else:
                                print('No "🚀 GDFlix" button found either. Trying "Direct-[Drive-link]" button.')
                                btn_to_click = None
                                for b in btns:
                                    try:
                                        if "🚀 Direct-[Drive-link]" in b.text:
                                            btn_to_click = b
                                            break
                                    except Exception as btn_err:
                                        print(f"Error reading button text: {btn_err}")

                                if btn_to_click:
                                    WebDriverWait(driver, 5).until(EC.element_to_be_clickable(btn_to_click))
                                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn_to_click)
                                    time.sleep(1)
                                    driver.execute_script("arguments[0].click();", btn_to_click)
                                    print('Clicked on "Direct-[Drive-link]" button using JavaScript')
                                else:
                                    print('No "🚀 Direct-[Drive-link]" button found either.')

                        time.sleep(1)  # Allow time for the new tab to open
                        all_tabs = driver.window_handles
                        new_download_tab = all_tabs[-1]
                        log_tab = all_tabs[-2]
                        driver.switch_to.window(new_download_tab)
                        print("Switched to newly opened download tab.")
                        driver.switch_to.window(log_tab)
                        driver.close()  # Close the log tab
                        driver.switch_to.window(new_download_tab)

                        current_url = driver.current_url
                        print(f"Final URL: {current_url}")

                        if content_name not in movie_links_cache:
                            with open(js_path, "r+", encoding="utf-8") as js_file:
                                content = js_file.read()
                                insert_index = content.rfind("};")
                                if insert_index != -1:
                                    updated_content = (
                                        content[:insert_index]
                                        + f'  "{content_name}": "{current_url}",\n'
                                        + content[insert_index:]
                                    )
                                    js_file.seek(0)
                                    js_file.write(updated_content)
                                    js_file.truncate()
                            movie_links_cache[content_name] = current_url

                        print(f"Updated movieDownloadLinks.js with {content_name}")
                    else:
                        print("No buttons found under 1080p section.")
                except Exception as e:
                    print(f"Error processing h4 with '1080p' text: {e}")
    finally:
        driver.close()  # Close the download tab
        driver.switch_to.window(driver.window_handles[0])  # Switch back to the main tab

def process_article_with_retry(link):
    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--start-maximized")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("--disable-blink-features=AutomationControlled")
        prefs = {"profile.managed_default_content_settings.images": 2}
        options.add_experimental_option("prefs", prefs)

        service = Service("/usr/bin/chromedriver")
        driver = webdriver.Chrome(service=service, options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        actions = ActionChains(driver)
        process_article(link, driver, actions)
        driver.quit()
    except Exception as e:
        print(f"Failed to process {link}: {e}")

# --------- Step 1: Open the Main Site ---------
page = 1  #--- hollywood 120
while True:
    if page > 1:
        break
    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--start-maximized")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument(f"--user-data-dir={tempfile.mkdtemp()}")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("--disable-blink-features=AutomationControlled")
        prefs = {"profile.managed_default_content_settings.images": 2}
        options.add_experimental_option("prefs", prefs)

        service = Service("/usr/bin/chromedriver")
        driver = webdriver.Chrome(service=service, options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        url = f"https://movies4u.rentals/page/{page}/" if page > 1 else "https://movies4u.rentals/"
        driver.get(url)
        time.sleep(1)

        driver.execute_script("""
            const overlays = document.querySelectorAll('[class*="overlay"], [id*="overlay"], .popup, .modal');
            overlays.forEach(el => el.remove());
        """)

        articles = driver.find_elements(By.TAG_NAME, "article")
        if not articles:
            print(f"No articles found on page {page}. Ending.")
            break

        article_links = []
        for article in articles:
            try:
                WebDriverWait(driver, 5).until(EC.element_to_be_clickable(article))
                article_link = article.find_element(By.TAG_NAME, "a").get_attribute("href")
                article_links.append(article_link)
            except Exception as e:
                print(f"Skipping an article due to error: {e}")

        if article_links:
            for i in range(0, len(article_links), 3):
                batch = article_links[i:i+3]
                threads = []
                for link in batch:
                    thread = threading.Thread(target=process_article_with_retry, args=(link,))
                    thread.start()
                    threads.append(thread)
                for thread in threads:
                    thread.join(timeout=30)
                    if thread.is_alive():
                        print("Thread timed out. Moving to next batch.")
            driver.quit()
            page += 1
        else:
            print(f"No valid article links found on page {page}. Ending.")
            driver.quit()
            break
    except Exception as e:
        print(f"Failed to process page {page}: {e}")
        driver.quit()
        break