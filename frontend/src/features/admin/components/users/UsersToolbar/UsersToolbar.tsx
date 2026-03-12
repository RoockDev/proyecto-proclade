import { AdminToolbar } from '../../shared/AdminToolbar/AdminToolbar';
import { AdminSearchBar } from '../../shared/AdminSearchBar/AdminSearchBar';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import './UsersToolbar.css';

type FilterOption = {
  label: string;
  value: 'active' | 'deleted' | 'all';
};

type UsersToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
  filters: FilterOption[];
  currentFilter: FilterOption['value'];
  onFilterChange: (value: FilterOption['value']) => void;
};

export const UsersToolbar = ({
  search,
  onSearchChange,
  onNew,
  filters,
  currentFilter,
  onFilterChange,
}: UsersToolbarProps) => (
  <div className="users-toolbar">
    <div className="users-toolbar__filters">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={`users-toolbar__filter ${
            currentFilter === filter.value ? 'users-toolbar__filter--active' : ''
          }`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
    <AdminToolbar
      searchSlot={
        <AdminSearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por nombre o email..."
        />
      }
      actionsSlot={
        <AdminButton variant="solid" className="users-toolbar__new" onClick={onNew}>
          Nuevo usuario
        </AdminButton>
      }
    />
  </div>
);
