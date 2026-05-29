import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCategoryList, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../useCategoryList';

vi.mock('../../../../api/categoryApi', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../../api/categoryApi';

const mockCategory = {
  id: 'cat-1',
  userId: 'user-1',
  name: '업무',
  isDefault: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('카테고리 목록을 로드한다', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([mockCategory]);

    const { result } = renderHook(() => useCategoryList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockCategory]);
  });
});

describe('useCreateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 categories 쿼리를 무효화한다', async () => {
    vi.mocked(getCategories).mockResolvedValue([mockCategory]);
    vi.mocked(createCategory).mockResolvedValueOnce(mockCategory);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCreateCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ name: '업무' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });
});

describe('useUpdateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 categories 쿼리를 무효화한다', async () => {
    const updated = { ...mockCategory, name: '개인' };
    vi.mocked(updateCategory).mockResolvedValueOnce(updated);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useUpdateCategory(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 'cat-1', name: '개인' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });
});

describe('useDeleteCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 categories 쿼리를 무효화한다', async () => {
    vi.mocked(deleteCategory).mockResolvedValueOnce(undefined);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useDeleteCategory(), { wrapper });

    await act(async () => {
      result.current.mutate('cat-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] });
  });
});
