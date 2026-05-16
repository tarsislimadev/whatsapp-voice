import { getClient } from './client.js';
import logger from '../logger.js';
import { handleVoiceMessage } from '../speech/voiceHandler.js';
import { handleTextMessage } from '../bot/textHandler.js';

export function setupMessageHandlers() {
  const client = getClient();

  client.on('message', async (message) => {
    try {
      logger.info('Message received', {
        from: message.from,
        type: message.type,
        isGroupMsg: message.isGroupMsg,
      });

      if (message.type === 'ptt' || message.type === 'audio') {
        await handleVoiceMessage(message);
      } else if (message.type === 'chat') {
        await handleTextMessage(message);
      }
    } catch (error) {
      logger.error('Error handling message', { error: error.message, from: message.from });
      console.log('[await message.reply]', 'Sorry, I encountered an error processing your message.');
    }
  });

  logger.info('Message handlers set up');
}

export default {
  setupMessageHandlers,
};
