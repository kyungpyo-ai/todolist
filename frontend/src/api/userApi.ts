import apiClient from './client';
import type { User, Theme, Language } from '../types/user';

export interface UpdateMeRequest {
  name?: string;
  password?: string;
  theme?: Theme;
  language?: Language;
}

export interface DeleteMeRequest {
  password: string;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<{ success: true; data: { user: User } }>('/api/users/me');
  return res.data.data.user;
}

export async function updateMe(data: UpdateMeRequest): Promise<User> {
  const res = await apiClient.patch<{ success: true; data: { user: User } }>('/api/users/me', data);
  return res.data.data.user;
}

export async function deleteMe(data: DeleteMeRequest): Promise<void> {
  await apiClient.delete('/api/users/me', { data });
}
