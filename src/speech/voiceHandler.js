import path from 'path';
import logger from '../logger.js';
import { downloadAudio, transcribeAudio, cleanupAudio } from './transcription.js';
import { synthesizeWithESpeak, cleanupAudioCache } from './synthesis.js';
import { generateBotReply } from '../bot/ollama.js';
import { validateAudioMessage, sanitizeText } from '../utils/validation.js';
import { TranscriptionError, SynthesisError } from '../utils/errors.js';

export async function handleVoiceMessage(message) {
  let audioPath = null;
  let synthesizedPath = null;

  try {
    logger.info('Handling voice message', { from: message.from });

    validateAudioMessage(message);

    const tempDir = './temp';
    audioPath = path.join(tempDir, `${message.id.id}_${Date.now()}.ogg`);

    await downloadAudio(message, audioPath);
    const transcript = await transcribeAudio(audioPath);

    if (!transcript || transcript.trim().length === 0) {
      throw new TranscriptionError('Failed to transcribe audio: empty result');
    }

    const sanitized = sanitizeText(transcript);
    logger.info('Voice message transcribed', { from: message.from, transcript: sanitized });

    const botReply = await generateBotReply(message.from, sanitized);

    synthesizedPath = await synthesizeWithESpeak(botReply);

    await message.reply(synthesizedPath, null, {
      sendMediaAsDocument: false,
      media: synthesizedPath,
    });

    logger.info('Voice reply sent', { from: message.from });
  } catch (error) {
    logger.error('Error handling voice message', {
      error: error.message,
      errorCode: error.code || 'UNKNOWN',
      from: message.from,
    });

    try {
      if (error instanceof TranscriptionError) {
        await message.reply('Sorry, I could not understand your voice message. Please try again.');
      } else if (error instanceof SynthesisError) {
        await message.reply('Sorry, I encountered an error generating a voice reply. Please try sending a text message instead.');
      } else {
        await message.reply('Sorry, I encountered an error processing your message.');
      }
    } catch (replyError) {
      logger.error('Failed to send error reply', { error: replyError.message });
    }
  } finally {
    if (audioPath) {
      cleanupAudio(audioPath);
    }
    if (synthesizedPath) {
      cleanupAudioCache(synthesizedPath);
    }
  }
}

export default {
  handleVoiceMessage,
};
