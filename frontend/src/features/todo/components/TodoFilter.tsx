import { useTranslation } from 'react-i18next';
import type { TodoFilter } from '../../../types/todo';
import type { Category } from '../../../types/category';
import './todo.css';

interface TodoFilterProps {
  filter: TodoFilter;
  categories: Category[];
  onChange: (filter: TodoFilter) => void;
  onAddClick: () => void;
}

export default function TodoFilterBar({ filter, categories, onChange, onAddClick }: TodoFilterProps) {
  const { t } = useTranslation();

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    onChange({ ...filter, categoryId: value || undefined });
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    onChange({
      ...filter,
      status: value ? (value as TodoFilter['status']) : undefined,
    });
  }

  function handleOverdueToggle() {
    onChange({ ...filter, overdue: filter.overdue ? undefined : true });
  }

  return (
    <div className="todo-toolbar">
      <div className="todo-toolbar-left">
        <button className="btn-primary" onClick={onAddClick}>
          {t('todo.addTodo')}
        </button>
      </div>
      <div className="todo-toolbar-right">
        <select
          className="todo-filter-select"
          value={filter.categoryId ?? ''}
          onChange={handleCategoryChange}
          aria-label={t('todo.filter.category') + ' 필터'}
        >
          <option value="">{t('todo.filter.allCategories')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          className="todo-filter-select"
          value={filter.status ?? ''}
          onChange={handleStatusChange}
          aria-label={t('todo.filter.status') + ' 필터'}
        >
          <option value="">{t('todo.filter.allStatuses')}</option>
          <option value="NOT_STARTED">{t('todo.status.NOT_STARTED')}</option>
          <option value="IN_PROGRESS">{t('todo.status.IN_PROGRESS')}</option>
          <option value="DONE">{t('todo.status.DONE')}</option>
        </select>
        <button
          className={`todo-filter-btn${filter.overdue ? ' todo-filter-btn--active' : ''}`}
          onClick={handleOverdueToggle}
          aria-pressed={!!filter.overdue}
        >
          {t('todo.overdue')}
        </button>
      </div>
    </div>
  );
}
