import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useTodoList } from '../useTodoList';
import type { TodoFilter } from '../../../../types/todo';

vi.mock('../../../../api/todoApi', () => ({
  getTodos: vi.fn(),
}));

import { getTodos } from '../../../../api/todoApi';

const mockGetTodos = vi.mocked(getTodos);

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

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTodos.mockResolvedValue(mockTodos);
});

describe('useTodoList', () => {
  it('기본 조회 시 todos 데이터를 반환한다', async () => {
    const { result } = renderHook(() => useTodoList(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTodos);
    expect(mockGetTodos).toHaveBeenCalledWith(undefined);
  });

  it('필터 변경 시 queryKey가 변경되어 재요청된다', async () => {
    const filter1: TodoFilter = { status: 'NOT_STARTED' };
    const filter2: TodoFilter = { status: 'DONE' };

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: qc }, children);

    const { result, rerender } = renderHook(
      ({ filter }: { filter: TodoFilter }) => useTodoList(filter),
      { wrapper, initialProps: { filter: filter1 } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGetTodos).toHaveBeenCalledWith(filter1);

    rerender({ filter: filter2 });

    await waitFor(() => expect(mockGetTodos).toHaveBeenCalledWith(filter2));
  });
});
