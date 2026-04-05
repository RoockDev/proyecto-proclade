import { AdminButton } from '../../shared/AdminButton/AdminButton';
import { AdminSearchBar } from '../../shared/AdminSearchBar/AdminSearchBar';
import { AdminToolbar } from '../../shared/AdminToolbar/AdminToolbar';
import type { SuperheroStatus } from '../../../types/superheroes.types';
import './SuperheroesToolbar.css';

export type SuperheroFilterValue = SuperheroStatus | '' | 'DELETED';

type FilterOption = {
  label: string;
  value: SuperheroFilterValue;
};

type SuperheroesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
  filters: FilterOption[];
  activeStatusFilter: SuperheroStatus | '';
  showDeletedOnly: boolean;
  onFilterSelect: (value: SuperheroFilterValue) => void;
};

const isFilterActive = (
  filterValue: SuperheroFilterValue,
  showDeletedOnly: boolean,
  activeStatusFilter: SuperheroStatus | '',
): boolean => {
  if (filterValue === 'DELETED') {
    return showDeletedOnly;
  }

  if (showDeletedOnly) {
    return false;
  }

  return activeStatusFilter === filterValue;
};

export const SuperheroesToolbar = ({
  search,
  onSearchChange,
  onNew,
  filters,
  activeStatusFilter,
  showDeletedOnly,
  onFilterSelect,
}: SuperheroesToolbarProps) => (
  <div className="superheroes-toolbar">
    <div className="superheroes-toolbar__filters">
      {filters.map((filter) => {
        const isActive = isFilterActive(filter.value, showDeletedOnly, activeStatusFilter);
        return (
          <button
            key={filter.value}
            type="button"
            className={`superheroes-toolbar__filter ${
              isActive ? 'superheroes-toolbar__filter--active' : ''
            }`}
            onClick={() => onFilterSelect(filter.value)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>

    <AdminToolbar
      searchSlot={
        <AdminSearchBar value={search} onChange={onSearchChange} placeholder="Buscar por nombre o país..." />
      }
      actionsSlot={
        <div className="superheroes-toolbar__actions">
          <AdminButton variant="solid" className="admin-toolbar__new" onClick={onNew}>
            Nuevo
          </AdminButton>
        </div>
      }
    />
  </div>
);
