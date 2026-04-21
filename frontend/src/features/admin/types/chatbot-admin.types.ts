export type ChatbotMetricsData = {
  totalMessages: number;
  directAnswerRate: number;
  clarificationRate: number;
  fallbackRate: number;
  avgResponseTimeMs: number;
  topIntents: { code: string; count: number }[];
  topUnresolved: { normalizedText: string; occurrences: number }[];
  feedbackHelpfulnessRate: number;
};

export type ChatbotUnresolvedQuestion = {
  id: number;
  normalizedText: string;
  sampleText: string;
  pageContext: string | null;
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt: string | null;
  resolvedById: number | null;
};

export type ChatbotKnowledgeItem = {
  id: number;
  intentId: number | null;
  intentCode: string | null;
  questionCanonical: string;
  answer: string;
  tags: string[];
  route: string | null;
  ctaLinks: { label: string; to: string }[];
  isActive: boolean;
  updatedAt: string;
  updatedById: number | null;
};

export type ChatbotKnowledgeList = {
  items: ChatbotKnowledgeItem[];
  total: number;
};

export type ChatbotIntentPhrase = {
  id: number;
  text: string;
  language: string;
  weight: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedById: number | null;
};

export type ChatbotIntentItem = {
  id: number;
  code: string;
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  updatedAt: string;
  updatedById: number | null;
  phrases: ChatbotIntentPhrase[];
};
