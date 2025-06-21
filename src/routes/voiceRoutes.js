import express from 'express';
import multer from 'multer';
import { voiceController } from '../controllers/voiceController.js';
import { handleMulterErrors, uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { verifyApiKey } from '../middleware/authMiddleware.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

router.post('/process-voice',
    verifyApiKey,
    uploadMiddleware.single('file'),
    handleMulterErrors,
    voiceController.processVoiceNote
);

export default router;