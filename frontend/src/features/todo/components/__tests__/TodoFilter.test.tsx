import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoFilterBar from '../TodoFilter';
import type { Category } from '../../../../types/category';

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

describe('TodoFilterBar', () => {
  it('카테고리 드롭다운에 "전체 카테고리" 및 카테고리 목록을 렌더링한다', () => {
    render(
      <TodoFilterBar
        filter={{}}
        categories={categories}
        onChange={() => {}}
        onAddClick={() => {}}
      />
    );

    expect(screen.getByRole('option', { name: '전체 카테고리' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '업무' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '개인' })).toBeInTheDocument();
  });

  it('상태 드롭다운 선택 시 onChange가 호출된다', async () => {
    const onChange = vi.fn();
    render(
      <TodoFilterBar
        filter={{}}
        categories={categories}
        onChange={onChange}
        onAddClick={() => {}}
      />
    );

    const statusSelect = screen.getByRole('combobox', { name: '상태 필터' });
    await userEvent.selectOptions(statusSelect, 'IN_PROGRESS');

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'IN_PROGRESS' }));
  });

  it('기한초과 버튼 클릭 시 overdue가 토글된다', async () => {
    const onChange = vi.fn();
    render(
      <TodoFilterBar
        filter={{}}
        categories={categories}
        onChange={onChange}
        onAddClick={() => {}}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '기한초과' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ overdue: true }));
  });

  it('기한초과 활성 상태에서 클릭하면 overdue가 해제된다', async () => {
    const onChange = vi.fn();
    render(
      <TodoFilterBar
        filter={{ overdue: true }}
        categories={categories}
        onChange={onChange}
        onAddClick={() => {}}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '기한초과' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ overdue: undefined }));
  });

  it('새 할일 추가 버튼 클릭 시 onAddClick이 호출된다', async () => {
    const onAddClick = vi.fn();
    render(
      <TodoFilterBar
        filter={{}}
        categories={categories}
        onChange={() => {}}
        onAddClick={onAddClick}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '할일 추가' }));
    expect(onAddClick).toHaveBeenCalled();
  });
});
