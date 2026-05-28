const { AppError } = require('../middleware/error.middleware');

function validateTodoBody({ title, startDate, endDate }) {
  if (!title || title.trim() === '') {
    throw new AppError('제목은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
  }
  if (!startDate) {
    throw new AppError('시작일은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
  }
  if (!endDate) {
    throw new AppError('종료일은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
  }
}

module.exports = { validateTodoBody };
