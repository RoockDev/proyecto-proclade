import { Link, useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../../../../../features/auth/utils/auth-session.storage';

type HeaderActionsProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  onClose: () => void;
};

export const HeaderActions = ({
  isAuthenticated,
  isAdmin,
  onClose,
}: HeaderActionsProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    onClose();
    navigate('/', { replace: true });
  };

  return (
    <div className="d-flex gap-2 header-actions">
      <a
        href="https://www.fundacionproclade.org/dona/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn header-action-btn header-action-btn--donate"
      >
        Donar
      </a>

      {!isAuthenticated && (
        <Link
          to="/auth/login"
          className="btn header-action-btn header-action-btn--main"
          onClick={onClose}
        >
          Acceso
        </Link>
      )}

      {isAuthenticated && isAdmin && (
        <Link
          to="/admin"
          className="btn header-action-btn header-action-btn--main"
          onClick={onClose}
        >
          Panel Admin
        </Link>
      )}

      {isAuthenticated && (
        <button
          type="button"
          className="btn header-action-btn header-action-btn--logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      )}
    </div>
  );
};
