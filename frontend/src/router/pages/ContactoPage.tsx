import { Link } from 'react-router-dom';
import './ContactoPage.css';

const CONTACT_PHONE = '913 14 78 71';
const CONTACT_PHONE_HREF = '+34913147871';
const CONTACT_EMAIL = 'info@fundacionproclade.org';
const CONTACT_ADDRESS =
  'C. del Conde de Serrallo, 15, Tetuán, 28029 Madrid, Spain';
const PROCLADE_URL = 'https://www.fundacionproclade.org/';
const PROCLADE_DONATE_URL = 'https://www.fundacionproclade.org/dona/';
const PROCLADE_VOLUNTEER_URL = 'https://www.fundacionproclade.org/voluntario/';
const PROCLADE_MEMBER_URL = 'https://www.fundacionproclade.org/quiero-ser-socio/';

const OFFICIAL_ACTIONS = [
  {
    title: 'Donar',
    description: 'Apoya económicamente proyectos y acciones impulsadas por la fundación.',
    href: PROCLADE_DONATE_URL,
    icon: 'bi-heart',
  },
  {
    title: 'Voluntariado',
    description: 'Descubre formas de participar activamente en campañas e iniciativas sociales.',
    href: PROCLADE_VOLUNTEER_URL,
    icon: 'bi-people',
  },
  {
    title: 'Hazte socio/a',
    description: 'Súmate al apoyo estable que sostiene a largo plazo la misión de PROCLADE.',
    href: PROCLADE_MEMBER_URL,
    icon: 'bi-person-plus',
  },
] as const;

export const ContactoPage = () => (
  <section className="contact-page">
    <header className="contact-page__hero page-hero gradient-hero reveal-up">
      <div className="container text-center">
        <span className="page-hero__eyebrow">Estamos cerca</span>
        <h1 className="contact-page__title">Contacto</h1>
        <p className="contact-page__subtitle">
          Si quieres resolver una duda, proponer una colaboración o conocer más
          iniciativas de Fundación PROCLADE, aquí tienes las vías más directas
          para hablar con el equipo.
        </p>
      </div>
    </header>

    <section className="contact-page__content section-padding">
      <div className="container">
        <div className="contact-page__grid">
          <aside className="contact-page__panel contact-page__panel--info reveal-up reveal-delay-1">
            <h2>Contacto directo</h2>
            <p className="contact-page__panel-text">
              Utiliza el canal que te resulte más cómodo. Si prefieres escribir
              desde la web, el formulario activo está en la página de
              colaboración.
            </p>

            <div className="contact-page__info-list">
              <article className="contact-page__info-card">
                <div className="contact-page__info-icon" aria-hidden="true">
                  <i className="bi bi-geo-alt" />
                </div>
                <div>
                  <h3>Dirección</h3>
                  <p>{CONTACT_ADDRESS}</p>
                </div>
              </article>

              <article className="contact-page__info-card">
                <div className="contact-page__info-icon" aria-hidden="true">
                  <i className="bi bi-telephone" />
                </div>
                <div>
                  <h3>Teléfono</h3>
                  <p>
                    <a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE}</a>
                  </p>
                </div>
              </article>

              <article className="contact-page__info-card">
                <div className="contact-page__info-icon" aria-hidden="true">
                  <i className="bi bi-envelope" />
                </div>
                <div>
                  <h3>Correo electrónico</h3>
                  <p>
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                  </p>
                </div>
              </article>
            </div>

            <div className="contact-page__quick-links">
              <Link to="/colabora" className="contact-page__quick-link">
                <strong>Escribir desde Colabora</strong>
                <span>
                  Accede al formulario web si prefieres enviarnos tu mensaje
                  desde la sección de colaboración.
                </span>
              </Link>
              <a
                href={PROCLADE_URL}
                target="_blank"
                rel="noreferrer"
                className="contact-page__quick-link"
              >
                <strong>Web oficial de Fundación PROCLADE</strong>
                <span>
                  Explora proyectos, campañas, noticias y otras formas de
                  participación de la ONG.
                </span>
              </a>
            </div>
          </aside>

          <div className="contact-page__panel contact-page__panel--actions reveal-up reveal-delay-2">
            <h2>Más formas de implicarte</h2>
            <p className="contact-page__panel-text">
              Además del contacto directo, la web oficial de Fundación PROCLADE
              reúne otras vías para sumarte a su labor social.
            </p>

            <article className="contact-page__foundation-highlight">
              <span className="contact-page__foundation-kicker">Fundación PROCLADE</span>
              <h3>Descubre todo lo que puedes hacer desde su página oficial</h3>
              <p>
                Si te interesa apoyar otras campañas, conocer mejor la entidad o
                explorar nuevas iniciativas, la web principal reúne toda esa
                información en un único lugar.
              </p>
              <a
                href={PROCLADE_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-brand-gradient"
              >
                Visitar la web oficial
              </a>
            </article>

            <div className="contact-page__action-grid">
              {OFFICIAL_ACTIONS.map((action) => (
                <a
                  key={action.title}
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-page__action-card"
                >
                  <div className="contact-page__action-icon" aria-hidden="true">
                    <i className={`bi ${action.icon}`} />
                  </div>
                  <div>
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  </section>
);
