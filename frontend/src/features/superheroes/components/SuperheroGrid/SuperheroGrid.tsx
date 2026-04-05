import type { SuperheroItem } from '../../types/superheroes.types';
import { SuperheroCard } from '../SuperheroCard/SuperheroCard';

type SuperheroGridProps = {
  items: SuperheroItem[];
};

export const SuperheroGrid = ({ items }: SuperheroGridProps) => (
  <div className="row g-4">
    {items.map((hero) => (
      <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={hero.id}>
        <SuperheroCard hero={hero} />
      </div>
    ))}
  </div>
);
