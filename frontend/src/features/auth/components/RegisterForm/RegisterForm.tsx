import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './RegisterForm.css';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth.api';
import { saveAuthSession } from '../../utils/auth-session.storage';
import {
  getRequestedRedirectTarget,
  resolvePostAuthTarget,
} from '../../utils/post-auth-redirect';
import type { ApiResponse } from '../../../../types/api';
import type { AuthResponseData } from '../../types/auth.api.types';
import {
  PASSWORD_POLICY_MESSAGE,
  validatePasswordPolicy,
} from '../../../../utils/password-policy';

type RegisterFormState = {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  privacyAccepted: boolean;
  privacyError: string | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};

export const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formState, setFormState] = useState<RegisterFormState>({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacyAccepted: false,
    privacyError: null,
    loading: false,
    error: null,
    successMessage: null,
  });

  const navigateAfterAuth = () => {
    const requestedTarget = getRequestedRedirectTarget(location.search, location.state);
    const target = resolvePostAuthTarget(requestedTarget);
    navigate(target, { replace: true });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      error: null,
      successMessage: null,
      ...(name === 'privacyAccepted' ? { privacyError: null } : {}),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formState.privacyAccepted) {
      setFormState((prev) => ({
        ...prev,
        privacyError:
          'Debes aceptar la Política de privacidad para crear una cuenta',
        error: null,
        successMessage: null,
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      successMessage: null,
      privacyError: null,
    }));

    const passwordError = validatePasswordPolicy(formState.password);

    if (passwordError) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: passwordError,
        successMessage: null,
      }));
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: 'Las contraseñas no coinciden',
        successMessage: null,
      }));
      return;
    }

    try {
      const response = await register({
        name: formState.name.trim(),
        surname: formState.surname.trim(),
        email: formState.email.trim(),
        password: formState.password,
        privacyAccepted: true,
      });

      if (!response.success || !response.data) {
        setFormState((prev) => ({
          ...prev,
          error: response.message,
        }));
        return;
      }

      saveAuthSession(response.data);
      navigateAfterAuth();
    } catch (error) {
      let errorMessage = 'No se pudo completar el registro. Inténtalo de nuevo.';

      if (axios.isAxiosError(error)) {
        const backendError = error.response?.data as
          | ApiResponse<AuthResponseData>
          | undefined;

        if (backendError?.message) {
          errorMessage = backendError.message;
        }
      }

      setFormState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__field">
        <label htmlFor="name" className="auth-form__label">
          Nombre
        </label>
        <input
          type="text"
          className="auth-form__input"
          id="name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Escribe tu nombre…"
          disabled={formState.loading}
          required
          autoComplete="given-name"
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="surname" className="auth-form__label">
          Apellidos
        </label>
        <input
          type="text"
          className="auth-form__input"
          id="surname"
          name="surname"
          value={formState.surname}
          onChange={handleChange}
          placeholder="Escribe tus apellidos…"
          disabled={formState.loading}
          required
          autoComplete="family-name"
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="register-email" className="auth-form__label">
          Correo electrónico
        </label>
        <input
          type="email"
          className="auth-form__input"
          id="register-email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          disabled={formState.loading}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="register-password" className="auth-form__label">
          Contraseña
        </label>
        <input
          type="password"
          className="auth-form__input"
          id="register-password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={formState.loading}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="auth-form__hint">{PASSWORD_POLICY_MESSAGE}</p>
      </div>

      <div className="auth-form__field">
        <label htmlFor="confirmPassword" className="auth-form__label">
          Confirmar contraseña
        </label>
        <input
          type="password"
          className="auth-form__input"
          id="confirmPassword"
          name="confirmPassword"
          value={formState.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={formState.loading}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {formState.successMessage && (
        <div className="auth-form__feedback auth-form__feedback--success" role="status">
          <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
          {formState.successMessage}
        </div>
      )}

      {formState.error && (
        <div className="auth-form__feedback auth-form__feedback--error" role="alert">
          <i className="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
          {formState.error}
        </div>
      )}

      <div className="auth-form__field auth-form__field--checkbox">
        <label htmlFor="privacyAccepted" className="auth-form__checkbox-label">
          <input
            type="checkbox"
            id="privacyAccepted"
            name="privacyAccepted"
            checked={formState.privacyAccepted}
            onChange={handleChange}
            disabled={formState.loading}
            className="auth-form__checkbox"
          />
          <span>
            He leído y acepto la{' '}
            <a
              href="https://www.fundacionproclade.org/politica-de-privacidad/"
              target="_blank"
              rel="noreferrer"
              className="auth-form__privacy-link"
            >
              Política de privacidad
            </a>
          </span>
        </label>
        {formState.privacyError && (
          <p className="auth-form__field-error" role="alert">
            {formState.privacyError}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn-brand-auth auth-form__submit"
        disabled={formState.loading}
      >
        {formState.loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Registrando…
          </>
        ) : (
          'Crear cuenta'
        )}
      </button>

      <p className="auth-form__switch">
        ¿Ya tienes cuenta?{' '}
        <Link to="/auth/login" className="auth-form__switch-link">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
};
