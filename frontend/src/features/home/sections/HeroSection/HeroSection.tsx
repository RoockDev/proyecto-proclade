import './HeroSection.css';

export const HeroSection = () => {
  return (
    <section className="home-hero">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <h1 className="home-hero__title">
              Construyendo un mundo mas justo y solidario
            </h1>
            <p className="home-hero__text">
              Fundacion PROCLADE trabaja por la cooperacion al desarrollo, la
              sensibilizacion y el comercio justo. Unete y participa.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <a href="#" className="btn btn-light btn-lg">
                <i className="bi bi-heart-fill me-2" />
                Ser voluntario
              </a>
              <a href="#" className="btn btn-outline-light btn-lg">
                <i className="bi bi-people-fill me-2" />
                Hazte socio
              </a>
              <a href="#" className="btn btn-outline-light btn-lg">
                <i className="bi bi-envelope-fill me-2" />
                Contactar
              </a>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="home-hero__card">
              <i className="bi bi-globe-americas home-hero__icon" />
              <p className="home-hero__card-text">+30 anos de compromiso solidario</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
