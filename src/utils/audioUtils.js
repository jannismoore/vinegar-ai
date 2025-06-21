import { appConfig } from '../config/config.js';
import { AGENTS, ERROR_MESSAGES, SUPPORTED_AUDIO_FORMATS } from '../constants/index.js';

class AudioUtils {
    static validateAudioFile(file) {
        if (!file) {
            throw new Error(ERROR_MESSAGES.FILE_UPLOAD.NO_FILE);
        }

        const allowedMimeTypes = Object.values(SUPPORTED_AUDIO_FORMATS);

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(
                ERROR_MESSAGES.FILE_UPLOAD.INVALID_TYPE
                    .replace('{types}', Object.values(SUPPORTED_AUDIO_FORMATS).join(', '))
            );
        }

        if (file.size > appConfig.upload.maxFileSize) {
            throw new Error(
                ERROR_MESSAGES.FILE_UPLOAD.SIZE_LIMIT
                    .replace('{size}', appConfig.upload.maxFileSize / (1024 * 1024))
            );
        }

        return true;
    }

    static getAgentFromTranscript(transcript) {
        const lowerTranscript = transcript.toLowerCase();

        for (const agent of Object.values(AGENTS)) {
            if (agent.commands.some(command => lowerTranscript.includes(command.toLowerCase()))) {
                return agent;
            }
        }

        return AGENTS.VINEGAR;
    }

    static validateAgent(agentName) {
        if (!agentName) {
            return AGENTS.VINEGAR;
        }

        const lowerAgentName = agentName.toLowerCase();
        const agent = Object.values(AGENTS).find(a => a.name.toLowerCase() === lowerAgentName);

        if (!agent) {
            return AGENTS.VINEGAR;
        }

        return agent;
    }
}

export default AudioUtils; 