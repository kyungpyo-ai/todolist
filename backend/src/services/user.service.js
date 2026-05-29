const userRepository = require('../repositories/user.repository');
const { hash, compare } = require('../utils/password');
const { validatePassword } = require('../validators/auth.validator');
const { AppError } = require('../middleware/error.middleware');

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    theme: user.theme ?? 'light',
    language: user.language ?? 'ko',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
  }
  return toPublicUser(user);
}

async function updateMe(userId, { name, password, theme, language }) {
  if (!name && !password && theme === undefined && language === undefined) {
    throw new AppError('수정할 항목을 입력해주세요.', 400, 'INVALID_INPUT');
  }

  const updateFields = {};

  if (name !== undefined) {
    updateFields.name = name;
  }

  if (password !== undefined) {
    validatePassword(password);
    updateFields.password = await hash(password);
  }

  if (theme !== undefined) {
    const allowed = ['light', 'dark'];
    if (!allowed.includes(theme)) throw new AppError('허용되지 않는 테마 값입니다.', 400, 'INVALID_THEME');
    updateFields.theme = theme;
  }

  if (language !== undefined) {
    const allowed = ['ko', 'en'];
    if (!allowed.includes(language)) throw new AppError('허용되지 않는 언어 코드입니다.', 400, 'INVALID_LANGUAGE');
    updateFields.language = language;
  }

  const updated = await userRepository.update(userId, updateFields);
  return toPublicUser(updated);
}

async function deleteMe(userId, password) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
  }

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    throw new AppError('비밀번호가 올바르지 않습니다.', 401, 'INVALID_CREDENTIALS');
  }

  await userRepository.deleteById(userId);
}

module.exports = { getMe, updateMe, deleteMe };
