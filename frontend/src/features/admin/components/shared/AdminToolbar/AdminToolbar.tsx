import type { ReactNode } from 'react';
import './AdminToolbar.css';

type AdminToolbarProps = {
  searchSlot?: ReactNode;
  actionsSlot?: ReactNode;
};

export const AdminToolbar = ({ searchSlot, actionsSlot }: AdminToolbarProps) => {
  return (
    <section className="admin-toolbar" aria-label="Filtros y acciones">
      <div className="admin-toolbar__search">{searchSlot}</div>
      <div className="admin-toolbar__actions">{actionsSlot}</div>
    </section>
  );
};
