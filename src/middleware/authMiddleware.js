import { appConfig } from '../config/config.js';
import ApiError from '../utils/ApiError.js';

export const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        throw new ApiError(401, 'API key is required');
    }

    if (apiKey !== appConfig.headers['x-api-key']) {
        throw new ApiError(403, 'Invalid API key');
    }

    next();
};
