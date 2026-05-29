import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('초기 상태에서 token과 user는 null이다', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth 호출 후 token과 user가 저장된다', () => {
    useAuthStore.getState().setAuth('test-token', mockUser);
    const state = useAuthStore.getState();
    expect(state.token).toBe('test-token');
    expect(state.user).toEqual(mockUser);
  });

  it('clearAuth 호출 후 token과 user가 null이 된다', () => {
    useAuthStore.getState().setAuth('test-token', mockUser);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('토큰이 있으면 isAuthenticated가 true를 반환한다', () => {
    useAuthStore.getState().setAuth('test-token', mockUser);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('토큰이 없으면 isAuthenticated가 false를 반환한다', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });
});
