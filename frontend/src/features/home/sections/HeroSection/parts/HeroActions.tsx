import { Link } from 'react-router-dom';

export const HeroActions = () => (
  <div className="home-hero__actions">
    <Link to="/colabora" className="btn btn-outline-light btn-lg hero-action__join">
      Únete al equipo
    </Link>
    <a
      href="https://www.fundacionproclade.org/dona/"
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline-light btn-lg"
    >
      Donar
    </a>
  </div>
);
