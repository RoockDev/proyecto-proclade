import { Link } from 'react-router-dom';
import { LoginForm } from '../../components/LoginForm/LoginForm';
import { RegisterForm } from '../../components/RegisterForm/RegisterForm';
import './AuthPage.css';

export type AuthPageMode = 'login' | 'register';

interface AuthPageProps {
  mode: AuthPageMode;
}

export const AuthPage = ({ mode }: AuthPageProps) => {
  const isLoginMode = mode === 'login';

  return (
    <main className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="login-page__card">
              <Link to="/" className="btn btn-link p-0 mb-3 text-decoration-none">
                <i className="bi bi-arrow-left me-1"></i>
                Volver
              </Link>

              <h1 className="login-page__title text-center">
                {isLoginMode ? 'Iniciar sesión' : 'Crear cuenta'}
              </h1>
              <p className="login-page__description text-center">
                {isLoginMode
                  ? 'Accede a tu cuenta para continuar'
                  : 'Regístrate para acceder a la plataforma'}
              </p>

              {isLoginMode ? (
                <LoginForm />
              ) : (
                <RegisterForm />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
