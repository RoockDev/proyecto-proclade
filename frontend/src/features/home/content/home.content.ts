import burkinaFasoProjectImage from '../../../assets/Fotos proyectos equipo puch/burkina faso.jpg';
import haitiRepDominicanaProjectImage from '../../../assets/Fotos proyectos equipo puch/haiti-republica dominicana .jpg';
import superheroPresentationImage from '../../../assets/superheroes/1-- SUPERHEROES OK-18.png';
import superheroHaitiRepDominicanaImage from '../../../assets/superheroes/4- HAT-REP DOM-SUPERHEROES OK-10.png';
import superheroIndiaImage from '../../../assets/superheroes/5-INDIA-SUPERHEROE .png';
import superheroBurkinaFasoImage from '../../../assets/superheroes/6-BURKINA FASO-SUPERHEROES OK-08.png';
import type {
  HomeCounter,
  HomeCountryProject,
  HomeJoinReason,
  MissionCard,
  SuperheroPreview,
} from '../types/home.types';

export const MISSION_CARDS: MissionCard[] = [
  {
    title: 'Conciencia crítica',
    description:
      'Entender las causas del hambre y cómo nos afecta a todos, desde lo local hasta lo global.',
    icon: 'bi-book',
  },
  {
    title: 'Responsabilidad compartida',
    description:
      'Sentir que el hambre no es un problema ajeno. Cada persona puede ser parte de la solución.',
    icon: 'bi-people',
  },
  {
    title: 'Acción local y global',
    description:
      'Promover acciones concretas en nuestras comunidades que contribuyan a un cambio real y sostenible.',
    icon: 'bi-bullseye',
  },
];

export const WHO_WE_ARE_INTRO =
  'Equipo PUCH: Personas Unidas Contra el Hambre. Cada curso apoyamos proyectos concretos para avanzar hacia el ODS 2: Hambre Cero y transformar pequeñas aportaciones en cambios reales.';

export const WHO_WE_ARE_SCOPE =
  'Este año el Equipo PUCH trabaja en India, Burkina Faso y Haití/República Dominicana para fortalecer la seguridad alimentaria, la autonomía de las comunidades y su resiliencia.';

export const HOME_COUNTRY_PROJECTS: HomeCountryProject[] = [
  {
    id: 'india',
    countryLabel: 'India',
    title: 'Derechos humanos y ganadería en Dindigul y Karumathur',
    description:
      'Apoyamos a mujeres Dalit en situación de pobreza estructural con entrega de ganado, formación en gestión económica y liderazgo, y talleres familiares para fomentar la igualdad y la convivencia.',
    imageUrl: null,
    imageAlt: 'Placeholder del proyecto de India',
  },
  {
    id: 'burkina-faso',
    countryLabel: 'Burkina Faso',
    title: 'Soberanía alimentaria en Koudougou',
    description:
      'Creamos huertas agroecológicas con riego solar, pozos de agua y granjas comunitarias. Mujeres y jóvenes reciben formación en agricultura sostenible, finanzas y liderazgo.',
    imageUrl: burkinaFasoProjectImage,
    imageAlt: 'Proyecto de soberanía alimentaria en Koudougou, Burkina Faso',
  },
  {
    id: 'haiti-republica-dominicana',
    countryLabel: 'Haití y República Dominicana',
    title: 'Seguridad y soberanía alimentaria en Enriquillo',
    description:
      'Trabajamos con comunidades rurales y migrantes en situación de extrema vulnerabilidad, combinando ayuda humanitaria inmediata con formación para la autosuficiencia.',
    imageUrl: haitiRepDominicanaProjectImage,
    imageAlt:
      'Proyecto de seguridad alimentaria en Enriquillo, Haití y República Dominicana',
  },
];

export const HOME_JOIN_TEAM_TITLE = '¿Cómo unirse al Equipo PUCH?';

export const HOME_JOIN_TEAM_INTRO =
  'Los proyectos del Equipo PUCH son posibles gracias a personas valientes que luchan por mejorar sus vidas y las de sus comunidades.';

export const HOME_JOIN_REASONS: HomeJoinReason[] = [
  {
    id: 'sensibilizar',
    text: 'Sensibilizar y contar historias que muchas veces permanecen invisibles.',
  },
  {
    id: 'red-solidaria',
    text: 'Formar parte de una red solidaria que trabaja por el Hambre Cero.',
  },
  {
    id: 'apoyo-economico',
    text: 'Apoyar económicamente los proyectos para luchar contra el hambre.',
  },
];

export const HOME_JOIN_CLOSING_MESSAGE =
  'Una misma insignia. Un mismo equipo. Una misma meta: acabar con el hambre.';

export const SUPERHERO_IMAGES_BY_KEY: Record<string, string> = {
  'hero-presentacion': superheroPresentationImage,
  'hero-india': superheroIndiaImage,
  'hero-burkina-faso': superheroBurkinaFasoImage,
  'hero-haiti-republica-dominicana': superheroHaitiRepDominicanaImage,
};

export const SUPERHEROES_PREVIEW: SuperheroPreview[] = [
  {
    id: 'presentacion',
    name: 'Equipo PUCH',
    speech:
      '“¡Hola! Somos Personas Unidas Contra el Hambre. No llevamos capa mágica, pero sí compromiso.”',
    imageKey: 'hero-presentacion',
  },
  {
    id: 'india',
    name: 'Superhéroe India',
    speech:
      '“En India trabajamos con comunidades Dalit, fortaleciendo su dignidad y su independencia económica a través de la ganadería.”',
    imageKey: 'hero-india',
  },
  {
    id: 'burkina-faso',
    name: 'Superhéroe Burkina Faso',
    speech:
      '“En Koudougou creamos huertas agroecológicas con riego solar y apoyamos pequeñas granjas para fortalecer la comunidad.”',
    imageKey: 'hero-burkina-faso',
  },
  {
    id: 'haiti-republica-dominicana',
    name: 'Superhéroe Haití y Rep. Dominicana',
    speech:
      '“En la frontera ayudamos a crear huertas agroecológicas, sistemas de riego y espacios de formación.”',
    imageKey: 'hero-haiti-republica-dominicana',
  },
];

export const HOME_REAL_HEROES_COUNTER: HomeCounter = {
  value: 1247,
  label: 'superhéroes reales y contando',
};
