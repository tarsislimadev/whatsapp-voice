import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import config from '../config.js';
import logger from '../logger.js';
import { SynthesisError } from '../utils/errors.js';

const AUDIO_CACHE_DIR = './audio_cache';

function ensureAudioCacheDir() {
  if (!fs.existsSync(AUDIO_CACHE_DIR)) {
    fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
  }
}

export async function synthesizeWithESpeak(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new SynthesisError('Cannot synthesize empty text');
    }

    ensureAudioCacheDir();

    const outputFile = path.join(AUDIO_CACHE_DIR, `audio_${Date.now()}.wav`);
    logger.info('Synthesizing audio with eSpeak', { textLength: text.length, outputFile });

    const safeText = text.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const command = `espeak-ng -v ${config.tts.voice} -s ${config.tts.rate} -p ${config.tts.pitch} -w ${outputFile} "${safeText}"`;

    try {
      execSync(command, { stdio: 'pipe' });
    } catch (error) {
      throw new SynthesisError(`eSpeak command failed: ${error.message}`);
    }

    if (!fs.existsSync(outputFile)) {
      throw new SynthesisError('Audio synthesis failed: output file not created');
    }

    const stats = fs.statSync(outputFile);
    if (stats.size === 0) {
      throw new SynthesisError('Audio synthesis failed: output file is empty');
    }

    logger.info('Audio synthesized successfully', { outputFile, fileSize: stats.size });
    return outputFile;
  } catch (error) {
    if (error instanceof SynthesisError) {
      logger.error('Synthesis error', { error: error.message });
      throw error;
    }
    logger.error('Error synthesizing audio', { error: error.message });
    throw new SynthesisError(`Audio synthesis failed: ${error.message}`);
  }
}

export function cleanupAudioCache(audioPath) {
  try {
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
      logger.debug('Audio file cleaned up', { audioPath });
    }
  } catch (error) {
    logger.warn('Error cleaning up audio cache', { error: error.message, audioPath });
  }
}

export default {
  synthesizeWithESpeak,
  cleanupAudioCache,
};
