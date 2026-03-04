import { Link } from 'react-router-dom';
import logoEquipoPuch from '../../../../../assets/branding/logo-equipo-puch.jpg';
import './HeaderBrand.css';

type HeaderBrandProps = {
  onClick?: () => void;
};

export const HeaderBrand = ({ onClick }: HeaderBrandProps) => (
  <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={onClick}>
    <img
      src={logoEquipoPuch}
      alt="Equipo PUCH"
      className="brand-logo-img"
    />
    <span className="brand-name">Equipo PUCH</span>
  </Link>
);
