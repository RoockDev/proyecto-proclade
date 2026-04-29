import { Link, Navigate } from 'react-router-dom';
import { LoginForm } from '../../components/LoginForm/LoginForm';
import { RegisterForm } from '../../components/RegisterForm/RegisterForm';
import { getAuthSession } from '../../utils/auth-session.storage';
import './AuthPage.css';

export type AuthPageMode = 'login' | 'register';

interface AuthPageProps {
  mode: AuthPageMode;
}

export const AuthPage = ({ mode }: AuthPageProps) => {
  const { accessToken } = getAuthSession();
  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  const isLoginMode = mode === 'login';

  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__card reveal-up">
          <Link to="/" className="auth-page__back">
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Volver al inicio
          </Link>

          <h1 className="auth-page__title">
            {isLoginMode ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="auth-page__description">
            {isLoginMode
              ? 'Accede a tu cuenta del Equipo PUCH'
              : 'Únete al Equipo PUCH y colabora con nosotros'}
          </p>

          {isLoginMode ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </main>
  );
};
