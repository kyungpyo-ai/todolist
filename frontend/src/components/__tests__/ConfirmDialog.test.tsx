import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('isOpen=false 이면 렌더링되지 않는다', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="삭제"
        message="삭제하시겠습니까?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen=true 이면 타이틀과 메시지를 표시한다', () => {
    render(
      <ConfirmDialog
        isOpen
        title="할일 삭제"
        message="삭제하시겠습니까?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('할일 삭제')).toBeInTheDocument();
    expect(screen.getByText('삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="삭제"
        message="삭제하시겠습니까?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        confirmLabel="삭제"
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="삭제"
        message="삭제하시겠습니까?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('isLoading=true 일 때 버튼이 비활성화되고 "처리 중..."이 표시된다', () => {
    render(
      <ConfirmDialog
        isOpen
        title="삭제"
        message="삭제하시겠습니까?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isLoading
      />
    );
    expect(screen.getByText('처리 중...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  });
});
