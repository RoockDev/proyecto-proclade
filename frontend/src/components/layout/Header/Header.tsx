import { useState } from 'react';
import './Header.css';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    'Inicio',
    'Conocenos',
    'Campanas',
    'Noticias',
    'Retos',
    'Comercio Justo',
    'Colabora',
    'Contacto',
  ];

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
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <span className="brand-logo">FP</span>
            <span className="brand-name">Fundacion PROCLADE</span>
          </a>

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
                <li className="nav-item" key={item}>
                  <a className="nav-link" href="#" onClick={closeMenu}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="btn btn-brand ms-lg-3"
              onClick={closeMenu}
            >
              <i className="bi bi-person-circle me-2" />
              Acceso
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
