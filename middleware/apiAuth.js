const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const TOKEN = process.env.API_TOKEN || 'dev-secret-token';

module.exports = function apiAuth(req, res, next) {
    const [scheme, token] = (req.get('Authorization') || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
        return next(ApiError.unauthorized('Нужен заголовок Authorization: Bearer <token>'));
    }
    const a = Buffer.from(token);
    const b = Buffer.from(TOKEN);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return next(ApiError.unauthorized('Неверный токен'));
    }
    next();
};