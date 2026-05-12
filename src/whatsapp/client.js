import pkg from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import config from '../config.js';
import logger from '../logger.js';

let client = null;
const { Client, LocalAuth } = pkg;

export function initWhatsAppClient() {
  client = new Client({
    auth: new LocalAuth({
      dataPath: config.whatsapp.sessionData,
    }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    logger.info('QR Code received. Scan with your WhatsApp device:');
    qrcodeTerminal.generate(qr, { small: true });
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
