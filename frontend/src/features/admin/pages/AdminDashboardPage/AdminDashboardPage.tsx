import { DashboardActivity } from '../../components/dashboard/DashboardActivity/DashboardActivity';
import { DashboardStats, type DashboardStatistic } from '../../components/dashboard/DashboardStats/DashboardStats';
import './AdminDashboardPage.css';

const stats: DashboardStatistic[] = [
  {
    label: 'Noticias publicadas',
    value: '3',
    detail: 'Lanzamiento campaña reciente',
    icon: <i className="bi bi-newspaper" aria-hidden="true" />,
  },
  {
    label: 'Retos activos',
    value: '2',
    detail: 'Actualizados esta semana',
    icon: <i className="bi bi-bullseye" aria-hidden="true" />,
  },
  {
    label: 'Libros humanos',
    value: '6',
    detail: 'Pendientes de revisión',
    icon: <i className="bi bi-book-half" aria-hidden="true" />,
  },
  {
    label: 'Superhéroes reales',
    value: '1.247',
    detail: 'Historias verificadas',
    icon: <i className="bi bi-people-fill" aria-hidden="true" />,
  },
];

const activities = [
  'Lanzamiento de campaña “Agua de vida” publicado',
  'Reto “Una granja en 30 días” actualizado con nuevos donantes',
  'Nuevo libro humano pendiente de revisión en Asturias',
  'Superhéroes reales aprobados: +3 este mes',
];

export const AdminDashboardPage = () => (
  <section className="admin-dashboard-page">
    <DashboardStats stats={stats} />
    <DashboardActivity items={activities} />
  </section>
);
