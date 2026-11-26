const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'password_manager',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
});

async function logToDb(method, url, eventType, details = null) {
    try {
        await pool.query(
            'INSERT INTO request_logs (method, url, event_type, details) VALUES ($1, $2, $3, $4)',
            [method, url, eventType, details]
        );
    } catch (err) {
        console.error('❌ Ошибка записи лога:', err.message);
        const e = new Error(`Сбой логирования: ${err.message}`);
        e.isLoggingError = true;
        throw e;                 // ← ОБЯЗАТЕЛЬНО throw, не просто console.error
    }
}

async function getAllPasswords() {
    const result = await pool.query('SELECT * FROM password_items ORDER BY id DESC');
    return result.rows;
}

async function getPasswordById(id) {
    const result = await pool.query('SELECT * FROM password_items WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function createPassword(title, username, password) {
    const result = await pool.query(
        'INSERT INTO password_items (title, username, password) VALUES ($1, $2, $3) RETURNING *',
        [title, username, password]
    );
    return result.rows[0];
}

module.exports = {
    pool,
    logToDb,
    getAllPasswords,
    getPasswordById,
    createPassword,
};