const Joi = require('joi');
const { id, listBase } = require('./common');

const f = {
    username: Joi.string().alphanum().min(3).max(50),
    email: Joi.string().email().max(255),
    master_password: Joi.string().min(8).max(128),
};

module.exports = {
    id,
    create:  Joi.object({
        username: f.username.required(),
        email: f.email.required(),
        master_password: f.master_password.required(),
    }),
    replace: Joi.object({
        username: f.username.required(),
        email: f.email.required(),
        master_password: f.master_password.required(),
    }),
    patch: Joi.object(f).min(1),
    list: Joi.object({
        ...listBase,
        sort: Joi.string().valid('id', 'username', 'email', 'created_at').default('id'),
    }),
};