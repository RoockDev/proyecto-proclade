import { useMemo, useState } from 'react';
import {
  adminCampaignsMock,
  adminCampaignsQuickActionMock,
} from '../../mocks/admin-panel.mocks';
import { CampaignsTable } from '../../components/campaigns/CampaignsTable/CampaignsTable';
import { AdminSearchBar } from '../../components/shared/AdminSearchBar/AdminSearchBar';
import { AdminToolbar } from '../../components/shared/AdminToolbar/AdminToolbar';
import { AdminQuickActionButton } from '../../components/shared/AdminQuickActionButton/AdminQuickActionButton';
import './AdminCampaignsPage.css';

export const AdminCampaignsPage = () => {
  const [search, setSearch] = useState('');

  const filteredCampaigns = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return adminCampaignsMock;

    return adminCampaignsMock.filter(
      (campaign) =>
        campaign.title.toLowerCase().includes(term) ||
        campaign.category.toLowerCase().includes(term),
    );
  }, [search]);

  return (
    <section className="admin-campaigns-page" aria-label="Gestión de campañas">
      <AdminToolbar
        searchSlot={
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar campaña..."
          />
        }
        actionsSlot={<AdminQuickActionButton action={adminCampaignsQuickActionMock} />}
      />

      <CampaignsTable rows={filteredCampaigns} />
    </section>
  );
};
