import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAuthSession,
  getAuthSession,
  subscribeToAuthSession,
  userHasAdminRole,
} from '../../../features/auth/utils/auth-session.storage';
import { ProfileModal } from '../../../features/profile/components/ProfileModal/ProfileModal';
import './Header.css';
import { HeaderBrand } from './shared/HeaderBrand/HeaderBrand';
import { HeaderNav, type HeaderNavItem } from './shared/HeaderNav/HeaderNav';
import { HeaderActions } from './shared/HeaderActions/HeaderActions';

const navItems: HeaderNavItem[] = [
  { label: 'Inicio', to: '/', end: true },
  { label: '¿Qué es?', to: '/conocenos' },
  { label: '¿Qué buscamos?', to: '/campanas' },
  { label: 'Superhéroes', to: '/superheroes' },
  {
    label: 'Bibliotecas Humanas',
    to: '/bibliotecas-humanas',
    className: 'nav-link--libraries',
  },
  { label: 'Noticias', to: '/noticias' },
  { label: 'Colabora', to: '/colabora' },
  { label: 'Contacto', to: '/contacto' },
];

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    const unsubscribe = subscribeToAuthSession(() => {
      setSession(getAuthSession());
    });

    return unsubscribe;
  }, []);

  const isAdmin = userHasAdminRole(session.user);
  const isAuthenticated = Boolean(session.accessToken);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleOpenProfile = () => {
    closeMenu();
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handlePasswordChanged = () => {
    clearAuthSession();
    setIsProfileOpen(false);
    navigate('/auth/login', { replace: true });
  };

  const handleLogout = () => {
    clearAuthSession();
    closeMenu();
    setIsProfileOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <header className="brand-header sticky-top">
      <nav className="navbar navbar-expand-xxl">
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
              onProfile={handleOpenProfile}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        onPasswordChanged={handlePasswordChanged}
      />
    </header>
  );
};
