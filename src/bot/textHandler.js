import logger from '../logger.js';
import { generateBotReply } from './ollama.js';
import { validateMessage, sanitizeText } from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';

export async function handleTextMessage(message) {
  try {
    logger.info('Handling text message', { from: message.from });

    validateMessage(message);

    const sanitized = sanitizeText(message.body);
    const botReply = await generateBotReply(message.from, sanitized);

    console.log('[await message.reply]', botReply);
    logger.info('Text reply sent', { from: message.from });
  } catch (error) {
    logger.error('Error handling text message', { error: error.message, from: message.from });
    if (error instanceof ValidationError) {
      try {
        console.log('[await message.reply]', 'Invalid message format. Please try again.');
      } catch (replyError) {
        logger.error('Failed to send error reply', { error: replyError.message });
      }
    }
    throw error;
  }
}

export default {
  handleTextMessage,
};
