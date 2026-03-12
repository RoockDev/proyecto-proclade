import type { FormEvent } from 'react';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import './UsersForm.css';

const ROLE_OPTIONS = ['ADMIN', 'USER'] as const;

type UsersFormData = {
  name: string;
  surname: string;
  email: string;
  roles: string;
};

type UsersFormProps = {
  isOpen: boolean;
  formMode: 'create' | 'edit';
  formData: UsersFormData;
  feedback?: string | null;
  isProcessing: boolean;
  onFieldChange: (field: keyof UsersFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onClose: () => void;
};

export const UsersForm = ({
  isOpen,
  formMode,
  formData,
  feedback,
  isProcessing,
  onFieldChange,
  onSubmit,
  onReset,
  onClose,
}: UsersFormProps) => {
  if (!isOpen) {
    return null;
  }

  const formFields: Array<keyof UsersFormData> = ['name', 'surname', 'email', 'roles'];

  return (
    <div className="users-form-modal" role="dialog" aria-modal="true">
      <div className="users-form-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="users-form-modal__content">
        <div className="users-form-card">
          <div className="users-form-card__header">
            <div>
              <p className="users-form-card__eyebrow">Gestión de usuarios</p>
              <h2>{formMode === 'create' ? 'Crear usuario' : 'Editar usuario'}</h2>
              <p>Completa los datos y guarda para sincronizar con el backend.</p>
            </div>
            <button type="button" className="users-form-card__close" onClick={onClose}>
              Cerrar
            </button>
          </div>
          {feedback && <p className="users-form-card__feedback">{feedback}</p>}
          <form className="users-form-card__form" onSubmit={onSubmit}>
            <div className="users-form-card__grid">
              {formFields.map((field) => (
                <label key={field}>
                  {field === 'name' && 'Nombre'}
                  {field === 'surname' && 'Apellidos'}
                  {field === 'email' && 'Email'}
                  {field === 'roles' && 'Roles'}
                  {field === 'roles' ? (
                    <select
                      value={formData.roles}
                      onChange={(event) => onFieldChange(field, event.target.value)}
                      required
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={formData[field]}
                      onChange={(event) => onFieldChange(field, event.target.value)}
                      placeholder={
                        field === 'email'
                          ? 'usuario@empresa.com'
                          : field === 'name'
                          ? 'Nombre'
                          : 'Apellidos'
                      }
                      required
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="users-form-card__actions">
              <AdminButton
                type="submit"
                variant="solid"
                className="users-form-card__primary"
                loading={isProcessing}
                disabled={!formData.name.trim() || !formData.surname.trim() || !formData.email.trim()}
              >
                {isProcessing ? 'Guardando...' : formMode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
              </AdminButton>
              <AdminButton
                variant="outline"
                className="users-form-card__secondary"
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
