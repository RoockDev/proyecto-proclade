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

export type AdminListItemStatus =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'PUBLICADO';

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
