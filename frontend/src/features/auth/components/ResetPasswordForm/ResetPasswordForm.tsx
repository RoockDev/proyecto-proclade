import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/auth.api';
import type { ApiResponse } from '../../../../types/api';
import './ResetPasswordForm.css';

type ResetPasswordFormProps = {
  token: string;
};

type ResetPasswordFormState = {
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    newPassword: '',
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

    if (formState.newPassword !== formState.confirmPassword) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: 'Las contraseñas no coinciden',
      }));
      return;
    }

    try {
      const response = await resetPassword({
        token,
        newPassword: formState.newPassword,
      });

      setFormState((prev) => ({
        ...prev,
        successMessage: response.message,
        error: null,
      }));

      // Redirigir a login tras 2 segundos
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      let errorMessage =
        'No se pudo restablecer la contraseña. Inténtalo de nuevo.';

      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data as
          | ApiResponse<null>
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
    <form className="reset-password-form" onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="newPassword" className="form-label">
          Nueva contraseña
        </label>
        <input
          type="password"
          className="form-control reset-password-form__input"
          id="newPassword"
          name="newPassword"
          value={formState.newPassword}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={formState.loading || !!formState.successMessage}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirmar contraseña
        </label>
        <input
          type="password"
          className="form-control reset-password-form__input"
          id="confirmPassword"
          name="confirmPassword"
          value={formState.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          disabled={formState.loading || !!formState.successMessage}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      {formState.successMessage && (
        <div className="reset-password-form__success" role="status">
          {formState.successMessage}. Redirigiendo al login...
        </div>
      )}

      {formState.error && (
        <div className="reset-password-form__error" role="alert">
          {formState.error}
        </div>
      )}

      {!formState.successMessage && (
        <button
          type="submit"
          className="btn btn-primary reset-password-form__btn mt-3"
          disabled={
            formState.loading ||
            !formState.newPassword ||
            !formState.confirmPassword
          }
        >
          {formState.loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Guardando...
            </>
          ) : (
            'Restablecer contraseña'
          )}
        </button>
      )}

      <p className="reset-password-form__switch mt-3 mb-0 text-center">
        <Link
          to="/auth/login"
          className="btn btn-link p-0 align-baseline reset-password-form__switch-link"
        >
          Volver al login
        </Link>
      </p>
    </form>
  );
};
