import express from 'express';
import voiceRoutes from './voiceRoutes.js';

const router = express.Router();

router.use('/', voiceRoutes);

export default router; 