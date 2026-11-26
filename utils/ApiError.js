class ApiError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
    static badRequest(msg, details) { return new ApiError(400, 'VALIDATION_ERROR', msg, details); }
    static unauthorized(msg = 'Требуется авторизация') { return new ApiError(401, 'UNAUTHORIZED', msg); }
    static notFound(msg = 'Ресурс не найден') { return new ApiError(404, 'NOT_FOUND', msg); }
    static conflict(msg) { return new ApiError(409, 'CONFLICT', msg); }
}

module.exports = ApiError;