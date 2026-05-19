import { useEffect, useState } from 'react';
import {
  acceptAllPreferences,
  getCookiePreferences,
  rejectAllPreferences,
  setCookiePreferences,
} from '../../utils/cookie-preferences';
import type { CookiePreferences } from '../../types/cookie-preferences.types';
import './CookiePreferencesModal.css';

type CookiePreferencesModalProps = {
  onClose: () => void;
};

type ModalView = 'initial' | 'config';

export const CookiePreferencesModal = ({ onClose }: CookiePreferencesModalProps) => {
  const [view, setView] = useState<ModalView>('initial');
  const [draft, setDraft] = useState<CookiePreferences>(() => getCookiePreferences());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAcceptAll = () => {
    acceptAllPreferences();
    onClose();
  };

  const handleRejectAll = () => {
    rejectAllPreferences();
    onClose();
  };

  const handleSaveConfig = () => {
    setCookiePreferences(draft);
    onClose();
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="cookie-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="cookie-modal__container">
        <header className="cookie-modal__header">
          <h2 id="cookie-modal-title" className="cookie-modal__title">
            Preferencias de privacidad
          </h2>
          <button
            type="button"
            className="cookie-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        {view === 'initial' ? (
          <div className="cookie-modal__body">
            <p className="cookie-modal__intro">
              Equipo PUCH usa almacenamiento técnico necesario para el funcionamiento
              de la web (sesión, preferencias). Algunos servicios externos como Google
              Maps no se cargan hasta que tú lo aceptes.
            </p>
            <p className="cookie-modal__intro">
              Consulta la{' '}
              <a
                href="https://www.fundacionproclade.org/politica-de-privacidad/"
                target="_blank"
                rel="noreferrer"
              >
                Política de privacidad oficial de PROCLADE
              </a>{' '}
              para más detalle.
            </p>
            <div className="cookie-modal__actions">
              <button
                type="button"
                className="cookie-modal__btn cookie-modal__btn--secondary"
                onClick={handleRejectAll}
              >
                Rechazar
              </button>
              <button
                type="button"
                className="cookie-modal__btn cookie-modal__btn--tertiary"
                onClick={() => setView('config')}
              >
                Configurar
              </button>
              <button
                type="button"
                className="cookie-modal__btn cookie-modal__btn--primary"
                onClick={handleAcceptAll}
              >
                Aceptar
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-modal__body">
            <ul className="cookie-modal__categories">
              <li className="cookie-modal__category">
                <div className="cookie-modal__category-head">
                  <span className="cookie-modal__category-title">Necesarias</span>
                  <span className="cookie-modal__badge cookie-modal__badge--locked">
                    Siempre activas
                  </span>
                </div>
                <p className="cookie-modal__category-desc">
                  Imprescindibles para iniciar sesión, recordar tu sesión y mantener
                  preferencias de la web. Se almacenan en localStorage.
                </p>
              </li>

              <li className="cookie-modal__category">
                <div className="cookie-modal__category-head">
                  <span className="cookie-modal__category-title">Servicios externos</span>
                  <label className="cookie-modal__switch">
                    <input
                      type="checkbox"
                      checked={draft.externalServices}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          externalServices: event.target.checked,
                        }))
                      }
                    />
                    <span className="cookie-modal__switch-slider" />
                  </label>
                </div>
                <p className="cookie-modal__category-desc">
                  Permite cargar mapas embebidos de Google Maps en las delegaciones.
                  Al aceptar, Google puede recibir información sobre tu visita según
                  sus propias políticas.
                </p>
              </li>

              <li className="cookie-modal__category cookie-modal__category--disabled">
                <div className="cookie-modal__category-head">
                  <span className="cookie-modal__category-title">Analítica</span>
                  <span className="cookie-modal__badge">No utilizada</span>
                </div>
                <p className="cookie-modal__category-desc">
                  Actualmente no usamos herramientas de analítica ni tracking en esta web.
                </p>
              </li>
            </ul>

            <div className="cookie-modal__actions cookie-modal__actions--config">
              <button
                type="button"
                className="cookie-modal__btn cookie-modal__btn--secondary"
                onClick={() => setView('initial')}
              >
                Volver
              </button>
              <button
                type="button"
                className="cookie-modal__btn cookie-modal__btn--primary"
                onClick={handleSaveConfig}
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
