import { useTranslation } from 'react-i18next';
import type { Todo, TodoStatus } from '../../../types/todo';
import { formatDate } from '../../../utils/dateUtils';
import './calendar.css';

interface Props {
  todo: Todo;
  categoryName: string;
  onClose: () => void;
}

const STATUS_CLASS: Record<TodoStatus, string> = {
  NOT_STARTED: 'todo-detail-modal__status-badge--not-started',
  IN_PROGRESS: 'todo-detail-modal__status-badge--in-progress',
  DONE: 'todo-detail-modal__status-badge--done',
};

export default function TodoDetailModal({ todo, categoryName, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="todo-detail-modal__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={todo.title}
    >
      <div className="todo-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="todo-detail-modal__header">
          <h2 className="todo-detail-modal__title">{todo.title}</h2>
          <button
            className="todo-detail-modal__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <div className="todo-detail-modal__row">
          <span className="todo-detail-modal__label">{t('calendar.status')}</span>
          <span className={`todo-detail-modal__status-badge ${STATUS_CLASS[todo.status]}`}>
            {t(`todo.status.${todo.status}`)}
          </span>
        </div>

        <div className="todo-detail-modal__row">
          <span className="todo-detail-modal__label">{t('calendar.startDate')}</span>
          <span className="todo-detail-modal__value">{formatDate(todo.startDate)}</span>
        </div>

        <div className="todo-detail-modal__row">
          <span className="todo-detail-modal__label">{t('calendar.endDate')}</span>
          <span className="todo-detail-modal__value">{formatDate(todo.endDate)}</span>
        </div>

        <div className="todo-detail-modal__row">
          <span className="todo-detail-modal__label">{t('calendar.category')}</span>
          <span className="todo-detail-modal__value">{categoryName}</span>
        </div>

        {(todo.description !== null && todo.description !== undefined) && (
          <div className="todo-detail-modal__row">
            <span className="todo-detail-modal__label">{t('calendar.description')}</span>
            <span className="todo-detail-modal__value">
              {todo.description || t('calendar.noDescription')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
