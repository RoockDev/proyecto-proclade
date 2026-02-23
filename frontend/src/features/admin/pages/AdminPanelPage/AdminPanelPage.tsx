import { adminMetricsMock } from '../../mocks/admin-panel.mocks';
import { AdminStatsGrid } from '../../components/dashboard/AdminStatsGrid/AdminStatsGrid';

export const AdminPanelPage = () => {
  return (
    <section aria-label="Dashboard del panel de administración">
      <AdminStatsGrid metrics={adminMetricsMock} />
    </section>
  );
};
