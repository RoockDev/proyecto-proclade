import type { SuperheroItem } from '../../types/superheroes.types';
import { SuperheroCard } from '../SuperheroCard/SuperheroCard';

type SuperheroGridProps = {
  items: SuperheroItem[];
  onOpenHero: (hero: SuperheroItem) => void;
};

export const SuperheroGrid = ({ items, onOpenHero }: SuperheroGridProps) => (
  <div className="row g-4">
    {items.map((hero) => (
      <div className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex" key={hero.id}>
        <SuperheroCard hero={hero} onOpen={onOpenHero} />
      </div>
    ))}
  </div>
);
