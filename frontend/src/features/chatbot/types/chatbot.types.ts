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
  replyType: ChatbotReplyType;
  answer: string;
  confidence: number;
  detectedIntentCode: string | null;
  suggestions: string[];
  ctaLinks: ChatbotCtaLink[];
};

export type SendChatbotMessagePayload = {
  message: string;
  sessionId?: string;
  pageContext?: string;
};

export type ChatRole = 'user' | 'bot';

export type ChatUiMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  replyType?: ChatbotReplyType;
  ctaLinks?: ChatbotCtaLink[];
  suggestions?: string[];
};
