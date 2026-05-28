const categoryRepository = require('../repositories/category.repository');
const todoRepository = require('../repositories/todo.repository');
const { validateCategoryName } = require('../validators/category.validator');
const { AppError } = require('../middleware/error.middleware');

async function getCategories(userId) {
  return categoryRepository.findAllByUserId(userId);
}

async function createCategory(userId, { name }) {
  validateCategoryName(name);
  return categoryRepository.create({ userId, name, isDefault: false });
}

async function updateCategory(userId, categoryId, { name }) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError('카테고리를 찾을 수 없습니다.', 404, 'CATEGORY_NOT_FOUND');
  }
  if (category.userId !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }
  if (category.isDefault === true) {
    throw new AppError('기본 카테고리는 수정할 수 없습니다.', 403, 'DEFAULT_CATEGORY_PROTECTED');
  }
  validateCategoryName(name);
  return categoryRepository.update(categoryId, { name });
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError('카테고리를 찾을 수 없습니다.', 404, 'CATEGORY_NOT_FOUND');
  }
  if (category.userId !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'FORBIDDEN');
  }
  if (category.isDefault === true) {
    throw new AppError('기본 카테고리는 삭제할 수 없습니다.', 403, 'DEFAULT_CATEGORY_PROTECTED');
  }
  const defaultCategory = await categoryRepository.findDefaultByUserId(userId);
  await todoRepository.updateCategoryForTodos(defaultCategory.id, categoryId);
  await categoryRepository.deleteById(categoryId);
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
