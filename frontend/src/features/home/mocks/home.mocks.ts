import type { NewsItem, StatItem } from '../types/home.types';

export const HOME_STATS: StatItem[] = [
  { label: 'Proyectos activos', value: '+50' },
  { label: 'Voluntarios', value: '+200' },
  { label: 'Paises', value: '15' },
  { label: 'Beneficiarios', value: '+5000' },
];

export const LATEST_NEWS: NewsItem[] = [
  {
    title: 'Nueva campana educativa en comunidades rurales',
    date: '2026-02-01',
    tag: 'Cooperacion',
    excerpt:
      'Iniciamos una nueva linea de apoyo educativo para mejorar el acceso a formacion basica.',
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Jornada de voluntariado con participacion record',
    date: '2026-01-20',
    tag: 'Voluntariado',
    excerpt:
      'Mas de 200 personas participaron en actividades de sensibilizacion y apoyo comunitario.',
    image:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Comercio justo: nuevos productores aliados',
    date: '2026-01-08',
    tag: 'Comercio Justo',
    excerpt:
      'Ampliamos la red de productores locales para impulsar consumo responsable e ingresos dignos.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  },
];
