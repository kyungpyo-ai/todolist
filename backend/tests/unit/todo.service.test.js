'use strict';

describe('TodoService - getTodos', () => {
  let todoService;
  let todoRepository;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/todo.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    }));
    jest.doMock('../../src/repositories/category.repository', () => ({
      findDefaultByUserId: jest.fn(),
      findById: jest.fn(),
    }));
    jest.doMock('../../src/validators/todo.validator', () => ({
      validateTodoBody: jest.fn(),
    }));

    todoService = require('../../src/services/todo.service');
    todoRepository = require('../../src/repositories/todo.repository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('userId로 todos 배열을 반환한다', async () => {
    const fakeTodos = [
      { id: 'todo-1', userId: 'user-1', title: '할일1', status: 'NOT_STARTED' },
      { id: 'todo-2', userId: 'user-1', title: '할일2', status: 'IN_PROGRESS' },
    ];
    todoRepository.findAllByUserId.mockResolvedValue(fakeTodos);

    const result = await todoService.getTodos('user-1', {});

    expect(result).toEqual(fakeTodos);
    expect(todoRepository.findAllByUserId).toHaveBeenCalledWith('user-1', expect.any(Object));
  });

  it('overdue=true 필터 파라미터를 repository에 전달한다', async () => {
    todoRepository.findAllByUserId.mockResolvedValue([]);

    await todoService.getTodos('user-1', { overdue: true });

    expect(todoRepository.findAllByUserId).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ overdue: true })
    );
  });
});

describe('TodoService - createTodo', () => {
  let todoService;
  let todoRepository;
  let categoryRepository;
  let todoValidator;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/todo.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    }));
    jest.doMock('../../src/repositories/category.repository', () => ({
      findDefaultByUserId: jest.fn(),
      findById: jest.fn(),
    }));
    jest.doMock('../../src/validators/todo.validator', () => ({
      validateTodoBody: jest.fn(),
    }));

    todoService = require('../../src/services/todo.service');
    todoRepository = require('../../src/repositories/todo.repository');
    categoryRepository = require('../../src/repositories/category.repository');
    todoValidator = require('../../src/validators/todo.validator');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('categoryId가 없을 때 기본 카테고리를 자동 적용한다 (BR-03)', async () => {
    const defaultCategory = { id: 'cat-default', userId: 'user-1', name: '기본', isDefault: true };
    const fakeTodo = {
      id: 'todo-new',
      userId: 'user-1',
      categoryId: 'cat-default',
      title: '새 할일',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      status: 'NOT_STARTED',
    };
    todoValidator.validateTodoBody.mockReturnValue(undefined);
    categoryRepository.findDefaultByUserId.mockResolvedValue(defaultCategory);
    todoRepository.create.mockResolvedValue(fakeTodo);

    const result = await todoService.createTodo('user-1', {
      title: '새 할일',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
    });

    expect(categoryRepository.findDefaultByUserId).toHaveBeenCalledWith('user-1');
    expect(todoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-default' })
    );
    expect(result).toEqual(fakeTodo);
  });

  it('endDate < startDate이면 400 INVALID_DATE_RANGE AppError를 throw한다 (BR-04)', async () => {
    todoValidator.validateTodoBody.mockReturnValue(undefined);

    await expect(
      todoService.createTodo('user-1', {
        title: '날짜 오류 할일',
        startDate: '2026-06-10',
        endDate: '2026-06-05',
        categoryId: 'cat-1',
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_DATE_RANGE',
    });
  });

  it('정상 입력 시 todo를 반환한다', async () => {
    const fakeTodo = {
      id: 'todo-new',
      userId: 'user-1',
      categoryId: 'cat-1',
      title: '새 할일',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      status: 'NOT_STARTED',
    };
    todoValidator.validateTodoBody.mockReturnValue(undefined);
    todoRepository.create.mockResolvedValue(fakeTodo);

    const result = await todoService.createTodo('user-1', {
      title: '새 할일',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      categoryId: 'cat-1',
    });

    expect(result).toEqual(fakeTodo);
  });

  it('validateTodoBody가 throw하면 에러가 그대로 전파된다', async () => {
    const { AppError } = require('../../src/middleware/error.middleware');
    const validationError = new AppError('제목은 필수 입력 항목입니다.', 400, 'INVALID_INPUT');
    todoValidator.validateTodoBody.mockImplementation(() => {
      throw validationError;
    });

    await expect(
      todoService.createTodo('user-1', {
        title: '',
        startDate: '2026-06-01',
        endDate: '2026-06-05',
        categoryId: 'cat-1',
      })
    ).rejects.toBe(validationError);
  });
});

describe('TodoService - getTodo', () => {
  let todoService;
  let todoRepository;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/todo.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    }));
    jest.doMock('../../src/repositories/category.repository', () => ({
      findDefaultByUserId: jest.fn(),
      findById: jest.fn(),
    }));
    jest.doMock('../../src/validators/todo.validator', () => ({
      validateTodoBody: jest.fn(),
    }));

    todoService = require('../../src/services/todo.service');
    todoRepository = require('../../src/repositories/todo.repository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('정상 조회 시 todo를 반환한다', async () => {
    const fakeTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '할일1',
      status: 'NOT_STARTED',
    };
    todoRepository.findById.mockResolvedValue(fakeTodo);

    const result = await todoService.getTodo('user-1', 'todo-1');

    expect(result).toEqual(fakeTodo);
  });
});

describe('TodoService - updateTodo (BR-05 상태 전이)', () => {
  let todoService;
  let todoRepository;
  let todoValidator;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/todo.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    }));
    jest.doMock('../../src/repositories/category.repository', () => ({
      findDefaultByUserId: jest.fn(),
      findById: jest.fn(),
    }));
    jest.doMock('../../src/validators/todo.validator', () => ({
      validateTodoBody: jest.fn(),
    }));

    todoService = require('../../src/services/todo.service');
    todoRepository = require('../../src/repositories/todo.repository');
    todoValidator = require('../../src/validators/todo.validator');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('NOT_STARTED → IN_PROGRESS 전이를 허용한다', async () => {
    const existingTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '할일',
      status: 'NOT_STARTED',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    };
    const updatedTodo = { ...existingTodo, status: 'IN_PROGRESS' };
    todoRepository.findById.mockResolvedValue(existingTodo);
    todoValidator.validateTodoBody.mockReturnValue(undefined);
    todoRepository.update.mockResolvedValue(updatedTodo);

    const result = await todoService.updateTodo('user-1', 'todo-1', { status: 'IN_PROGRESS' });

    expect(result.status).toBe('IN_PROGRESS');
  });

  it('NOT_STARTED → DONE 전이를 금지하며 400 INVALID_STATUS_TRANSITION을 throw한다', async () => {
    const existingTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '할일',
      status: 'NOT_STARTED',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    };
    todoRepository.findById.mockResolvedValue(existingTodo);
    todoValidator.validateTodoBody.mockReturnValue(undefined);

    await expect(
      todoService.updateTodo('user-1', 'todo-1', { status: 'DONE' })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_STATUS_TRANSITION',
    });
  });

  it('IN_PROGRESS → DONE 전이를 허용한다', async () => {
    const existingTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '할일',
      status: 'IN_PROGRESS',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    };
    const updatedTodo = { ...existingTodo, status: 'DONE' };
    todoRepository.findById.mockResolvedValue(existingTodo);
    todoValidator.validateTodoBody.mockReturnValue(undefined);
    todoRepository.update.mockResolvedValue(updatedTodo);

    const result = await todoService.updateTodo('user-1', 'todo-1', { status: 'DONE' });

    expect(result.status).toBe('DONE');
  });

  it('IN_PROGRESS → NOT_STARTED 전이를 허용한다', async () => {
    const existingTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '할일',
      status: 'IN_PROGRESS',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    };
    const updatedTodo = { ...existingTodo, status: 'NOT_STARTED' };
    todoRepository.findById.mockResolvedValue(existingTodo);
    todoValidator.validateTodoBody.mockReturnValue(undefined);
    todoRepository.update.mockResolvedValue(updatedTodo);

    const result = await todoService.updateTodo('user-1', 'todo-1', { status: 'NOT_STARTED' });

    expect(result.status).toBe('NOT_STARTED');
  });

  it('DONE → IN_PROGRESS 전이를 허용한다', async () => {
    const existingTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '할일',
      status: 'DONE',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    };
    const updatedTodo = { ...existingTodo, status: 'IN_PROGRESS' };
    todoRepository.findById.mockResolvedValue(existingTodo);
    todoValidator.validateTodoBody.mockReturnValue(undefined);
    todoRepository.update.mockResolvedValue(updatedTodo);

    const result = await todoService.updateTodo('user-1', 'todo-1', { status: 'IN_PROGRESS' });

    expect(result.status).toBe('IN_PROGRESS');
  });

  it('DONE → NOT_STARTED 전이를 금지하며 400 INVALID_STATUS_TRANSITION을 throw한다', async () => {
    const existingTodo = {
      id: 'todo-1',
      userId: 'user-1',
      title: '할일',
      status: 'DONE',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
    };
    todoRepository.findById.mockResolvedValue(existingTodo);
    todoValidator.validateTodoBody.mockReturnValue(undefined);

    await expect(
      todoService.updateTodo('user-1', 'todo-1', { status: 'NOT_STARTED' })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_STATUS_TRANSITION',
    });
  });
});

describe('TodoService - deleteTodo', () => {
  let todoService;
  let todoRepository;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/todo.repository', () => ({
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    }));
    jest.doMock('../../src/repositories/category.repository', () => ({
      findDefaultByUserId: jest.fn(),
      findById: jest.fn(),
    }));
    jest.doMock('../../src/validators/todo.validator', () => ({
      validateTodoBody: jest.fn(),
    }));

    todoService = require('../../src/services/todo.service');
    todoRepository = require('../../src/repositories/todo.repository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('정상 삭제 시 deleteById가 호출된다', async () => {
    const existingTodo = { id: 'todo-1', userId: 'user-1', title: '할일', status: 'NOT_STARTED' };
    todoRepository.findById.mockResolvedValue(existingTodo);
    todoRepository.deleteById.mockResolvedValue(undefined);

    await todoService.deleteTodo('user-1', 'todo-1');

    expect(todoRepository.deleteById).toHaveBeenCalledWith('todo-1');
  });

  it('타인의 todo 삭제 시 403 FORBIDDEN AppError를 throw한다', async () => {
    const otherUserTodo = { id: 'todo-1', userId: 'other-user', title: '할일', status: 'NOT_STARTED' };
    todoRepository.findById.mockResolvedValue(otherUserTodo);

    await expect(
      todoService.deleteTodo('user-1', 'todo-1')
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });
});
