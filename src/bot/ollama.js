import { Ollama } from 'ollama';
import config from '../config.js';
import logger from '../logger.js';
import { OllamaError } from '../utils/errors.js';

const ollama = new Ollama({ baseUrl: config.ollama.baseUrl });
const conversationHistory = {};

export async function generateBotReply(userId, userMessage) {
  try {
    if (!userMessage || userMessage.trim().length === 0) {
      throw new OllamaError('Cannot generate reply for empty message');
    }

    logger.info('Generating bot reply', { userId, messageLength: userMessage.length });

    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }

    const context = conversationHistory[userId]
      .map((msg) => `User: ${msg.user}\nBot: ${msg.bot}`)
      .join('\n');

    const prompt = context
      ? `${context}\nUser: ${userMessage}\nBot:`
      : `User: ${userMessage}\nBot:`;

    let response;
    try {
      response = await Promise.race([
        ollama.generate({
          model: config.ollama.model,
          prompt: prompt,
          stream: false,
          num_predict: 150,
          temperature: 0.7,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Ollama request timeout')), config.bot.responseTimeout)
        ),
      ]);
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new OllamaError(`Request timed out after ${config.bot.responseTimeout}ms`);
      }
      throw error;
    }

    if (!response || !response.response) {
      throw new OllamaError('Ollama returned invalid response');
    }

    const botReply = response.response.trim();

    if (botReply.length === 0) {
      throw new OllamaError('Ollama generated empty response');
    }

    conversationHistory[userId].push({
      user: userMessage,
      bot: botReply,
    });

    if (conversationHistory[userId].length > 20) {
      conversationHistory[userId] = conversationHistory[userId].slice(-20);
    }

    logger.info('Bot reply generated', { userId, replyLength: botReply.length });
    return botReply;
  } catch (error) {
    if (error instanceof OllamaError) {
      logger.error('Ollama error', { error: error.message, userId });
      throw error;
    }
    logger.error('Error generating bot reply', { error: error.message, userId });
    throw new OllamaError(`Failed to generate reply: ${error.message}`);
  }
}

export function clearHistory(userId) {
  delete conversationHistory[userId];
  logger.debug('Conversation history cleared', { userId });
}

export default {
  generateBotReply,
  clearHistory,
};
