import type { AdminMetric } from '../../../types/admin-panel.types';
import './AdminStatCard.css';

type AdminStatCardProps = {
  metric: AdminMetric;
};

export const AdminStatCard = ({ metric }: AdminStatCardProps) => {
  return (
    <article
      className={`admin-stat-card admin-stat-card--${metric.accent}`}
      aria-label={`Métrica: ${metric.label}`}
    >
      <p className="admin-stat-card__label">{metric.label}</p>
      <p className="admin-stat-card__value" aria-live="polite">
        {metric.value}
      </p>
    </article>
  );
};
