import type {
  AdminListBlock,
  AdminMetric,
  AdminQuickAction,
} from '../types/admin-panel.types';

export const adminMetricsMock: AdminMetric[] = [
  {
    key: 'activeCampaigns',
    label: 'Campañas Activas',
    value: 3,
    accent: 'primary',
  },
  {
    key: 'pendingRequests',
    label: 'Solicitudes Pendientes',
    value: 2,
    accent: 'warning',
  },
  {
    key: 'pendingProposals',
    label: 'Propuestas Pendientes',
    value: 1,
    accent: 'info',
  },
  {
    key: 'unreadMessages',
    label: 'Mensajes sin leer',
    value: 1,
    accent: 'success',
  },
];

export const adminListBlocksMock: AdminListBlock[] = [
  {
    key: 'latestRequests',
    title: 'Últimas Solicitudes',
    items: [
      {
        id: 'request-1',
        title: 'Laura Fernández',
        subtitle: 'Voluntariado',
        date: '2025-12-10',
        status: 'PENDIENTE',
      },
      {
        id: 'request-2',
        title: 'Miguel Torres',
        subtitle: 'Socio',
        date: '2025-12-08',
        status: 'APROBADO',
      },
      {
        id: 'request-3',
        title: 'Elena Ruiz',
        subtitle: 'Contacto',
        date: '2025-12-05',
        status: 'PENDIENTE',
      },
      {
        id: 'request-4',
        title: 'Javier Moreno',
        subtitle: 'Donación',
        date: '2025-12-01',
        status: 'RECHAZADO',
      },
    ],
  },
  {
    key: 'productProposals',
    title: 'Propuestas de Productos',
    items: [
      {
        id: 'proposal-1',
        title: 'Quinoa orgánica',
        subtitle: 'BioAndes',
        date: '2025-12-12',
        status: 'PENDIENTE',
      },
      {
        id: 'proposal-2',
        title: 'Cestería artesanal',
        subtitle: 'ArteManos',
        date: '2025-12-08',
        status: 'APROBADO',
      },
      {
        id: 'proposal-3',
        title: 'Aceite de argán',
        subtitle: 'CoopArgán',
        date: '2025-11-25',
        status: 'PUBLICADO',
      },
      {
        id: 'proposal-4',
        title: 'Especias de Tanzania',
        subtitle: 'SpiceFair',
        date: '2025-11-20',
        status: 'RECHAZADO',
      },
    ],
  },
];

export const adminQuickActionsMock: AdminQuickAction[] = [
  {
    id: 'new-campaign',
    label: 'Nueva Campaña',
    icon: 'bi bi-plus-lg',
    variant: 'solid',
    target: '/admin/campanas/nueva',
  },
  {
    id: 'new-news',
    label: 'Nueva Noticia',
    icon: 'bi bi-plus-lg',
    variant: 'outline',
    target: '/admin/noticias/nueva',
  },
  {
    id: 'view-requests',
    label: 'Ver Solicitudes',
    icon: 'bi bi-inbox',
    variant: 'outline',
    target: '/admin/solicitudes',
  },
];
