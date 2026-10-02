const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'password_manager',
    user: 'postgres',
    password: 'root',  // замените на реальный
});

// Асинхронная запись лога (не блокирует запрос)
async function logToDb(method, url, eventType, details = null) {
    try {
        await pool.query(
            'INSERT INTO request_logs (method, url, event_type, details) VALUES ($1, $2, $3, $4)',
            [method, url, eventType, details]
        );
    } catch (err) {
        console.error('Ошибка записи лога:', err.message);
    }
}

module.exports = { pool, logToDb };