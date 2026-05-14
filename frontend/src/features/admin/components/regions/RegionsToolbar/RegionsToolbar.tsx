import { AdminButton } from '../../shared/AdminButton/AdminButton';
import { AdminSearchBar } from '../../shared/AdminSearchBar/AdminSearchBar';
import { AdminToolbar } from '../../shared/AdminToolbar/AdminToolbar';
import './RegionsToolbar.css';

type RegionsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
};

export const RegionsToolbar = ({
  search,
  onSearchChange,
  onNew,
}: RegionsToolbarProps) => (
  <div className="regions-toolbar">
    <AdminToolbar
      searchSlot={
        <AdminSearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, dirección, email o teléfono..."
        />
      }
      actionsSlot={
        <AdminButton
          variant="solid"
          className="regions-toolbar__new admin-toolbar__new"
          onClick={onNew}
        >
          Nuevo
        </AdminButton>
      }
    />
  </div>
);
