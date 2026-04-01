const CHATBOT_SESSION_STORAGE_KEY = 'chatbotSessionId';
const isBrowser = typeof window !== 'undefined';

export function getChatbotSessionId(): string | null {
  if (!isBrowser) {
    return null;
  }

  return localStorage.getItem(CHATBOT_SESSION_STORAGE_KEY);
}

export function saveChatbotSessionId(sessionId: string): void {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(CHATBOT_SESSION_STORAGE_KEY, sessionId);
}

export function clearChatbotSessionId(): void {
  if (!isBrowser) {
    return;
  }

  localStorage.removeItem(CHATBOT_SESSION_STORAGE_KEY);
}
