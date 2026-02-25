import type { AdminCampaign } from '../../../types/admin-panel.types';
import { AdminDataTable } from '../../shared/AdminDataTable/AdminDataTable';
import {
  buildCampaignsColumns,
  type CampaignRowHandlers,
} from '../CampaignsTableConfig/campaigns-table.config';

type CampaignsTableProps = {
  rows: AdminCampaign[];
  handlers?: CampaignRowHandlers;
};

export const CampaignsTable = ({ rows, handlers }: CampaignsTableProps) => {
  const columns = buildCampaignsColumns(handlers);

  return (
    <AdminDataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      emptyMessage="No hay campañas que coincidan con la búsqueda."
    />
  );
};
