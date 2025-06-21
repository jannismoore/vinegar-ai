class ApiError {
    constructor(code, message, from, params) {
        this.code = code;
        this.message = message;
        this.from = from;
        this.params = params;
    }

    static forbidden(message, from, params) {
        return new ApiError(403, message, from, params);
    }

    static unauthorized(message, from, params) {
        return new ApiError(401, message, from, params);
    }

    static badRequest(message, from, params) {
        return new ApiError(400, message, from, params);
    }

    static notFound(message, from, params) {
        return new ApiError(404, message, from, params);
    }

    static internal(message, from) {
        return new ApiError(500, message, from);
    }

    static serviceUnavailable(message, from) {
        return new ApiError(503, message, from);
    }
}

export default ApiError; 