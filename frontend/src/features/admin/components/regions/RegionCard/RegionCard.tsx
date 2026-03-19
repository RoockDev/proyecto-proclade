import type { AdminRegion } from '../../../types/regions.types';
import './RegionCard.css';

type RegionCardProps = {
  region: AdminRegion;
  onEdit: (region: AdminRegion) => void;
  onDelete: (region: AdminRegion) => void;
};

export const RegionCard = ({ region, onEdit, onDelete }: RegionCardProps) => (
  <article className="region-card">
    <header className="region-card__header">
      <h3>{region.name}</h3>
      <span className="region-card__badge">
        {region.booksCount} {region.booksCount === 1 ? 'libro' : 'libros'}
      </span>
    </header>

    <dl className="region-card__details">
      <div>
        <dt>Dirección</dt>
        <dd>{region.address}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>{region.email}</dd>
      </div>
    </dl>

    <div className="region-card__actions">
      <button
        type="button"
        onClick={() => onEdit(region)}
        className="region-card__action region-card__action--edit"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => onDelete(region)}
        className="region-card__action region-card__action--delete"
      >
        Eliminar
      </button>
    </div>
  </article>
);
