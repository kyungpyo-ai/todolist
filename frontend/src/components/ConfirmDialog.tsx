import { useTranslation } from 'react-i18next';
import '../features/category/components/category.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  confirmLabel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t('common.confirm');

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="confirm-dialog-header">
          <h2 className="confirm-dialog-title" id="confirm-dialog-title">{title}</h2>
        </div>
        <div className="confirm-dialog-body">{message}</div>
        <div className="confirm-dialog-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t('common.deleting') : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
