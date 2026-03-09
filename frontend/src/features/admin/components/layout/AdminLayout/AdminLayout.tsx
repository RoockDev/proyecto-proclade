import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  clearAuthSession,
  getAuthSession,
  subscribeToAuthSession,
  userHasAdminRole,
} from '../../../../auth/utils/auth-session.storage';
import { AdminSidebar, type AdminNavItem } from '../../shared/AdminSidebar/AdminSidebar';
import { AdminTopbar } from '../../shared/AdminTopbar/AdminTopbar';
import './AdminLayout.css';

const navItems: AdminNavItem[] = [
  { label: 'Panel', to: '/admin' },
  { label: 'Campañas', to: '/admin/campanas' },
  { label: 'Noticias' },
  { label: 'Retos' },
  { label: 'Solicitudes' },
  { label: 'Propuestas' },
  { label: 'Chat' },
];

const getAdminTitle = (pathname: string): string => {
  if (pathname.startsWith('/admin/campanas')) return 'Campañas';
  if (pathname === '/admin') return 'Panel';
  return 'Administración';
};

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(() => getAuthSession().user);

  useEffect(() => {
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

  const title = useMemo(() => getAdminTitle(location.pathname), [location.pathname]);
  const handleLogout = () => {
    clearAuthSession();
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar items={navItems} onLogout={handleLogout} />

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
