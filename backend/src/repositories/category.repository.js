const { pool } = require('../config/db');

function toCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function create({ userId, name, isDefault }) {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, name, isDefault]
  );
  return toCategory(result.rows[0]);
}

async function findDefaultByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM categories WHERE user_id = $1 AND is_default = true LIMIT 1',
    [userId]
  );
  return toCategory(result.rows[0] || null);
}

async function findAllByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM categories WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC',
    [userId]
  );
  return result.rows.map(toCategory);
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return toCategory(result.rows[0] || null);
}

async function update(id, { name }) {
  const result = await pool.query(
    'UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [name, id]
  );
  return toCategory(result.rows[0]);
}

async function deleteById(id) {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
}

module.exports = { create, findDefaultByUserId, findAllByUserId, findById, update, deleteById };
