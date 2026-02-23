import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  getAuthSession,
  subscribeToAuthSession,
  userHasAdminRole,
} from '../../../../auth/utils/auth-session.storage';
import './AdminLayout.css';

const sidebarItems = [
  'Panel',
  'Campanas',
  'Noticias',
  'Retos',
  'Solicitudes',
  'Propuestas',
  'Chat',
];

export const AdminLayout = () => {
  const [sessionUser, setSessionUser] = useState(() => getAuthSession().user);

  useEffect(() => {
    // Sincroniza la UI del panel si cambia la sesión (login/logout) sin recargar.
    const unsubscribe = subscribeToAuthSession(() => {
      setSessionUser(getAuthSession().user);
    });

    return unsubscribe;
  }, []);

  const isAdmin = userHasAdminRole(sessionUser);
  const topbarEmail = sessionUser?.email ?? '';
  const topbarRole = sessionUser?.roles?.[0]
    ? sessionUser.roles[0].charAt(0).toUpperCase() +
      sessionUser.roles[0].slice(1).toLowerCase()
    : '';

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar" aria-label="Navegacion del panel">
        <div className="admin-layout__brand">
          <span className="admin-layout__brand-icon" aria-hidden="true">
            <i className="bi bi-shield-lock" />
          </span>
          <span className="admin-layout__brand-text">Administración</span>
        </div>

        <nav className="admin-layout__nav">
          <ul className="admin-layout__nav-list">
            {sidebarItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className={`admin-layout__nav-item ${
                    item === 'Panel' ? 'admin-layout__nav-item--active' : ''
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to="/"
          className="admin-layout__logout"
          aria-label="Volver a la página principal"
        >
          <i className="bi bi-box-arrow-left me-2" aria-hidden="true" />
          Salir
        </Link>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-layout__topbar">
          <h1 className="admin-layout__title">Panel</h1>
          <p className="admin-layout__context mb-0">
            {isAdmin ? `${topbarRole} · ${topbarEmail}` : 'Acceso restringido'}
          </p>
        </header>

        <main className="admin-layout__content">
          {isAdmin ? (
            <Outlet />
          ) : (
            <section className="container-fluid px-0">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h4 mb-3">Acceso no autorizado al panel</h2>
                  <p className="mb-2">
                    Esta vista está disponible solo para usuarios con rol <code>ADMIN</code>.
                  </p>
                  <p className="mb-0 text-muted">
                    Inicia sesión con una cuenta administradora para acceder al panel.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
