const todoRepository = require('../repositories/todo.repository');
const categoryRepository = require('../repositories/category.repository');
const { validateTodoBody } = require('../validators/todo.validator');
const { AppError } = require('../middleware/error.middleware');

// BR-05: 허용된 상태 전이 맵
const ALLOWED_TRANSITIONS = {
  NOT_STARTED: ['IN_PROGRESS'],
  IN_PROGRESS: ['DONE', 'NOT_STARTED'],
  DONE: ['IN_PROGRESS'],
};

async function getTodos(userId, { categoryId, status, overdue, month } = {}) {
  return todoRepository.findAllByUserId(userId, { categoryId, status, overdue, month });
}

async function createTodo(userId, { title, startDate, endDate, categoryId, description }) {
  validateTodoBody({ title, startDate, endDate });

  // BR-04: endDate >= startDate 검증
  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError('종료일은 시작일보다 이전일 수 없습니다.', 400, 'INVALID_DATE_RANGE');
  }

  // BR-03: categoryId 없으면 기본 카테고리 자동 적용
  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId) {
    const defaultCategory = await categoryRepository.findDefaultByUserId(userId);
    resolvedCategoryId = defaultCategory.id;
  }

  return todoRepository.create({ userId, categoryId: resolvedCategoryId, title, description, startDate, endDate });
}

async function getTodo(userId, todoId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError('할일을 찾을 수 없습니다.', 404, 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }
  return todo;
}

async function updateTodo(userId, todoId, updates) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError('할일을 찾을 수 없습니다.', 404, 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }

  // BR-05: 상태 전이 검증
  if (updates.status && updates.status !== todo.status) {
    const allowed = ALLOWED_TRANSITIONS[todo.status] || [];
    if (!allowed.includes(updates.status)) {
      throw new AppError(
        `${todo.status} 상태에서 ${updates.status}(으)로 변경할 수 없습니다.`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }
  }

  // BR-04: 날짜 검증
  const newStartDate = updates.startDate || todo.startDate;
  const newEndDate = updates.endDate || todo.endDate;
  if (new Date(newEndDate) < new Date(newStartDate)) {
    throw new AppError('종료일은 시작일보다 이전일 수 없습니다.', 400, 'INVALID_DATE_RANGE');
  }

  return todoRepository.update(todoId, updates);
}

async function deleteTodo(userId, todoId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError('할일을 찾을 수 없습니다.', 404, 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }
  await todoRepository.deleteById(todoId);
}

module.exports = { getTodos, createTodo, getTodo, updateTodo, deleteTodo };
