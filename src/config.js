import dotenv from 'dotenv';

dotenv.config();

export default {
  whatsapp: {
    sessionData: process.env.WHATSAPP_SESSION_DATA || './session',
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2:1b',
  },
  bot: {
    name: process.env.BOT_NAME || 'WhatsApp Voice',
    logLevel: process.env.LOG_LEVEL || 'info',
    responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT || '30000', 10),
  },
  tts: {
    voice: process.env.ESPEAK_VOICE || 'en',
    rate: parseInt(process.env.ESPEAK_RATE || '150', 10),
    pitch: parseInt(process.env.ESPEAK_PITCH || '50', 10),
  },
};
