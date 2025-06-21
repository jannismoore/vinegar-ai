export const SUPPORTED_AUDIO_FORMATS = {
    MP3: 'audio/mpeg',
    WAV: 'audio/wav',
    WAV1: 'audio/wave',
    MP4: 'audio/mp4',
    OGG: 'audio/ogg'
};

export const SUPPORTED_IMAGE_FORMATS = {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    GIF: 'image/gif'
};

export const SUPPORTED_DOCUMENT_FORMATS = {
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    TXT: 'text/plain'
};

export const MIME_TO_EXTENSION = {
    [SUPPORTED_AUDIO_FORMATS.MP3]: 'mp3',
    [SUPPORTED_AUDIO_FORMATS.WAV]: 'wav',
    [SUPPORTED_AUDIO_FORMATS.WAV1]: 'wav',
    [SUPPORTED_AUDIO_FORMATS.MP4]: 'm4a',
    [SUPPORTED_AUDIO_FORMATS.OGG]: 'ogg',
    'audio/webm': 'webm',
    'audio/x-m4a': 'm4a',
    'audio/x-aac': 'aac'
};

export const SUPPORTED_AUDIO_MIMETYPES = Object.keys(MIME_TO_EXTENSION); 