const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const requestLogger = require('./middleware/logger');
const checkAuth = require('./middleware/auth');

app.use(requestLogger);
app.use(checkAuth);

const passwordRoutes = require('./routes/passwords');
app.use('/', passwordRoutes);

// 404
app.use((req, res) => {
    res.status(404).render('404', { user: req.user });
});

// Общий error-handler: различает сбой логирования ("5") и прочие сбои (500)
app.use(async (err, req, res, next) => {
    console.error('💥 Ошибка приложения:', err.stack || err.message);

    // 1) Сбой логирования → отдельная страница "5"
    if (err.isLoggingError) {
        return res.status(500).render('5', {
            user: req.user || { name: 'Гость', role: 'guest' },
            error: err.message
        });
    }

    // 2) Любая другая ошибка (например, упала БД password_items) → 500.
    //    Пытаемся записать ошибку в лог, но не падаем, если лог недоступен.
    try {
        await require('./db').logToDb(
            req.method,
            req.originalUrl,
            'ERROR',
            err.message
        );
    } catch (logErr) {
        console.error('❌ Не удалось записать ошибку в лог:', logErr.message);
    }

    res.status(500).render('500', {
        user: req.user || { name: 'Гость', role: 'guest' }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});