import apiClient from './client';
import type { Category } from '../types/category';

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<{ success: true; data: { categories: Category[] } }>('/api/categories');
  return res.data.data.categories;
}

export async function createCategory(data: { name: string }): Promise<Category> {
  const res = await apiClient.post<{ success: true; data: { category: Category } }>('/api/categories', data);
  return res.data.data.category;
}

export async function updateCategory(id: string, data: { name: string }): Promise<Category> {
  const res = await apiClient.patch<{ success: true; data: { category: Category } }>(`/api/categories/${id}`, data);
  return res.data.data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/categories/${id}`);
}
