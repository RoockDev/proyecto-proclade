import type { MissionCard, SuperheroPreview } from '../types/home.types';

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

export const SUPERHEROES_PREVIEW: SuperheroPreview[] = [
  {
    name: 'La Maestra Semilla',
    speech: '“Cada lección planta una semilla de esperanza.”',
    imageKey: 'hero-maestra',
  },
  {
    name: 'El Abuelo Tierra',
    speech: '“La tierra nos da todo si la cuidamos con amor.”',
    imageKey: 'hero-agricultor',
  },
  {
    name: 'Lía Mundo',
    speech: '“¡El mundo cambia cuando nos unimos!”',
    imageKey: 'hero-estudiante',
  },
  {
    name: 'Don Reparto',
    speech: '“Cada caja que entrego lleva un pedacito de corazón.”',
    imageKey: 'hero-voluntario',
  },
];
