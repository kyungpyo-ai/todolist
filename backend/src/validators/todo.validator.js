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

// YYYY-MM 형식 검증
function validateMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError('month는 YYYY-MM 형식이어야 합니다.', 400, 'INVALID_INPUT');
  }
  const [year, mon] = month.split('-').map(Number);
  if (mon < 1 || mon > 12) {
    throw new AppError('month의 월 값이 유효하지 않습니다.', 400, 'INVALID_INPUT');
  }
}

module.exports = { validateTodoBody, validateMonth };
