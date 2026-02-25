import type { AdminQuickAction } from '../../../types/admin-panel.types';
import './AdminQuickActionButton.css';

type AdminQuickActionButtonProps = {
  action: AdminQuickAction;
};

export const AdminQuickActionButton = ({
  action,
}: AdminQuickActionButtonProps) => {
  return (
    <button
      type="button"
      className={`admin-quick-action-button admin-quick-action-button--${action.variant}`}
      aria-label={`Acción rápida: ${action.label}`}
    >
      <i className={`${action.icon} admin-quick-action-button__icon`} aria-hidden="true" />
      <span>{action.label}</span>
    </button>
  );
};
