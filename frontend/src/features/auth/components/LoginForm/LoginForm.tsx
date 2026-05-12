import { useCallback, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/auth.api";
import { saveAuthSession } from "../../utils/auth-session.storage";
import {
  getRequestedRedirectTarget,
  resolvePostAuthTarget,
} from "../../utils/post-auth-redirect";
import type { ApiResponse } from "../../../../types/api";
import type { AuthResponseData } from "../../types/auth.api.types";
import type { LoginFormState } from "../../types/auth.types";
import { ForgotPasswordModal } from "../ForgotPasswordModal/ForgotPasswordModal";
import "./LoginForm.css";

const LOGIN_ERROR_MESSAGE = "No se pudo iniciar sesion. Intentalo de nuevo.";

const getBackendErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const backendError = error.response?.data as
    | ApiResponse<AuthResponseData>
    | undefined;
  return backendError?.message || fallbackMessage;
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
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

  const navigateAfterAuth = useCallback(() => {
    const requestedTarget = getRequestedRedirectTarget(
      location.search,
      location.state,
    );
    const target = resolvePostAuthTarget(requestedTarget);
    navigate(target, { replace: true });
  }, [location.search, location.state, navigate]);

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

      saveAuthSession(response.data);
      navigateAfterAuth();
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: getBackendErrorMessage(error, LOGIN_ERROR_MESSAGE),
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label htmlFor="email" className="auth-form__label">
            Correo electrónico
          </label>
          <input
            type="email"
            className="auth-form__input"
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

        <div className="auth-form__field">
          <label htmlFor="password" className="auth-form__label">
            Contraseña
          </label>
          <input
            type="password"
            className="auth-form__input"
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
          <div
            className="auth-form__feedback auth-form__feedback--success"
            role="status"
          >
            <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
            {formState.successMessage}
          </div>
        )}

        {formState.error && (
          <div
            className="auth-form__feedback auth-form__feedback--error"
            role="alert"
          >
            <i className="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
            {formState.error}
          </div>
        )}

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
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <p className="auth-form__forgot">
          <button
            type="button"
            className="auth-form__forgot-link"
            onClick={() => setShowForgotModal(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </p>

        <p className="auth-form__switch">
          ¿No estás registrado?{" "}
          <Link to="/auth/register" className="auth-form__switch-link">
            Regístrate
          </Link>
        </p>
      </form>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </>
  );
};
