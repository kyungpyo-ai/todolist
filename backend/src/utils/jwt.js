const jwt = require('jsonwebtoken');

function sign(userId) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;
  return jwt.sign({ userId }, secret, { expiresIn });
}

function verify(token) {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
}

module.exports = { sign, verify };
