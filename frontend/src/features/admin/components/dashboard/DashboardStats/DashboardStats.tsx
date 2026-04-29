import type { ReactNode } from 'react';
import './DashboardStats.css';
import { DashboardStatCard } from '../DashboardStatCard/DashboardStatCard';

export type DashboardStatistic = {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
};

type DashboardStatsProps = {
  stats: DashboardStatistic[];
};

export const DashboardStats = ({ stats }: DashboardStatsProps) => (
  <div className="dashboard-stats">
    {stats.map((stat) => (
      <DashboardStatCard key={stat.label} stat={stat} />
    ))}
  </div>
);
