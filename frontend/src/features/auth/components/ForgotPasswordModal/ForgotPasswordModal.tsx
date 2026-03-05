import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { forgotPassword } from '../../api/auth.api';
import type { ApiResponse } from '../../../../types/api';
import './ForgotPasswordModal.css';

type ForgotPasswordModalProps = {
  onClose: () => void;
};

export const ForgotPasswordModal = ({ onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPassword({ email: email.trim() });
      setSuccessMessage(response.message);
    } catch (err) {
      let errorMessage =
        'No se pudo enviar la solicitud. Inténtalo de nuevo.';

      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data as
          | ApiResponse<null>
          | undefined;

        if (backendError?.message) {
          errorMessage = backendError.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="forgot-modal__backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="forgot-modal__content">
        <button
          className="forgot-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>

        <h2 className="forgot-modal__title" id="forgot-password-title">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="forgot-modal__description">
          Introduce tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="forgot-email" className="auth-form__label">
              Correo electrónico
            </label>
            <input
              type="email"
              className="auth-form__input"
              id="forgot-email"
              value={email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={loading || !!successMessage}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          {successMessage && (
            <div className="auth-form__feedback auth-form__feedback--success" role="status">
              <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
              {successMessage}
            </div>
          )}

          {error && (
            <div className="auth-form__feedback auth-form__feedback--error" role="alert">
              <i className="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
              {error}
            </div>
          )}

          {!successMessage ? (
            <button
              type="submit"
              className="btn-brand-auth auth-form__submit"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Enviando…
                </>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </button>
          ) : (
            <button
              type="button"
              className="forgot-modal__close-btn"
              onClick={onClose}
            >
              Cerrar
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
