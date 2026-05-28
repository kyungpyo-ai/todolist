class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || '서버 오류가 발생했습니다.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    success: false,
    message,
    code,
  });
}

module.exports = { errorMiddleware, AppError };
