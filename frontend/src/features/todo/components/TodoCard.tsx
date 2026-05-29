import { useTranslation } from 'react-i18next';
import type { Todo } from '../../../types/todo';
import { isOverdue, formatDate } from '../../../utils/dateUtils';
import './todo.css';

interface TodoCardProps {
  todo: Todo;
  categoryName: string;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const STATUS_CLASS: Record<Todo['status'], string> = {
  NOT_STARTED: 'todo-badge-status--not-started',
  IN_PROGRESS: 'todo-badge-status--in-progress',
  DONE: 'todo-badge-status--done',
};

export default function TodoCard({ todo, categoryName, onEdit, onDelete }: TodoCardProps) {
  const { t } = useTranslation();
  const showOverdue = isOverdue(todo.endDate) && todo.status !== 'DONE';

  return (
    <tr className="todo-table-row">
      <td style={{ width: 80 }}>
        <span className="todo-badge-category">{categoryName}</span>
      </td>
      <td>
        <div className="todo-title-cell">
          <span className="todo-title-text">{todo.title}</span>
          {showOverdue && <span className="todo-badge-overdue">{t('todo.overdue')}</span>}
        </div>
      </td>
      <td style={{ width: 80 }}>
        <span className={`todo-badge-status ${STATUS_CLASS[todo.status]}`}>
          {t(`todo.status.${todo.status}`)}
        </span>
      </td>
      <td style={{ width: 120 }}>
        <span className="todo-date-cell">
          {formatDate(todo.startDate)} ~ {formatDate(todo.endDate)}
        </span>
      </td>
      <td style={{ width: 80 }}>
        <button
          className="btn-icon"
          onClick={() => onEdit(todo)}
          aria-label={`${todo.title} ${t('common.edit')}`}
        >
          {t('common.edit')}
        </button>
        <button
          className="btn-icon"
          onClick={() => onDelete(todo)}
          aria-label={`${todo.title} ${t('common.delete')}`}
        >
          {t('common.delete')}
        </button>
      </td>
    </tr>
  );
}
