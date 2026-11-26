const { logToDb } = require('../db');

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

async function requestLogger(req, res, next) {
    const start = Date.now();
    const isWrite = WRITE_METHODS.includes(req.method);

    try {
        await logToDb(
            req.method,
            req.originalUrl,
            isWrite ? 'WRITE_REQUEST' : 'REQUEST',
            'incoming request'
        );
    } catch (err) {
        console.error('❌ Нарушен процесс логирования:', err.message);

        // Строгий режим: запись/удаление запрещены без лога → страница "5"
        if (isWrite) {
            return res.status(500).render('5', {
                user: req.user || { name: 'Гость', role: 'guest' },
                error: err.message
            });
        }

        // Мягкий режим: чтение разрешено, просто пропускаем лог
        console.warn('⚠️  Чтение продолжается без записи в лог (БД логов недоступна)');
        return next();
    }

    res.on('finish', () => {
        const duration = Date.now() - start;
        const time = new Date().toLocaleTimeString('ru-RU');
        const details = `status=${res.statusCode}, duration=${duration}ms`;
        console.log(`[${time}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
        logToDb(req.method, req.originalUrl, 'REQUEST_FINISH', details)
            .catch(e => console.error('❌ Ошибка finish-лога:', e.message));
    });

    next();
}

module.exports = requestLogger;