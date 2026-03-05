import type { SuperheroPreview } from '../../../types/home.types';

type SuperheroPreviewCardProps = {
  hero: SuperheroPreview;
  imageSrc: string;
};

export const SuperheroPreviewCard = ({
  hero,
  imageSrc,
}: SuperheroPreviewCardProps) => (
  <article className="who-we-are__hero-card h-100">
    <div className="who-we-are__hero-image-wrap">
      <img src={imageSrc} alt={hero.name} className="who-we-are__hero-image" />
    </div>
    <div className="who-we-are__hero-content">
      <h4>{hero.name}</h4>
      <p>{hero.speech}</p>
    </div>
  </article>
);
