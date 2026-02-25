import './AdminRowActions.css';

type AdminRowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const AdminRowActions = ({
  onView,
  onEdit,
  onDelete,
}: AdminRowActionsProps) => {
  return (
    <div className="admin-row-actions">
      <button type="button" onClick={onView} aria-label="Ver">
        <i className="bi bi-eye" />
      </button>
      <button type="button" onClick={onEdit} aria-label="Editar">
        <i className="bi bi-pencil-square" />
      </button>
      <button type="button" onClick={onDelete} aria-label="Eliminar">
        <i className="bi bi-trash text-danger" />
      </button>
    </div>
  );
};
