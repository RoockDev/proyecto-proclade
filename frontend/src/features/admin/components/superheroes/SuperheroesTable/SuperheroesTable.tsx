import { AdminDataTable, type AdminTableColumn } from '../../shared/AdminDataTable/AdminDataTable';
import { AdminStatusBadge } from '../../shared/AdminStatusBadge/AdminStatusBadge';
import type { AdminStatusCode } from '../../../types/admin-panel.types';
import type { AdminSuperheroRow, SuperheroStatus } from '../../../types/superheroes.types';
import './SuperheroesTable.css';

type SuperheroesTableProps = {
  heroes: AdminSuperheroRow[];
  onEdit: (hero: AdminSuperheroRow) => void;
  onToggleStatus: (hero: AdminSuperheroRow) => void;
  onDeactivate: (hero: AdminSuperheroRow) => void;
  onRestore: (hero: AdminSuperheroRow) => void;
  showDeletedOnly?: boolean;
};

const statusLabelMap: Record<SuperheroStatus, { label: string; badgeStatus: AdminStatusCode }> = {
  DRAFT: { label: 'Borrador', badgeStatus: 'DRAFT' },
  PUBLISHED: { label: 'Publicado', badgeStatus: 'PUBLICADO' },
  HIDDEN: { label: 'Oculto', badgeStatus: 'HIDDEN' },
};

export const SuperheroesTable = ({
  heroes,
  onEdit,
  onToggleStatus,
  onDeactivate,
  onRestore,
}: SuperheroesTableProps) => {
  const columns: AdminTableColumn<AdminSuperheroRow>[] = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (hero) => (
        <div className="superheroes-table__name-cell">
          {hero.imageUrl ? (
            <img src={hero.imageUrl} alt={hero.name} loading="lazy" />
          ) : (
            <span className="superheroes-table__avatar-placeholder" aria-hidden="true" />
          )}
          <div>
            <strong>{hero.name}</strong>
            <span className="superheroes-table__slug">/{hero.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'País',
      cell: (hero) => hero.country || '—',
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (hero) => {
        const badge = hero.deletedAt
          ? { label: 'Desactivado', badgeStatus: 'BORRADO' as AdminStatusCode }
          : statusLabelMap[hero.status];
        return <AdminStatusBadge label={badge.label} status={badge.badgeStatus} />;
      },
    },
    {
      key: 'sortOrder',
      header: 'Orden',
      cell: (hero) => hero.sortOrder.toString(),
    },
    {
      key: 'updatedAt',
      header: 'Actualizado',
      cell: (hero) => new Date(hero.updatedAt).toLocaleString(),
    },
    {
      key: 'actions',
      header: 'Acciones',
      cell: (hero) => (
        <div className="superheroes-table__actions">
          {!hero.deletedAt ? (
            <>
              <button
                type="button"
                className="superheroes-table__icon-button superheroes-table__icon-button--tool"
                onClick={() => onEdit(hero)}
                aria-label={`Editar ${hero.name}`}
              >
                <i className="bi bi-tools" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="superheroes-table__icon-button superheroes-table__icon-button--visibility"
                onClick={() => onToggleStatus(hero)}
                aria-label={hero.status === 'PUBLISHED' ? `Ocultar ${hero.name}` : `Publicar ${hero.name}`}
              >
                <i
                  className={`bi ${hero.status === 'PUBLISHED' ? 'bi-eye-slash' : 'bi-eye'}`}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className="superheroes-table__icon-button superheroes-table__icon-button--danger"
                onClick={() => onDeactivate(hero)}
                aria-label={`Desactivar ${hero.name}`}
              >
                <i className="bi bi-x-circle" aria-hidden="true" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="superheroes-table__icon-button superheroes-table__icon-button--reactivate"
              onClick={() => onRestore(hero)}
              aria-label={`Reactivar ${hero.name}`}
            >
              <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="superheroes-table">
      <AdminDataTable<AdminSuperheroRow>
        columns={columns}
        rows={heroes}
        getRowKey={(hero) => hero.id.toString()}
        emptyMessage="No hay superhéroes que coincidan."
      />
    </div>
  );
};
