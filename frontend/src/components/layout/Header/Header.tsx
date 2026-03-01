import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  getAuthSession,
  subscribeToAuthSession,
  userHasAdminRole,
} from '../../../features/auth/utils/auth-session.storage';
import './Header.css';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(() => getAuthSession().user);

  useEffect(() => {
    // aquí se escuchann cambios de sesión para actualizar el botón del header sin recargar la página
    const unsubscribe = subscribeToAuthSession(() => {
      setSessionUser(getAuthSession().user);
    });

    return unsubscribe;
  }, []);

  const navItems = [
    { label: 'Inicio', to: '/', end: true },
    { label: 'Conocenos', to: '/conocenos' },
    { label: 'Campanas', to: '/campanas' },
    { label: 'Noticias', to: '/noticias' },
    { label: 'Retos', to: '/retos' },
    { label: 'Comercio Justo', to: '/comercio-justo' },
    { label: 'Colabora', to: '/colabora' },
    { label: 'Contacto', to: '/contacto' },
  ];

  
  const isAdmin = userHasAdminRole(sessionUser);

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="brand-header sticky-top">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link
            className="navbar-brand d-flex align-items-center gap-2"
            to="/"
            onClick={closeMenu}
          >
            <span className="brand-logo">FP</span>
            <span className="brand-name">Fundacion PROCLADE</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="mainNav"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menu de navegacion"
            onClick={toggleMenu}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}
            id="mainNav"
          >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {navItems.map((item) => (
                <li className="nav-item" key={item.label}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-link${isActive ? ' active' : ''}`
                    }
                    onClick={closeMenu}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {isAdmin ? (
              <Link to="/admin" className="btn btn-brand ms-lg-3" onClick={closeMenu}>
                <i className="bi bi-speedometer2 me-2" />
                Panel Admin
              </Link>
            ) : (
              <Link to="/auth/login" className="btn btn-brand ms-lg-3" onClick={closeMenu}>
                <i className="bi bi-person-circle me-2" />
                Acceso
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
