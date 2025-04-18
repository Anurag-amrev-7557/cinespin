FROM python:3.13-alphine

# Install dependencies
RUN apk add --no-cache \
    bash curl unzip chromium chromium-chromedriver \
    libstdc++ libx11 libxcomposite libxdamage libxrandr \
    libxss libgtk-3.0-dev libnss dbus ttf-freefont

# Set environment variables for Selenium
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROMEDRIVER_BIN=/usr/bin/chromedriver

# Set working directory
WORKDIR /app

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the scraper script
COPY mkvcinemas_scrapper.py .

# Run the scraper
CMD ["python", "mkvcinemas_scrapper.py"]