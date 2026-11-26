const { pool } = require('../db');

const SORT = { id: 'id', title: 'title', username: 'username', created_at: 'created_at' };
const LIST_COLS = 'id, title, username, url, category_id, user_id, created_at, updated_at';
const UPDATABLE = ['title', 'username', 'password', 'url', 'notes', 'category_id', 'user_id'];

async function list({ page, limit, sort, order, search, category_id, user_id }) {
    const where = [];
    const params = [];
    if (search) {
        params.push(`%${search.replace(/[%_\\]/g, '\\$&')}%`);
        where.push(`(title ILIKE $${params.length} OR username ILIKE $${params.length})`);
    }
    if (category_id) { params.push(category_id); where.push(`category_id = $${params.length}`); }
    if (user_id)     { params.push(user_id);     where.push(`user_id = $${params.length}`); }
    const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const dir = order === 'asc' ? 'ASC' : 'DESC';

    const total = Number((await pool.query(`SELECT COUNT(*) FROM password_items ${w}`, params)).rows[0].count);
    const { rows } = await pool.query(
        `SELECT ${LIST_COLS} FROM password_items ${w}
         ORDER BY ${SORT[sort]} ${dir}, id ${dir}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, (page - 1) * limit]
    );
    return { rows, total };
}

async function getById(id) {
    const { rows } = await pool.query('SELECT * FROM password_items WHERE id = $1', [id]);
    return rows[0] || null;
}

async function create(d) {
    const { rows } = await pool.query(
        `INSERT INTO password_items (title, username, password, url, notes, category_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [d.title, d.username, d.password, d.url ?? null, d.notes ?? null, d.category_id ?? null, d.user_id ?? null]
    );
    return rows[0];
}

async function update(id, fields) {
    const keys = Object.keys(fields).filter(k => UPDATABLE.includes(k));
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const { rows } = await pool.query(
        `UPDATE password_items SET ${sets.join(', ')}, updated_at = NOW()
         WHERE id = $${keys.length + 1} RETURNING *`,
        [...keys.map(k => fields[k]), id]
    );
    return rows[0] || null;
}

async function remove(id) {
    const r = await pool.query('DELETE FROM password_items WHERE id = $1', [id]);
    return r.rowCount > 0;
}

module.exports = { list, getById, create, update, remove };