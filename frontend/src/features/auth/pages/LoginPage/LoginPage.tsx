import { LoginForm } from '../../components/LoginForm/LoginForm';
import './LoginPage.css';

interface LoginPageProps {
  onBack?: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
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
              <h1 className="login-page__title text-center">Iniciar sesión</h1>
              <p className="login-page__description text-center">
                Accede a tu cuenta para continuar
              </p>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
