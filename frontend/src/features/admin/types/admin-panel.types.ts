export type AdminMetricKey =
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

export type AdminUser = {
  id: number;
  name: string;
  surname: string;
  email: string;
  roles: string[];
  deletedAt?: string | null;
  updatedAt: string;
};
