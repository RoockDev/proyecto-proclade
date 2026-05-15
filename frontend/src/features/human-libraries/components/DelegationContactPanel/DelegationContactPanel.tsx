import { useEffect, useState } from 'react';
import type { DelegationContactView } from '../../types/human-libraries.types';
import { formatRegionPhone } from '../../../../utils/region-phone';
import {
  getCookiePreferences,
  setCookiePreferences,
} from '../../../privacy/utils/cookie-preferences';
import {
  COOKIE_PREFERENCES_EVENT,
  type CookiePreferences,
} from '../../../privacy/types/cookie-preferences.types';
import './DelegationContactPanel.css';

type DelegationContactPanelProps = {
  contact: DelegationContactView;
};

export const DelegationContactPanel = ({ contact }: DelegationContactPanelProps) => {
  const [externalServicesAccepted, setExternalServicesAccepted] = useState<boolean>(
    () => getCookiePreferences().externalServices,
  );

  useEffect(() => {
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<CookiePreferences>).detail;
      if (detail) {
        setExternalServicesAccepted(detail.externalServices === true);
      } else {
        setExternalServicesAccepted(getCookiePreferences().externalServices);
      }
    };
    window.addEventListener(COOKIE_PREFERENCES_EVENT, handleChange);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, handleChange);
  }, []);

  const encodedQuery = encodeURIComponent(contact.mapQuery);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  const normalizedPhoneLink = contact.phone
    ? `tel:${contact.phone.replace(/[^+\d]/g, '')}`
    : null;

  const handleAcceptExternalServices = () => {
    const current = getCookiePreferences();
    setCookiePreferences({ ...current, externalServices: true });
  };

  return (
    <article className="delegation-contact-panel">
      <h2 className="delegation-contact-panel__title">Mapa y contacto</h2>

      {externalServicesAccepted ? (
        <>
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
        </>
      ) : (
        <div
          className="delegation-contact-panel__map-placeholder"
          role="region"
          aria-label="Mapa bloqueado por preferencias de privacidad"
        >
          <i
            className="bi bi-geo-alt delegation-contact-panel__placeholder-icon"
            aria-hidden="true"
          />
          <p className="delegation-contact-panel__placeholder-text">
            Para ver el mapa de Google Maps necesitas aceptar servicios externos.
          </p>
          <div className="delegation-contact-panel__placeholder-actions">
            <button
              type="button"
              className="btn btn-sm btn-brand"
              onClick={handleAcceptExternalServices}
            >
              Aceptar servicios externos y ver mapa
            </button>
            <a
              href={mapOpenUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-brand-outline"
            >
              Abrir ubicación en Google Maps
            </a>
          </div>
        </div>
      )}

      <div className="delegation-contact-panel__details">
        <p>
          <i className="bi bi-pin-map" aria-hidden="true" />
          <span>{contact.address}</span>
        </p>
        <p>
          <i className="bi bi-telephone" aria-hidden="true" />
          <span>
            {contact.phone && normalizedPhoneLink ? (
              <a href={normalizedPhoneLink}>{formatRegionPhone(contact.phone)}</a>
            ) : (
              'Teléfono no disponible'
            )}
          </span>
        </p>
        <p>
          <i className="bi bi-envelope" aria-hidden="true" />
          <span>{contact.email}</span>
        </p>
      </div>
    </article>
  );
};
