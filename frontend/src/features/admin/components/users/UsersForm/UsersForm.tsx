import type { FormEvent } from 'react';
import { useState } from 'react';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import './UsersForm.css';

const ROLE_OPTIONS = ['ADMIN', 'USER'] as const;

type UsersFormData = {
  name: string;
  surname: string;
  email: string;
  roles: string;
  password: string;
  confirmPassword: string;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) {
    return null;
  }

  const baseFields: Array<keyof UsersFormData> = ['name', 'surname', 'email', 'roles'];
  const passwordFields: Array<keyof UsersFormData> = ['password', 'confirmPassword'];
  const visibleFields =
    formMode === 'create'
      ? [...baseFields, ...passwordFields]
      : [...baseFields, ...(formData.password ? passwordFields : [])];

  const getFieldLabel = (field: keyof UsersFormData) => {
    switch (field) {
      case 'name':
        return 'Nombre';
      case 'surname':
        return 'Apellidos';
      case 'email':
        return 'Email';
      case 'roles':
        return 'Roles';
      case 'password':
        return 'Contraseña';
      case 'confirmPassword':
        return 'Repetir contraseña';
    }
    return '';
  };

  const getFieldPlaceholder = (field: keyof UsersFormData) => {
    switch (field) {
      case 'email':
        return 'usuario@empresa.com';
      case 'password':
        return 'Contraseña segura';
      case 'confirmPassword':
        return 'Repite la contraseña';
      case 'name':
        return 'Nombre';
      case 'surname':
        return 'Apellidos';
    }
    return '';
  };

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
              {visibleFields.map((field) => {
                const isPasswordField = field === 'password';
                const isConfirmField = field === 'confirmPassword';
                const showToggle = isPasswordField ? showPassword : isConfirmField ? showConfirmPassword : false;
                const inputType = field === 'email' ? 'email' : (isPasswordField || isConfirmField) ? (showToggle ? 'text' : 'password') : 'text'

                return (
                  <label key={field}>
                    {getFieldLabel(field)}
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
                      <div className="users-form-input-wrapper">
                        <input
                          type={inputType}
                          value={formData[field]}
                          onChange={(event) => onFieldChange(field, event.target.value)}
                          placeholder={getFieldPlaceholder(field)}
                          required
                        />
                        {(isPasswordField || isConfirmField) && (
                          <button
                            type="button"
                            className="users-form-input-eye"
                            onClick={() =>
                              isPasswordField
                                ? setShowPassword((prev) => !prev)
                                : setShowConfirmPassword((prev) => !prev)
                            }
                            aria-label={isPasswordField ? 'Mostrar contraseña' : 'Mostrar repetir contraseña'}
                          >
                            <i
                              className={`bi ${
                                isPasswordField
                                  ? showPassword
                                    ? 'bi-eye-slash'
                                    : 'bi-eye'
                                  : showConfirmPassword
                                  ? 'bi-eye-slash'
                                  : 'bi-eye'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    )}
                  </label>
                );
              })}
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
              <AdminButton variant="outline" className="users-form-card__secondary" onClick={onReset} type="button">
                Limpiar formulario
              </AdminButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
