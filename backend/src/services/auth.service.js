const userRepository = require('../repositories/user.repository');
const categoryRepository = require('../repositories/category.repository');
const { hash, compare } = require('../utils/password');
const { sign } = require('../utils/jwt');
const { validateSignupBody } = require('../validators/auth.validator');
const { AppError } = require('../middleware/error.middleware');

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function signup({ email, password, name }) {
  validateSignupBody({ email, password, name });

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError('이미 사용 중인 이메일입니다.', 409, 'EMAIL_CONFLICT');
  }

  const hashedPassword = await hash(password);
  const user = await userRepository.create({ email, password: hashedPassword, name });

  await categoryRepository.create({ userId: user.id, name: '기본', isDefault: true });

  return toPublicUser(user);
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new AppError('이메일과 비밀번호는 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
  }

  const token = sign(user.id);

  return { token, user: toPublicUser(user) };
}

module.exports = { signup, login };
