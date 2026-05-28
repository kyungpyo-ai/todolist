const { AppError } = require('../middleware/error.middleware');

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new AppError('유효하지 않은 이메일 형식입니다.', 400, 'INVALID_EMAIL');
  }
}

function validatePassword(password) {
  const hasMinLength = password && password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasMinLength || !hasLetter || !hasNumber) {
    throw new AppError(
      '비밀번호는 최소 8자 이상이며 영문과 숫자를 포함해야 합니다.',
      400,
      'INVALID_PASSWORD'
    );
  }
}

function validateSignupBody({ email, password, name }) {
  if (!name || name.trim() === '') {
    throw new AppError('이름은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
  }
  validateEmail(email);
  validatePassword(password);
}

module.exports = { validateEmail, validatePassword, validateSignupBody };
