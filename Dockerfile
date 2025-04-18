FROM python:3.13-alpine

# Install Chromium and dependencies for Selenium
RUN apk add --no-cache \
    bash curl unzip \
    chromium \
    chromium-chromedriver \
    libstdc++ \
    libx11 \
    libxcomposite \
    libxdamage \
    libxrandr \
    libxrender \
    dbus \
    ttf-freefont \
    alsa-lib \
    nss \
    gtk+3.0

# Set environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROMEDRIVER_BIN=/usr/bin/chromedriver

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your script
COPY mkvcinemas_scrapper.py .

# Run the script
CMD ["python", "mkvcinemas_scrapper.py"]