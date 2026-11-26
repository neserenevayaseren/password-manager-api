const Joi = require('joi');
const { id, listBase } = require('./common');

const f = {
    title:       Joi.string().trim().min(1).max(100),
    username:    Joi.string().trim().min(1).max(100),
    password:    Joi.string().min(1).max(128),
    url:         Joi.string().uri({ scheme: ['http', 'https'] }).max(255).allow(null),
    notes:       Joi.string().max(1000).allow(null, ''),
    category_id: Joi.number().integer().positive().allow(null),
    user_id:     Joi.number().integer().positive().allow(null),
};

module.exports = {
    id,
    create:  Joi.object({ ...f, title: f.title.required(), username: f.username.required() }),
    replace: Joi.object({
        ...f,
        title: f.title.required(),
        username: f.username.required(),
        password: f.password.required(),
    }),
    patch: Joi.object(f).min(1),
    list: Joi.object({
        ...listBase,
        sort: Joi.string().valid('id', 'title', 'username', 'created_at').default('id'),
        category_id: Joi.number().integer().positive(),
        user_id: Joi.number().integer().positive(),
    }),
    generate: Joi.object({
        length: Joi.number().integer().min(8).max(128).default(16),
        lowercase: Joi.boolean().default(true),
        uppercase: Joi.boolean().default(true),
        digits: Joi.boolean().default(true),
        symbols: Joi.boolean().default(true),
        excludeAmbiguous: Joi.boolean().default(false),
    }),
    checkStrength: Joi.object({ password: Joi.string().min(1).max(128).required() }),
};