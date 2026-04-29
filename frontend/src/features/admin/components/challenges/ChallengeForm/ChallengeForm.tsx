import type { FormEvent } from 'react';
import type { ChallengeFormData } from '../../../types/challenges.types';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import './ChallengeForm.css';

type ChallengeFormProps = {
  isOpen: boolean;
  formMode: 'create' | 'edit';
  formData: ChallengeFormData;
  isProcessing: boolean;
  feedback: string | null;
  onFieldChange: (field: keyof ChallengeFormData, value: string | boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onReset: () => void;
};

export const ChallengeForm = ({
  isOpen,
  formMode,
  formData,
  isProcessing,
  feedback,
  onFieldChange,
  onSubmit,
  onClose,
  onReset,
}: ChallengeFormProps) => {
  if (!isOpen) return null;

  const isSaveDisabled =
    !formData.title.trim() ||
    !formData.description.trim() ||
    !formData.targetAmount.trim() ||
    isProcessing;

  return (
    <div className="challenge-form-modal" role="dialog" aria-modal="true">
      <div
        className="challenge-form-modal__backdrop"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        role="presentation"
      />

      <div className="challenge-form-modal__content">
        <div className="challenge-form-card">
          <div className="challenge-form-card__header">
            <h2>{formMode === 'create' ? 'Crear reto' : 'Editar reto'}</h2>
            <button
              type="button"
              className="challenge-form-card__close-button"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>

          {feedback && (
            <p className="challenge-form-card__feedback" role="status">
              {feedback}
            </p>
          )}

          <form onSubmit={onSubmit}>
            <div className="challenge-form-card__grid">
              <label className="challenge-form-card__field">
                Título *
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => onFieldChange('title', e.target.value)}
                  required
                />
              </label>

              <label className="challenge-form-card__field">
                Monto objetivo (euros) *
                <input
                  type="number"
                  min={1}
                  value={formData.targetAmount}
                  onChange={(e) => onFieldChange('targetAmount', e.target.value)}
                  required
                />
              </label>

              <label className="challenge-form-card__field">
                Monto actual (euros)
                <input
                  type="number"
                  min={0}
                  value={formData.currentAmount}
                  onChange={(e) =>
                    onFieldChange('currentAmount', e.target.value)
                  }
                />
              </label>

              <label className="challenge-form-card__field challenge-form-card__field--toggle">
                <span>Activo</span>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => onFieldChange('isActive', e.target.checked)}
                />
              </label>

              <label className="challenge-form-card__field challenge-form-card__field--full">
                Descripción *
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    onFieldChange('description', e.target.value)
                  }
                  required
                />
              </label>
            </div>

            <div className="challenge-form-card__actions">
              <AdminButton
                type="submit"
                variant="solid"
                disabled={isSaveDisabled}
                loading={isProcessing}
              >
                Crear reto
              </AdminButton>
              <AdminButton variant="outline" type="button" onClick={onReset}>
                Limpiar formulario
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
