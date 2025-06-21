export const ERROR_MESSAGES = {
    FILE_UPLOAD: {
        NO_FILE: 'No file provided',
        INVALID_TYPE: 'Invalid file type. Supported types: {types}',
        SIZE_LIMIT: 'File size exceeds limit of {size}MB'
    },
    TRANSCRIPTION: {
        FAILED: 'Failed to transcribe audio',
        EMPTY: 'No speech detected in the audio'
    },
    AI_RESPONSE: {
        FAILED: 'Failed to get AI response'
    },
    AGENT: {
        NOT_FOUND: 'Agent not found',
        INVALID: 'Invalid agent specified'
    }
};

export const SYSTEM_MESSAGES = {
    WELCOME: 'Welcome to the Voice Assistant API',
    READY: 'System is ready to process voice notes',
    PROCESSING: 'Processing your voice note...',
    SUCCESS: 'Voice note processed successfully'
}; 