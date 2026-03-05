import burkinaFasoProjectImage from '../../../assets/Fotos proyectos equipo puch/burkina faso.jpg';
import type { HomeNewsPreview, NewsItem } from '../types/home.types';

export const HOME_NEWS_PREVIEW: HomeNewsPreview[] = [
  {
    id: 'home-news-1',
    title: 'Lanzamiento del curso PUCH con centros educativos de Asturias',
    date: '2026-02-15',
    excerpt:
      'Arrancamos nuevas sesiones de sensibilización sobre hambre cero con docentes, alumnado y comunidad educativa.',
    category: 'Eventos',
    imageUrl: null,
    imageAlt: 'Tarjeta de noticia sin imagen de portada',
    to: '/noticias',
  },
  {
    id: 'home-news-2',
    title: 'Nuevas acciones comunitarias en Koudougou',
    date: '2026-02-01',
    excerpt:
      'Las huertas agroecológicas avanzan con formación técnica y participación activa de mujeres y jóvenes.',
    category: 'Proyectos',
    imageUrl: null,
    imageAlt: 'Tarjeta de noticia sin imagen de portada',
    to: '/noticias',
  },
  {
    id: 'home-news-3',
    title: 'Equipo PUCH amplía su red de voluntariado local',
    date: '2026-01-20',
    excerpt:
      'La red solidaria continúa creciendo con nuevas personas comprometidas con la sensibilización y la acción.',
    category: 'Voluntariado',
    imageUrl: null,
    imageAlt: 'Tarjeta de noticia sin imagen de portada',
    to: '/noticias',
  },
];

export const LATEST_NEWS: NewsItem[] = HOME_NEWS_PREVIEW.map((news) => ({
  id: news.id,
  title: news.title,
  date: news.date,
  tag: news.category,
  excerpt: news.excerpt,
  image: news.imageUrl ?? burkinaFasoProjectImage,
  to: news.to,
}));
