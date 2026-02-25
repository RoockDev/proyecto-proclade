export type AdminMetricKey =
  | 'activeCampaigns'
  | 'pendingRequests'
  | 'pendingProposals'
  | 'unreadMessages';

export type AdminMetricAccent = 'primary' | 'warning' | 'info' | 'success';

export type AdminMetric = {
  key: AdminMetricKey;
  label: string;
  value: number;
  accent: AdminMetricAccent;
};

export type AdminStatusCode =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'PUBLICADO'
  | 'ACTIVA'
  | 'FINALIZADA';

export type AdminListItemStatus = Extract<
  AdminStatusCode,
  'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'PUBLICADO'
>;

export type AdminDashboardListItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: AdminListItemStatus;
};

export type AdminListBlockKey = 'latestRequests' | 'productProposals';

export type AdminListBlock = {
  key: AdminListBlockKey;
  title: string;
  items: AdminDashboardListItem[];
};

export type AdminQuickActionVariant = 'solid' | 'outline';

export type AdminQuickAction = {
  id: string;
  label: string;
  icon: string;
  variant: AdminQuickActionVariant;
  target?: string;
};

export type AdminCampaignStatus = Extract<AdminStatusCode, 'ACTIVA' | 'FINALIZADA'>;

export type AdminCampaign = {
  id: string;
  title: string;
  category: string;
  status: AdminCampaignStatus;
  raisedAmount: number;
  goalAmount: number;
};
