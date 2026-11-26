const Joi = require('joi');

const id = Joi.object({ id: Joi.number().integer().positive().required() });

const listBase = {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().trim().max(100),
};

module.exports = { id, listBase };