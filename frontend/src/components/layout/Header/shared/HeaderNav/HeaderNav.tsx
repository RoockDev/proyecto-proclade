import { Link, NavLink, useLocation } from "react-router-dom";

export type HeaderNavItem = {
  label: string;
  to: string;
  end?: boolean;
  className?: string;
  matchHash?: string;
};

type HeaderNavProps = {
  items: HeaderNavItem[];
  onLinkClick?: () => void;
};

export const HeaderNav = ({ items, onLinkClick }: HeaderNavProps) => {
  const location = useLocation();

  return (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
      {items.map((item) => {
        if (item.matchHash) {
          const isActive =
            location.pathname === "/" && location.hash === item.matchHash;

          return (
            <li className="nav-item" key={item.label}>
              <Link
                to={item.to}
                className={[
                  "nav-link",
                  item.className,
                  isActive ? "active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={onLinkClick}
              >
                {item.label}
              </Link>
            </li>
          );
        }

        return (
          <li className="nav-item" key={item.label}>
            <NavLink
              to={item.to}
              end={Boolean(item.end)}
              className={({ isActive }) =>
                ["nav-link", item.className, isActive ? "active" : ""]
                  .filter(Boolean)
                  .join(" ")
              }
              onClick={onLinkClick}
            >
              {item.label}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};
