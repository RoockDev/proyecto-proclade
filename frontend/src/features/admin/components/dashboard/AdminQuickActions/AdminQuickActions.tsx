import type { AdminQuickAction } from '../../../types/admin-panel.types';
import { AdminQuickActionButton } from '../AdminQuickActionButton/AdminQuickActionButton';
import './AdminQuickActions.css';

type AdminQuickActionsProps = {
  actions: AdminQuickAction[];
};

export const AdminQuickActions = ({ actions }: AdminQuickActionsProps) => {
  return (
    <section className="admin-quick-actions" aria-label="Acciones rápidas del panel">
      {actions.map((action) => (
        <AdminQuickActionButton key={action.id} action={action} />
      ))}
    </section>
  );
};
