import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import SignupForm from '../SignupForm';

vi.mock('../../../../api/authApi', () => ({
  signup: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { signup } from '../../../../api/authApi';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderSignupForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(MemoryRouter, null, React.createElement(SignupForm))
    )
  );
}

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('유효하지 않은 이메일 blur 시 오류 메시지를 표시한다', async () => {
    renderSignupForm();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText('이메일');
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다.')).toBeInTheDocument();
    });
  });

  it('비밀번호 조건 미충족 시 오류 메시지를 표시한다', async () => {
    renderSignupForm();
    const user = userEvent.setup();

    const passwordInput = screen.getByLabelText('비밀번호');
    await user.type(passwordInput, 'short');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다.')).toBeInTheDocument();
    });
  });

  it('이름 미입력 시 제출을 차단한다', async () => {
    renderSignupForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'pass1234');
    await user.click(screen.getByRole('button', { name: '회원가입' }));

    expect(signup).not.toHaveBeenCalled();
  });

  it('유효한 입력으로 폼 제출 시 signup API를 호출한다', async () => {
    vi.mocked(signup).mockResolvedValueOnce(mockUser);

    renderSignupForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('이름'), '홍길동');
    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'pass1234');
    await user.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith({
        name: '홍길동',
        email: 'test@example.com',
        password: 'pass1234',
      });
    });
  });

  it('서버 409 에러 시 이메일 중복 메시지를 표시한다', async () => {
    const axiosError = { response: { status: 409, data: { message: 'Conflict' } } };
    vi.mocked(signup).mockRejectedValueOnce(axiosError);

    renderSignupForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('이름'), '홍길동');
    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'pass1234');
    await user.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
    });
  });

  it('로그인 링크가 /login으로 연결된다', () => {
    renderSignupForm();
    const link = screen.getByRole('link', { name: '로그인' });
    expect(link).toHaveAttribute('href', '/login');
  });
});
