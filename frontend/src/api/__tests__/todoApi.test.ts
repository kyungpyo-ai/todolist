import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../todoApi';

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../client';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

const mockTodos = [
  {
    id: 'todo-1',
    userId: 'user-1',
    categoryId: 'cat-1',
    title: '테스트 할일',
    description: null,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: 'NOT_STARTED' as const,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockResolvedValue({ data: { success: true, data: { todos: mockTodos } } });
  mockPost.mockResolvedValue({ data: { success: true, data: { todo: mockTodos[0] } } });
  mockPatch.mockResolvedValue({ data: { success: true, data: { todo: mockTodos[0] } } });
  mockDelete.mockResolvedValue({});
});

describe('getTodos', () => {
  it('필터 없이 호출하면 params 없이 요청한다', async () => {
    const result = await getTodos();
    expect(mockGet).toHaveBeenCalledWith('/api/todos', { params: {} });
    expect(result).toEqual(mockTodos);
  });

  it('status 필터가 있으면 params에 status를 포함한다', async () => {
    await getTodos({ status: 'IN_PROGRESS' });
    expect(mockGet).toHaveBeenCalledWith('/api/todos', { params: { status: 'IN_PROGRESS' } });
  });

  it('categoryId 필터가 있으면 params에 categoryId를 포함한다', async () => {
    await getTodos({ categoryId: 'cat-1' });
    expect(mockGet).toHaveBeenCalledWith('/api/todos', { params: { categoryId: 'cat-1' } });
  });

  it('overdue 필터가 true이면 params에 overdue=true를 포함한다', async () => {
    await getTodos({ overdue: true });
    expect(mockGet).toHaveBeenCalledWith('/api/todos', { params: { overdue: 'true' } });
  });

  it('복합 필터를 모두 조합하여 params에 포함한다', async () => {
    await getTodos({ categoryId: 'cat-1', status: 'DONE', overdue: true });
    expect(mockGet).toHaveBeenCalledWith('/api/todos', {
      params: { categoryId: 'cat-1', status: 'DONE', overdue: 'true' },
    });
  });
});

describe('createTodo', () => {
  it('POST /api/todos에 데이터를 전송하고 todo를 반환한다', async () => {
    const data = { title: '새 할일', startDate: '2026-05-01', endDate: '2026-05-31' };
    const result = await createTodo(data);
    expect(mockPost).toHaveBeenCalledWith('/api/todos', data);
    expect(result).toEqual(mockTodos[0]);
  });
});

describe('updateTodo', () => {
  it('PATCH /api/todos/:id에 데이터를 전송하고 todo를 반환한다', async () => {
    const result = await updateTodo('todo-1', { title: '수정된 할일' });
    expect(mockPatch).toHaveBeenCalledWith('/api/todos/todo-1', { title: '수정된 할일' });
    expect(result).toEqual(mockTodos[0]);
  });
});

describe('deleteTodo', () => {
  it('DELETE /api/todos/:id를 호출한다', async () => {
    await deleteTodo('todo-1');
    expect(mockDelete).toHaveBeenCalledWith('/api/todos/todo-1');
  });
});
