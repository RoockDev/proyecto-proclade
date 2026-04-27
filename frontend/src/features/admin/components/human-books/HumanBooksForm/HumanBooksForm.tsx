import type { ChangeEvent, FormEvent } from 'react';
import { useRef } from 'react';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import type { RegionOption, HumanBookFormData } from '../../../types/human-books.types';
import './HumanBooksForm.css';

type HumanBooksFormProps = {
  isOpen: boolean;
  formMode: 'create' | 'edit';
  formData: HumanBookFormData;
  regions: RegionOption[];
  feedback?: string | null;
  isProcessing: boolean;
  onFieldChange: (field: keyof HumanBookFormData, value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onClose: () => void;
};

export const HumanBooksForm = ({
  isOpen,
  formMode,
  formData,
  regions,
  feedback,
  isProcessing,
  onFieldChange,
  onFileChange,
  onSubmit,
  onReset,
  onClose,
}: HumanBooksFormProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileChange(file);
  };

  const handleClearFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="human-books-form-modal" role="dialog" aria-modal="true">
      <div className="human-books-form-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="human-books-form-modal__content">
        <div className="human-books-form-card">
          <div className="human-books-form-card__header">
            <div>
              <h2>{formMode === 'create' ? 'Crear libro humano' : 'Editar libro humano'}</h2>
            </div>
            <button type="button" className="human-books-form-card__close" onClick={onClose}>
              Cerrar
            </button>
          </div>
          {feedback && <p className="human-books-form-card__feedback">{feedback}</p>}
          <form className="human-books-form-card__form" onSubmit={onSubmit}>
            <div className="human-books-form-card__grid">
              <label>
                Nombre
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onFieldChange('name', e.target.value)}
                  placeholder="Nombre del recurso"
                  required
                />
              </label>
              <label>
                Título
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => onFieldChange('title', e.target.value)}
                  placeholder="Título del libro humano"
                  required
                />
              </label>
              <label>
                Delegación
                <select
                  value={formData.regionId}
                  onChange={(e) => onFieldChange('regionId', e.target.value)}
                  required
                >
                  <option value="">Selecciona una delegación</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Archivo PDF {formMode === 'edit' && '(opcional, reemplaza el actual)'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required={formMode === 'create'}
                />
                {formData.pdf && (
                  <span className="human-books-form-card__file-info">
                    <span className="human-books-form-card__file-name" title={formData.pdf.name}>
                      {formData.pdf.name}
                    </span>
                    <button type="button" className="human-books-form-card__clear-file" onClick={handleClearFile}>
                      <i className="bi bi-x" aria-hidden="true" />
                    </button>
                  </span>
                )}
                <span className="human-books-form-card__hint">Solo PDF, máximo 10 MB</span>
              </label>
            </div>
            <div className="human-books-form-card__actions">
              <AdminButton
                type="submit"
                variant="solid"
                className="human-books-form-card__primary"
                loading={isProcessing}
                disabled={
                  !formData.name.trim() ||
                  !formData.title.trim() ||
                  !formData.regionId ||
                  (formMode === 'create' && !formData.pdf)
                }
              >
                {isProcessing ? 'Guardando...' : formMode === 'create' ? 'Crear libro' : 'Guardar cambios'}
              </AdminButton>
              <AdminButton variant="outline" className="human-books-form-card__secondary" onClick={onReset} type="button">
                Limpiar formulario
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
