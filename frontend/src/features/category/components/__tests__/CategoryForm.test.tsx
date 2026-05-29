import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryForm from '../CategoryForm';

describe('CategoryForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('이름 미입력 제출 시 오류 메시지를 표시한다', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: '생성' }));

    expect(screen.getByText('카테고리 이름을 입력해 주세요.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('유효한 이름 제출 시 onSubmit을 호출한다', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText('카테고리 이름'), { target: { value: '업무' } });
    fireEvent.click(screen.getByRole('button', { name: '생성' }));

    expect(mockOnSubmit).toHaveBeenCalledWith('업무');
  });

  it('initialName이 있을 때 수정 모드로 표시된다', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialName="기존 이름" />);

    expect(screen.getByDisplayValue('기존 이름')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 onCancel을 호출한다', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('공백만 입력 시 오류 메시지를 표시한다', () => {
    render(<CategoryForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText('카테고리 이름'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: '생성' }));

    expect(screen.getByText('카테고리 이름을 입력해 주세요.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
