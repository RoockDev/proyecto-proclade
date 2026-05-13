import { Link } from 'react-router-dom';
import type { SuperheroItem } from '../../../../superheroes/types/superheroes.types';

type SuperheroPreviewCardProps = {
  hero: SuperheroItem;
};

export const SuperheroPreviewCard = ({
  hero,
}: SuperheroPreviewCardProps) => (
  <article className="who-we-are__hero-card h-100">
    <div className="who-we-are__hero-image-wrap">
      {hero.imageUrl ? (
        <img src={hero.imageUrl} alt={hero.name} className="who-we-are__hero-image" />
      ) : (
        <div className="who-we-are__hero-image-placeholder" aria-hidden="true">
          <i className="bi bi-person-badge" />
        </div>
      )}
    </div>
    <div className="who-we-are__hero-content">
      <h4>{hero.name}</h4>
      {hero.country && <p className="who-we-are__hero-country">{hero.country}</p>}
      <p className="who-we-are__hero-summary">{hero.quote || hero.description}</p>
      <Link
        to={`/superheroes?page=1&hero=${hero.slug}`}
        className="who-we-are__hero-link"
      >
        Ver historia completa <i className="bi bi-arrow-right" />
      </Link>
    </div>
  </article>
);
