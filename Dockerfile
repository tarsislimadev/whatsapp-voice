FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  espeak-ng \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application source
COPY src ./src
COPY .env.example ./

# Create necessary directories
RUN mkdir -p /root/.ollama temp audio_cache logs

# Pre-download Llama3 model to save startup time
RUN ollama pull llama3 || true

# Expose ports
EXPOSE 3000 11434

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start services
CMD ["sh", "-c", "ollama serve & npm start"]

