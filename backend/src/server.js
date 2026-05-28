require('dotenv/config');

const app = require('./config/app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`[Server] 포트 ${PORT} 에서 실행 중`);
    });
  } catch (err) {
    console.error('[Server] DB 연결 실패:', err.message);
    process.exit(1);
  }
}

start();
