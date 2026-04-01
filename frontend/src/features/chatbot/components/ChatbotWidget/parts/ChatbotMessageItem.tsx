import type { ChatbotCtaLink, ChatUiMessage } from '../../../types/chatbot.types';

type ChatbotMessageItemProps = {
  message: ChatUiMessage;
  onSuggestionClick: (suggestion: string) => void;
  onCtaClick: (link: ChatbotCtaLink) => void;
};

export function ChatbotMessageItem({
  message,
  onSuggestionClick,
  onCtaClick,
}: ChatbotMessageItemProps) {
  const isBot = message.role === 'bot';

  return (
    <article
      className={`chatbot-message ${
        isBot ? 'chatbot-message--bot' : 'chatbot-message--user'
      }`}
    >
      <p className="chatbot-message__text">{message.text}</p>

      {isBot && Array.isArray(message.ctaLinks) && message.ctaLinks.length > 0 && (
        <div className="chatbot-message__cta-group">
          {message.ctaLinks.map((link) => (
            <button
              key={`${message.id}-${link.to}-${link.label}`}
              type="button"
              className="chatbot-message__cta btn btn-sm"
              onClick={() => onCtaClick(link)}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {isBot &&
        Array.isArray(message.suggestions) &&
        message.suggestions.length > 0 && (
          <div className="chatbot-message__suggestions">
            {message.suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={`${message.id}-${suggestion}`}
                type="button"
                className="chatbot-message__suggestion btn btn-sm"
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
    </article>
  );
}
