import { AdminToolbar } from '../../shared/AdminToolbar/AdminToolbar';
import { AdminSearchBar } from '../../shared/AdminSearchBar/AdminSearchBar';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import './HumanBooksToolbar.css';

type HumanBooksToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
};

export const HumanBooksToolbar = ({
  search,
  onSearchChange,
  onNew,
}: HumanBooksToolbarProps) => (
  <div className="human-books-toolbar">
    <AdminToolbar
      searchSlot={
        <AdminSearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, título o delegación..."
        />
      }
      actionsSlot={
        <AdminButton variant="solid" className="human-books-toolbar__new" onClick={onNew}>
          Nuevo libro humano
        </AdminButton>
      }
    />
  </div>
);
