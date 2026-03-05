import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ResetPasswordForm } from '../../components/ResetPasswordForm/ResetPasswordForm';
import '../AuthPage/AuthPage.css';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__card reveal-up">
          <Link to="/auth/login" className="auth-page__back">
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Volver al login
          </Link>

          <h1 className="auth-page__title">Restablecer contraseña</h1>
          <p className="auth-page__description">
            Introduce tu nueva contraseña
          </p>

          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="auth-form__feedback auth-form__feedback--error">
              <i className="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
              El enlace de recuperación no es válido. Falta el token.
              <Link to="/auth/login" className="btn-brand-auth auth-form__submit" style={{ marginTop: '0.75rem' }}>
                Ir al login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
