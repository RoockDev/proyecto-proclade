import type { DashboardStatistic } from '../DashboardStats/DashboardStats';
import './DashboardStatCard.css';

type DashboardStatCardProps = {
  stat: DashboardStatistic;
};

export const DashboardStatCard = ({ stat }: DashboardStatCardProps) => (
  <article className="dashboard-stat-card">
    <div>
      <p className="dashboard-stat-card__label">{stat.label}</p>
      <p className="dashboard-stat-card__value">{stat.value}</p>
      <p className="dashboard-stat-card__detail">{stat.detail}</p>
    </div>
    <span className="dashboard-stat-card__icon">{stat.icon}</span>
  </article>
);
