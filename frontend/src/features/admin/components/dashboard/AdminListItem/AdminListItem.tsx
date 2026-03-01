import type {
  AdminDashboardListItem,
  AdminListItemStatus,
} from '../../../types/admin-panel.types';
import { AdminStatusBadge } from '../../shared/AdminStatusBadge/AdminStatusBadge';
import './AdminListItem.css';

type AdminListItemProps = {
  item: AdminDashboardListItem;
};

const statusLabelMap: Record<AdminListItemStatus, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  PUBLICADO: 'Publicado',
};

export const AdminListItem = ({ item }: AdminListItemProps) => {
  return (
    <article className="admin-list-item" aria-label={`${item.title} - ${item.status}`}>
      <div className="admin-list-item__content">
        <p className="admin-list-item__title">{item.title}</p>
        <p className="admin-list-item__meta">
          <span>{item.subtitle}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={item.date}>{item.date}</time>
        </p>
      </div>

      <AdminStatusBadge label={statusLabelMap[item.status]} status={item.status} />
    </article>
  );
};
