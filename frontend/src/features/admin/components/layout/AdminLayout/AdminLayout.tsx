import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  getAuthSession,
  subscribeToAuthSession,
  userHasAdminRole,
} from '../../../../auth/utils/auth-session.storage';
import { AdminSidebar, type AdminNavItem } from '../../shared/AdminSidebar/AdminSidebar';
import { AdminTopbar } from '../../shared/AdminTopbar/AdminTopbar';
import './AdminLayout.css';

const navItems: AdminNavItem[] = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Noticias', to: '/admin/noticias' },
  { label: 'Retos', to: '/admin/retos' },
  { label: 'Libros Humanos', to: '/admin/libros' },
  { label: 'Superhéroes', to: '/admin/superheroes' },
  { label: 'Delegaciones', to: '/admin/delegaciones' },
  { label: 'Usuarios', to: '/admin/usuarios' },
];

const getAdminTitle = (pathname: string): string => {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/noticias')) return 'Noticias';
  if (pathname.startsWith('/admin/retos')) return 'Retos';
  if (pathname.startsWith('/admin/libros')) return 'Libros Humanos';
  if (pathname.startsWith('/admin/superheroes')) return 'Superhéroes';
  if (pathname.startsWith('/admin/delegaciones')) return 'Delegaciones';
  if (pathname.startsWith('/admin/usuarios')) return 'Usuarios';
  return 'Administración';
};

export const AdminLayout = () => {
  const location = useLocation();
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    const unsubscribe = subscribeToAuthSession(() => {
      setSession(getAuthSession());
    });

    return unsubscribe;
  }, []);

  const isAuthenticated = Boolean(session.accessToken);
  if (!isAuthenticated) {
    const requestedPath = `${location.pathname}${location.search}`;
    const params = new URLSearchParams();
    params.set('redirectTo', requestedPath);

    return (
      <Navigate
        to={`/auth/login?${params.toString()}`}
        replace
        state={{ redirectTo: requestedPath }}
      />
    );
  }

  const isAdmin = userHasAdminRole(session.user);
  const topbarEmail = session.user?.email ?? '';
  const topbarRole = session.user?.roles?.[0]
    ? session.user.roles[0].charAt(0).toUpperCase() +
      session.user.roles[0].slice(1).toLowerCase()
    : '';
  const title = getAdminTitle(location.pathname);

  return (
    <div className="admin-layout">
      <AdminSidebar items={navItems} />

      <div className="admin-layout__main">
        <AdminTopbar
          title={title}
          context={isAdmin ? `${topbarRole} · ${topbarEmail}` : 'Acceso restringido'}
        />

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
