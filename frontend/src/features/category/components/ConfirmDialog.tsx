import './category.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmDialogProps) {
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
            취소
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '처리 중...' : '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}
