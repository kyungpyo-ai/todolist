import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoCard from '../TodoCard';
import type { Todo } from '../../../../types/todo';

vi.mock('../../../../utils/dateUtils', () => ({
  isOverdue: vi.fn(),
  formatDate: (d: string) => d,
}));

import { isOverdue } from '../../../../utils/dateUtils';
const mockIsOverdue = vi.mocked(isOverdue);

function makeTodo(overrides?: Partial<Todo>): Todo {
  return {
    id: 'todo-1',
    userId: 'user-1',
    categoryId: 'cat-1',
    title: '테스트 할일',
    description: null,
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: 'NOT_STARTED',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    ...overrides,
  };
}

function renderInTable(ui: React.ReactElement) {
  const { container } = render(
    <table>
      <tbody>{ui}</tbody>
    </table>
  );
  return container;
}

describe('TodoCard', () => {
  it('할일 제목, 날짜, 상태를 렌더링한다', () => {
    mockIsOverdue.mockReturnValue(false);
    const todo = makeTodo();
    renderInTable(
      <TodoCard todo={todo} categoryName="작업" onEdit={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText('테스트 할일')).toBeInTheDocument();
    expect(screen.getByText('미시작')).toBeInTheDocument();
    expect(screen.getByText(/2026-05-01/)).toBeInTheDocument();
  });

  it('DONE 상태이면 상태 뱃지에 "완료"를 표시한다', () => {
    mockIsOverdue.mockReturnValue(false);
    const todo = makeTodo({ status: 'DONE' });
    renderInTable(
      <TodoCard todo={todo} categoryName="작업" onEdit={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('기한초과 조건 충족 시 기한초과 뱃지를 표시한다', () => {
    mockIsOverdue.mockReturnValue(true);
    const todo = makeTodo({ status: 'NOT_STARTED' });
    renderInTable(
      <TodoCard todo={todo} categoryName="작업" onEdit={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText('기한초과')).toBeInTheDocument();
  });

  it('DONE 상태이면 isOverdue가 true여도 기한초과 뱃지를 표시하지 않는다', () => {
    mockIsOverdue.mockReturnValue(true);
    const todo = makeTodo({ status: 'DONE' });
    renderInTable(
      <TodoCard todo={todo} categoryName="작업" onEdit={() => {}} onDelete={() => {}} />
    );

    expect(screen.queryByText('기한초과')).not.toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 onEdit 콜백이 호출된다', async () => {
    mockIsOverdue.mockReturnValue(false);
    const todo = makeTodo();
    const onEdit = vi.fn();
    renderInTable(
      <TodoCard todo={todo} categoryName="작업" onEdit={onEdit} onDelete={() => {}} />
    );

    await userEvent.click(screen.getByRole('button', { name: /수정/ }));
    expect(onEdit).toHaveBeenCalledWith(todo);
  });

  it('삭제 버튼 클릭 시 onDelete 콜백이 호출된다', async () => {
    mockIsOverdue.mockReturnValue(false);
    const todo = makeTodo();
    const onDelete = vi.fn();
    renderInTable(
      <TodoCard todo={todo} categoryName="작업" onEdit={() => {}} onDelete={onDelete} />
    );

    await userEvent.click(screen.getByRole('button', { name: /삭제/ }));
    expect(onDelete).toHaveBeenCalledWith(todo);
  });
});
