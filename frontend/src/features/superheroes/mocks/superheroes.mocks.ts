import heroBurkinaFasoImage from '../../../assets/superheroes/6-BURKINA FASO-SUPERHEROES OK-08.png';
import heroHaitiImage from '../../../assets/superheroes/4- HAT-REP DOM-SUPERHEROES OK-10.png';
import heroIndiaImage from '../../../assets/superheroes/5-INDIA-SUPERHEROE .png';
import heroPresentationImage from '../../../assets/superheroes/1-- SUPERHEROES OK-18.png';
import heroSecondImage from '../../../assets/superheroes/2--SUPERHEROES OK-04.png';
import heroThirdImage from '../../../assets/superheroes/3-SUPERHEROES OK-14.png';
import type { SuperheroItem } from '../types/superheroes.types';

const SUPERHEROES_MOCK_ITEMS: SuperheroItem[] = [
  {
    id: 41,
    name: 'Equipo PUCH',
    slug: 'equipo-puch',
    description:
      'Colectivo internacional que acompaña proyectos de seguridad alimentaria y formación crítica con humildad, rigor y empatía.',
    quote:
      '“Somos personas reales, sin capa, pero con ganas enormes de iluminar espacios donde el hambre todavía persiste.”',
    country: 'Global',
    imageUrl: heroPresentationImage,
    sortOrder: 0,
    status: 'PUBLISHED',
    createdAt: '2026-03-02T10:00:00.000Z',
  },
  {
    id: 42,
    name: 'Superhéroe India',
    slug: 'superheroe-india',
    description:
      'Acompaña comunidades Dalit con programas de ganadería familiar, liderazgo y acompañamiento pedagógico.',
    quote:
      '“La dignidad no se improvisa: se construye con trabajo en equipo y compromiso sostenido.”',
    country: 'India',
    imageUrl: heroIndiaImage,
    sortOrder: 1,
    status: 'PUBLISHED',
    createdAt: '2026-02-25T13:20:00.000Z',
  },
  {
    id: 43,
    name: 'Superhéroe Burkina Faso',
    slug: 'superheroe-burkina-faso',
    description:
      'Diseña huertas agroecológicas y sistemas de riego solar para que mujeres y jóvenes lideren la soberanía alimentaria.',
    quote:
      '“Cuando una huerta florece, florece toda la comunidad.”',
    country: 'Burkina Faso',
    imageUrl: heroBurkinaFasoImage,
    sortOrder: 2,
    status: 'PUBLISHED',
    createdAt: '2026-02-20T09:45:00.000Z',
  },
  {
    id: 44,
    name: 'Superhéroe Haití y Rep. Dominicana',
    slug: 'superheroe-haiti-republica-dominicana',
    description:
      'Combina ayuda humanitaria inmediata con formación para fortalecer redes de resiliencia fronteriza.',
    quote:
      '“Hay más fuerza en los lazos que en la distancia.”',
    country: 'Haití / República Dominicana',
    imageUrl: heroHaitiImage,
    sortOrder: 3,
    status: 'PUBLISHED',
    createdAt: '2026-02-14T14:05:00.000Z',
  },
  {
    id: 45,
    name: 'Superhéroe Desafío',
    slug: 'superheroe-desafio',
    description:
      'Impulsa sistemas de captación y gestión de agua en territorios que enfrentan sequías prolongadas.',
    quote:
      '“Sembrar resiliencia es sembrar esperanza.”',
    country: 'Koudougou',
    imageUrl: heroSecondImage,
    sortOrder: 4,
    status: 'PUBLISHED',
    createdAt: '2026-02-10T11:20:00.000Z',
  },
  {
    id: 46,
    name: 'Superhéroe Comunidad',
    slug: 'superheroe-comunidad',
    description:
      'Difunde testimonios visuales, campañas y procesos participativos para acercar la causa del hambre cero.',
    quote:
      '“Contar historias reales ayuda a que más personas se unan a este movimiento.”',
    country: 'Global',
    imageUrl: heroThirdImage,
    sortOrder: 5,
    status: 'PUBLISHED',
    createdAt: '2026-02-05T15:10:00.000Z',
  },
];

export function getMockSuperheroes(): SuperheroItem[] {
  return SUPERHEROES_MOCK_ITEMS;
}
