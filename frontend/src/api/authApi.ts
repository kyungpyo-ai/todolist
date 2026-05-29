import apiClient from './client';
import type { User } from '../types/user';

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function signup(data: SignupRequest): Promise<User> {
  const res = await apiClient.post<{ success: true; data: { user: User } }>('/api/auth/signup', data);
  return res.data.data.user;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<{ success: true; data: LoginResponse }>('/api/auth/login', data);
  return res.data.data;
}
