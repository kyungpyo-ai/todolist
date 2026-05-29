import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isOpen=false 시 렌더링되지 않는다', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('삭제 확인')).not.toBeInTheDocument();
  });

  it('isOpen=true 시 제목과 메시지가 렌더링된다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('삭제 확인')).toBeInTheDocument();
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm을 호출한다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onCancel을 호출한다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
