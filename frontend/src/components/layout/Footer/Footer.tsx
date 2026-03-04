import './Footer.css';
import { FooterBrand } from './shared/FooterBrand/FooterBrand';
import { FooterColumn } from './shared/FooterColumn/FooterColumn';
import { FooterLegal } from './shared/FooterLegal/FooterLegal';

export const Footer = () => (
  <footer className="brand-footer section-padding">
    <div className="container">
      <div className="row g-4">
        <div className="col-lg-4">
          <FooterBrand />
        </div>
        <div className="col-6 col-lg-2">
          <FooterColumn
            title="Equipo PUCH"
            links={[
              { label: '¿Qué es?', href: '/conocenos' },
              { label: '¿Qué buscamos?', href: '/campanas' },
              { label: 'Superhéroes', href: '/superheroes' },
            ]}
          />
        </div>
        <div className="col-6 col-lg-2">
          <FooterColumn
            title="Participa"
            links={[
              { label: 'Colabora', href: '/colabora' },
              { label: 'Voluntariado', href: '/colabora#voluntariado' },
              { label: 'Hazte socio', href: '/colabora#hazte-socio' },
            ]}
          />
        </div>
        <div className="col-lg-4">
          <FooterColumn
            title="Contacto"
            links={[
              { label: 'Madrid, España', href: 'mailto:info@fundacionproclade.org' },
              { label: '+34 91 000 00 00', href: 'tel:+34910000000' },
              { label: 'equipo@equipopuch.org', href: 'mailto:equipo@equipopuch.org' },
              { label: 'Horario: Lun - Vie 09:00 - 18:00', href: '/contacto' },
            ]}
          />
        </div>
      </div>

      <hr className="footer-separator" />

      <FooterLegal />
    </div>
  </footer>
);
