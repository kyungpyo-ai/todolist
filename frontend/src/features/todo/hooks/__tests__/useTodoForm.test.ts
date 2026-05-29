import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useCreateTodo, useUpdateTodo, useDeleteTodo } from '../useTodoForm';

vi.mock('../../../../api/todoApi', () => ({
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { createTodo, updateTodo, deleteTodo } from '../../../../api/todoApi';

const mockCreateTodo = vi.mocked(createTodo);
const mockUpdateTodo = vi.mocked(updateTodo);
const mockDeleteTodo = vi.mocked(deleteTodo);

const mockTodo = {
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
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreateTodo', () => {
  it('성공 시 todos 쿼리를 무효화한다', async () => {
    mockCreateTodo.mockResolvedValue(mockTodo);
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useCreateTodo(), { wrapper });

    await act(async () => {
      result.current.mutate({
        title: '새 할일',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCreateTodo).toHaveBeenCalledWith({
      title: '새 할일',
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });
  });

  it('실패 시 isError가 true가 된다', async () => {
    mockCreateTodo.mockRejectedValue(new Error('서버 오류'));
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useCreateTodo(), { wrapper });

    await act(async () => {
      result.current.mutate({
        title: '새 할일',
        startDate: '2026-05-01',
        endDate: '2026-05-31',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateTodo', () => {
  it('성공 시 todos 쿼리를 무효화한다', async () => {
    mockUpdateTodo.mockResolvedValue({ ...mockTodo, title: '수정된 할일' });
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useUpdateTodo(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'todo-1', data: { title: '수정된 할일' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateTodo).toHaveBeenCalledWith('todo-1', { title: '수정된 할일' });
  });
});

describe('useDeleteTodo', () => {
  it('성공 시 todos 쿼리를 무효화한다', async () => {
    mockDeleteTodo.mockResolvedValue(undefined);
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useDeleteTodo(), { wrapper });

    await act(async () => {
      result.current.mutate('todo-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1');
  });

  it('실패 시 isError가 true가 된다', async () => {
    mockDeleteTodo.mockRejectedValue(new Error('삭제 실패'));
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useDeleteTodo(), { wrapper });

    await act(async () => {
      result.current.mutate('todo-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
