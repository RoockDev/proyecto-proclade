import { Link } from "react-router-dom";
import "./FooterColumn.css";

type FooterColumnProps = {
  title: string;
  links: { label: string; href: string }[];
};

export const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <div className="footer-column">
    <h5 className="footer-column__title">{title}</h5>
    <ul className="footer-column__list">
      {links.map((link) => (
        <li key={link.label}>
          {link.href.startsWith("/") ? (
            <Link to={link.href}>{link.label}</Link>
          ) : (
            <a href={link.href}>{link.label}</a>
          )}
        </li>
      ))}
    </ul>
  </div>
);
