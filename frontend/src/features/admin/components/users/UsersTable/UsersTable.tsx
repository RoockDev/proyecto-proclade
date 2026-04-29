import { AdminDataTable, type AdminTableColumn } from '../../shared/AdminDataTable/AdminDataTable';
import { AdminStatusBadge } from '../../shared/AdminStatusBadge/AdminStatusBadge';
import type { AdminUser } from '../../../types/users.types';
import './UsersTable.css';

type UsersTableProps = {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onReactivate?: (user: AdminUser) => void;
  onToggleRealHero?: (user: AdminUser) => void;
};

const badgeForUser = (user: AdminUser) =>
  user.deletedAt
    ? { label: 'Eliminado', status: 'FINALIZADA' as const }
    : user.isRealHero
    ? { label: 'Superhéroe real', status: 'PUBLICADO' as const }
    : { label: 'Activo', status: 'ACTIVA' as const };

export const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onReactivate,
  onToggleRealHero,
}: UsersTableProps) => {
  const columns: AdminTableColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (user: AdminUser) => `${user.name} ${user.surname}`,
    },
    {
      key: 'email',
      header: 'Email',
      cell: (user: AdminUser) => user.email,
    },
    {
      key: 'roles',
      header: 'Roles',
      cell: (user: AdminUser) => user.roles.join(', '),
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (user: AdminUser) => <AdminStatusBadge {...badgeForUser(user)} />,
    },
    {
      key: 'updatedAt',
      header: 'Actualizado',
      cell: (user: AdminUser) => new Date(user.updatedAt).toLocaleString(),
    },
      {
        key: 'actions',
        header: 'Acciones',
        cell: (user: AdminUser) => (
          <div className="users-table__actions">
            <button
              type="button"
              onClick={() => onEdit(user)}
              aria-label={`Editar ${user.name} ${user.surname}`}
              className="users-table__icon-button users-table__icon-button--tool"
            >
              <i className="bi bi-tools" aria-hidden="true" />
            </button>
            {!user.deletedAt && onToggleRealHero ? (
              <button
                type="button"
                onClick={() => onToggleRealHero(user)}
                aria-label={
                  user.isRealHero
                    ? `Desactivar ${user.name} ${user.surname} como superhéroe real`
                    : `Convertir ${user.name} ${user.surname} en superhéroe real`
                }
                className={`users-table__icon-button users-table__icon-button--convert${
                  user.isRealHero ? ' is-active' : ''
                }`}
              >
                <i
                  className={`bi ${user.isRealHero ? 'bi-star-fill' : 'bi-star'}`}
                  aria-hidden="true"
                />
              </button>
            ) : null}
            {user.deletedAt ? (
              <button
                type="button"
                onClick={() => onReactivate?.(user)}
                aria-label={`Reactivar ${user.name} ${user.surname}`}
                className="users-table__icon-button users-table__icon-button--reactivate"
              >
                <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onDelete(user)}
                aria-label={`Eliminar ${user.name} ${user.surname}`}
                className="users-table__icon-button users-table__icon-button--delete"
              >
                <i className="bi bi-x-circle" aria-hidden="true" />
              </button>
            )}
          </div>
        ),
      },
  ];

  return (
    <div className="users-table">
      <AdminDataTable<AdminUser>
        columns={columns}
        rows={users}
        getRowKey={(user) => user.id.toString()}
        emptyMessage="No hay usuarios que coincidan."
      />
    </div>
  );
};
