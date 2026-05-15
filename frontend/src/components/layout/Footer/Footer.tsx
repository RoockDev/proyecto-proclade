import "./Footer.css";
import { FooterBrand } from "./shared/FooterBrand/FooterBrand";
import { FooterColumn } from "./shared/FooterColumn/FooterColumn";
import { FooterLegal } from "./shared/FooterLegal/FooterLegal";

type FooterProps = {
  onCookiePreferencesClick?: () => void;
};

export const Footer = ({ onCookiePreferencesClick }: FooterProps) => (
  <footer id="contacto" className="brand-footer section-padding">
    <div className="container">
      <div className="row g-4">
        <div className="col-lg-4">
          <FooterBrand />
        </div>
        <div className="col-6 col-lg-2">
          <FooterColumn
            title="Equipo PUCH"
            links={[
              { label: "Conócenos", href: "/#conocenos" },
              { label: "Noticias", href: "/noticias" },
              { label: "Bibliotecas Humanas", href: "/bibliotecas-humanas" },
              { label: "Superhéroes", href: "/superheroes?page=1" },
            ]}
          />
        </div>
        <div className="col-6 col-lg-2">
          <FooterColumn
            title="Participa"
            links={[
              { label: "Colabora", href: "/colabora" },
              {
                label: "Donar",
                href: "https://www.fundacionproclade.org/dona/",
                external: true,
              },
              {
                label: "Voluntariado",
                href: "https://www.fundacionproclade.org/voluntario/",
                external: true,
              },
              {
                label: "Hazte socio/a",
                href: "https://www.fundacionproclade.org/quiero-ser-socio/",
                external: true,
              },
            ]}
          />
        </div>
        <div className="col-lg-4">
          <FooterColumn
            title="Contacto PROCLADE"
            links={[
              {
                label: "C. del Conde de Serrallo, 15, Tetuán, 28029 Madrid, Spain",
              },
              {
                label: "913 14 78 71",
                href: "tel:+34913147871",
              },
              {
                label: "info@fundacionproclade.org",
                href: "mailto:info@fundacionproclade.org",
              },
            ]}
          />
        </div>
      </div>

      <hr className="footer-separator" />

      <FooterLegal onCookiePreferencesClick={onCookiePreferencesClick} />
    </div>
  </footer>
);
