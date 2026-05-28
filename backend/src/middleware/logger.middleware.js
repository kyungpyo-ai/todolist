function log(message) {
  console.log(message);
}

function loggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`[${req.method}] ${req.path} - ${res.statusCode} ${duration}ms`);
  });

  next();
}

module.exports = loggerMiddleware;
