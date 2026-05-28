const { pool } = require('../config/db');

function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return toUser(result.rows[0] || null);
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return toUser(result.rows[0] || null);
}

async function create({ email, password, name }) {
  const result = await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, password, name]
  );
  return toUser(result.rows[0]);
}

module.exports = { findByEmail, findById, create };
