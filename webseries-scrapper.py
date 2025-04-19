import re
import time
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
from webdriver_manager.chrome import ChromeDriverManager

movie_links_cache = {}
js_path = "/Users/anurag/Downloads/seriesDownloadLinks .js"

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

        time.sleep(2)
        all_tabs = driver.window_handles
        new_tab = all_tabs[-1]
        driver.switch_to.window(new_tab)
        final_url = driver.current_url
        print(f"Final URL after download button click: {final_url}")

        if content_name not in movie_links_cache:
            with open(js_path, "r+", encoding="utf-8") as js_file:
                content = js_file.read()
                insert_index = content.rfind("};")
                if insert_index != -1:
                    updated_content = (
                        content[:insert_index]
                        + f'  "{content_name}": "{final_url}",\n'
                        + content[insert_index:]
                    )
                    js_file.seek(0)
                    js_file.write(updated_content)
                    js_file.truncate()
            movie_links_cache[content_name] = final_url
            print(f"Updated movieDownloadLinks.js with {content_name}")
        driver.close()
        driver.switch_to.window(driver.window_handles[0])
    except Exception as e:
        print(f"Failed to click download button: {e}")
        raise

    finally:
        driver.close()  # Close the download tab
        driver.switch_to.window(driver.window_handles[0])  # Switch back to the main tab

def process_article_with_retry(link):
    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--start-maximized")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("--disable-blink-features=AutomationControlled")
        prefs = {"profile.managed_default_content_settings.images": 2}
        options.add_experimental_option("prefs", prefs)

        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        actions = ActionChains(driver)
        process_article(link, driver, actions)
        driver.quit()
    except Exception as e:
        print(f"Failed to process {link}: {e}")

# --------- Step 1: Open the Main Site ---------
page = 17  #--- hollywood 120
while True:
    try:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("--disable-blink-features=AutomationControlled")
        prefs = {"profile.managed_default_content_settings.images": 2}
        options.add_experimental_option("prefs", prefs)

        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        url = f"https://movies4u.rentals/category/web-series/page/{page}/" if page > 1 else "https://movies4u.rentals/category/web-series"
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