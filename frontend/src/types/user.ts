export type Theme = 'light' | 'dark';
export type Language = 'ko' | 'en';

export interface User {
  id: string;
  email: string;
  name: string;
  theme: Theme;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdateRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface DeleteAccountRequest {
  password: string;
}
