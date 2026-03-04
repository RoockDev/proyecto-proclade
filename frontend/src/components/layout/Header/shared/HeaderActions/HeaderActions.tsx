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
  className="btn btn-brand-outline btn-lg"
>
  Donar
</a>


    {isAdmin ? (
      <Link to="/admin" className="btn btn-brand btn-lg" onClick={onClose}>
        Panel Admin
      </Link>
    ) : (
      <Link to="/auth/login" className="btn btn-brand btn-lg" onClick={onClose}>
        Acceso
      </Link>
    )}
  </div>
);
