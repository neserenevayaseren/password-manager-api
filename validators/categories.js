const Joi = require('joi');
const { id, listBase } = require('./common');

const f = {
    name: Joi.string().trim().min(1).max(50),
    description: Joi.string().trim().max(255).allow(null, ''),
};

module.exports = {
    id,
    create:  Joi.object({ ...f, name: f.name.required() }),
    replace: Joi.object({ ...f, name: f.name.required() }),
    patch:   Joi.object(f).min(1),
    list: Joi.object({
        ...listBase,
        sort: Joi.string().valid('id', 'name', 'created_at').default('id'),
    }),
};