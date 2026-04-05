export type ChatbotReplyType =
  | 'DIRECT_ANSWER'
  | 'CLARIFICATION'
  | 'FALLBACK';

export type ChatbotCtaLink = {
  label: string;
  to: string;
};

export type ChatbotSessionData = {
  sessionId: string;
};

export type ChatbotReplyData = {
  sessionId: string;
  messageId?: number;
  replyType: ChatbotReplyType;
  answer: string;
  confidence: number;
  detectedIntentCode: string | null;
  suggestions: string[];
  ctaLinks: ChatbotCtaLink[];
};

export type ChatbotSuggestionsData = {
  sessionId: string | null;
  pageContext: string | null;
  suggestions: string[];
};

export type SendChatbotMessagePayload = {
  message: string;
  sessionId?: string;
  pageContext?: string;
};

export type ListChatbotSuggestionsPayload = {
  sessionId?: string;
  pageContext?: string;
  limit?: number;
};

export type SendChatbotFeedbackPayload = {
  sessionId: string;
  messageId: number;
  helpful: boolean;
};

export type ChatRole = 'user' | 'bot';

export type ChatUiMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  messageId?: number;
  replyType?: ChatbotReplyType;
  ctaLinks?: ChatbotCtaLink[];
  suggestions?: string[];
  feedbackHelpful?: boolean;
};
