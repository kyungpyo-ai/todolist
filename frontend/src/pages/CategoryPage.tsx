import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types/category';
import { useCategoryList, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../features/category/hooks/useCategoryList';
import CategoryList from '../features/category/components/CategoryList';
import CategoryForm from '../features/category/components/CategoryForm';
import ConfirmDialog from '../features/category/components/ConfirmDialog';
import '../features/category/components/category.css';

export default function CategoryPage() {
  const { t } = useTranslation();
  const { data: categories, isLoading, isError } = useCategoryList();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function handleCreateSubmit(name: string) {
    createCategory.mutate({ name }, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  }

  function handleEditSubmit(name: string) {
    if (!editTarget) return;
    updateCategory.mutate({ id: editTarget.id, name }, {
      onSuccess: () => setEditTarget(null),
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="category-page">
      <div className="category-page-header">
        <h1 className="category-page-title">{t('category.title')}</h1>
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          {t('category.addCategory')}
        </button>
      </div>

      {isLoading && <div className="category-loading">{t('common.loading')}</div>}
      {isError && <div className="category-error">카테고리를 불러오지 못했습니다.</div>}
      {!isLoading && !isError && categories && (
        <CategoryList
          categories={categories}
          onEdit={(cat) => setEditTarget(cat)}
          onDelete={(cat) => setDeleteTarget(cat)}
        />
      )}

      {/* 생성 모달 */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">새 카테고리</h2>
            </div>
            <CategoryForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={createCategory.isPending}
            />
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">카테고리 수정</h2>
            </div>
            <CategoryForm
              onSubmit={handleEditSubmit}
              onCancel={() => setEditTarget(null)}
              initialName={editTarget.name}
              isLoading={updateCategory.isPending}
            />
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={t('category.deleteConfirmTitle')}
        message={t('category.deleteConfirmMessage') + ' 삭제하시겠습니까?'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
