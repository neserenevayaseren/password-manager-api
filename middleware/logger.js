const { logToDb } = require('../db');

// Логирующее middleware: время, метод, URL записываются в БД
function requestLogger(req, res, next) {
    const start = Date.now();

    // Срабатывает после отправки ответа — можно получить статус и длительность
    res.on('finish', () => {
        const duration = Date.now() - start;
        const details = `status=${res.statusCode}, duration=${duration}ms`;

        logToDb(req.method, req.originalUrl, 'REQUEST', details);
    });

    next();  // обязательно, иначе запрос зависнет
}

module.exports = requestLogger;