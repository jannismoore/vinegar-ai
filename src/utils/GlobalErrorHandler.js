import ApiError from './ApiError.js';

export const globalErrorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        error = ApiError.internal(
            error.message || 'Internal Server Error',
            'GlobalErrorHandler'
        );
    }

    const response = {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            from: error.from,
            ...(error.params && { params: error.params }),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
    };

    res.status(error.code).json(response);
}; 