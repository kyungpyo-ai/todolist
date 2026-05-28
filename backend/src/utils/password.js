const bcrypt = require('bcrypt');

async function hash(plainPassword) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
  return bcrypt.hash(plainPassword, saltRounds);
}

async function compare(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hash, compare };
