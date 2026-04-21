export type QuickFaqItem = {
  id: string;
  label: string;
  message: string;
  order: number;
  isActive: boolean;
};

export const QUICK_FAQ_ITEMS: QuickFaqItem[] = [
  {
    id: 'faq-donate',
    label: '💰 ¿Cómo puedo donar?',
    message: '¿Cómo puedo donar a Equipo PUCH?',
    order: 1,
    isActive: true,
  },
  {
    id: 'faq-volunteer',
    label: '🤝 ¿Cómo colaborar?',
    message: '¿Cómo puedo colaborar o hacer voluntariado?',
    order: 2,
    isActive: true,
  },
  {
    id: 'faq-projects',
    label: '🌍 Proyectos actuales',
    message: '¿Qué proyectos apoyáis actualmente?',
    order: 3,
    isActive: true,
  },
  {
    id: 'faq-news',
    label: '📰 Noticias recientes',
    message: '¿Dónde puedo ver noticias de la iniciativa?',
    order: 4,
    isActive: true,
  },
  {
    id: 'faq-about',
    label: '❓ ¿Qué es Equipo PUCH?',
    message: '¿Qué es Equipo PUCH y cuál es su objetivo?',
    order: 5,
    isActive: true,
  },
];

const MAX_VISIBLE_FAQS = 6;

export function getVisibleFaqs(): QuickFaqItem[] {
  return QUICK_FAQ_ITEMS.filter((faq) => faq.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_VISIBLE_FAQS);
}
