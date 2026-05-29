import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import { useAuthStore } from '../../stores/authStore';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('PrivateRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('미인증 상태에서 /login으로 리다이렉트된다', () => {
    render(
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/login" element={<div>로그인 페이지</div>} />
          <Route
            path="/todos"
            element={
              <PrivateRoute>
                <div>할일 목록</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
    expect(screen.queryByText('할일 목록')).not.toBeInTheDocument();
  });

  it('인증 상태에서 자식 컴포넌트가 렌더링된다', () => {
    useAuthStore.getState().setAuth('test-token', mockUser);
    render(
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/login" element={<div>로그인 페이지</div>} />
          <Route
            path="/todos"
            element={
              <PrivateRoute>
                <div>할일 목록</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('할일 목록')).toBeInTheDocument();
    expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument();
  });
});
