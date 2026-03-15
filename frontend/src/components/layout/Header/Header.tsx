import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAuthSession,
  getAuthSession,
  subscribeToAuthSession,
  userHasAdminRole,
} from '../../../features/auth/utils/auth-session.storage';
import './Header.css';
import { HeaderBrand } from './shared/HeaderBrand/HeaderBrand';
import { HeaderNav, type HeaderNavItem } from './shared/HeaderNav/HeaderNav';
import { HeaderActions } from './shared/HeaderActions/HeaderActions';

const navItems: HeaderNavItem[] = [
  { label: 'Inicio', to: '/', end: true },
  { label: '¿Qué es?', to: '/conocenos' },
  { label: '¿Qué buscamos?', to: '/campanas' },
  { label: 'Superhéroes', to: '/superheroes' },
  { label: 'Noticias', to: '/noticias' },
  { label: 'Colabora', to: '/colabora' },
  { label: 'Contacto', to: '/contacto' },
];

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(() => getAuthSession().user);

  useEffect(() => {
    const unsubscribe = subscribeToAuthSession(() => {
      setSessionUser(getAuthSession().user);
    });

    return unsubscribe;
  }, []);

  const isAdmin = userHasAdminRole(sessionUser);
  const isAuthenticated = Boolean(sessionUser);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => {
    clearAuthSession();
    closeMenu();
    navigate('/', { replace: true });
  };

  return (
    <header className="brand-header sticky-top">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <HeaderBrand onClick={closeMenu} />

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="mainNav"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú de navegación"
            onClick={toggleMenu}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="mainNav">
            <HeaderNav items={navItems} onLinkClick={closeMenu} />
            <HeaderActions
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              onClose={closeMenu}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </nav>
    </header>
  );
};
