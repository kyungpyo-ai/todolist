import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './category.css';

interface CategoryFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  initialName?: string;
  isLoading?: boolean;
}

export default function CategoryForm({ onSubmit, onCancel, initialName, isLoading }: CategoryFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName ?? '');
  const [error, setError] = useState('');

  const isEditMode = initialName !== undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('카테고리 이름을 입력해 주세요.');
      return;
    }
    setError('');
    onSubmit(name.trim());
  }

  return (
    <form className="category-form" onSubmit={handleSubmit} noValidate>
      <div className="category-form-field">
        <label className="category-form-label" htmlFor="category-name">
          카테고리 이름
        </label>
        <input
          id="category-name"
          className={`category-form-input${error ? ' category-form-input--error' : ''}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('category.namePlaceholder')}
          disabled={isLoading}
          autoFocus
        />
        {error && <p className="category-form-error">{error}</p>}
      </div>
      <div className="category-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isLoading}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? t('common.saving') : isEditMode ? t('common.edit') : '생성'}
        </button>
      </div>
    </form>
  );
}
