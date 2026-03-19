import type { AdminRegion } from '../../../types/regions.types';
import { RegionCard } from '../RegionCard/RegionCard';
import './RegionsGrid.css';

type RegionsGridProps = {
  regions: AdminRegion[];
  onEdit: (region: AdminRegion) => void;
  onDelete: (region: AdminRegion) => void;
};

export const RegionsGrid = ({ regions, onEdit, onDelete }: RegionsGridProps) => {
  if (!regions.length) {
    return (
      <div className="regions-grid regions-grid--empty">
        No hay delegaciones para mostrar.
      </div>
    );
  }

  return (
    <div className="regions-grid">
      {regions.map((region) => (
        <RegionCard
          key={region.id}
          region={region}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
