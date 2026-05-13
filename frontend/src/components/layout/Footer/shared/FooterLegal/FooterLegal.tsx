import './FooterLegal.css';

export const FooterLegal = () => (
  <div className="footer-legal">
    <p>© 2026 Equipo PUCH. Unidos contra el hambre.</p>
    <div className="footer-legal__links">
      <a
        href="https://www.fundacionproclade.org/aviso-legal/"
        target="_blank"
        rel="noreferrer"
      >
        Aviso legal
      </a>
      <a
        href="https://www.fundacionproclade.org/politica-de-privacidad/"
        target="_blank"
        rel="noreferrer"
      >
        Privacidad
      </a>
    </div>
  </div>
);
