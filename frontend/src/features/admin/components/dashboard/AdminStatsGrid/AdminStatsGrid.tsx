import type { AdminMetric } from '../../../types/admin-panel.types';
import { AdminStatCard } from '../AdminStatCard/AdminStatCard';
import './AdminStatsGrid.css';

type AdminStatsGridProps = {
  metrics: AdminMetric[];
};

export const AdminStatsGrid = ({ metrics }: AdminStatsGridProps) => {
  return (
    <section className="admin-stats-grid" aria-label="Resumen de métricas del panel">
      {metrics.map((metric) => (
        <AdminStatCard key={metric.key} metric={metric} />
      ))}
    </section>
  );
};
