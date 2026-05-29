import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useGetMe, useUpdateMe, useDeleteMe } from '../useProfile';

vi.mock('../../../../api/userApi', () => ({
  getMe: vi.fn(),
  updateMe: vi.fn(),
  deleteMe: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../../../stores/authStore', () => ({
  useAuthStore: vi.fn((selector: (s: { token: string | null; user: null; setAuth: () => void; clearAuth: () => void }) => unknown) =>
    selector({ token: 'test-token', user: null, setAuth: vi.fn(), clearAuth: vi.fn() })
  ),
}));

import { getMe, updateMe, deleteMe } from '../../../../api/userApi';

const mockGetMe = vi.mocked(getMe);
const mockUpdateMe = vi.mocked(updateMe);
const mockDeleteMe = vi.mocked(deleteMe);

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
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

describe('useGetMe', () => {
  it('getMe를 호출하고 user 데이터를 반환한다', async () => {
    mockGetMe.mockResolvedValue(mockUser);
    const { result } = renderHook(() => useGetMe(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
  });

  it('실패 시 isError가 true가 된다', async () => {
    mockGetMe.mockRejectedValue(new Error('서버 오류'));
    const { result } = renderHook(() => useGetMe(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateMe', () => {
  it('이름 변경 성공 시 isSuccess가 true가 된다', async () => {
    mockUpdateMe.mockResolvedValue({ ...mockUser, name: '김철수' });
    const { result } = renderHook(() => useUpdateMe(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ name: '김철수' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockUpdateMe).toHaveBeenCalledWith({ name: '김철수' });
  });

  it('실패 시 isError가 true가 된다', async () => {
    mockUpdateMe.mockRejectedValue(new Error('저장 실패'));
    const { result } = renderHook(() => useUpdateMe(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ password: 'weak' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useDeleteMe', () => {
  it('탈퇴 성공 시 isSuccess가 true가 된다', async () => {
    mockDeleteMe.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteMe(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ password: 'pass1234' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDeleteMe).toHaveBeenCalledWith({ password: 'pass1234' });
  });

  it('비밀번호 불일치 시 isError가 true가 된다', async () => {
    mockDeleteMe.mockRejectedValue(new Error('비밀번호 불일치'));
    const { result } = renderHook(() => useDeleteMe(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
