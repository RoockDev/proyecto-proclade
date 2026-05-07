import logoEquipoPuch from '../../../../../assets/branding/logo-equipo-puch.jpg';
import './FooterBrand.css';

export const FooterBrand = () => (
  <div className="footer-brand">
    <div className="footer-brand__logo-badge">
      <img src={logoEquipoPuch} alt="Equipo PUCH" className="footer-brand__logo" />
    </div>
    <div>
      <p className="footer-brand__title">Equipo PUCH</p>
      <p className="footer-brand__text">
        Personas Unidas Contra el Hambre es la campaña de Fundación PROCLADE que sensibiliza, educa y moviliza en torno al ODS 2.
      </p>
      <div className="footer-brand__socials">
        <a href="https://www.facebook.com/PROCLADE" target="_blank" rel="noreferrer" aria-label="Facebook">
          <i className="bi bi-facebook" />
        </a>
        <a href="https://www.instagram.com/fundacion_proclade/?hl=es" target="_blank" rel="noreferrer" aria-label="Instagram">
          <i className="bi bi-instagram" />
        </a>
        <a href="https://www.youtube.com/@FPROCLADE" target="_blank" rel="noreferrer" aria-label="YouTube">
          <i className="bi bi-youtube" />
        </a>
        <a href="https://www.linkedin.com/company/fundacion-proclade/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <i className="bi bi-linkedin" />
        </a>
      </div>
    </div>
  </div>
);
