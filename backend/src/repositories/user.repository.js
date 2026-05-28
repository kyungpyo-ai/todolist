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

async function update(id, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (fields.name !== undefined) {
    setClauses.push(`name = $${idx++}`);
    values.push(fields.name);
  }
  if (fields.password !== undefined) {
    setClauses.push(`password = $${idx++}`);
    values.push(fields.password);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  return toUser(result.rows[0]);
}

async function deleteById(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { findByEmail, findById, create, update, deleteById };
