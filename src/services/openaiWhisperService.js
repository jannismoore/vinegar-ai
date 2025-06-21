import OpenAI from 'openai';
import { appConfig } from '../config/config.js';
import ApiError from '../utils/ApiError.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

const openai = new OpenAI({
    apiKey: appConfig.openai.apiKey,
    timeout: 30000 // 30 seconds timeout
});

export const openaiWhisperService = {
    async transcribeAudio(buffer, mimetype) {
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`);
        let tempFileCreated = false;

        try {
            // Write buffer to temporary file
            fs.writeFileSync(tempFilePath, buffer);
            tempFileCreated = true;

            // Create file stream from the temporary file
            const fileStream = fs.createReadStream(tempFilePath);

            const transcription = await openai.audio.transcriptions.create({
                file: fileStream,
                model: "whisper-1",
                response_format: "text"
            });

            if (!transcription) {
                throw ApiError.internal(
                    'No transcription received from Whisper',
                    'openaiWhisperService.transcribeAudio'
                );
            }

            return transcription;
        } catch (error) {
            console.error('Error in Whisper transcription:', error);

            // Handle specific error cases
            if (error.response?.data) {
                throw ApiError.internal(
                    `OpenAI API Error: ${error.response.data.error?.message || 'Unknown error'}`,
                    'openaiWhisperService.transcribeAudio'
                );
            }

            if (error.code === 'ETIMEDOUT') {
                throw ApiError.serviceUnavailable(
                    'OpenAI API request timed out',
                    'openaiWhisperService.transcribeAudio'
                );
            }

            throw ApiError.internal(
                `Failed to transcribe audio: ${error.message}`,
                'openaiWhisperService.transcribeAudio'
            );
        } finally {
            // Cleanup temporary file
            if (tempFileCreated && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    }
}