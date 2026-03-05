import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ResetPasswordForm } from '../../components/ResetPasswordForm/ResetPasswordForm';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <main className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="login-page__card">
              <Link to="/auth/login" className="btn btn-link p-0 mb-3 text-decoration-none">
                <i className="bi bi-arrow-left me-1"></i>
                Volver al login
              </Link>

              <h1 className="login-page__title text-center">
                Restablecer contraseña
              </h1>
              <p className="login-page__description text-center">
                Introduce tu nueva contraseña
              </p>

              {token ? (
                <ResetPasswordForm token={token} />
              ) : (
                <div className="text-center">
                  <p className="text-danger">
                    El enlace de recuperación no es válido. Falta el token.
                  </p>
                  <Link to="/auth/login" className="btn btn-primary mt-2">
                    Ir al login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
