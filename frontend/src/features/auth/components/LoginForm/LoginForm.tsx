import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { login } from '../../api/auth.api';
import type { ApiResponse } from '../../../../types/api';
import type { LoginResponseData } from '../../types/auth.api.types';
import type { LoginFormState } from '../../types/auth.types';
import './LoginForm.css';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
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

    try {
      const response = await login({
        email: formState.email,
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
      }));
    } catch (error) {
      let errorMessage = 'No se pudo iniciar sesion. Intentalo de nuevo.';

      if (axios.isAxiosError(error)) {
        const backendError = error.response?.data as
          | ApiResponse<LoginResponseData>
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
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Correo electrónico
        </label>
        <input
          type="email"
          className="form-control login-form__input"
          id="email"
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
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <input
          type="password"
          className="form-control login-form__input"
          id="password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={formState.loading}
          required
          autoComplete="current-password"
        />
      </div>

      {formState.successMessage && (
        <div className="login-form__success" role="status">
          {formState.successMessage}
        </div>
      )}

      {formState.error && (
        <div className="login-form__error" role="alert">
          {formState.error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary login-form__btn mt-3"
        disabled={formState.loading}
      >
        {formState.loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </button>

      <p className="login-form__switch mt-3 mb-0 text-center">
        ¿No estás registrado?{' '}
        <button
          type="button"
          className="btn btn-link p-0 align-baseline login-form__switch-link"
          onClick={onSwitchToRegister}
        >
          Regístrate
        </button>
      </p>
    </form>
  );
}
