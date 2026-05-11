import { Client, LocalAuth } from 'whatsapp-web.js';
import config from '../config.js';
import logger from '../logger.js';

let client = null;

export function initWhatsAppClient() {
  client = new Client({
    auth: new LocalAuth({
      dataPath: config.whatsapp.sessionData,
    }),
  });

  client.on('qr', (qr) => {
    logger.info('QR Code received. Scan with your WhatsApp device:', { qr });
  });

  client.on('authenticated', () => {
    logger.info('WhatsApp authenticated successfully');
  });

  client.on('auth_failure', (msg) => {
    logger.error('Authentication failed', { msg });
  });

  client.on('disconnected', (reason) => {
    logger.warn('WhatsApp client disconnected', { reason });
  });

  client.on('ready', () => {
    logger.info('WhatsApp client is ready');
  });

  return client;
}

export function getClient() {
  return client;
}

export async function connectWhatsApp() {
  if (!client) {
    initWhatsAppClient();
  }
  await client.initialize();
}

export async function disconnectWhatsApp() {
  if (client) {
    await client.destroy();
    client = null;
  }
}

export default {
  initWhatsAppClient,
  getClient,
  connectWhatsApp,
  disconnectWhatsApp,
};
