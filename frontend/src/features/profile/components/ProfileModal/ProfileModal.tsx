import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, MouseEvent } from 'react';
import axios from 'axios';
import { changeMyPassword, getMyProfile, updateMyProfile } from '../../api/profile.api';
import type { ChangePasswordPayload, UserProfile } from '../../types/profile.types';
import type { ApiResponse } from '../../../../types/api';
import {
  getAuthSession,
  updateAuthSessionUser,
} from '../../../auth/utils/auth-session.storage';
import './ProfileModal.css';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChanged: () => void;
};

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
};

const initialPasswordForm: ChangePasswordPayload = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

const profileFieldLabels: Record<keyof ChangePasswordPayload, string> = {
  currentPassword: 'Contraseña actual',
  newPassword: 'Nueva contraseña',
  confirmNewPassword: 'Confirmar nueva contraseña',
};

export const ProfileModal = ({ isOpen, onClose, onPasswordChanged }: ProfileModalProps) => {
  const sessionUser = getAuthSession().user;
  const [profile, setProfile] = useState<UserProfile | null>(sessionUser);
  const [name, setName] = useState(sessionUser?.name ?? '');
  const [surname, setSurname] = useState(sessionUser?.surname ?? '');
  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>(initialPasswordForm);
  const [showPassword, setShowPassword] = useState<Record<keyof ChangePasswordPayload, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState | null>(null);
  const logoutTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const user = getAuthSession().user;
    if (user) {
      setProfile(user);
      setName(user.name);
      setSurname(user.surname);
    }
    setPasswordForm(initialPasswordForm);
    setPasswordFeedback(null);
    setProfileFeedback(null);

    let isCancelled = false;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setProfileFeedback(null);

      try {
        const response = await getMyProfile();
        if (isCancelled) {
          return;
        }

        if (response.success && response.data) {
          setProfile(response.data);
          setName(response.data.name);
          setSurname(response.data.surname);
          updateAuthSessionUser(response.data);
        } else {
          setProfileFeedback({
            type: 'error',
            message: response.message || 'No se pudo cargar tu perfil',
          });
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setProfileFeedback({
          type: 'error',
          message: resolveApiError(error, 'No se pudo cargar tu perfil'),
        });
      } finally {
        if (!isCancelled) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();

    if (!trimmedName || !trimmedSurname) {
      setProfileFeedback({
        type: 'error',
        message: 'Nombre y apellidos son obligatorios',
      });
      return;
    }

    setIsSavingProfile(true);
    setProfileFeedback(null);

    try {
      const response = await updateMyProfile({
        name: trimmedName,
        surname: trimmedSurname,
      });

      if (response.success && response.data) {
        setProfile(response.data);
        setName(response.data.name);
        setSurname(response.data.surname);
        updateAuthSessionUser(response.data);
        setProfileFeedback({
          type: 'success',
          message: response.message || 'Perfil actualizado correctamente',
        });
        return;
      }

      setProfileFeedback({
        type: 'error',
        message: response.message || 'No se pudo actualizar el perfil',
      });
    } catch (error) {
      setProfileFeedback({
        type: 'error',
        message: resolveApiError(error, 'No se pudo actualizar el perfil'),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordInput = (
    field: keyof ChangePasswordPayload,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setPasswordForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
    setPasswordFeedback(null);
  };

  const togglePasswordVisibility = (field: keyof ChangePasswordPayload) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmNewPassword = passwordForm.confirmNewPassword.trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'Completa todos los campos de contraseña',
      });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'La nueva contraseña debe ser distinta de la actual',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'La confirmación no coincide con la nueva contraseña',
      });
      return;
    }

    setIsChangingPassword(true);
    setPasswordFeedback(null);

    try {
      const response = await changeMyPassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (!response.success) {
        setPasswordFeedback({
          type: 'error',
          message: response.message || 'No se pudo cambiar la contraseña',
        });
        return;
      }

      setPasswordFeedback({
        type: 'success',
        message:
          'Contraseña actualizada correctamente. Se cerrará tu sesión por seguridad.',
      });
      setPasswordForm(initialPasswordForm);

      logoutTimerRef.current = window.setTimeout(() => {
        onPasswordChanged();
      }, 900);
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        message: resolveApiError(error, 'No se pudo cambiar la contraseña'),
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div
      className="profile-modal__backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="profile-modal__content">
        <button
          className="profile-modal__close"
          onClick={onClose}
          aria-label="Cerrar perfil"
          type="button"
          disabled={isChangingPassword}
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>

        <header className="profile-modal__header">
          <h2 className="profile-modal__title" id="profile-modal-title">
            Tu perfil
          </h2>
          <p className="profile-modal__subtitle">
            Gestiona tus datos personales y la seguridad de tu cuenta.
          </p>
        </header>

        <div className="profile-modal__meta">
          <span className="profile-modal__email">
            <i className="bi bi-envelope" aria-hidden="true" />
            {profile?.email ?? sessionUser?.email ?? 'Sin email'}
          </span>
          <span className="profile-modal__role">
            {(profile?.roles?.[0] ?? sessionUser?.roles?.[0] ?? 'USER').toUpperCase()}
          </span>
        </div>

        <div className="profile-modal__grid">
          <section className="profile-modal__panel">
            <h3 className="profile-modal__panel-title">Datos personales</h3>

            <form className="auth-form" onSubmit={handleProfileSubmit} noValidate>
              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="profile-name">
                  Nombre
                </label>
                <input
                  id="profile-name"
                  className="auth-form__input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isProfileLoading || isSavingProfile || isChangingPassword}
                  maxLength={80}
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="profile-surname">
                  Apellidos
                </label>
                <input
                  id="profile-surname"
                  className="auth-form__input"
                  type="text"
                  value={surname}
                  onChange={(event) => setSurname(event.target.value)}
                  disabled={isProfileLoading || isSavingProfile || isChangingPassword}
                  maxLength={120}
                  autoComplete="family-name"
                  required
                />
              </div>

              {profileFeedback ? (
                <div
                  className={`auth-form__feedback auth-form__feedback--${profileFeedback.type}`}
                  role={profileFeedback.type === 'error' ? 'alert' : 'status'}
                >
                  <i
                    className={`bi ${
                      profileFeedback.type === 'success'
                        ? 'bi-check-circle-fill'
                        : 'bi-exclamation-circle-fill'
                    }`}
                    aria-hidden="true"
                  />
                  {profileFeedback.message}
                </div>
              ) : null}

              <button
                type="submit"
                className="btn-brand-auth auth-form__submit"
                disabled={isProfileLoading || isSavingProfile || isChangingPassword}
              >
                {isSavingProfile ? 'Guardando...' : 'Guardar perfil'}
              </button>
            </form>
          </section>

          <section className="profile-modal__panel">
            <h3 className="profile-modal__panel-title">Seguridad</h3>

            <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
              {(Object.keys(passwordForm) as Array<keyof ChangePasswordPayload>).map((field) => (
                <div className="auth-form__field" key={field}>
                  <label className="auth-form__label" htmlFor={`profile-${field}`}>
                    {profileFieldLabels[field]}
                  </label>

                  <div className="profile-modal__password-wrap">
                    <input
                      id={`profile-${field}`}
                      className="auth-form__input profile-modal__password-input"
                      type={showPassword[field] ? 'text' : 'password'}
                      value={passwordForm[field]}
                      onChange={(event) => handlePasswordInput(field, event)}
                      disabled={isChangingPassword}
                      autoComplete={
                        field === 'currentPassword' ? 'current-password' : 'new-password'
                      }
                      required
                    />
                    <button
                      type="button"
                      className="profile-modal__toggle-password"
                      onClick={() => togglePasswordVisibility(field)}
                      aria-label={
                        showPassword[field]
                          ? `Ocultar ${profileFieldLabels[field].toLowerCase()}`
                          : `Mostrar ${profileFieldLabels[field].toLowerCase()}`
                      }
                      disabled={isChangingPassword}
                    >
                      <i
                        className={`bi ${showPassword[field] ? 'bi-eye-slash' : 'bi-eye'}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              ))}

              {passwordFeedback ? (
                <div
                  className={`auth-form__feedback auth-form__feedback--${passwordFeedback.type}`}
                  role={passwordFeedback.type === 'error' ? 'alert' : 'status'}
                >
                  <i
                    className={`bi ${
                      passwordFeedback.type === 'success'
                        ? 'bi-check-circle-fill'
                        : 'bi-exclamation-circle-fill'
                    }`}
                    aria-hidden="true"
                  />
                  {passwordFeedback.message}
                </div>
              ) : null}

              <button
                type="submit"
                className="btn-brand-auth auth-form__submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

const resolveApiError = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const backendError = error.response?.data as ApiResponse<null> | undefined;
    if (backendError?.message) {
      return backendError.message;
    }
  }

  return fallbackMessage;
};
