import type { FormEvent } from 'react';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import type { AdminNewsFormData } from '../../../types/news-admin.types';
import './NewsForm.css';

type NewsFormProps = {
  isOpen: boolean;
  formMode: 'create' | 'edit';
  formData: AdminNewsFormData;
  feedback?: string | null;
  isProcessing: boolean;
  onFieldChange: (field: keyof AdminNewsFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onClose: () => void;
};

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PUBLISHED', label: 'Publicada' },
] as const;

export const NewsForm = ({
  isOpen,
  formMode,
  formData,
  feedback,
  isProcessing,
  onFieldChange,
  onSubmit,
  onReset,
  onClose,
}: NewsFormProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="news-form-modal" role="dialog" aria-modal="true">
      <div className="news-form-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="news-form-modal__content">
        <div className="news-form-card">
          <div className="news-form-card__header">
            <div>
              <p className="news-form-card__eyebrow">Gestión de noticias</p>
              <h2>{formMode === 'create' ? 'Crear noticia' : 'Editar noticia'}</h2>
              <p>Completa la información y guarda para actualizar el panel.</p>
            </div>
            <button type="button" className="news-form-card__close" onClick={onClose}>
              Cerrar
            </button>
          </div>

          {feedback ? <p className="news-form-card__feedback">{feedback}</p> : null}

          <form className="news-form-card__form" onSubmit={onSubmit}>
            <div className="news-form-card__grid">
              <label>
                Título
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) => onFieldChange('title', event.target.value)}
                  placeholder="Título de la noticia"
                  maxLength={140}
                  required
                />
              </label>

              <label>
                Estado
                <select
                  value={formData.status}
                  onChange={(event) => onFieldChange('status', event.target.value)}
                  required
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="news-form-card__full">
                URL de imagen
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(event) => onFieldChange('imageUrl', event.target.value)}
                  placeholder="/uploads/news/mi-imagen.jpg o https://..."
                />
              </label>

              <label className="news-form-card__full">
                Resumen
                <textarea
                  value={formData.excerpt}
                  onChange={(event) => onFieldChange('excerpt', event.target.value)}
                  placeholder="Resumen breve de al menos 40 caracteres"
                  rows={3}
                  required
                />
              </label>

              <label className="news-form-card__full">
                Contenido
                <textarea
                  value={formData.content}
                  onChange={(event) => onFieldChange('content', event.target.value)}
                  placeholder="Contenido completo de la noticia"
                  rows={7}
                  required
                />
              </label>
            </div>

            <div className="news-form-card__actions">
              <AdminButton
                type="submit"
                variant="solid"
                className="news-form-card__primary"
                loading={isProcessing}
                disabled={
                  !formData.title.trim() ||
                  !formData.excerpt.trim() ||
                  !formData.content.trim()
                }
              >
                {isProcessing
                  ? 'Guardando...'
                  : formMode === 'create'
                    ? 'Crear noticia'
                    : 'Guardar cambios'}
              </AdminButton>
              <AdminButton
                variant="outline"
                className="news-form-card__secondary"
                onClick={onReset}
                type="button"
              >
                Limpiar formulario
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
