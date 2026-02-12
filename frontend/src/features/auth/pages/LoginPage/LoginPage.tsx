import { useState } from 'react';
import { LoginForm } from '../../components/LoginForm/LoginForm';
import { RegisterForm } from '../../components/RegisterForm/RegisterForm';
import './LoginPage.css';

interface LoginPageProps {
  onBack?: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const isLoginMode = mode === 'login';

  return (
    <main className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="login-page__card">
              {onBack && (
                <button
                  type="button"
                  className="btn btn-link p-0 mb-3 text-decoration-none"
                  onClick={onBack}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Volver
                </button>
              )}
              <h1 className="login-page__title text-center">
                {isLoginMode ? 'Iniciar sesión' : 'Crear cuenta'}
              </h1>
              <p className="login-page__description text-center">
                {isLoginMode
                  ? 'Accede a tu cuenta para continuar'
                  : 'Regístrate para acceder a la plataforma'}
              </p>
              {isLoginMode ? (
                <LoginForm onSwitchToRegister={() => setMode('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setMode('login')} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
