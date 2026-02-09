import './CtaSection.css';

export const CtaSection = () => {
  return (
    <section className="home-cta section-padding">
      <div className="container text-center">
        <h2 className="home-cta__title">Quieres colaborar con nosotros?</h2>
        <p className="home-cta__text">
          Puedes apoyar haciendote socio, participando como voluntario o
          colaborando con recursos.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <a href="#" className="btn btn-light btn-lg">
            <i className="bi bi-people-fill me-2" />
            Hazte socio
          </a>

          <a href="#" className="btn btn-outline-light btn-lg">
            <i className="bi bi-heart-fill me-2" />
            Voluntariado
          </a>

          <a href="#" className="btn btn-outline-light btn-lg">
            <i className="bi bi-gift-fill me-2" />
            Donar recursos
          </a>
        </div>
      </div>
    </section>
  );
};
