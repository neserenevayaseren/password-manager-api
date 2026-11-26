const model = require('../models/passwordModel');
const ApiError = require('../utils/ApiError');
const { meta } = require('../utils/pagination');
const { generatePassword, generatePasswordAdvanced, checkStrength } = require('../utils/password');

const notFound = id => ApiError.notFound(`Пароль с id=${id} не найден`);

function buildPassword(opts) {
    if (!(opts.lowercase || opts.uppercase || opts.digits || opts.symbols)) {
        throw ApiError.badRequest('Включите хотя бы один набор символов (lowercase, uppercase, digits, symbols)');
    }
    return generatePasswordAdvanced(opts);
}

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
    const data = { ...req.valid.body };
    if (!data.password) data.password = generatePassword();   // как в веб-форме ПЗ1
    const item = await model.create(data);
    res.status(201).location(`/api/v1/passwords/${item.id}`).json({ data: item });
};

// PUT: полная замена, необязательные поля, которые не пришли, становятся null
exports.replace = async (req, res) => {
    const { id } = req.valid.params;
    const b = req.valid.body;
    const item = await model.update(id, {
        title: b.title,
        username: b.username,
        password: b.password,
        url: b.url ?? null,
        notes: b.notes ?? null,
        category_id: b.category_id ?? null,
        user_id: b.user_id ?? null,
    });
    if (!item) throw notFound(id);
    res.json({ data: item });
};

// PATCH: меняются только присланные поля
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

exports.generate = async (req, res) => {
    const password = buildPassword(req.valid.body);
    res.json({ data: { password, length: password.length, strength: checkStrength(password) } });
};

exports.checkStrength = async (req, res) => {
    res.json({ data: checkStrength(req.valid.body.password) });
};

exports.regenerate = async (req, res) => {
    const { id } = req.valid.params;
    const item = await model.update(id, { password: buildPassword(req.valid.body) });
    if (!item) throw notFound(id);
    res.json({ data: item });
};