import type { AdminStatusCode } from '../../../types/admin-panel.types';
import './AdminStatusBadge.css';

type AdminStatusBadgeProps = {
  label: string;
  status: AdminStatusCode;
};

export const AdminStatusBadge = ({ label, status }: AdminStatusBadgeProps) => {
  return (
    <span className={`admin-status-badge admin-status-badge--${status.toLowerCase()}`}>
      {label}
    </span>
  );
};
