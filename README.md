# WhatsApp Voice

A WhatsApp voice bot built with Node.js that can receive voice messages, transcribe them, process through an LLM, and reply with synthesized speech. Powered by **Ollama/Llama3** for bot intelligence and **eSpeak NG** for text-to-speech synthesis.

## Features

- 🎙️ **Voice Message Handling**: Receive and process WhatsApp voice notes
- 🗣️ **Speech-to-Text**: Transcribe audio messages (placeholder for Whisper integration)
- 🤖 **AI-Powered Replies**: Generate intelligent responses using Ollama with Llama3
- 🔊 **Text-to-Speech**: Synthesize bot replies into voice using eSpeak NG
- 💬 **Conversation Context**: Maintain conversation history for multi-turn interactions
- 📦 **Docker Ready**: Fully containerized with all dependencies included
- 🚀 **CI/CD Pipeline**: Automated Docker image builds and publishing

## Prerequisites

### Local Development

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Ollama** (for running Llama3 locally)
- **eSpeak NG** (for text-to-speech)

## Installation

1. **Clone and Install Dependencies**:
   ```bash
   git clone <your-repo-url>
   cd whatsapp-voice
   npm install
   ```

2. **Setup Environment**:
   ```bash
   cp .env.example .env
   ```

3. **Install System Dependencies**:
   - **macOS**: `brew install espeak-ng && brew install ollama`
   - **Linux**: `sudo apt-get install espeak-ng && curl https://ollama.ai/install.sh | sh`
   - **Windows**: Download from [ollama.ai](https://ollama.ai) and [espeak-ng](https://github.com/espeak-ng/espeak-ng/releases)

## Local Development

### Step 1: Start Ollama Server
```bash
ollama serve
# First run will download Llama3 (~4-5GB)
```

### Step 2: Start the Bot
```bash
npm start
# Or for development with auto-reload: npm run dev
```

### Step 3: Scan QR Code
When started, scan the QR code with your WhatsApp device.

### Step 4: Start Chatting
Send messages or voice notes to the bot from WhatsApp!

## Docker Deployment

### Build and Run

```bash
# Build
docker build -t whatsapp-voice-copilot:latest .

# Run with volume mounts
docker run -it \
  -v $(pwd)/session:/app/session \
  -v $(pwd)/logs:/app/logs \
  whatsapp-voice-copilot:latest
```

### Using Docker Compose

```bash
docker-compose up -d
docker-compose logs -f whatsapp-bot
```

## Publishing to Registries

### Docker Hub
```bash
docker tag whatsapp-voice-copilot:latest YOUR_USERNAME/whatsapp-voice-copilot:latest
docker push YOUR_USERNAME/whatsapp-voice-copilot:latest
```

### GitHub Container Registry
```bash
docker tag whatsapp-voice-copilot:latest ghcr.io/YOUR_USERNAME/whatsapp-voice-copilot:latest
docker push ghcr.io/YOUR_USERNAME/whatsapp-voice-copilot:latest
```

## CI/CD Pipeline

GitHub Actions workflow automatically builds and publishes on push to `main`.

Set secrets in GitHub:
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub access token

## Project Structure

```
src/
├── index.js                    # Entry point
├── config.js                   # Configuration
├── logger.js                   # Logging
├── whatsapp/
│   ├── client.js              # WhatsApp client
│   └── messageHandler.js      # Message routing
├── bot/
│   ├── ollama.js              # Ollama/Llama3
│   └── textHandler.js         # Text handling
└── speech/
    ├── transcription.js       # STT
    ├── synthesis.js           # TTS (eSpeak)
    └── voiceHandler.js        # Voice handling
```

## Configuration

Edit `.env` for settings:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
LOG_LEVEL=info
ESPEAK_VOICE=en
ESPEAK_RATE=150
ESPEAK_PITCH=50
```

## Troubleshooting

### Ollama not responding
```bash
curl http://localhost:11434/api/tags
ollama serve  # Start if not running
```

### eSpeak not found
```bash
espeak-ng --version  # Verify installation
```

### Session issues
```bash
rm -rf ./session  # Clear and rescan QR code
npm start
```

## Future Enhancements

- [ ] Implement actual STT (Whisper/Google Cloud Speech-to-Text)
- [ ] Multi-language support
- [ ] Rate limiting
- [ ] Image message support
- [ ] Persistent conversation history
- [ ] Monitoring and metrics

## License

MIT License - see LICENSE file

## Acknowledgments

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [Ollama](https://ollama.ai)
- [Llama3](https://www.meta.com/research/llama/)
- [eSpeak NG](https://github.com/espeak-ng/espeak-ng)
