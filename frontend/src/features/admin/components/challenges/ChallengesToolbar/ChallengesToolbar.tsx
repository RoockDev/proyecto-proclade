import { AdminToolbar } from '../../shared/AdminToolbar/AdminToolbar';
import { AdminSearchBar } from '../../shared/AdminSearchBar/AdminSearchBar';
import { AdminButton } from '../../shared/AdminButton/AdminButton';

type ChallengesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
};

export const ChallengesToolbar = ({
  search,
  onSearchChange,
  onNew,
}: ChallengesToolbarProps) => (
  <AdminToolbar
    searchSlot={
      <AdminSearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por título..."
      />
    }
    actionsSlot={
      <AdminButton variant="solid" className="admin-toolbar__new" onClick={onNew}>
        Nuevo
      </AdminButton>
    }
  />
);
