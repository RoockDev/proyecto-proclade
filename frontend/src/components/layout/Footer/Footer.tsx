import './Footer.css';

export const Footer = () => {
  return (
    <footer className="brand-footer section-padding">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="brand-logo">FP</span>
              <span className="brand-name text-light">Fundacion PROCLADE</span>
            </div>
            <p className="footer-text">
              Trabajamos por un mundo mas justo y solidario mediante cooperacion,
              sensibilizacion y comercio justo.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" aria-label="Facebook"><i className="bi bi-facebook" /></a>
              <a href="#" aria-label="Instagram"><i className="bi bi-instagram" /></a>
              <a href="#" aria-label="YouTube"><i className="bi bi-youtube" /></a>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h5 className="footer-title">Navegacion</h5>
            <ul className="list-unstyled footer-list">
              <li><a href="#">Inicio</a></li>
              <li><a href="#">Conocenos</a></li>
              <li><a href="#">Campanas</a></li>
              <li><a href="#">Noticias</a></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h5 className="footer-title">Participa</h5>
            <ul className="list-unstyled footer-list">
              <li><a href="#">Comercio Justo</a></li>
              <li><a href="#">Colabora</a></li>
              <li><a href="#">Voluntariado</a></li>
              <li><a href="#">Hazte socio</a></li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h5 className="footer-title">Contacto</h5>
            <ul className="list-unstyled footer-list">
              <li><i className="bi bi-geo-alt me-2" />Madrid, Espana</li>
              <li><i className="bi bi-telephone me-2" />+34 91 000 00 00</li>
              <li><i className="bi bi-envelope me-2" />info@fundacionproclade.org</li>
              <li><i className="bi bi-clock me-2" />Lun - Vie 09:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <hr className="footer-separator" />

        <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
          <p className="mb-0 footer-copy">
            © 2026 Fundacion PROCLADE. Todos los derechos reservados.
          </p>
          <div className="d-flex gap-3">
            <a href="#">Aviso legal</a>
            <a href="#">Privacidad</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
