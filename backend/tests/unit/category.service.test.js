'use strict';

describe('CategoryService - getCategories', () => {
  let categoryService;
  let categoryRepository;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/category.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findDefaultByUserId: jest.fn(),
    }));
    jest.doMock('../../src/repositories/todo.repository', () => ({
      updateCategoryForTodos: jest.fn(),
    }));
    jest.doMock('../../src/validators/category.validator', () => ({
      validateCategoryName: jest.fn(),
    }));

    categoryService = require('../../src/services/category.service');
    categoryRepository = require('../../src/repositories/category.repository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('userId에 해당하는 categories 배열을 반환한다', async () => {
    const fakeCategories = [
      { id: 'cat-1', userId: 'user-1', name: '기본', isDefault: true },
      { id: 'cat-2', userId: 'user-1', name: '업무', isDefault: false },
    ];
    categoryRepository.findAllByUserId.mockResolvedValue(fakeCategories);

    const result = await categoryService.getCategories('user-1');

    expect(result).toEqual(fakeCategories);
    expect(categoryRepository.findAllByUserId).toHaveBeenCalledWith('user-1');
  });

  it('결과가 없을 때 빈 배열을 정상 반환한다', async () => {
    categoryRepository.findAllByUserId.mockResolvedValue([]);

    const result = await categoryService.getCategories('user-1');

    expect(result).toEqual([]);
  });
});

describe('CategoryService - createCategory', () => {
  let categoryService;
  let categoryRepository;
  let categoryValidator;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/category.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findDefaultByUserId: jest.fn(),
    }));
    jest.doMock('../../src/repositories/todo.repository', () => ({
      updateCategoryForTodos: jest.fn(),
    }));
    jest.doMock('../../src/validators/category.validator', () => ({
      validateCategoryName: jest.fn(),
    }));

    categoryService = require('../../src/services/category.service');
    categoryRepository = require('../../src/repositories/category.repository');
    categoryValidator = require('../../src/validators/category.validator');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 name으로 생성 시 category를 반환하며 isDefault가 false이다', async () => {
    const fakeCategory = {
      id: 'cat-new',
      userId: 'user-1',
      name: '새 카테고리',
      isDefault: false,
    };
    categoryValidator.validateCategoryName.mockReturnValue(undefined);
    categoryRepository.create.mockResolvedValue(fakeCategory);

    const result = await categoryService.createCategory('user-1', { name: '새 카테고리' });

    expect(result).toEqual(fakeCategory);
    expect(result.isDefault).toBe(false);
  });

  it('validateCategoryName이 throw하면 에러가 그대로 전파된다', async () => {
    const { AppError } = require('../../src/middleware/error.middleware');
    const validationError = new AppError('카테고리 이름은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
    categoryValidator.validateCategoryName.mockImplementation(() => {
      throw validationError;
    });

    await expect(
      categoryService.createCategory('user-1', { name: '' })
    ).rejects.toBe(validationError);
  });

  it('categoryRepository.create 호출 시 isDefault=false를 전달한다', async () => {
    categoryValidator.validateCategoryName.mockReturnValue(undefined);
    categoryRepository.create.mockResolvedValue({
      id: 'cat-new',
      userId: 'user-1',
      name: '테스트',
      isDefault: false,
    });

    await categoryService.createCategory('user-1', { name: '테스트' });

    expect(categoryRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: '테스트',
      isDefault: false,
    });
  });
});

describe('CategoryService - updateCategory', () => {
  let categoryService;
  let categoryRepository;
  let categoryValidator;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/category.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findDefaultByUserId: jest.fn(),
    }));
    jest.doMock('../../src/repositories/todo.repository', () => ({
      updateCategoryForTodos: jest.fn(),
    }));
    jest.doMock('../../src/validators/category.validator', () => ({
      validateCategoryName: jest.fn(),
    }));

    categoryService = require('../../src/services/category.service');
    categoryRepository = require('../../src/repositories/category.repository');
    categoryValidator = require('../../src/validators/category.validator');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('정상 수정 시 업데이트된 category를 반환한다', async () => {
    const existingCategory = { id: 'cat-1', userId: 'user-1', name: '업무', isDefault: false };
    const updatedCategory = { id: 'cat-1', userId: 'user-1', name: '개인', isDefault: false };
    categoryRepository.findById.mockResolvedValue(existingCategory);
    categoryValidator.validateCategoryName.mockReturnValue(undefined);
    categoryRepository.update.mockResolvedValue(updatedCategory);

    const result = await categoryService.updateCategory('user-1', 'cat-1', { name: '개인' });

    expect(result).toEqual(updatedCategory);
  });

  it('존재하지 않는 카테고리 수정 시 404 AppError를 throw한다', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      categoryService.updateCategory('user-1', 'non-existent', { name: '수정' })
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'CATEGORY_NOT_FOUND',
    });
  });

  it('타인 소유 카테고리 수정 시 403 FORBIDDEN AppError를 throw한다', async () => {
    const otherUserCategory = { id: 'cat-1', userId: 'other-user', name: '업무', isDefault: false };
    categoryRepository.findById.mockResolvedValue(otherUserCategory);

    await expect(
      categoryService.updateCategory('user-1', 'cat-1', { name: '수정' })
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });

  it('isDefault=true인 카테고리 수정 시 403 DEFAULT_CATEGORY_PROTECTED AppError를 throw한다', async () => {
    const defaultCategory = { id: 'cat-default', userId: 'user-1', name: '기본', isDefault: true };
    categoryRepository.findById.mockResolvedValue(defaultCategory);

    await expect(
      categoryService.updateCategory('user-1', 'cat-default', { name: '수정' })
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'DEFAULT_CATEGORY_PROTECTED',
    });
  });

  it('validateCategoryName이 throw하면 에러가 그대로 전파된다', async () => {
    const { AppError } = require('../../src/middleware/error.middleware');
    const existingCategory = { id: 'cat-1', userId: 'user-1', name: '업무', isDefault: false };
    categoryRepository.findById.mockResolvedValue(existingCategory);
    const validationError = new AppError('카테고리 이름은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
    categoryValidator.validateCategoryName.mockImplementation(() => {
      throw validationError;
    });

    await expect(
      categoryService.updateCategory('user-1', 'cat-1', { name: '' })
    ).rejects.toBe(validationError);
  });
});

describe('CategoryService - deleteCategory', () => {
  let categoryService;
  let categoryRepository;
  let todoRepository;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/category.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findDefaultByUserId: jest.fn(),
    }));
    jest.doMock('../../src/repositories/todo.repository', () => ({
      updateCategoryForTodos: jest.fn(),
    }));
    jest.doMock('../../src/validators/category.validator', () => ({
      validateCategoryName: jest.fn(),
    }));

    categoryService = require('../../src/services/category.service');
    categoryRepository = require('../../src/repositories/category.repository');
    todoRepository = require('../../src/repositories/todo.repository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('정상 삭제 시 deleteById가 호출된다', async () => {
    const existingCategory = { id: 'cat-1', userId: 'user-1', name: '업무', isDefault: false };
    const defaultCategory = { id: 'cat-default', userId: 'user-1', name: '기본', isDefault: true };
    categoryRepository.findById.mockResolvedValue(existingCategory);
    categoryRepository.findDefaultByUserId.mockResolvedValue(defaultCategory);
    todoRepository.updateCategoryForTodos.mockResolvedValue(undefined);
    categoryRepository.deleteById.mockResolvedValue(undefined);

    await categoryService.deleteCategory('user-1', 'cat-1');

    expect(categoryRepository.deleteById).toHaveBeenCalledWith('cat-1');
  });

  it('존재하지 않는 카테고리 삭제 시 404 AppError를 throw한다', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      categoryService.deleteCategory('user-1', 'non-existent')
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'CATEGORY_NOT_FOUND',
    });
  });

  it('타인 소유 카테고리 삭제 시 403 FORBIDDEN AppError를 throw한다', async () => {
    const otherUserCategory = { id: 'cat-1', userId: 'other-user', name: '업무', isDefault: false };
    categoryRepository.findById.mockResolvedValue(otherUserCategory);

    await expect(
      categoryService.deleteCategory('user-1', 'cat-1')
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });

  it('isDefault=true인 카테고리 삭제 시 403 DEFAULT_CATEGORY_PROTECTED AppError를 throw한다', async () => {
    const defaultCategory = { id: 'cat-default', userId: 'user-1', name: '기본', isDefault: true };
    categoryRepository.findById.mockResolvedValue(defaultCategory);

    await expect(
      categoryService.deleteCategory('user-1', 'cat-default')
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'DEFAULT_CATEGORY_PROTECTED',
    });
  });

  it('삭제 전 updateCategoryForTodos를 호출하여 todos를 기본 카테고리로 이관한다', async () => {
    const existingCategory = { id: 'cat-1', userId: 'user-1', name: '업무', isDefault: false };
    const defaultCategory = { id: 'cat-default', userId: 'user-1', name: '기본', isDefault: true };
    categoryRepository.findById.mockResolvedValue(existingCategory);
    categoryRepository.findDefaultByUserId.mockResolvedValue(defaultCategory);
    todoRepository.updateCategoryForTodos.mockResolvedValue(undefined);
    categoryRepository.deleteById.mockResolvedValue(undefined);

    await categoryService.deleteCategory('user-1', 'cat-1');

    expect(todoRepository.updateCategoryForTodos).toHaveBeenCalledWith('cat-default', 'cat-1');
    const updateOrder = todoRepository.updateCategoryForTodos.mock.invocationCallOrder[0];
    const deleteOrder = categoryRepository.deleteById.mock.invocationCallOrder[0];
    expect(updateOrder).toBeLessThan(deleteOrder);
  });
});
