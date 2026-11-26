const ApiError = require('../utils/ApiError');

// schemas: { params, query, body } — Joi-схемы. Результат кладём в req.valid
module.exports = function validate(schemas) {
    return (req, res, next) => {
        const details = [];
        req.valid = {};
        for (const part of ['params', 'query', 'body']) {
            if (!schemas[part]) continue;
            const { value, error } = schemas[part].validate(req[part] ?? {}, { abortEarly: false });
            if (error) {
                details.push(...error.details.map(d => ({ field: d.path.join('.'), message: d.message })));
            } else {
                req.valid[part] = value;
            }
        }
        if (details.length) return next(ApiError.badRequest('Ошибка валидации входных данных', details));
        next();
    };
};