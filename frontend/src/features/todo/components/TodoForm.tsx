import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoStatus } from '../../../types/todo';
import { ALLOWED_STATUS_TRANSITIONS } from '../../../types/todo';
import type { Category } from '../../../types/category';
import { isEndDateValid, todayString } from '../../../utils/dateUtils';
import './todo.css';

interface TodoFormProps {
  todo?: Todo;
  categories: Category[];
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TodoForm({ todo, categories, onSubmit, onCancel, isLoading }: TodoFormProps) {
  const { t } = useTranslation();
  const isEditMode = todo !== undefined;
  const today = todayString();

  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [startDate, setStartDate] = useState(todo?.startDate ?? today);
  const [endDate, setEndDate] = useState(todo?.endDate ?? today);
  const [categoryId, setCategoryId] = useState(todo?.categoryId ?? '');
  const [status, setStatus] = useState<TodoStatus>(todo?.status ?? 'NOT_STARTED');

  const [titleError, setTitleError] = useState('');
  const [dateError, setDateError] = useState('');

  const allowedStatuses: TodoStatus[] = isEditMode
    ? [todo.status, ...ALLOWED_STATUS_TRANSITIONS[todo.status]]
    : ['NOT_STARTED'];

  function validate(): boolean {
    let valid = true;

    if (!title.trim()) {
      setTitleError('제목을 입력해 주세요.');
      valid = false;
    } else {
      setTitleError('');
    }

    if (!isEndDateValid(startDate, endDate)) {
      setDateError('종료일은 시작일 이후여야 합니다.');
      valid = false;
    } else {
      setDateError('');
    }

    return valid;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode) {
      const data: UpdateTodoRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        categoryId: categoryId || undefined,
        status,
      };
      onSubmit(data);
    } else {
      const data: CreateTodoRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        categoryId: categoryId || undefined,
      };
      onSubmit(data);
    }
  }

  return (
    <div className="todo-form-overlay">
      <div className="todo-form-modal" role="dialog" aria-modal="true" aria-labelledby="todo-form-title">
        <div className="todo-form-header">
          <h2 className="todo-form-title" id="todo-form-title">
            {isEditMode ? '할일 수정' : '할일 등록'}
          </h2>
        </div>

        <form className="todo-form-body" onSubmit={handleSubmit} noValidate>
          <div className="todo-form-field">
            <label className="todo-form-label" htmlFor="todo-title">
              {t('todo.titleLabel')} <span className="todo-form-required">*</span>
            </label>
            <input
              id="todo-title"
              className={`todo-form-input${titleError ? ' todo-form-input--error' : ''}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('todo.titlePlaceholder')}
              disabled={isLoading}
              autoFocus
            />
            {titleError && <p className="todo-form-error">{titleError}</p>}
          </div>

          <div className="todo-form-field">
            <label className="todo-form-label" htmlFor="todo-description">
              {t('todo.descriptionLabel')}
            </label>
            <textarea
              id="todo-description"
              className="todo-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('todo.descriptionPlaceholder')}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="todo-form-row">
            <div className="todo-form-field">
              <label className="todo-form-label" htmlFor="todo-start-date">
                {t('todo.startDateLabel')}
              </label>
              <input
                id="todo-start-date"
                className="todo-form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="todo-form-field">
              <label className="todo-form-label" htmlFor="todo-end-date">
                {t('todo.endDateLabel')}
              </label>
              <input
                id="todo-end-date"
                className={`todo-form-input${dateError ? ' todo-form-input--error' : ''}`}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
              {dateError && <p className="todo-form-error">{dateError}</p>}
            </div>
          </div>

          <div className="todo-form-field">
            <label className="todo-form-label" htmlFor="todo-category">
              {t('todo.categoryLabel')}
            </label>
            <select
              id="todo-category"
              className="todo-form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isLoading}
            >
              <option value="">기본 카테고리</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {isEditMode && (
            <div className="todo-form-field">
              <label className="todo-form-label" htmlFor="todo-status">
                {t('todo.statusLabel')}
              </label>
              <select
                id="todo-status"
                className="todo-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TodoStatus)}
                disabled={isLoading}
              >
                {allowedStatuses.map((s) => (
                  <option key={s} value={s}>
                    {t(`todo.status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="todo-form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={isLoading}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? t('common.saving') : isEditMode ? t('common.edit') : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
