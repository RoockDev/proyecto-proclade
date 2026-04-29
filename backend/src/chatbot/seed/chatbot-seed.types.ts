export type ChatbotSeedIntent = {
  code: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
};

export type ChatbotSeedIntentPhrase = {
  intentCode: string;
  text: string;
  language: 'es';
  weight: number;
  isActive: boolean;
};

export type ChatbotSeedCtaLink = {
  label: string;
  to: string;
};

export type ChatbotSeedKnowledgeItem = {
  intentCode: string;
  questionCanonical: string;
  answer: string;
  tags: string[];
  route: string | null;
  ctaLinks: ChatbotSeedCtaLink[];
  isActive: boolean;
};
