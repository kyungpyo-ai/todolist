import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useLogin, useSignup } from '../useAuth';
import { useAuthStore } from '../../../../stores/authStore';

vi.mock('../../../../api/authApi', () => ({
  login: vi.fn(),
  signup: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { login, signup } from '../../../../api/authApi';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(MemoryRouter, null, children)
    );
  };
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('성공 시 setAuth를 호출하고 /todos로 이동한다', async () => {
    vi.mocked(login).mockResolvedValueOnce({ token: 'jwt-token', user: mockUser });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'pass1234' });
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('jwt-token');
    expect(state.user).toEqual(mockUser);
    expect(mockNavigate).toHaveBeenCalledWith('/todos');
  });
});

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 /login으로 이동한다', async () => {
    vi.mocked(signup).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ email: 'test@example.com', password: 'pass1234', name: '홍길동' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
