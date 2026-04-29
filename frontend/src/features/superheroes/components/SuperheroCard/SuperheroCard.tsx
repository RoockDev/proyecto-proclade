import { useState } from 'react';
import type { SuperheroItem } from '../../types/superheroes.types';
import './SuperheroCard.css';

type SuperheroCardProps = {
  hero: SuperheroItem;
};

export const SuperheroCard = ({ hero }: SuperheroCardProps) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(hero.imageUrl) && !imageError;

  return (
    <article className="superhero-card h-100">
      <div className="superhero-card__media">
        {hasImage ? (
          <img
            src={hero.imageUrl ?? ''}
            alt={hero.name}
            loading="lazy"
            className="superhero-card__image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="superhero-card__placeholder" role="img" aria-label="Imagen del superhéroe no disponible">
            <i className="bi bi-person-badge" aria-hidden="true" />
            <span>Imagen próximamente</span>
          </div>
        )}
      </div>

      <div className="superhero-card__body d-flex flex-column">
        <header className="superhero-card__header">
          <h3>{hero.name}</h3>
          {hero.country && <p className="superhero-card__country">{hero.country}</p>}
        </header>

        <p className="superhero-card__description">{hero.description}</p>

        {hero.quote && (
          <blockquote className="superhero-card__quote">
            <p>{hero.quote}</p>
          </blockquote>
        )}
      </div>
    </article>
  );
};
