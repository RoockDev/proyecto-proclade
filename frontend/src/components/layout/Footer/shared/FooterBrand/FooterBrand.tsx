import logoEquipoPuch from '../../../../../assets/branding/logo-equipo-puch.jpg';
import './FooterBrand.css';

export const FooterBrand = () => (
  <div className="footer-brand">
    <img src={logoEquipoPuch} alt="Equipo PUCH" className="footer-brand__logo" />
    <div>
      <p className="footer-brand__title">Equipo PUCH</p>
      <p className="footer-brand__text">
        Personas Unidas Contra el Hambre es la campaña de Fundación PROCLADE que sensibiliza, educa y moviliza en torno al ODS 2.
      </p>
      <div className="footer-brand__socials">
        <a href="#" aria-label="Facebook"><i className="bi bi-facebook" /></a>
        <a href="#" aria-label="Instagram"><i className="bi bi-instagram" /></a>
        <a href="#" aria-label="YouTube"><i className="bi bi-youtube" /></a>
      </div>
    </div>
  </div>
);
