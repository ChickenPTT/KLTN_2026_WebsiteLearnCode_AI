import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const resolvedConfirm = confirmLabel || confirmText || 'Xác nhận';
  const resolvedCancel = cancelLabel || cancelText || 'Hủy';

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-close" onClick={onCancel} aria-label="Đóng">
          <X size={18} />
        </button>

        <div className={`dialog-icon ${variant}`}>
          <AlertTriangle size={24} strokeWidth={1.8} />
        </div>

        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>

        <div className="dialog-actions">
          <button className="dialog-cancel" onClick={onCancel}>
            {resolvedCancel}
          </button>
          <button className={`dialog-confirm ${variant}`} onClick={onConfirm}>
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
