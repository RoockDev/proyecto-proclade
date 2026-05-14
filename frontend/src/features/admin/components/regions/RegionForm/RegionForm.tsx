import type { FormEvent } from 'react';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import type { RegionFormData } from '../../../types/regions.types';
import './RegionForm.css';

type RegionFormProps = {
  isOpen: boolean;
  formMode: 'create' | 'edit';
  formData: RegionFormData;
  feedback?: string | null;
  isProcessing: boolean;
  onFieldChange: (field: keyof RegionFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onClose: () => void;
};

export const RegionForm = ({
  isOpen,
  formMode,
  formData,
  feedback,
  isProcessing,
  onFieldChange,
  onSubmit,
  onReset,
  onClose,
}: RegionFormProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="region-form-modal" role="dialog" aria-modal="true">
      <div className="region-form-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="region-form-modal__content">
        <div className="region-form-card">
          <div className="region-form-card__header">
            <div>
              <h2>{formMode === 'create' ? 'Nueva delegación' : 'Editar delegación'}</h2>
            </div>
            <button type="button" className="region-form-card__close" onClick={onClose}>
              Cerrar
            </button>
          </div>

          {feedback ? <p className="region-form-card__feedback">{feedback}</p> : null}

          <form className="region-form-card__form" onSubmit={onSubmit}>
            <label>
              Nombre
              <input
                type="text"
                value={formData.name}
                onChange={(event) => onFieldChange('name', event.target.value)}
                placeholder="Cantabria"
                maxLength={100}
                required
              />
            </label>

            <label>
              Dirección
              <input
                type="text"
                value={formData.address}
                onChange={(event) => onFieldChange('address', event.target.value)}
                placeholder="Calle, número, ciudad"
                maxLength={200}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(event) => onFieldChange('email', event.target.value)}
                placeholder="delegacion@proclade.org"
                maxLength={120}
                required
              />
            </label>

            <label>
              Teléfono
              <input
                type="text"
                value={formData.phone}
                onChange={(event) => onFieldChange('phone', event.target.value)}
                placeholder="+34 600 000 000"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={12}
              />
            </label>

            <div className="region-form-card__actions">
              <AdminButton
                type="submit"
                variant="solid"
                className="region-form-card__primary"
                loading={isProcessing}
                disabled={
                  !formData.name.trim() ||
                  !formData.address.trim() ||
                  !formData.email.trim()
                }
              >
                {isProcessing
                  ? 'Guardando...'
                  : formMode === 'create'
                    ? 'Crear delegación'
                    : 'Guardar cambios'}
              </AdminButton>
              <AdminButton
                variant="outline"
                className="region-form-card__secondary"
                onClick={onReset}
                type="button"
              >
                Limpiar
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
