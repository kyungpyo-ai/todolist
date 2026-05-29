import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../TodoForm';
import type { Todo } from '../../../../types/todo';
import type { Category } from '../../../../types/category';

vi.mock('../../../../utils/dateUtils', () => ({
  isEndDateValid: vi.fn((start: string, end: string) => end >= start),
  todayString: vi.fn(() => '2026-05-29'),
}));

const mockCategories: Category[] = [
  { id: 'cat-1', name: '업무', isDefault: false },
  { id: 'cat-2', name: '개인', isDefault: false },
];

const mockTodo: Todo = {
  id: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '기존 할일',
  description: '기존 설명',
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  status: 'NOT_STARTED',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TodoForm — 등록 모드', () => {
  it('"할일 등록" 타이틀을 표시한다', () => {
    render(
      <TodoForm
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('할일 등록')).toBeInTheDocument();
  });

  it('제목 미입력 시 오류 메시지를 표시하고 onSubmit을 호출하지 않는다', async () => {
    const onSubmit = vi.fn();
    render(
      <TodoForm
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '등록' }));
    expect(screen.getByText('제목을 입력해 주세요.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('유효한 입력으로 제출 시 onSubmit이 호출된다', async () => {
    const onSubmit = vi.fn();
    render(
      <TodoForm
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/제목/), '새 할일');
    await userEvent.click(screen.getByRole('button', { name: '등록' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('종료일이 시작일보다 이전이면 날짜 오류 메시지를 표시한다', async () => {
    const onSubmit = vi.fn();
    render(
      <TodoForm
        categories={mockCategories}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/제목/), '새 할일');
    await userEvent.clear(screen.getByLabelText('시작일'));
    await userEvent.type(screen.getByLabelText('시작일'), '2026-06-01');
    await userEvent.clear(screen.getByLabelText('종료일'));
    await userEvent.type(screen.getByLabelText('종료일'), '2026-05-01');

    await userEvent.click(screen.getByRole('button', { name: '등록' }));
    expect(screen.getByText('종료일은 시작일 이후여야 합니다.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn();
    render(
      <TodoForm
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('등록 모드에서는 상태 선택 필드가 표시되지 않는다', () => {
    render(
      <TodoForm
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByLabelText('상태')).not.toBeInTheDocument();
  });
});

describe('TodoForm — 수정 모드', () => {
  it('"할일 수정" 타이틀과 기존 값을 표시한다', () => {
    render(
      <TodoForm
        todo={mockTodo}
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('할일 수정')).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 할일')).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 설명')).toBeInTheDocument();
  });

  it('수정 모드에서 상태 선택 필드가 표시된다', () => {
    render(
      <TodoForm
        todo={mockTodo}
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByLabelText('상태')).toBeInTheDocument();
  });

  it('NOT_STARTED 상태에서는 IN_PROGRESS만 선택 가능하다', () => {
    render(
      <TodoForm
        todo={mockTodo}
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const select = screen.getByLabelText('상태') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('NOT_STARTED');
    expect(options).toContain('IN_PROGRESS');
    expect(options).not.toContain('DONE');
  });

  it('IN_PROGRESS 상태에서는 DONE과 NOT_STARTED가 선택 가능하다', () => {
    render(
      <TodoForm
        todo={{ ...mockTodo, status: 'IN_PROGRESS' }}
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const select = screen.getByLabelText('상태') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('IN_PROGRESS');
    expect(options).toContain('DONE');
    expect(options).toContain('NOT_STARTED');
  });

  it('DONE 상태에서는 IN_PROGRESS만 선택 가능하다', () => {
    render(
      <TodoForm
        todo={{ ...mockTodo, status: 'DONE' }}
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const select = screen.getByLabelText('상태') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('DONE');
    expect(options).toContain('IN_PROGRESS');
    expect(options).not.toContain('NOT_STARTED');
  });

  it('isLoading=true 일 때 버튼이 비활성화된다', () => {
    render(
      <TodoForm
        todo={mockTodo}
        categories={mockCategories}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isLoading
      />
    );
    expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
  });
});
