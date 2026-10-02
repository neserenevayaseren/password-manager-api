const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Встроенные middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Кастомные middleware
const requestLogger = require('./middleware/logger');
const checkAuth = require('./middleware/auth');

app.use(requestLogger);  // логирование (глобально)
app.use(checkAuth);      // имитация авторизации (глобально)

// Маршруты
const passwordRoutes = require('./routes/passwords');
app.use('/', passwordRoutes);

// Обработка 404
app.use((req, res) => {
    res.status(404).render('404', { user: req.user });
});

// Обработка 500 (сигнатура из 4 параметров)
app.use((err, req, res, next) => {
    console.error(err.stack);
    require('./db').logToDb(req.method, req.originalUrl, 'ERROR', err.message);
    res.status(500).render('500', { user: req.user });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});