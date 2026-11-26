const model = require('../models/userModel');
const passwordModel = require('../models/passwordModel');
const ApiError = require('../utils/ApiError');
const { meta } = require('../utils/pagination');

const notFound = id => ApiError.notFound(`Пользователь с id=${id} не найден`);

exports.list = async (req, res) => {
    const q = req.valid.query;
    const { rows, total } = await model.list(q);
    res.json({ data: rows, meta: meta(q, total) });
};

exports.getOne = async (req, res) => {
    const { id } = req.valid.params;
    const item = await model.getById(id);
    if (!item) throw notFound(id);
    res.json({ data: item });
};

exports.create = async (req, res) => {
    const item = await model.create(req.valid.body);
    res.status(201).location(`/api/v1/users/${item.id}`).json({ data: item });
};

exports.replace = async (req, res) => {
    const { id } = req.valid.params;
    const item = await model.update(id, req.valid.body);
    if (!item) throw notFound(id);
    res.json({ data: item });
};

exports.patch = async (req, res) => {
    const { id } = req.valid.params;
    const item = await model.update(id, req.valid.body);
    if (!item) throw notFound(id);
    res.json({ data: item });
};

exports.remove = async (req, res) => {
    const { id } = req.valid.params;
    if (!(await model.remove(id))) throw notFound(id);
    res.status(204).end();
};

// вложенный ресурс: GET /users/:id/passwords
exports.passwords = async (req, res) => {
    const { id } = req.valid.params;
    if (!(await model.getById(id))) throw notFound(id);
    const q = req.valid.query;
    const { rows, total } = await passwordModel.list({ ...q, user_id: id });
    res.json({ data: rows, meta: meta(q, total) });
};