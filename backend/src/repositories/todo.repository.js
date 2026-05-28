const { pool } = require('../config/db');

function toTodo(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findAllByUserId(userId, { categoryId, status, overdue } = {}) {
  const conditions = ['t.user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (categoryId) {
    conditions.push(`t.category_id = $${idx++}`);
    values.push(categoryId);
  }
  if (status) {
    conditions.push(`t.status = $${idx++}`);
    values.push(status);
  }
  if (overdue) {
    conditions.push(`t.end_date < CURRENT_DATE AND t.status != 'DONE'`);
  }

  const where = conditions.join(' AND ');
  const result = await pool.query(
    `SELECT * FROM todos t WHERE ${where} ORDER BY t.created_at DESC`,
    values
  );
  return result.rows.map(toTodo);
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
  return toTodo(result.rows[0] || null);
}

async function create({ userId, categoryId, title, description, startDate, endDate }) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, categoryId, title, description || null, startDate, endDate]
  );
  return toTodo(result.rows[0]);
}

async function update(id, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (fields.title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(fields.description);
  }
  if (fields.startDate !== undefined) {
    setClauses.push(`start_date = $${idx++}`);
    values.push(fields.startDate);
  }
  if (fields.endDate !== undefined) {
    setClauses.push(`end_date = $${idx++}`);
    values.push(fields.endDate);
  }
  if (fields.status !== undefined) {
    setClauses.push(`status = $${idx++}`);
    values.push(fields.status);
  }
  if (fields.categoryId !== undefined) {
    setClauses.push(`category_id = $${idx++}`);
    values.push(fields.categoryId);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE todos SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );
  return toTodo(result.rows[0]);
}

async function deleteById(id) {
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
}

async function updateCategoryForTodos(newCategoryId, oldCategoryId) {
  await pool.query(
    'UPDATE todos SET category_id = $1, updated_at = NOW() WHERE category_id = $2',
    [newCategoryId, oldCategoryId]
  );
}

module.exports = { findAllByUserId, findById, create, update, deleteById, updateCategoryForTodos };
