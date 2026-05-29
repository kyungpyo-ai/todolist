import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useCalendarTodos } from '../useCalendarTodos';

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
    title: '5월 할일',
    description: null,
    startDate: '2026-05-10',
    endDate: '2026-05-15',
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
});

describe('useCalendarTodos', () => {
  it('month 파라미터로 getTodos를 호출한다', async () => {
    mockGetTodos.mockResolvedValue(mockTodos);

    const { result } = renderHook(() => useCalendarTodos('2026-05'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetTodos).toHaveBeenCalledWith({ month: '2026-05' });
    expect(result.current.data).toEqual(mockTodos);
  });

  it('month가 변경되면 새 queryKey로 재요청된다', async () => {
    mockGetTodos.mockResolvedValue([]);

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: qc }, children);

    const { rerender } = renderHook(
      ({ month }: { month: string }) => useCalendarTodos(month),
      { wrapper, initialProps: { month: '2026-05' } }
    );

    await waitFor(() => expect(mockGetTodos).toHaveBeenCalledWith({ month: '2026-05' }));

    rerender({ month: '2026-06' });

    await waitFor(() => expect(mockGetTodos).toHaveBeenCalledWith({ month: '2026-06' }));
  });

  it('빈 배열을 반환해도 isSuccess가 true가 된다', async () => {
    mockGetTodos.mockResolvedValue([]);

    const { result } = renderHook(() => useCalendarTodos('2026-05'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('API 오류 시 isError가 true가 된다', async () => {
    mockGetTodos.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCalendarTodos('2026-05'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
