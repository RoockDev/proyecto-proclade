import './FooterLegal.css';

type FooterLegalProps = {
  onCookiePreferencesClick?: () => void;
};

export const FooterLegal = ({ onCookiePreferencesClick }: FooterLegalProps) => (
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
      {onCookiePreferencesClick && (
        <button
          type="button"
          className="footer-legal__link-button"
          onClick={onCookiePreferencesClick}
        >
          Configurar cookies
        </button>
      )}
    </div>
  </div>
);
