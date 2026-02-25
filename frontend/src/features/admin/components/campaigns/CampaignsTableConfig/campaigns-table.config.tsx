import type { AdminCampaign } from '../../../types/admin-panel.types';
import { AdminRowActions } from '../../shared/AdminRowActions/AdminRowActions';
import { AdminStatusBadge } from '../../shared/AdminStatusBadge/AdminStatusBadge';
import type { AdminTableColumn } from '../../shared/AdminDataTable/AdminDataTable';

export type CampaignRowHandlers = {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const formatEur = (value: number): string =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);

const statusLabelMap: Record<AdminCampaign['status'], string> = {
  ACTIVA: 'Activa',
  FINALIZADA: 'Finalizada',
};

export const buildCampaignsColumns = (
  handlers?: CampaignRowHandlers,
): AdminTableColumn<AdminCampaign>[] => [
  {
    key: 'title',
    header: 'Título',
    cell: (row) => row.title,
  },
  {
    key: 'category',
    header: 'Categoría',
    cell: (row) => row.category,
  },
  {
    key: 'status',
    header: 'Estado',
    cell: (row) => (
      <AdminStatusBadge label={statusLabelMap[row.status]} status={row.status} />
    ),
  },
  {
    key: 'raisedAmount',
    header: 'Recaudado',
    cell: (row) => formatEur(row.raisedAmount),
  },
  {
    key: 'goalAmount',
    header: 'Meta',
    cell: (row) => formatEur(row.goalAmount),
  },
  {
    key: 'actions',
    header: 'Acciones',
    cell: (row) => (
      <AdminRowActions
        onView={handlers?.onView ? () => handlers.onView?.(row.id) : undefined}
        onEdit={handlers?.onEdit ? () => handlers.onEdit?.(row.id) : undefined}
        onDelete={handlers?.onDelete ? () => handlers.onDelete?.(row.id) : undefined}
      />
    ),
  },
];
