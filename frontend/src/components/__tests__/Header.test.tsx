import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import Header from '../Header';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';

vi.mock('../../api/userApi', () => ({
  updateMe: vi.fn().mockResolvedValue({}),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(MemoryRouter, null, React.createElement(Header))
    )
  );
}

describe('Header', () => {
  beforeEach(() => {
    useUiStore.setState({ theme: 'light', language: 'ko' });
    useAuthStore.getState().setAuth('test-token', mockUser);
    document.documentElement.removeAttribute('data-theme');
  });

  it('테마 토글 버튼이 렌더링된다', () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: '다크 모드로 전환' });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('라이트 모드일 때 🌙 아이콘이 표시된다', () => {
    renderHeader();
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('다크 모드일 때 ☀️ 아이콘이 표시된다', () => {
    useUiStore.setState({ theme: 'dark', language: 'ko' });
    renderHeader();
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('토글 버튼 클릭 시 theme이 dark로 변경된다', async () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: '다크 모드로 전환' });
    await userEvent.click(toggleBtn);
    expect(useUiStore.getState().theme).toBe('dark');
  });

  it('토글 버튼 클릭 시 document에 data-theme 속성이 설정된다', async () => {
    renderHeader();
    const toggleBtn = screen.getByRole('button', { name: '다크 모드로 전환' });
    await userEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('로그아웃 버튼이 렌더링된다', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });
});
