import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoDetailModal from '../TodoDetailModal';
import type { Todo } from '../../../../types/todo';

const mockTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '테스트 할일',
  description: '테스트 설명입니다.',
  startDate: '2026-05-10',
  endDate: '2026-05-15',
  status: 'IN_PROGRESS',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

describe('TodoDetailModal', () => {
  it('제목, 상태, 날짜, 카테고리, 설명이 표시된다', () => {
    render(
      <TodoDetailModal
        todo={mockTodo}
        categoryName="업무"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('테스트 할일')).toBeInTheDocument();
    expect(screen.getByText('진행중')).toBeInTheDocument();
    expect(screen.getByText('2026-05-10')).toBeInTheDocument();
    expect(screen.getByText('2026-05-15')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
    expect(screen.getByText('테스트 설명입니다.')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <TodoDetailModal todo={mockTodo} categoryName="업무" onClose={onClose} />
    );

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn();
    render(
      <TodoDetailModal todo={mockTodo} categoryName="업무" onClose={onClose} />
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('설명이 null이면 설명 행이 렌더링되지 않는다', () => {
    render(
      <TodoDetailModal
        todo={{ ...mockTodo, description: null }}
        categoryName="업무"
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText('설명')).not.toBeInTheDocument();
  });

  it('NOT_STARTED 상태 배지가 올바르게 표시된다', () => {
    render(
      <TodoDetailModal
        todo={{ ...mockTodo, status: 'NOT_STARTED' }}
        categoryName="업무"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('미시작')).toBeInTheDocument();
  });

  it('DONE 상태 배지가 올바르게 표시된다', () => {
    render(
      <TodoDetailModal
        todo={{ ...mockTodo, status: 'DONE' }}
        categoryName="업무"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('완료')).toBeInTheDocument();
  });
});
