const bcrypt = require('bcrypt');
const { pool } = require('../db');

const SORT = { id: 'id', username: 'username', email: 'email', created_at: 'created_at' };
const COLS = 'id, username, email, created_at, updated_at';      // хэш пароля наружу не отдаём
const UPDATABLE = ['username', 'email', 'master_password_hash'];

async function list({ page, limit, sort, order, search }) {
    const params = [];
    let w = '';
    if (search) {
        params.push(`%${search.replace(/[%_\\]/g, '\\$&')}%`);
        w = 'WHERE (username ILIKE $1 OR email ILIKE $1)';
    }
    const dir = order === 'asc' ? 'ASC' : 'DESC';
    const total = Number((await pool.query(`SELECT COUNT(*) FROM users ${w}`, params)).rows[0].count);
    const { rows } = await pool.query(
        `SELECT ${COLS} FROM users ${w}
         ORDER BY ${SORT[sort]} ${dir}, id ${dir}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, (page - 1) * limit]
    );
    return { rows, total };
}

async function getById(id) {
    const { rows } = await pool.query(`SELECT ${COLS} FROM users WHERE id = $1`, [id]);
    return rows[0] || null;
}

async function create({ username, email, master_password }) {
    const hash = await bcrypt.hash(master_password, 10);
    const { rows } = await pool.query(
        `INSERT INTO users (username, email, master_password_hash) VALUES ($1, $2, $3) RETURNING ${COLS}`,
        [username, email, hash]
    );
    return rows[0];
}

async function update(id, fields) {
    const data = { ...fields };
    if (data.master_password !== undefined) {
        data.master_password_hash = await bcrypt.hash(data.master_password, 10);
        delete data.master_password;
    }
    const keys = Object.keys(data).filter(k => UPDATABLE.includes(k));
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const { rows } = await pool.query(
        `UPDATE users SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${keys.length + 1} RETURNING ${COLS}`,
        [...keys.map(k => data[k]), id]
    );
    return rows[0] || null;
}

async function remove(id) {
    const r = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return r.rowCount > 0;
}

module.exports = { list, getById, create, update, remove };