const { AppError } = require('../middleware/error.middleware');

function validateCategoryName(name) {
  if (!name || name.trim() === '') {
    throw new AppError('카테고리 이름은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
  }
}

module.exports = { validateCategoryName };
