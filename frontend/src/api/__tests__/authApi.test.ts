import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login } from '../authApi';

vi.mock('../client', () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from '../client';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('성공 시 user 객체를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { user: mockUser } },
      });

      const result = await signup({ email: 'test@example.com', password: 'pass1234', name: '홍길동' });

      expect(result).toEqual(mockUser);
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/signup', {
        email: 'test@example.com',
        password: 'pass1234',
        name: '홍길동',
      });
    });

    it('실패 시 에러를 전파한다', async () => {
      const mockError = new Error('Network Error');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(
        signup({ email: 'test@example.com', password: 'pass1234', name: '홍길동' })
      ).rejects.toThrow('Network Error');
    });
  });

  describe('login', () => {
    it('성공 시 { token, user } 를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { token: 'jwt-token', user: mockUser } },
      });

      const result = await login({ email: 'test@example.com', password: 'pass1234' });

      expect(result).toEqual({ token: 'jwt-token', user: mockUser });
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'pass1234',
      });
    });

    it('실패 시 에러를 전파한다', async () => {
      const mockError = new Error('Unauthorized');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(
        login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Unauthorized');
    });
  });
});
