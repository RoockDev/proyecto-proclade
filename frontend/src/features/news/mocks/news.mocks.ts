import burkinaFasoProjectImage from '../../../assets/Fotos proyectos equipo puch/burkina faso.jpg';
import haitiRepDominicanaProjectImage from '../../../assets/Fotos proyectos equipo puch/haiti-republica dominicana .jpg';
import superheroPresentationImage from '../../../assets/superheroes/1-- SUPERHEROES OK-18.png';
import superheroHaitiRepDominicanaImage from '../../../assets/superheroes/4- HAT-REP DOM-SUPERHEROES OK-10.png';
import superheroIndiaImage from '../../../assets/superheroes/5-INDIA-SUPERHEROE .png';
import superheroBurkinaFasoImage from '../../../assets/superheroes/6-BURKINA FASO-SUPERHEROES OK-08.png';
import type { NewsItem } from '../types/news.types';
import { normalizeNewsCollection } from '../utils/news.mapper';

const RAW_NEWS_MOCKS: NewsItem[] = [
  {
    id: 1001,
    title: 'Equipo PUCH inicia nuevas sesiones en centros educativos de Asturias',
    slug: 'equipo-puch-inicia-sesiones-asturias',
    excerpt:
      'Comenzamos un nuevo ciclo de talleres para sensibilizar sobre el ODS 2 y conectar a alumnado y profesorado con acciones concretas.',
    content:
      'Durante el inicio del curso, Equipo PUCH ha puesto en marcha una nueva ronda de sesiones en centros educativos de Asturias. El objetivo principal es acercar la realidad del hambre desde una mirada crítica y participativa.\n\nLas actividades incluyen dinámicas en aula, trabajo por equipos y propuestas de acción local. Además, se han compartido testimonios reales de comunidades acompañadas por Fundación PROCLADE para reforzar el compromiso del alumnado.',
    imageUrl: superheroPresentationImage,
    status: 'PUBLISHED',
    publishedAt: '2026-03-02T10:30:00.000Z',
    createdAt: '2026-03-01T09:10:00.000Z',
    category: 'Educación',
  },
  {
    id: 1002,
    title: 'Avances en huertas agroecológicas de Koudougou',
    slug: 'avances-huertas-agroecologicas-koudougou',
    excerpt:
      'Las comunidades de Burkina Faso amplían sus huertas con nuevos sistemas de riego y formación técnica para mujeres y jóvenes.',
    content:
      'El equipo local de Koudougou ha ampliado la superficie de cultivo comunitario con apoyo técnico y acompañamiento formativo. Esta fase se centra en fortalecer la producción local y reducir la dependencia de ayudas puntuales.\n\nLas sesiones de formación han incluido manejo de suelos, riego eficiente y planificación de cosechas. Las participantes destacan una mejora clara en la organización comunitaria y en la autonomía alimentaria.',
    imageUrl: burkinaFasoProjectImage,
    status: 'PUBLISHED',
    publishedAt: '2026-02-25T12:00:00.000Z',
    createdAt: '2026-02-24T17:15:00.000Z',
    category: 'Proyectos',
  },
  {
    id: 1003,
    title: 'Nueva red de voluntariado para sensibilización local',
    slug: 'nueva-red-voluntariado-sensibilizacion-local',
    excerpt:
      'La campaña suma nuevas personas voluntarias para impulsar actividades de concienciación y difusión en barrios y centros juveniles.',
    content:
      'Equipo PUCH ha reforzado su red de voluntariado con nuevas incorporaciones en distintas ciudades. Esta red tendrá un papel clave para acercar la campaña a espacios comunitarios y juveniles.\n\nLa coordinación se apoyará en un calendario común de acciones y materiales pedagógicos compartidos. El objetivo es mantener una presencia constante que invite a la participación social.',
    imageUrl: superheroIndiaImage,
    status: 'PUBLISHED',
    publishedAt: '2026-02-20T08:45:00.000Z',
    createdAt: '2026-02-19T16:00:00.000Z',
    category: 'Voluntariado',
  },
  {
    id: 1004,
    title: 'Encuentro de coordinación entre equipos de India y España',
    slug: 'encuentro-coordinacion-india-espana',
    excerpt:
      'El encuentro online permitió revisar objetivos del trimestre y compartir buenas prácticas de formación con comunidades Dalit.',
    content:
      'Los equipos de India y España han mantenido una sesión de coordinación para evaluar avances de los últimos meses. Se revisaron indicadores de participación, sostenibilidad y aprendizaje comunitario.\n\nTambién se acordó reforzar el intercambio de metodologías para mejorar la calidad de las acciones formativas y su seguimiento en territorio.',
    imageUrl: superheroIndiaImage,
    status: 'PUBLISHED',
    publishedAt: '2026-02-14T14:05:00.000Z',
    createdAt: '2026-02-13T10:00:00.000Z',
    category: 'Cooperación',
  },
  {
    id: 1005,
    title: 'Haití y República Dominicana: apoyo a comunidades fronterizas',
    slug: 'haiti-republica-dominicana-apoyo-fronterizo',
    excerpt:
      'Las acciones combinan ayuda inmediata y formación para mejorar la seguridad alimentaria y la resiliencia comunitaria.',
    content:
      'En la zona fronteriza se han reforzado las actividades de apoyo a familias en situación de alta vulnerabilidad. El plan combina respuesta humanitaria inmediata con procesos formativos para la autosuficiencia.\n\nLas comunidades están participando en espacios de capacitación sobre huertas, almacenamiento y gestión de recursos básicos para sostener los avances a medio plazo.',
    imageUrl: haitiRepDominicanaProjectImage,
    status: 'PUBLISHED',
    publishedAt: '2026-02-09T09:20:00.000Z',
    createdAt: '2026-02-08T11:30:00.000Z',
    category: 'Territorio',
  },
  {
    id: 1006,
    title: 'Historias que cuentan: testimonios del Equipo PUCH',
    slug: 'historias-que-cuentan-testimonios-equipo-puch',
    excerpt:
      'Nueva serie audiovisual para visibilizar experiencias de personas que transforman su comunidad con acciones cotidianas.',
    content:
      'Se ha lanzado una nueva serie de testimonios para dar voz a personas que participan en la campaña desde distintos contextos. Cada historia muestra cómo la acción comunitaria genera cambios reales.\n\nLa iniciativa busca sensibilizar de forma cercana y motivar la implicación de nuevos grupos en torno al objetivo de Hambre Cero.',
    imageUrl: superheroPresentationImage,
    status: 'PUBLISHED',
    publishedAt: '2026-01-30T13:40:00.000Z',
    createdAt: '2026-01-29T15:50:00.000Z',
    category: 'Comunicación',
  },
  {
    id: 1007,
    title: 'Formación en liderazgo comunitario para jóvenes',
    slug: 'formacion-liderazgo-comunitario-jovenes',
    excerpt:
      'El programa refuerza habilidades de liderazgo y gestión para que jóvenes impulsen acciones sostenibles en sus barrios.',
    content:
      'La nueva fase formativa está dirigida a jóvenes con interés en impulsar iniciativas de impacto social. Se trabajan competencias de coordinación, comunicación y planificación de proyectos.\n\nLas personas participantes presentarán propuestas locales que podrán conectarse con otras líneas de trabajo de Equipo PUCH.',
    imageUrl: superheroBurkinaFasoImage,
    status: 'PUBLISHED',
    publishedAt: '2026-01-22T11:10:00.000Z',
    createdAt: '2026-01-21T09:30:00.000Z',
    category: 'Formación',
  },
  {
    id: 1008,
    title: 'Refuerzo de sistemas de riego solar en Burkina Faso',
    slug: 'refuerzo-riego-solar-burkina-faso',
    excerpt:
      'Se han instalado nuevos puntos de riego para mejorar la continuidad productiva durante periodos de mayor sequía.',
    content:
      'La instalación de nuevos sistemas de riego solar en Burkina Faso permitirá optimizar el uso del agua en parcelas comunitarias. Esta mejora técnica se acompaña de sesiones prácticas de mantenimiento.\n\nEl objetivo es asegurar estabilidad productiva y reducir riesgos en épocas de menor disponibilidad hídrica.',
    imageUrl: burkinaFasoProjectImage,
    status: 'PUBLISHED',
    publishedAt: '2026-01-15T16:25:00.000Z',
    createdAt: '2026-01-14T10:20:00.000Z',
    category: 'Infraestructura',
  },
  {
    id: 1009,
    title: 'Campaña de invierno: más participación social en la Home',
    slug: 'campana-invierno-mas-participacion-social',
    excerpt:
      'La campaña digital incrementa el alcance de mensajes sobre hambre cero y abre nuevas vías de colaboración ciudadana.',
    content:
      'Durante la campaña de invierno se ha reforzado la estrategia digital para conectar con más personas interesadas en colaborar. Se han publicado materiales educativos y llamadas a la acción desde la Home de la web.\n\nLos resultados iniciales muestran mayor interacción y una subida de visitas en contenidos de sensibilización.',
    imageUrl: null,
    status: 'PUBLISHED',
    publishedAt: '2026-01-10T08:00:00.000Z',
    createdAt: '2026-01-09T08:00:00.000Z',
    category: 'Campaña',
  },
  {
    id: 1010,
    title: 'Superhéroes PUCH: nueva galería de testimonios visuales',
    slug: 'superheroes-puch-nueva-galeria-testimonios',
    excerpt:
      'La nueva galería presenta historias visuales que reflejan compromiso, diversidad y trabajo comunitario.',
    content:
      'La sección de Superhéroes PUCH incorpora nuevas piezas visuales para mostrar iniciativas locales y experiencias de cambio. Las imágenes destacan el trabajo colectivo y la diversidad de perfiles que participan.\n\nEste material servirá también como apoyo en actividades educativas y dinámicas de sensibilización en aula.',
    imageUrl: superheroHaitiRepDominicanaImage,
    status: 'PUBLISHED',
    publishedAt: '2026-01-04T18:00:00.000Z',
    createdAt: '2026-01-03T12:00:00.000Z',
    category: 'Historias',
  },
  {
    id: 1011,
    title: 'Jornada de trabajo en red con entidades colaboradoras',
    slug: 'jornada-trabajo-red-entidades-colaboradoras',
    excerpt:
      'Las entidades participantes comparten aprendizajes para mejorar la coordinación en acciones de incidencia social.',
    content:
      'Equipo PUCH ha celebrado una jornada de trabajo en red con entidades colaboradoras para alinear objetivos y fortalecer sinergias. El encuentro permitió detectar necesidades comunes y áreas de mejora conjunta.\n\nSe acordó mantener espacios periódicos de seguimiento para sostener la coordinación a lo largo del curso.',
    imageUrl: superheroPresentationImage,
    status: 'PUBLISHED',
    publishedAt: '2025-12-27T10:00:00.000Z',
    createdAt: '2025-12-26T09:00:00.000Z',
    category: 'Red',
  },
  {
    id: 1012,
    title: 'Balance trimestral de acciones contra el hambre',
    slug: 'balance-trimestral-acciones-contra-el-hambre',
    excerpt:
      'El balance refleja crecimiento en participación, consolidación de proyectos y mayor impacto en sensibilización.',
    content:
      'El último balance trimestral recoge una evolución positiva en las principales líneas de trabajo de Equipo PUCH. Destacan el aumento de participación y la continuidad de proyectos en territorios priorizados.\n\nEl informe también identifica retos para el siguiente periodo, especialmente en seguimiento de indicadores y coordinación de equipos.',
    imageUrl: null,
    status: 'PUBLISHED',
    publishedAt: '2025-12-18T15:35:00.000Z',
    createdAt: '2025-12-17T12:20:00.000Z',
    category: 'Informe',
  },
];

export const NEWS_MOCK_ITEMS: NewsItem[] = normalizeNewsCollection(RAW_NEWS_MOCKS);

export function getMockNewsList(): NewsItem[] {
  return NEWS_MOCK_ITEMS;
}

export function getMockLatestNews(limit: number): NewsItem[] {
  return NEWS_MOCK_ITEMS.slice(0, Math.max(limit, 0));
}

export function getMockNewsBySlug(slug: string): NewsItem | null {
  const item = NEWS_MOCK_ITEMS.find((news) => news.slug === slug);
  return item ?? null;
}
