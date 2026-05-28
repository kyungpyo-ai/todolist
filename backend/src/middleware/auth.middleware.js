const { verify } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
      code: 'UNAUTHORIZED',
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verify(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
      code: 'UNAUTHORIZED',
    });
  }
}

module.exports = authMiddleware;
