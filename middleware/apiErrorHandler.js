const ApiError = require('../utils/ApiError');

module.exports = function apiErrorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err.type === 'entity.parse.failed') {
        err = new ApiError(400, 'INVALID_JSON', 'Тело запроса не является корректным JSON');
    } else if (err.type === 'entity.too.large') {
        err = new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Слишком большое тело запроса');
    } else if (err.code === '23505') {            // PostgreSQL: нарушена уникальность
        err = ApiError.conflict('Запись с такими уникальными данными уже существует');
    } else if (err.code === '23503') {            // PostgreSQL: нарушена связь (внешний ключ)
        err = req.method === 'DELETE'
            ? ApiError.conflict('Ресурс используется другими записями, удаление невозможно')
            : new ApiError(400, 'INVALID_REFERENCE', 'Указанный связанный ресурс не существует');
    }

    if (!(err instanceof ApiError)) {
        console.error('💥 API error:', err);
        err = new ApiError(500, 'INTERNAL_ERROR', 'Внутренняя ошибка сервера');
    }

    res.status(err.status).json({
        error: {
            code: err.code,
            message: err.message,
            ...(err.details && { details: err.details }),
        },
    });
};