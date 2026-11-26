const { pool } = require('../db');

const SORT = { id: 'id', name: 'name', created_at: 'created_at' };
const COLS = 'id, name, description, created_at, updated_at';
const UPDATABLE = ['name', 'description'];

async function list({ page, limit, sort, order, search }) {
    const params = [];
    let w = '';
    if (search) {
        params.push(`%${search.replace(/[%_\\]/g, '\\$&')}%`);
        w = 'WHERE name ILIKE $1';
    }
    const dir = order === 'asc' ? 'ASC' : 'DESC';
    const total = Number((await pool.query(`SELECT COUNT(*) FROM categories ${w}`, params)).rows[0].count);
    const { rows } = await pool.query(
        `SELECT ${COLS} FROM categories ${w}
         ORDER BY ${SORT[sort]} ${dir}, id ${dir}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, (page - 1) * limit]
    );
    return { rows, total };
}

async function getById(id) {
    const { rows } = await pool.query(`SELECT ${COLS} FROM categories WHERE id = $1`, [id]);
    return rows[0] || null;
}

async function create({ name, description }) {
    const { rows } = await pool.query(
        `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING ${COLS}`,
        [name, description ?? null]
    );
    return rows[0];
}

async function update(id, fields) {
    const keys = Object.keys(fields).filter(k => UPDATABLE.includes(k));
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const { rows } = await pool.query(
        `UPDATE categories SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${keys.length + 1} RETURNING ${COLS}`,
        [...keys.map(k => fields[k]), id]
    );
    return rows[0] || null;
}

async function remove(id) {
    const r = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return r.rowCount > 0;
}

module.exports = { list, getById, create, update, remove };