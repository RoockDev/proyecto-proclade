import type { DelegationContactView } from '../../types/human-libraries.types';
import './DelegationContactPanel.css';

type DelegationContactPanelProps = {
  contact: DelegationContactView;
};

export const DelegationContactPanel = ({ contact }: DelegationContactPanelProps) => {
  const encodedQuery = encodeURIComponent(contact.mapQuery);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <article className="delegation-contact-panel">
      <h2 className="delegation-contact-panel__title">Mapa y contacto</h2>

      <div className="delegation-contact-panel__map-wrapper">
        <iframe
          title={`Mapa de la delegación ${contact.label}`}
          src={mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="delegation-contact-panel__map-frame"
        />
      </div>

      <a
        href={mapOpenUrl}
        target="_blank"
        rel="noreferrer"
        className="delegation-contact-panel__map-link btn btn-sm btn-brand-outline"
      >
        Abrir mapa en Google Maps
      </a>

      <div className="delegation-contact-panel__details">
        <p>
          <i className="bi bi-pin-map" aria-hidden="true" />
          <span>{contact.address}</span>
        </p>
        <p>
          <i className="bi bi-telephone" aria-hidden="true" />
          <span>{contact.phone ?? 'Teléfono no disponible'}</span>
        </p>
        <p>
          <i className="bi bi-envelope" aria-hidden="true" />
          <span>{contact.email}</span>
        </p>
      </div>
    </article>
  );
};
