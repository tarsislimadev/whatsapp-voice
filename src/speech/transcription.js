import fs from 'fs';
import path from 'path';
import logger from '../logger.js';

export async function downloadAudio(message, outputPath) {
  try {
    logger.info('Downloading audio from message', { from: message.from, filename: message.filename });

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    const media = await message.downloadMedia();
    fs.writeFileSync(outputPath, media.data, 'base64');

    logger.info('Audio downloaded successfully', { outputPath });
    return outputPath;
  } catch (error) {
    logger.error('Error downloading audio', { error: error.message, from: message.from });
    throw error;
  }
}

export async function transcribeAudio(audioPath) {
  try {
    logger.info('Transcribing audio (placeholder)', { audioPath });

    // TODO: Implement actual transcription using OpenAI Whisper or similar
    // For now, return a placeholder
    const transcript = 'This is a transcribed message from audio';

    logger.info('Audio transcribed', { audioPath, transcriptLength: transcript.length });
    return transcript;
  } catch (error) {
    logger.error('Error transcribing audio', { error: error.message, audioPath });
    throw error;
  }
}

export function cleanupAudio(audioPath) {
  try {
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
      logger.debug('Audio file cleaned up', { audioPath });
    }
  } catch (error) {
    logger.warn('Error cleaning up audio', { error: error.message, audioPath });
  }
}

export default {
  downloadAudio,
  transcribeAudio,
  cleanupAudio,
};
