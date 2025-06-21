import multer from 'multer';
import { appConfig } from '../config/config.js';
import ApiError from '../utils/ApiError.js';

// Memoize the fileFilter function
const createFileFilter = () => {
    const allowedTypes = new Set(appConfig.upload.allowedMimeTypes);
    return (req, file, cb) => {
        if (allowedTypes.has(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new ApiError(400, `Unsupported file type. Supported types: ${appConfig.upload.allowedMimeTypes.join(', ')}`), false);
    };
};

export const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: appConfig.upload.maxFileSize
    },
    fileFilter: createFileFilter()
});

export const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new ApiError(400, 'Multiple file upload is not supported. Please upload a single audio file.'));
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, 'File size exceeds the limit.'));
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
    }
    if (err instanceof ApiError) {
        return next(err);
    }
    return next(err);
};