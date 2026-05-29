import { useTranslation } from 'react-i18next';
import type { Category } from '../../../types/category';
import './category.css';

interface CategoryListProps {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return <div className="category-empty">카테고리가 없습니다.</div>;
  }

  return (
    <table className="category-table">
      <thead>
        <tr className="category-table-header">
          <th>이름</th>
          <th style={{ width: 100 }}>관리</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((cat) => (
          <tr key={cat.id} className="category-table-row">
            <td>
              {cat.name}
              {cat.isDefault && <span className="category-badge-default">{t('category.defaultBadge')}</span>}
            </td>
            <td>
              <button
                className="btn-icon"
                onClick={() => onEdit(cat)}
                disabled={cat.isDefault}
                aria-label={`${cat.name} ${t('common.edit')}`}
              >
                {t('common.edit')}
              </button>
              <button
                className="btn-icon"
                onClick={() => onDelete(cat)}
                disabled={cat.isDefault}
                aria-label={`${cat.name} ${t('common.delete')}`}
              >
                {t('common.delete')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
