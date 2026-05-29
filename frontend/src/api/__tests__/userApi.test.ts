import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMe, updateMe, deleteMe } from '../userApi';

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../client';

const mockGet = vi.mocked(apiClient.get);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMe', () => {
  it('GET /api/users/me를 호출하고 user를 반환한다', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: { user: mockUser } } });
    const result = await getMe();
    expect(mockGet).toHaveBeenCalledWith('/api/users/me');
    expect(result).toEqual(mockUser);
  });
});

describe('updateMe', () => {
  it('이름 변경 시 PATCH /api/users/me에 name을 전송한다', async () => {
    mockPatch.mockResolvedValue({ data: { success: true, data: { user: { ...mockUser, name: '김철수' } } } });
    const result = await updateMe({ name: '김철수' });
    expect(mockPatch).toHaveBeenCalledWith('/api/users/me', { name: '김철수' });
    expect(result.name).toBe('김철수');
  });

  it('비밀번호 변경 시 PATCH /api/users/me에 password를 전송한다', async () => {
    mockPatch.mockResolvedValue({ data: { success: true, data: { user: mockUser } } });
    await updateMe({ password: 'new1234' });
    expect(mockPatch).toHaveBeenCalledWith('/api/users/me', { password: 'new1234' });
  });
});

describe('deleteMe', () => {
  it('DELETE /api/users/me에 password를 전송한다', async () => {
    mockDelete.mockResolvedValue({});
    await deleteMe({ password: 'pass1234' });
    expect(mockDelete).toHaveBeenCalledWith('/api/users/me', { data: { password: 'pass1234' } });
  });
});
