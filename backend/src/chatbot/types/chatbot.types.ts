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

export type ScoreBreakdown = {
  keywordScore: number;
  fuzzyScore: number;
  semanticScore: number;
  contextScore: number;
  finalScore: number;
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
  scoreBreakdown: ScoreBreakdown;
};

export type MatchingSessionContext = {
  lastDetectedIntentCode: string | null;
  lastMessageAt: Date | null;
  startedAt: Date | null;
};

export type MatchingThresholds = {
  directAnswer: number;
  clarification: number;
};

export type MatchingWeights = {
  keyword: number;
  fuzzy: number;
  semantic: number;
  context: number;
};

export type ChatbotSuggestionsData = {
  sessionId: string | null;
  pageContext: string | null;
  suggestions: string[];
};
