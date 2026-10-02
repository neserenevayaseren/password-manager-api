const express = require('express');
const router = express.Router();
const { generatePassword } = require('../utils/password');
const { logToDb } = require('../db');

console.log('>>> ФАЙЛ ROUTES/PASSWORDS.JS ЗАГРУЖЕН <<<');

let passwords = [
    { id: 1, title: 'Gmail', username: 'user@gmail.com', password: 'Xk9#mP2$vL8q', createdAt: new Date() },
    { id: 2, title: 'GitHub', username: 'devuser', password: 'Rf4@nB7*wQ1z', createdAt: new Date() },
];
let nextId = 3;

// === Отладка (потом удалить) ===
// console.log('>>> routes/passwords.js загружен <<<');

router.get('/', (req, res) => {
    res.render('index', { passwords, user: req.user });
});

router.get('/add', (req, res) => {
    res.render('add', { user: req.user });
});

router.get('/api/generate', (req, res) => {
    const length = parseInt(req.query.length) || 16;
    const password = generatePassword(length);
    logToDb('GET', '/api/generate', 'GENERATE', `Сгенерирован пароль длиной ${length}`);
    res.json({ password, length });
});

router.get('/item/:id', (req, res, next) => {
    const item = passwords.find(p => p.id === parseInt(req.params.id));
    if (!item) return next();
    res.render('item', { item, user: req.user });
});

router.post('/add', (req, res) => {
    const { title, username, password } = req.body;
    const newItem = {
        id: nextId++,
        title,
        username,
        password: password || generatePassword(),
        createdAt: new Date()
    };
    passwords.push(newItem);
    logToDb('POST', '/add', 'CREATE', `Добавлен пароль: ${title}`);
    res.redirect('/');
});

module.exports = router;