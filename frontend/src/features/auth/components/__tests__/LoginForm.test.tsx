import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import LoginForm from '../LoginForm';

vi.mock('../../../../api/authApi', () => ({
  login: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { login } from '../../../../api/authApi';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(MemoryRouter, null, React.createElement(LoginForm))
    )
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('이메일/비밀번호 입력 후 제출하면 login API를 호출한다', async () => {
    vi.mocked(login).mockResolvedValueOnce({ token: 'jwt-token', user: mockUser });

    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'pass1234');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pass1234' });
    });
  });

  it('서버 오류 시 오류 메시지를 표시한다', async () => {
    const axiosError = {
      response: { status: 401, data: { message: '이메일 또는 비밀번호가 잘못되었습니다.' } },
    };
    vi.mocked(login).mockRejectedValueOnce(axiosError);

    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호가 잘못되었습니다.')).toBeInTheDocument();
    });
  });

  it('서버 오류 메시지가 없으면 기본 메시지를 표시한다', async () => {
    const axiosError = { response: { status: 401, data: {} } };
    vi.mocked(login).mockRejectedValueOnce(axiosError);

    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호를 확인해주세요.')).toBeInTheDocument();
    });
  });

  it('로딩 상태일 때 버튼이 비활성화된다', async () => {
    vi.mocked(login).mockImplementation(() => new Promise(() => {}));

    renderLoginForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'pass1234');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로딩 중...' })).toBeDisabled();
    });
  });

  it('회원가입 링크가 /signup으로 연결된다', () => {
    renderLoginForm();
    const link = screen.getByRole('link', { name: '회원가입' });
    expect(link).toHaveAttribute('href', '/signup');
  });
});
