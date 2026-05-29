import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import ProfilePage from '../ProfilePage';

vi.mock('../../features/profile/hooks/useProfile', () => ({
  useUpdateMe: vi.fn(),
  useDeleteMe: vi.fn(),
  useGetMe: vi.fn(),
}));

vi.mock('../../stores/uiStore', () => ({
  useUiStore: vi.fn((selector: (s: { language: string; setLanguage: () => void }) => unknown) =>
    selector({ language: 'ko', setLanguage: vi.fn() })
  ),
}));

vi.mock('../../i18n', () => ({
  default: { changeLanguage: vi.fn() },
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn((selector: (s: { user: { id: string; email: string; name: string; theme: string; language: string; createdAt: string; updatedAt: string } | null; token: string | null }) => unknown) =>
    selector({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: '홍길동',
        theme: 'light',
        language: 'ko',
        createdAt: '2026-05-01T00:00:00Z',
        updatedAt: '2026-05-01T00:00:00Z',
      },
      token: 'test-token',
    })
  ),
}));

import { useUpdateMe, useDeleteMe } from '../../features/profile/hooks/useProfile';

const mockUpdateMe = vi.mocked(useUpdateMe);
const mockDeleteMe = vi.mocked(useDeleteMe);

const mutateFn = vi.fn();
const deleteMutateFn = vi.fn();

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateMe.mockReturnValue({
    mutate: mutateFn,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateMe>);
  mockDeleteMe.mockReturnValue({
    mutate: deleteMutateFn,
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteMe>);
});

function renderProfilePage() {
  return render(
    createElement(makeWrapper(), null, createElement(ProfilePage))
  );
}

describe('ProfilePage — 이름 변경', () => {
  it('사용자 이름과 이메일이 표시된다', () => {
    renderProfilePage();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();
  });

  it('이름을 변경하지 않으면 저장 버튼이 비활성화된다', () => {
    renderProfilePage();
    const saveButtons = screen.getAllByRole('button', { name: '저장' });
    expect(saveButtons[0]).toBeDisabled();
  });

  it('이름 변경 시 저장 버튼이 활성화된다', async () => {
    renderProfilePage();
    const nameInput = screen.getByLabelText('이름');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '김철수');
    const saveButtons = screen.getAllByRole('button', { name: '저장' });
    expect(saveButtons[0]).not.toBeDisabled();
  });

  it('저장 버튼 클릭 시 updateMe.mutate가 name으로 호출된다', async () => {
    renderProfilePage();
    const nameInput = screen.getByLabelText('이름');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '김철수');
    const saveButtons = screen.getAllByRole('button', { name: '저장' });
    await userEvent.click(saveButtons[0]);
    expect(mutateFn).toHaveBeenCalledWith(
      { name: '김철수' },
      expect.any(Object)
    );
  });
});

describe('ProfilePage — 비밀번호 변경', () => {
  it('새 비밀번호 미입력 시 변경 버튼이 비활성화된다', () => {
    renderProfilePage();
    expect(screen.getByRole('button', { name: '변경' })).toBeDisabled();
  });

  it('새 비밀번호 입력 시 변경 버튼이 활성화된다', async () => {
    renderProfilePage();
    await userEvent.type(screen.getByLabelText(/새 비밀번호 \*/), 'new1234pass');
    expect(screen.getByRole('button', { name: '변경' })).not.toBeDisabled();
  });

  it('비밀번호 확인 불일치 시 즉시 오류 메시지를 표시한다', async () => {
    renderProfilePage();
    await userEvent.type(screen.getByLabelText(/새 비밀번호 \*/), 'new1234pass');
    await userEvent.type(screen.getByLabelText(/새 비밀번호 확인/), 'different');
    expect(screen.getByText('새 비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
  });

  it('비밀번호 조건 미충족 시 오류 메시지를 표시하고 mutate를 호출하지 않는다', async () => {
    renderProfilePage();
    await userEvent.type(screen.getByLabelText(/새 비밀번호 \*/), 'short');
    await userEvent.type(screen.getByLabelText(/새 비밀번호 확인/), 'short');
    await userEvent.click(screen.getByRole('button', { name: '변경' }));
    expect(mutateFn).not.toHaveBeenCalled();
  });

  it('유효한 비밀번호 입력 시 updateMe.mutate가 password로 호출된다', async () => {
    renderProfilePage();
    await userEvent.type(screen.getByLabelText(/새 비밀번호 \*/), 'new1234pass');
    await userEvent.type(screen.getByLabelText(/새 비밀번호 확인/), 'new1234pass');
    await userEvent.click(screen.getByRole('button', { name: '변경' }));
    expect(mutateFn).toHaveBeenCalledWith(
      { password: 'new1234pass' },
      expect.any(Object)
    );
  });
});

describe('ProfilePage — 회원 탈퇴', () => {
  it('"회원 탈퇴" 버튼이 표시된다', () => {
    renderProfilePage();
    expect(screen.getByRole('button', { name: '회원 탈퇴' })).toBeInTheDocument();
  });

  it('탈퇴 버튼 클릭 시 확인 다이얼로그가 표시된다', async () => {
    renderProfilePage();
    await userEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
    expect(screen.getByRole('dialog', { name: '회원 탈퇴' })).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
  });

  it('다이얼로그에서 취소 클릭 시 다이얼로그가 닫힌다', async () => {
    renderProfilePage();
    await userEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('비밀번호 입력 후 탈퇴 버튼 클릭 시 deleteMe.mutate가 호출된다', async () => {
    renderProfilePage();
    const deleteButtons = screen.getAllByRole('button', { name: '회원 탈퇴' });
    await userEvent.click(deleteButtons[0]);
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'mypassword1');
    const dialogDeleteButtons = screen.getAllByRole('button', { name: '회원 탈퇴' });
    await userEvent.click(dialogDeleteButtons[dialogDeleteButtons.length - 1]);
    expect(deleteMutateFn).toHaveBeenCalledWith(
      { password: 'mypassword1' },
      expect.any(Object)
    );
  });

  it('비밀번호 미입력 상태에서 탈퇴 버튼 클릭 시 오류 메시지를 표시한다', async () => {
    renderProfilePage();
    const deleteButtons = screen.getAllByRole('button', { name: '회원 탈퇴' });
    await userEvent.click(deleteButtons[0]);
    const dialogDeleteButtons = screen.getAllByRole('button', { name: '회원 탈퇴' });
    await userEvent.click(dialogDeleteButtons[dialogDeleteButtons.length - 1]);
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
    expect(deleteMutateFn).not.toHaveBeenCalled();
  });
});
