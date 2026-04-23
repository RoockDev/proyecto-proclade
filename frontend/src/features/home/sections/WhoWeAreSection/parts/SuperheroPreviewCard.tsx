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
      <p>{hero.quote || hero.description}</p>
    </div>
  </article>
);
