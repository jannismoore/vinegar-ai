import pkg from 'dotenv';
const { config } = pkg;
import { AGENTS, SUPPORTED_AUDIO_FORMATS } from '../constants/index.js';

config();

export const appConfig = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo',
        whisperModel: 'whisper-1',
        systemPrompt: AGENTS.VINEGAR.instructions
    },
    headers: {
        'x-api-key': process.env.SECURITY_HEADER_KEY
    },
    upload: {
        maxFileSize: 10 * 1024 * 1024,
        allowedMimeTypes: [
            SUPPORTED_AUDIO_FORMATS.WAV,
            SUPPORTED_AUDIO_FORMATS.WAV1,
            SUPPORTED_AUDIO_FORMATS.MP3,
            SUPPORTED_AUDIO_FORMATS.MP4,
            SUPPORTED_AUDIO_FORMATS.OGG
        ]
    }
};