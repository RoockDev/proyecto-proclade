import {
  adminListBlocksMock,
  adminMetricsMock,
  adminQuickActionsMock,
} from '../../mocks/admin-panel.mocks';
import { AdminListCard } from '../../components/dashboard/AdminListCard/AdminListCard';
import { AdminQuickActions } from '../../components/dashboard/AdminQuickActions/AdminQuickActions';
import { AdminStatsGrid } from '../../components/dashboard/AdminStatsGrid/AdminStatsGrid';
import './AdminPanelPage.css';

export const AdminPanelPage = () => {
  return (
    <section className="admin-panel-page" aria-label="Dashboard del panel de administración">
      <AdminStatsGrid metrics={adminMetricsMock} />

      <section className="admin-panel-page__lists" aria-label="Listas de gestión del panel">
        {adminListBlocksMock.map((block) => (
          <AdminListCard key={block.key} block={block} />
        ))}
      </section>

      <AdminQuickActions actions={adminQuickActionsMock} />
    </section>
  );
};
