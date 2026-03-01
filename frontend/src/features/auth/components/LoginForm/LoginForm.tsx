import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { googleSignIn, login } from '../../api/auth.api';
import { saveAuthSession } from '../../utils/auth-session.storage';
import type { ApiResponse } from '../../../../types/api';
import type { AuthResponseData } from '../../types/auth.api.types';
import type { LoginFormState } from '../../types/auth.types';
import './LoginForm.css';

const GOOGLE_SCRIPT_ID = 'google-identity-services-script';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const LOGIN_ERROR_MESSAGE = 'No se pudo iniciar sesion. Intentalo de nuevo.';
const GOOGLE_ERROR_MESSAGE =
  'No se pudo iniciar sesion con Google. Intentalo de nuevo.';

const getBackendErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const backendError = error.response?.data as ApiResponse<AuthResponseData> | undefined;
  return backendError?.message || fallbackMessage;
};

const loadGoogleIdentityScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('No se pudo cargar Google Identity Services')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('No se pudo cargar Google Identity Services'));

    document.head.appendChild(script);
  });
};

export const LoginForm = () => {
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  const [googleError, setGoogleError] = useState<string | null>(null);
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

  const handleGoogleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setFormState((prev) => ({
          ...prev,
          error: GOOGLE_ERROR_MESSAGE,
          successMessage: null,
        }));
        return;
      }

      setFormState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        successMessage: null,
      }));

      try {
        const apiResponse = await googleSignIn({ idToken: response.credential });

        if (!apiResponse.success || !apiResponse.data) {
          setFormState((prev) => ({
            ...prev,
            error: apiResponse.message,
          }));
          return;
        }

        saveAuthSession(apiResponse.data);
        setFormState((prev) => ({
          ...prev,
          successMessage: apiResponse.message,
          error: null,
        }));
      } catch (error) {
        setFormState((prev) => ({
          ...prev,
          error: getBackendErrorMessage(error, GOOGLE_ERROR_MESSAGE),
        }));
      } finally {
        setFormState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!googleClientId) {
      setGoogleError('Inicio con Google no disponible en este entorno.');
      return;
    }

    const setupGoogleButton = async () => {
      try {
        await loadGoogleIdentityScript();

        if (!window.google?.accounts?.id || !googleButtonRef.current) {
          throw new Error('Google Identity no disponible');
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 320,
        });

        setGoogleError(null);
      } catch {
        setGoogleError('No se pudo cargar el acceso con Google.');
      }
    };

    void setupGoogleButton();
  }, [googleClientId, handleGoogleCredentialResponse]);

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
      setFormState((prev) => ({
        ...prev,
        successMessage: response.message,
      }));
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

      <div className="login-form__divider" role="separator" aria-label="Otras opciones">
        <span>o</span>
      </div>

      <div
        className={`login-form__google ${
          formState.loading ? 'login-form__google--disabled' : ''
        }`}
      >
        <div ref={googleButtonRef} />
      </div>

      {googleError && (
        <div className="login-form__error mt-2" role="alert">
          {googleError}
        </div>
      )}

      <p className="login-form__switch mt-3 mb-0 text-center">
        ¿No estás registrado?{' '}
        <Link
          to="/auth/register"
          className="btn btn-link p-0 align-baseline login-form__switch-link"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
};
