import { ChatReplyType } from 'generated/prisma/client';

export type ChatbotCtaLink = {
  label: string;
  to: string;
};

export type ChatbotReplyData = {
  sessionId: string;
  replyType: ChatReplyType;
  answer: string;
  confidence: number;
  detectedIntentCode: string | null;
  suggestions: string[];
  ctaLinks: ChatbotCtaLink[];
};

export type KnowledgeCandidate = {
  id: number;
  intentCode: string | null;
  questionCanonical: string;
  answer: string;
  tags: string[];
  route: string | null;
  ctaLinks: ChatbotCtaLink[];
  phrases: string[];
};

export type ScoredCandidate = {
  candidate: KnowledgeCandidate;
  score: number;
};
