import { Link } from 'react-router-dom';

type HeaderActionsProps = {
  isAdmin: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
  onLogout: () => void;
};

export const HeaderActions = ({
  isAdmin,
  isAuthenticated,
  onClose,
  onLogout,
}: HeaderActionsProps) => (
  <div className="d-flex gap-2 header-actions">
    <a
      href="https://www.fundacionproclade.org/dona/"
      target="_blank"
      rel="noopener noreferrer"
      className="btn header-action-btn header-action-btn--donate"
    >
      Donar
    </a>

    {isAuthenticated ? (
      <>
        {isAdmin ? (
          <Link
            to="/admin"
            className="btn header-action-btn header-action-btn--main"
            onClick={onClose}
          >
            Panel Admin
          </Link>
        ) : null}

        <button
          type="button"
          className="btn header-action-btn header-action-btn--logout"
          onClick={onLogout}
        >
          <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
          Cerrar sesión
        </button>
      </>
    ) : (
      <Link
        to="/auth/login"
        className="btn header-action-btn header-action-btn--main"
        onClick={onClose}
      >
        Acceso
      </Link>
    )}
  </div>
);
