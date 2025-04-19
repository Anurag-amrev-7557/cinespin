from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Setup
driver = webdriver.Chrome()  # or webdriver.Firefox() if using Firefox
driver.get("https://movies4u.rentals/")
wait = WebDriverWait(driver, 15)

# Step 1: Wait for articles and get all of them
wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".container article")))
articles = driver.find_elements(By.CSS_SELECTOR, ".container article")

# Loop through all articles
for article in articles:
    article_url = article.get_attribute("href")

    # Open article in new tab
    driver.execute_script("window.open(arguments[0], '_blank');", article_url)
    driver.switch_to.window(driver.window_handles[1])

    # Step 2: Wait for h1 and get movie title
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    h1_text = driver.find_element(By.TAG_NAME, "h1").text
    movie_title = h1_text.split("(")[0].strip() if "(" in h1_text else h1_text.strip()

    # Step 3: Check for the presence of the .watch-btns-div element
    try:
        watch_btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".watch-btns-div .btn")))
        driver.execute_script("window.open(arguments[0].href, '_blank');", watch_btn)
        time.sleep(2)  # Let the new tab open
        driver.switch_to.window(driver.window_handles[2])

        # Step 4: Close article tab
        driver.switch_to.window(driver.window_handles[-2])
        driver.close()
        driver.switch_to.window(driver.window_handles[-1])

        # Step 5: Click "Embed Link" tab
        wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".nav-link")))
        nav_links = driver.find_elements(By.CSS_SELECTOR, ".nav-link")
        for link in nav_links:
            if "Embed Link" in link.text:
                driver.execute_script("arguments[0].scrollIntoView(true);", link)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", link)
                break

        # Step 6: Extract textarea value
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "textarea")))
        download_link = driver.find_element(By.TAG_NAME, "textarea").get_attribute("value")

        # Step 7: Save to file
        embed_link = download_link.replace("download", "embed")

        file_content = f'''const streamDownloadLinks = {{
          "{movie_title}": "{embed_link}",
        }};

        export default streamDownloadLinks;
        '''

        # Save the content to the .js file
        with open("/Users/anurag/Downloads/streamLinks.js", "a", encoding="utf-8") as f:
            f.write(file_content)

        print("Saved:", movie_title, "->", embed_link)

        # Close streaming tab and switch back to main
        driver.close()
        driver.switch_to.window(driver.window_handles[0])

    except Exception as e:
        # If there's no .watch-btns-div or any error occurs, skip this article
        print(f"Skipping article: {article_url}. Error: {e}")
        driver.close()
        driver.switch_to.window(driver.window_handles[0])

# After processing all articles, finish up
driver.quit()