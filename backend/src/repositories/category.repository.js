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

module.exports = { create, findDefaultByUserId };
