import { AdminButton } from '../../shared/AdminButton/AdminButton';
import { AdminSearchBar } from '../../shared/AdminSearchBar/AdminSearchBar';
import { AdminToolbar } from '../../shared/AdminToolbar/AdminToolbar';
import './NewsToolbar.css';

type NewsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNew: () => void;
};

export const NewsToolbar = ({
  search,
  onSearchChange,
  onNew,
}: NewsToolbarProps) => (
  <div className="news-toolbar">
    <AdminToolbar
      searchSlot={
        <AdminSearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar por título, resumen o slug..."
        />
      }
      actionsSlot={
        <AdminButton
          variant="solid"
          className="news-toolbar__new"
          onClick={onNew}
        >
          Nueva noticia
        </AdminButton>
      }
    />
  </div>
);
