const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('[DB] 연결 성공:', result.rows[0].now);
    return true;
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
