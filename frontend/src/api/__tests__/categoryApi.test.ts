import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../categoryApi';

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../client';

const mockCategory = {
  id: 'cat-1',
  userId: 'user-1',
  name: '업무',
  isDefault: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('categoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('성공 시 카테고리 배열을 반환한다', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: { categories: [mockCategory] } },
      });

      const result = await getCategories();

      expect(result).toEqual([mockCategory]);
      expect(apiClient.get).toHaveBeenCalledWith('/api/categories');
    });

    it('실패 시 에러를 전파한다', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network Error'));

      await expect(getCategories()).rejects.toThrow('Network Error');
    });
  });

  describe('createCategory', () => {
    it('성공 시 생성된 카테고리를 반환한다', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { category: mockCategory } },
      });

      const result = await createCategory({ name: '업무' });

      expect(result).toEqual(mockCategory);
      expect(apiClient.post).toHaveBeenCalledWith('/api/categories', { name: '업무' });
    });

    it('실패 시 에러를 전파한다', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Bad Request'));

      await expect(createCategory({ name: '' })).rejects.toThrow('Bad Request');
    });
  });

  describe('updateCategory', () => {
    it('성공 시 수정된 카테고리를 반환한다', async () => {
      const updated = { ...mockCategory, name: '개인' };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { success: true, data: { category: updated } },
      });

      const result = await updateCategory('cat-1', { name: '개인' });

      expect(result).toEqual(updated);
      expect(apiClient.patch).toHaveBeenCalledWith('/api/categories/cat-1', { name: '개인' });
    });

    it('실패 시 에러를 전파한다', async () => {
      vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error('Forbidden'));

      await expect(updateCategory('cat-1', { name: '개인' })).rejects.toThrow('Forbidden');
    });
  });

  describe('deleteCategory', () => {
    it('성공 시 undefined를 반환한다', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true, data: { message: '삭제되었습니다.' } },
      });

      const result = await deleteCategory('cat-1');

      expect(result).toBeUndefined();
      expect(apiClient.delete).toHaveBeenCalledWith('/api/categories/cat-1');
    });

    it('실패 시 에러를 전파한다', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Forbidden'));

      await expect(deleteCategory('cat-1')).rejects.toThrow('Forbidden');
    });
  });
});
