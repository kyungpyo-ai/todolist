import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryList from '../CategoryList';
import type { Category } from '../../../../types/category';

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    userId: 'user-1',
    name: '전체',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    userId: 'user-1',
    name: '업무',
    isDefault: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('CategoryList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('카테고리 목록을 렌더링한다', () => {
    render(<CategoryList categories={mockCategories} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
  });

  it('isDefault=true 카테고리의 수정/삭제 버튼이 비활성화된다', () => {
    render(<CategoryList categories={mockCategories} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editBtn = screen.getByRole('button', { name: '전체 수정' });
    const deleteBtn = screen.getByRole('button', { name: '전체 삭제' });

    expect(editBtn).toBeDisabled();
    expect(deleteBtn).toBeDisabled();
  });

  it('isDefault=false 카테고리의 수정/삭제 버튼이 활성화된다', () => {
    render(<CategoryList categories={mockCategories} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    const editBtn = screen.getByRole('button', { name: '업무 수정' });
    const deleteBtn = screen.getByRole('button', { name: '업무 삭제' });

    expect(editBtn).not.toBeDisabled();
    expect(deleteBtn).not.toBeDisabled();
  });

  it('isDefault=false 카테고리의 수정 버튼 클릭 시 onEdit을 호출한다', () => {
    render(<CategoryList categories={mockCategories} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByRole('button', { name: '업무 수정' }));

    expect(mockOnEdit).toHaveBeenCalledWith(mockCategories[1]);
  });

  it('isDefault=false 카테고리의 삭제 버튼 클릭 시 onDelete를 호출한다', () => {
    render(<CategoryList categories={mockCategories} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByRole('button', { name: '업무 삭제' }));

    expect(mockOnDelete).toHaveBeenCalledWith(mockCategories[1]);
  });

  it('빈 목록일 때 안내 메시지를 표시한다', () => {
    render(<CategoryList categories={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText('카테고리가 없습니다.')).toBeInTheDocument();
  });
});
