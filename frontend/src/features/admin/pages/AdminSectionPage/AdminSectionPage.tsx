import './AdminSectionPage.css';

type AdminSectionPageProps = {
  section: string;
  description?: string;
};

export const AdminSectionPage = ({ section, description }: AdminSectionPageProps) => (
  <section className="admin-section-page">
    <div className="admin-section-page__content">
      <h1 className="admin-section-page__title">{section}</h1>
      {description ? <p className="admin-section-page__description">{description}</p> : null}
      <div className="admin-section-page__placeholder">
        <p>En construcción. Esta sección todavía no tiene contenido específico.</p>
      </div>
    </div>
  </section>
);
