import type { AdminListBlock } from '../../../types/admin-panel.types';
import { AdminListItem } from '../AdminListItem/AdminListItem';
import './AdminListCard.css';

type AdminListCardProps = {
  block: AdminListBlock;
};

export const AdminListCard = ({ block }: AdminListCardProps) => {
  return (
    <section className="admin-list-card" aria-labelledby={`admin-list-card-${block.key}`}>
      <div className="admin-list-card__header">
        <h2 id={`admin-list-card-${block.key}`} className="admin-list-card__title">
          {block.title}
        </h2>
      </div>

      <div className="admin-list-card__items">
        {block.items.map((item) => (
          <AdminListItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
