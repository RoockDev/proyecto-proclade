import { Link } from 'react-router-dom';
import './CtaSection.css';

export const CtaSection = () => {
  return (
    <section className="home-cta section-padding reveal-up reveal-delay-6">
      <div className="container text-center">
        <h2 className="home-cta__title">Únete al cambio</h2>
        <p className="home-cta__text">
          Cada acción cuenta. Colabora con tu tiempo, tu historia o tu
          donación para construir un mundo sin hambre.
        </p>

        <div className="home-cta__actions">
          <Link to="/colabora" className="btn btn-light btn-lg home-cta__btn-main">
            Colabora ahora <i className="bi bi-arrow-right ms-2" />
          </Link>

          <a
            href="https://www.fundacionproclade.org/dona/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-light btn-lg home-cta__btn-alt"
          >
            <i className="bi bi-heart-fill me-2" />
            Donar
          </a>
        </div>
      </div>
    </section>
  );
};
