import type { FormEvent } from 'react';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import './SuperheroFormModal.css';
import type { SuperheroStatus } from '../../../types/superheroes.types';

type SuperheroFormState = {
  name: string;
  description: string;
  quote: string;
  country: string;
  sortOrder: string;
  status: SuperheroStatus;
};

type SuperheroFormModalProps = {
  isOpen: boolean;
  formMode: 'create' | 'edit';
  formState: SuperheroFormState;
  isProcessing: boolean;
  imagePreview: string | null;
  onClose: () => void;
  onFieldChange: (field: keyof SuperheroFormState, value: string) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export const SuperheroFormModal = ({
  isOpen,
  formMode,
  formState,
  isProcessing,
  imagePreview,
  onClose,
  onFieldChange,
  onImageChange,
  onSubmit,
  onReset,
}: SuperheroFormModalProps) => {
  if (!isOpen) {
    return null;
  }

  const isSaveDisabled =
    !formState.name.trim() || !formState.description.trim() || isProcessing;

  return (
    <div className="superhero-form-modal" role="dialog" aria-modal="true">
      <div className="superhero-form-modal__backdrop" aria-hidden="true" onClick={onClose} />
      <div className="superhero-form-modal__content">
        <div className="superhero-form-card">
          <div className="superhero-form-card__header">
            <div>
              <h2>{formMode === 'create' ? 'Nuevo superhéroe' : 'Editar superhéroe'}</h2>
            </div>
            <button type="button" className="superhero-form-card__close" onClick={onClose}>
              Cerrar
            </button>
          </div>

          <form className="superhero-form-card__form" onSubmit={onSubmit}>
            <div className="superhero-form-card__grid">
              <label>
                Nombre*
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => onFieldChange('name', event.target.value)}
                  required
                />
              </label>
              <label>
                País
                <input
                  type="text"
                  value={formState.country}
                  onChange={(event) => onFieldChange('country', event.target.value)}
                />
              </label>
              <label>
                Estado
                <select
                  value={formState.status}
                  onChange={(event) => onFieldChange('status', event.target.value as SuperheroStatus)}
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="HIDDEN">Oculto</option>
                </select>
              </label>
              <label>
                Orden
                <input
                  type="number"
                  min={0}
                  value={formState.sortOrder}
                  onChange={(event) => onFieldChange('sortOrder', event.target.value)}
                />
              </label>
              <label className="superhero-form-card__file">
                Imagen
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
                />
              </label>
              <div className="superhero-form-card__preview superhero-form-card__full">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" />
                ) : (
                  <span>No se ha seleccionado imagen</span>
                )}
              </div>
              <label className="superhero-form-card__full">
                Descripción*
                <textarea
                  value={formState.description}
                  onChange={(event) => onFieldChange('description', event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="superhero-form-card__actions">
              <AdminButton type="submit" variant="solid" loading={isProcessing} disabled={isSaveDisabled}>
                {formMode === 'create' ? 'Crear superhéroe' : 'Guardar cambios'}
              </AdminButton>
              <AdminButton variant="outline" type="button" onClick={onReset} disabled={isProcessing}>
                Limpiar formulario
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
