import { Link } from 'react-router-dom';

type HeaderActionsProps = {
  isAdmin: boolean;
  onClose: () => void;
};

export const HeaderActions = ({ isAdmin, onClose }: HeaderActionsProps) => (
  <div className="d-flex gap-2 header-actions">
    <a
      href="https://www.fundacionproclade.org/dona/"
      target="_blank"
      rel="noopener noreferrer"
      className="btn header-action-btn header-action-btn--donate"
    >
      Donar
    </a>

    {isAdmin ? (
      <Link
        to="/admin"
        className="btn header-action-btn header-action-btn--main"
        onClick={onClose}
      >
        Panel Admin
      </Link>
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
