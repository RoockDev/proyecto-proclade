import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

export type AdminNavItem = {
  label: string;
  to?: string;
  badge?: number;
};

type AdminSidebarProps = {
  items: AdminNavItem[];
  onGoHome: () => void;
};

export const AdminSidebar = ({ items, onGoHome }: AdminSidebarProps) => {
  return (
    <aside className="admin-sidebar" aria-label="Navegacion del panel">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__brand-icon" aria-hidden="true">
          <i className="bi bi-heart-fill" />
        </span>
        <span className="admin-sidebar__brand-text">Admin</span>
      </div>

      <nav className="admin-sidebar__nav">
        <ul className="admin-sidebar__nav-list">
          {items.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <NavLink
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    `admin-sidebar__nav-item ${isActive ? 'admin-sidebar__nav-item--active' : ''}`
                  }
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="admin-sidebar__nav-badge" aria-label={`${item.badge} pendientes`}>
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ) : (
                <button type="button" className="admin-sidebar__nav-item" disabled>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="admin-sidebar__nav-badge" aria-label={`${item.badge} pendientes`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="admin-sidebar__logout" onClick={onGoHome}>
        <i className="bi bi-house-door me-2" aria-hidden="true" />
        Volver a página
      </button>
    </aside>
  );
};
