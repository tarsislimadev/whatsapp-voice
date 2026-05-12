# Getting Started with WhatsApp Voice

## ✅ Pre-Implementation Checklist

Before you begin, ensure you have:
- [ ] Node.js 18.0.0 or higher installed
- [ ] npm 9.0.0 or higher
- [ ] Docker installed (for containerized deployment)
- [ ] Ollama installed and accessible
- [ ] eSpeak NG installed

## 🚀 Quick Start

### 1. Local Development Setup

```bash
# Clone the repository
cd /workspaces/whatsapp-voice

# Install dependencies
npm install

# Copy .env.example to .env (optional - defaults already set)
cp .env.example .env
```

### 2. Start Ollama Server

Open a new terminal and run:
```bash
ollama serve
```

**Note**: The first run will download Llama3 (~4-5GB). This is normal and may take 5-10 minutes.

### 3. Start the Bot

In another terminal:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 4. Authenticate WhatsApp

When you start the bot, a QR code will appear in the terminal:
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices → Link a Device
3. Scan the QR code displayed in your terminal
4. Your bot is now authenticated!

### 5. Test the Bot

Send a text message or voice note to the linked WhatsApp account. The bot will respond!

## 🐳 Docker Setup

### Using Docker

```bash
# Build the Docker image
docker build -t whatsapp-voice-copilot:latest .

# Run with session persistence
docker run -it \
  -v $(pwd)/session:/app/session \
  -v $(pwd)/logs:/app/logs \
  whatsapp-voice-copilot:latest
```

### Using Docker Compose

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f whatsapp-bot

# Stop the service
docker-compose down
```

## ⚙️ Configuration

Edit `.env` to customize:

```bash
# WhatsApp
WHATSAPP_SESSION_DATA=./session

# Ollama/Llama3
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Bot Behavior
LOG_LEVEL=info              # debug, info, warn, error
BOT_NAME=WhatsApp Voice
RESPONSE_TIMEOUT=30000      # milliseconds

# Text-to-Speech (eSpeak NG)
ESPEAK_VOICE=en            # en, es, fr, de, etc.
ESPEAK_RATE=150            # 80-450 (words per minute)
ESPEAK_PITCH=50            # 0-99
```

## 📊 How It Works

### Text Messages:
```
User sends text
    ↓
Message validated & sanitized
    ↓
Ollama/Llama3 generates reply (with conversation context)
    ↓
Reply sent to WhatsApp
```

### Voice Messages:
```
User sends voice note
    ↓
Audio downloaded from WhatsApp
    ↓
Transcription (currently placeholder - ready for Whisper)
    ↓
Ollama/Llama3 generates reply
    ↓
eSpeak NG synthesizes reply to audio
    ↓
Audio sent to WhatsApp
    ↓
Cleanup of temp files
```

## 🔧 Troubleshooting

### "Ollama request timeout" error
- Check if Ollama server is running: `curl http://localhost:11434/api/tags`
- Increase timeout in `.env`: `RESPONSE_TIMEOUT=60000`
- Ensure Llama3 model is downloaded: `ollama list`

### "eSpeak command not found"
```bash
# macOS
brew install espeak-ng

# Linux
sudo apt-get install espeak-ng

# Windows - download from:
# https://github.com/espeak-ng/espeak-ng/releases
```

### "Session authentication issues"
```bash
# Clear the session and rescan QR code
rm -rf ./session
npm start
```

### "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Or use different ports in Docker
docker run -p 3001:3000 -p 11435:11434 whatsapp-voice-copilot:latest
```

### "Cannot transcribe audio"
- This is currently a placeholder
- You'll need to implement Whisper integration
- See `src/speech/transcription.js` for integration point

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/index.js` | Main application entry point |
| `src/config.js` | Configuration management |
| `src/logger.js` | Logging utilities |
| `src/whatsapp/client.js` | WhatsApp connection |
| `src/bot/ollama.js` | LLM integration |
| `src/speech/synthesis.js` | Text-to-speech |
| `src/utils/validation.js` | Input validation |
| `src/utils/errors.js` | Custom error classes |
| `Dockerfile` | Container definition |
| `docker-compose.yml` | Docker Compose setup |
| `.github/workflows/docker-publish.yml` | CI/CD pipeline |

## 🎯 Next Steps

### Enhance STT (Speech-to-Text):
1. Install OpenAI Whisper or Google Cloud Speech-to-Text
2. Update `src/speech/transcription.js` with real implementation
3. Test with voice messages

### Customize Bot:
1. Modify the Ollama prompt in `src/bot/ollama.js`
2. Add system instructions for specific behaviors
3. Adjust temperature and num_predict for different response styles

### Add Features:
1. Image message support
2. Rate limiting per user
3. Database storage for conversation history
4. Admin commands
5. Multi-language support

### Deploy to Production:
1. Set GitHub secrets for Docker Hub access
2. Push to main branch
3. GitHub Actions will automatically build and publish
4. Deploy Docker image to your platform (Azure, AWS, GCP, etc.)

## 🔒 Security Reminders

- Never commit `.env` file with real secrets
- Use environment variables for all sensitive data
- Regularly update dependencies: `npm audit`
- Review logs for suspicious activity
- Use strong authentication for WhatsApp

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Review error messages in the console
3. Verify all dependencies are installed
4. Check GitHub issues (if applicable)
5. Review IMPLEMENTATION.md for technical details

## ✨ Enjoy Your WhatsApp Voice Bot!

You now have a fully functional WhatsApp voice bot powered by AI. Start sending messages and voice notes to see it in action!
