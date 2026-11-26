const express = require('express');
const router = express.Router();
const { generatePassword } = require('../utils/password');
const {
    logToDb,
    getAllPasswords,
    getPasswordById,
    createPassword,
} = require('../db');

// ---- Хелперы логирования ----

// Строгое логирование: при сбое бросаем ошибку с флагом isLoggingError
// (уйдёт в error-handler server.js → страница "5")
async function logStrict(method, url, eventType, details) {
    try {
        await logToDb(method, url, eventType, details);
    } catch (err) {
        console.error('❌ Нарушен процесс логирования (запись запрещена):', err.message);
        throw err;
    }
}

// Мягкое логирование: при сбое только предупреждаем, работу не блокируем
async function logSoft(method, url, eventType, details) {
    try {
        await logToDb(method, url, eventType, details);
    } catch (err) {
        console.warn('⚠️  Логирование недоступно, продолжаем без записи в лог:', err.message);
    }
}

// ---- Чтение ----

router.get('/', async (req, res, next) => {
    try {
        await logSoft('GET', '/', 'VIEW_LIST', 'Просмотр списка паролей');
        const passwords = await getAllPasswords();
        res.render('index', { passwords, user: req.user });
    } catch (err) {
        next(err); // сбой БД → 500
    }
});

router.get('/add', async (req, res, next) => {
    try {
        await logSoft('GET', '/add', 'VIEW_ADD_FORM', 'Открытие формы добавления');
        res.render('add', { user: req.user });
    } catch (err) {
        next(err);
    }
});

router.get('/api/generate', async (req, res, next) => {
    try {
        const length = parseInt(req.query.length) || 16;
        const password = generatePassword(length);

        // Логируем мягко: генерация не должна падать из-за сломанного лога
        await logSoft('GET', '/api/generate', 'GENERATE', `Сгенерирован пароль длиной ${length}`);

        res.json({ password, length });
    } catch (err) {
        next(err);
    }
});

router.get('/item/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next();

        await logSoft('GET', `/item/${id}`, 'VIEW_ITEM', `Просмотр пароля id=${id}`);

        const item = await getPasswordById(id);
        if (!item) return next();

        res.render('item', { item, user: req.user });
    } catch (err) {
        next(err);
    }
});

// ---- Валидация ----

const LIMITS = {
    title:    { min: 1, max: 100 },
    username: { min: 1, max: 100 },
    password: { min: 0, max: 128 },
};

function validateField(name, value) {
    const { min, max } = LIMITS[name];
    const trimmed = (value || '').trim();

    if (trimmed.length < min) {
        if (name === 'password' && trimmed.length === 0) return null;
        return `Поле «${name}» не может быть пустым`;
    }
    if (value && value.length > max) {
        return `Поле «${name}» не должно превышать ${max} символов`;
    }
    return null;
}

// ---- Запись (строгое логирование) ----

router.post('/add', async (req, res, next) => {
    try {
        const { title, username, password } = req.body;
        const errors = [];

        if (!title || title.trim().length === 0) {
            errors.push('Поле «title» не может быть пустым');
        }
        if (!username || username.trim().length === 0) {
            errors.push('Поле «username» не может быть пустым');
        }
        if (title && title.length > 100) {
            errors.push('Поле «title» не должно превышать 100 символов');
        }
        if (username && username.length > 100) {
            errors.push('Поле «username» не должно превышать 100 символов');
        }

        if (errors.length > 0) {
            return res.status(400).render('add', {
                user: req.user,
                errors,
                values: { title, username, password }
            });
        }

        // Сначала строгая проверка логирования — до создания пароля.
        // Если лог не записался → next(err) → error-handler → страница "5",
        // и пароль в БД НЕ создаётся.
        await logStrict('POST', '/add', 'CREATE', `Добавление пароля: ${title.trim()}`);

        const finalPassword = password && password.trim() !== ''
            ? password
            : generatePassword();

        await createPassword(title.trim(), username.trim(), finalPassword);

        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

module.exports = router;