import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoList from '../TodoList';
import type { Todo } from '../../../../types/todo';
import type { Category } from '../../../../types/category';

vi.mock('../../../../utils/dateUtils', () => ({
  isOverdue: vi.fn().mockReturnValue(false),
  formatDate: (d: string) => d,
}));

const categories: Category[] = [
  {
    id: 'cat-1',
    userId: 'user-1',
    name: '업무',
    isDefault: false,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    userId: 'user-1',
    name: '개인',
    isDefault: false,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
];

const todos: Todo[] = [
  {
    id: 'todo-1',
    userId: 'user-1',
    categoryId: 'cat-1',
    title: '할일 첫번째',
    description: null,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: 'NOT_STARTED',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'todo-2',
    userId: 'user-1',
    categoryId: 'cat-2',
    title: '할일 두번째',
    description: null,
    startDate: '2026-05-05',
    endDate: '2026-05-20',
    status: 'IN_PROGRESS',
    createdAt: '2026-05-05T00:00:00Z',
    updatedAt: '2026-05-05T00:00:00Z',
  },
];

describe('TodoList', () => {
  it('할일 목록을 렌더링한다', () => {
    render(
      <TodoList todos={todos} categories={categories} onEdit={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText('할일 첫번째')).toBeInTheDocument();
    expect(screen.getByText('할일 두번째')).toBeInTheDocument();
  });

  it('빈 배열이면 "할일이 없습니다." 메시지를 표시한다', () => {
    render(
      <TodoList todos={[]} categories={categories} onEdit={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText('할일이 없습니다.')).toBeInTheDocument();
  });

  it('카테고리명을 올바르게 표시한다', () => {
    render(
      <TodoList todos={todos} categories={categories} onEdit={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText('업무')).toBeInTheDocument();
    expect(screen.getByText('개인')).toBeInTheDocument();
  });
});
