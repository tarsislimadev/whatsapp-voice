# Project Plan

## 1. Project Goal

Build a WhatsApp voice bot in Node.js that can:

- Receive WhatsApp messages and voice notes

- Transcribe incoming audio to text

- Process the text through bot logic

- Reply with synthesized voice

- Be deployed and operated on Azure

## 2. Development Plan

### Phase 1: Foundations

- Set up the Node.js project structure

- Add configuration handling for environment variables

- Choose the WhatsApp integration approach, using `whatsapp-web.js`

- Define the message flow for text and voice messages

- Select STT and TTS providers for the first version

### Phase 2: WhatsApp Integration

- Connect the bot to WhatsApp Web

- Handle login and session persistence

- Listen for incoming messages and detect audio messages

- Download and store incoming audio temporarily for processing

- Add basic error handling and retry logic

### Phase 3: Speech Processing

- Convert WhatsApp voice formats to a format supported by the STT service

- Transcribe audio into text

- Send the transcript to the bot logic

- Generate the response text

- If needed, synthesize audio for voice replies

#### TTS Option: eSpeak NG (Text-to-Speech)

**eSpeak NG** (https://github.com/espeak-ng/espeak-ng) is an open-source Text-to-Speech (TTS) engine that synthesizes spoken audio from text.

**Setup for Local/Azure Deployment:**
```bash
# Install eSpeak NG locally (Linux)
apt-get install espeak-ng

# Or use a Docker container that includes it
```

**Integration in Node.js:**
- Use the `espeak` or `node-espeak` npm package to call eSpeak NG from your bot
- Alternative: Shell out to the `espeak-ng` CLI directly
- Supports multiple languages, voices, and speech rates
- Generates `.wav` or `.mp3` files that can be sent as WhatsApp audio replies

**Advantages for Your Project:**
- Fully open-source and free (no API costs)
- Runs locally or in a container (no external service dependency)
- Lightweight and fast synthesis
- Works offline and in restricted network environments

**Deployment in Azure:**
- Include `espeak-ng` in your Docker image with a `RUN apt-get install espeak-ng` step
- No additional Azure services needed (unlike cloud-based TTS)
- Fast response times for voice replies

*Note: eSpeak NG is for Text-to-Speech (TTS), not audio transcription. Pair it with Whisper or Google Cloud Speech-to-Text for the transcription (STT) side.*

### Phase 4: Bot Logic

- Implement a simple command and intent layer

- Add conversation handling for common user flows

- Support both short text replies and voice replies

- Log message processing results for debugging

#### Using Ollama with Llama3 for Bot Intelligence

**Ollama** is a local, self-hosted LLM (Large Language Model) runtime that lets you run **Llama3** and other models without external API calls.

**Why Ollama + Llama3?**
- Free and open-source (no API costs like OpenAI)
- Runs locally or in your Azure container (privacy & control)
- Fast inference for real-time WhatsApp replies
- Supports multi-language conversations
- Easy to fine-tune for domain-specific responses

**Setup for Local Development:**

```bash
# Install Ollama (macOS, Linux, Windows)
# From https://ollama.ai

# Pull Llama3 model
ollama pull llama3.2:1b

# Start Ollama server (runs on localhost:11434 by default)
ollama serve

# Test the model
curl http://localhost:11434/api/generate -d '{"model":"llama3.2:1b","prompt":"Hello, how are you?"}'
```

**Node.js Integration:**

```javascript
// Install SDK
npm install ollama

// In your bot code
const { Ollama } = require('ollama');

const ollama = new Ollama({ base_url: 'http://localhost:11434' });

async function generateBotReply(userMessage) {
  const response = await ollama.generate({
    model: 'llama3.2:1b',
    prompt: userMessage,
    stream: false,
  });
  return response.response;
}

// Use in message handler
const transcribedText = await transcribeAudio(voiceMessage);
const botReply = await generateBotReply(transcribedText);
const syntesizedAudio = await synthesizeWithESpeak(botReply);
await sendVoiceReply(chatId, syntesizedAudio);
```

**Advanced: Keeping Conversation Context**

```javascript
// Store conversation history for multi-turn interactions
const conversationHistory = {};

async function generateContextualReply(userId, userMessage) {
  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }

  // Build prompt with conversation history
  const context = conversationHistory[userId]
    .map((msg) => `User: ${msg.user}\nBot: ${msg.bot}`)
    .join('\n');

  const prompt = context 
    ? `${context}\nUser: ${userMessage}\nBot:`
    : `User: ${userMessage}\nBot:`;

  const response = await ollama.generate({
    model: 'llama3.2:1b',
    prompt: prompt,
    stream: false,
  });

  const botReply = response.response.trim();

  // Store in history
  conversationHistory[userId].push({
    user: userMessage,
    bot: botReply,
  });

  // Keep last 10 messages to avoid memory bloat
  if (conversationHistory[userId].length > 20) {
    conversationHistory[userId] = conversationHistory[userId].slice(-20);
  }

  return botReply;
}
```

**Deployment in Azure:**

Include Ollama and Llama3 in your Docker container:

```dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  && rm -rf /var/lib/apt/lists/*

# Install Ollama (lightweight installation)
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Copy bot code
WORKDIR /app
COPY . .

# Install npm dependencies
RUN npm install

# Expose ports
EXPOSE 3000 11434

# Start both Ollama and the bot
CMD ollama serve & npm start
```

**Azure Container Apps / App Service Considerations:**
- Ensure your Azure instance has sufficient RAM (Llama3 needs ~8GB minimum)
- Use Azure Container Apps with `memory: 4Gi` or higher
- For larger models, use **Azure Container Instances** with GPU support (though not cost-efficient for always-on)
- Pre-download the Llama3 model in the Docker image to avoid startup delays
- Alternative: Use **Azure OpenAI** if you prefer not to self-host

**Performance Optimization:**
- Cache recent Ollama responses for repeated queries
- Set `num_predict` parameter to limit response length and latency
- Use quantized models (e.g., `llama3-q4` for faster inference)
- Consider model variants: `llama3` (full), `llama3.2:1b` (smaller, faster)

**Example: Faster Configuration**

```javascript
async function generateFastReply(userMessage) {
  const response = await ollama.generate({
    model: 'llama3.2:1b',  // Smaller, faster variant
    prompt: userMessage,
    stream: false,
    num_predict: 150,    // Limit output length
    temperature: 0.7,    // Balance creativity & consistency
  });
  return response.response;
}
```

*Note: eSpeak NG (Phase 3) synthesizes the bot reply into voice, and Ollama/Llama3 (Phase 4) generates the intelligent text response.*

### Phase 5: Hardening

- Add validation for file types, sizes, and message formats

- Handle timeouts and failed transcription or synthesis requests

- Protect secrets and API keys

- Add structured logging and basic observability

## 3. Docker & Deployment Plan

### Containerization Strategy

The WhatsApp voice bot will be containerized as a Docker image that includes:
- Node.js runtime
- Ollama + Llama3 for bot logic
- eSpeak NG for text-to-speech synthesis
- All bot dependencies and configurations

### Dockerfile Structure

```dockerfile
FROM node:18-slim

# Install system dependencies for Ollama and eSpeak NG
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  espeak-ng \
  && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Set working directory
WORKDIR /app

# Copy bot source code
COPY . .

# Install Node.js dependencies
RUN npm install

# Pre-download Llama3 model during build (runs once, cached in layers)
RUN ollama pull llama3

# Expose ports
EXPOSE 3000 11434

# Start Ollama server and bot application
CMD ollama serve & npm start
```

### Building and Publishing the Docker Image

**Local Development:**
```bash
# Build the Docker image locally
docker build -t whatsapp-voice-copilot:latest .

# Run locally
docker run -it --rm \
  -e WHATSAPP_SESSION_DATA=/app/session \
  -v $(pwd)/session:/app/session \
  whatsapp-voice-copilot:latest
```

**Publishing to Container Registries:**

1. **Docker Hub** (Free, widely used)
   ```bash
   # Tag image
   docker tag whatsapp-voice-copilot:latest tarsislimadev/whatsapp-voice-copilot:latest
   
   # Push to Docker Hub
   docker push tarsislimadev/whatsapp-voice-copilot:latest
   ```

2. **GitHub Container Registry (ghcr.io)** (Free for public repos)
   ```bash
   # Tag image
   docker tag whatsapp-voice-copilot:latest ghcr.io/tarsislimadev/whatsapp-voice-copilot:latest
   
   # Login to GitHub Container Registry
   echo $GITHUB_TOKEN | docker login ghcr.io -u tarsislimadev --password-stdin
   
   # Push image
   docker push ghcr.io/tarsislimadev/whatsapp-voice-copilot:latest
   ```

3. **Quay.io** (Free, enterprise options)
   ```bash
   docker tag whatsapp-voice-copilot:latest quay.io/tarsislimadev/whatsapp-voice-copilot:latest
   docker push quay.io/tarsislimadev/whatsapp-voice-copilot:latest
   ```

### CI/CD Pipeline with GitHub Actions

Create `.github/workflows/docker-publish.yml`:

```yaml
name: Publish Docker Image

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/whatsapp-voice-copilot:latest
            ghcr.io/${{ github.repository }}:latest
            ${{ secrets.DOCKER_USERNAME }}/whatsapp-voice-copilot:${{ github.ref_name }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/whatsapp-voice-copilot:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/whatsapp-voice-copilot:buildcache,mode=max
```

### Running the Docker Image

**Basic Usage:**
```bash
docker run -it tarsislimadev/whatsapp-voice-copilot:latest
```

**With Environment Variables:**
```bash
docker run -it \
  -e OPENAI_API_KEY=your_api_key \
  -e LOG_LEVEL=debug \
  -v $(pwd)/session:/app/session \
  tarsislimadev/whatsapp-voice-copilot:latest
```

**Using Docker Compose:**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  whatsapp-bot:
    image: tarsislimadev/whatsapp-voice-copilot:latest
    container_name: whatsapp-voice-copilot
    ports:
      - "3000:3000"
      - "11434:11434"  # Ollama API
    environment:
      - LOG_LEVEL=info
      - OLLAMA_NUM_GPU=0  # Set to 1 if GPU available
    volumes:
      - ./session:/app/session
      - ./logs:/app/logs
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### Image Optimization

**Reduce Image Size:**
- Use multi-stage builds to exclude development dependencies
- Pre-download Llama3 model in build layer (increases image size but saves startup time)
- Consider using lighter model variants (`llama3:7b`) for smaller images

**Example Multi-Stage Build:**
```dockerfile
# Stage 1: Builder
FROM node:18-slim AS builder
WORKDIR /app
COPY . .
RUN npm install --production

# Stage 2: Runtime
FROM node:18-slim
RUN apt-get update && apt-get install -y curl wget espeak-ng && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://ollama.ai/install.sh | sh
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000 11434
CMD ollama serve & npm start
```

### Deployment on Any Container Platform

The Docker image can be deployed on any platform that supports containers:
- **Local Docker Desktop** (development)
- **Docker Swarm** (on-premise clusters)
- **Kubernetes** (self-managed or cloud)
- **AWS ECS** (Amazon)
- **Google Cloud Run** (serverless containers)
- **Azure Container Instances** (still supported, just not required)
- **Render, Railway, Fly.io** (container hosting platforms)

## 4. Delivery Milestones

### Milestone 1

- Project skeleton in place

- WhatsApp connection working locally

- Basic text reply working

### Milestone 2

- Voice note transcription working

- TTS reply support working

- Core bot flow validated locally

### Milestone 3

- Docker image builds successfully

- Ollama + Llama3 runs in container

- Image published to Docker Hub / ghcr.io

- End-to-end voice bot verified in container

### Milestone 4

- CI/CD pipeline (GitHub Actions) automated

- Docker image deployable on any container platform

- Documentation complete for users to run the image

## 5. Final Checklist

- Local development works reliably

- Voice notes are handled correctly

- Secrets are not stored in source control

- Dockerfile builds and runs without errors

- Docker image published to registry (Docker Hub or GitHub Container Registry)

- CI/CD pipeline automatically publishes on push to main

- Logging and monitoring are enabled

- Bot survives container restarts and redeployments

- Documentation includes instructions for running the Docker image locally
