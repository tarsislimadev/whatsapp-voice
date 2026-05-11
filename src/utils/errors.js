export class BotError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message);
    this.name = 'BotError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends BotError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class TranscriptionError extends BotError {
  constructor(message) {
    super(message, 'TRANSCRIPTION_ERROR', 503);
    this.name = 'TranscriptionError';
  }
}

export class SynthesisError extends BotError {
  constructor(message) {
    super(message, 'SYNTHESIS_ERROR', 503);
    this.name = 'SynthesisError';
  }
}

export class OllamaError extends BotError {
  constructor(message) {
    super(message, 'OLLAMA_ERROR', 503);
    this.name = 'OllamaError';
  }
}

export class WhatsAppError extends BotError {
  constructor(message) {
    super(message, 'WHATSAPP_ERROR', 500);
    this.name = 'WhatsAppError';
  }
}

export default {
  BotError,
  ValidationError,
  TranscriptionError,
  SynthesisError,
  OllamaError,
  WhatsAppError,
};
