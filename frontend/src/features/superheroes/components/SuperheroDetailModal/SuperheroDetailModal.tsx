import { useEffect, useState } from 'react';
import type { SuperheroItem } from '../../types/superheroes.types';
import './SuperheroDetailModal.css';

type SuperheroDetailModalProps = {
  hero: SuperheroItem;
  onClose: () => void;
};

export const SuperheroDetailModal = ({
  hero,
  onClose,
}: SuperheroDetailModalProps) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(hero.imageUrl) && !imageError;
  const detailCopyLength =
    hero.description.length + (hero.quote?.length ?? 0);
  const hasLongCopy = detailCopyLength > 420;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="superhero-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="superhero-detail-title"
    >
      <div
        className="superhero-detail-modal__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`superhero-detail-modal__content${hasLongCopy ? ' superhero-detail-modal__content--scrollable' : ''}`}
      >
        <button
          type="button"
          className="superhero-detail-modal__close"
          aria-label="Cerrar detalle del superhéroe"
          onClick={onClose}
        >
          <i className="bi bi-x-lg" />
        </button>

        <div className="superhero-detail-modal__media">
          {hasImage ? (
            <img
              src={hero.imageUrl ?? ''}
              alt={hero.name}
              className="superhero-detail-modal__image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="superhero-detail-modal__placeholder"
              role="img"
              aria-label="Imagen del superhéroe no disponible"
            >
              <i className="bi bi-person-badge" aria-hidden="true" />
              <span>Imagen próximamente</span>
            </div>
          )}
        </div>

        <div className="superhero-detail-modal__body">
          {hero.country && (
            <p className="superhero-detail-modal__country">{hero.country}</p>
          )}
          <h2
            className="superhero-detail-modal__title"
            id="superhero-detail-title"
          >
            {hero.name}
          </h2>

          <div className="superhero-detail-modal__copy">
            <p>{hero.description}</p>
            {hero.quote && (
              <blockquote className="superhero-detail-modal__quote">
                <p>{hero.quote}</p>
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
