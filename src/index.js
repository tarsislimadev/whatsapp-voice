import logger from './logger.js';
import { connectWhatsApp, disconnectWhatsApp } from './whatsapp/client.js';
import { setupMessageHandlers } from './whatsapp/messageHandler.js';

async function main() {
  try {
    logger.info('Starting WhatsApp Voice');

    await connectWhatsApp();
    setupMessageHandlers();

    logger.info('WhatsApp Voice is running. Waiting for messages...');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      await disconnectWhatsApp();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down gracefully...');
      await disconnectWhatsApp();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Fatal error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

main();
