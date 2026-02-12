import { useState } from 'react';
import type { LoginFormState } from '../../types/auth.types';
import './LoginForm.css';

export function LoginForm() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    loading: false,
    error: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      error: null,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simulación de loading (sin integración real aún)
    setFormState((prev) => ({ ...prev, loading: true, error: null }));
    
    // Simular respuesta después de 1.5s
    setTimeout(() => {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: 'Integración con API pendiente (HU futura)',
      }));
    }, 1500);
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
    </form>
  );
}
