FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  espeak-ng \
  zstd \
  libglib2.0-0 \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libdbus-1-3 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libatspi2.0-0 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxext6 \
  libxss1 \
  libxshmfence1 \
  libpango-1.0-0 \
  libcairo2 \
  libgtk-3-0 \
  fonts-liberation \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Ollama
# RUN curl -fsSL https://ollama.ai/install.sh | sh

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy application source
COPY src ./src
COPY .env.example ./

# Create necessary directories
RUN mkdir -p /root/.ollama temp audio_cache logs

# Pre-download Llama3 model to save startup time
# RUN ollama pull llama3 || true

# Expose ports
EXPOSE 3000 11434

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start services
CMD ["sh", "-c", "ollama serve & npm start"]
