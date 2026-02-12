import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './RegisterForm.css';
import axios from 'axios';
import { register } from '../../api/auth.api';
import type { ApiResponse } from '../../../../types/api';
import type { AuthResponseData } from '../../types/auth.api.types';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

type RegisterFormState = {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formState, setFormState] = useState<RegisterFormState>({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
    error: null,
    successMessage: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      error: null,
      successMessage: null,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      successMessage: null,
    }));

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
      });

      if (!response.success || !response.data) {
        setFormState((prev) => ({
          ...prev,
          error: response.message,
        }));
        return;
      }

      localStorage.setItem('accessToken', response.data.accessToken);
      setFormState((prev) => ({
        ...prev,
        successMessage: response.message,
        error: null,
      }));
    } catch (error) {
      let errorMessage = 'No se pudo completar el registro. Intentalo de nuevo.';

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
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Nombre
        </label>
        <input
          type="text"
          className="form-control register-form__input"
          id="name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Escribe tu nombre..."
          disabled={formState.loading}
          required
          autoComplete="given-name"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="surname" className="form-label">
          Apellidos
        </label>
        <input
          type="text"
          className="form-control register-form__input"
          id="surname"
          name="surname"
          value={formState.surname}
          onChange={handleChange}
          placeholder="Escribe tus apellidos..."
          disabled={formState.loading}
          required
          autoComplete="family-name"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="register-email" className="form-label">
          Correo electrónico
        </label>
        <input
          type="email"
          className="form-control register-form__input"
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

      <div className="mb-3">
        <label htmlFor="register-password" className="form-label">
          Contraseña
        </label>
        <input
          type="password"
          className="form-control register-form__input"
          id="register-password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={formState.loading}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirmar contraseña
        </label>
        <input
          type="password"
          className="form-control register-form__input"
          id="confirmPassword"
          name="confirmPassword"
          value={formState.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={formState.loading}
          required
          autoComplete="new-password"
        />
      </div>

      {formState.successMessage && (
        <div className="register-form__success" role="status">
          {formState.successMessage}
        </div>
      )}

      {formState.error && (
        <div className="register-form__error" role="alert">
          {formState.error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary register-form__btn mt-3"
        disabled={formState.loading}
      >
        {formState.loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Registrando...
          </>
        ) : (
          'Crear cuenta'
        )}
      </button>

      <p className="register-form__switch mt-3 mb-0 text-center">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          className="btn btn-link p-0 align-baseline register-form__switch-link"
          onClick={onSwitchToLogin}
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
}
