import type { ReactNode } from 'react';
import './ConfirmModal.css';

type ConfirmModalProps = {
  isOpen: boolean;
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
};

export const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-modal" role="dialog" aria-modal="true">
      <div className="confirm-modal__backdrop" onClick={onCancel} aria-hidden="true" />
      <div className="confirm-modal__content">
        {title && <h3 className="confirm-modal__title">{title}</h3>}
        {description && <p className="confirm-modal__description">{description}</p>}
        <div className="confirm-modal__actions">
          <button
            type="button"
            className="confirm-modal__confirm btn btn-success btn-sm"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : confirmLabel}
          </button>
          <button
            type="button"
            className="confirm-modal__cancel btn btn-outline-secondary btn-sm"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
