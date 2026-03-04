import { NavLink } from 'react-router-dom';

export type HeaderNavItem = {
  label: string;
  to: string;
  end?: boolean;
};

type HeaderNavProps = {
  items: HeaderNavItem[];
  onLinkClick?: () => void;
};

export const HeaderNav = ({ items, onLinkClick }: HeaderNavProps) => (
  <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
    {items.map((item) => (
      <li className="nav-item" key={item.label}>
        <NavLink
          to={item.to}
          end={Boolean(item.end)}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          onClick={onLinkClick}
        >
          {item.label}
        </NavLink>
      </li>
    ))}
  </ul>
);
