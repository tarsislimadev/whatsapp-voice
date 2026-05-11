import logger from '../logger.js';

const MAX_MESSAGE_LENGTH = 4096;
const MAX_FILE_SIZE = 16 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = ['audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/webm'];
const ALLOWED_MESSAGE_TYPES = ['chat', 'ptt', 'audio'];

export function validateMessage(message) {
  if (!message || !message.body) {
    throw new Error('Invalid message: missing body');
  }

  if (message.body.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
  }

  return true;
}

export function validateAudioMessage(message) {
  if (!message || !message.type) {
    throw new Error('Invalid audio message: missing type');
  }

  if (!ALLOWED_MESSAGE_TYPES.includes(message.type)) {
    throw new Error(`Invalid message type: ${message.type}`);
  }

  return true;
}

export function validateFileSize(sizeInBytes) {
  if (sizeInBytes > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE} bytes`);
  }

  return true;
}

export function sanitizeText(text) {
  if (!text) {
    return '';
  }

  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
    .substring(0, MAX_MESSAGE_LENGTH);
}

export default {
  validateMessage,
  validateAudioMessage,
  validateFileSize,
  sanitizeText,
  MAX_MESSAGE_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_AUDIO_TYPES,
};
