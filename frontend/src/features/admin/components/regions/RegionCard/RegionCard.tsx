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
        className="region-card__icon-button region-card__icon-button--edit"
        onClick={() => onEdit(region)}
        aria-label={`Editar ${region.name}`}
      >
        <i className="bi bi-tools" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="region-card__icon-button region-card__icon-button--delete"
        onClick={() => onDelete(region)}
        aria-label={`Eliminar ${region.name}`}
      >
        <i className="bi bi-x-circle" aria-hidden="true" />
      </button>
    </div>
  </article>
);
