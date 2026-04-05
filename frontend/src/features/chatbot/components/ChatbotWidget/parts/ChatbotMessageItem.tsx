import type { ChatbotCtaLink, ChatUiMessage } from '../../../types/chatbot.types';

type ChatbotMessageItemProps = {
  message: ChatUiMessage;
  onSuggestionClick: (suggestion: string) => void;
  onCtaClick: (link: ChatbotCtaLink) => void;
  onFeedback: (messageId: number, helpful: boolean) => void;
};

export function ChatbotMessageItem({
  message,
  onSuggestionClick,
  onCtaClick,
  onFeedback,
}: ChatbotMessageItemProps) {
  const isBot = message.role === 'bot';
  const feedbackMessageId =
    typeof message.messageId === 'number' ? message.messageId : null;

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

      {isBot && feedbackMessageId !== null && (
        <div className="chatbot-message__feedback">
          <button
            type="button"
            className={`chatbot-message__feedback-btn btn btn-sm ${
              message.feedbackHelpful === true
                ? 'chatbot-message__feedback-btn--active'
                : ''
            }`}
            aria-label="Esta respuesta me ayudó"
            onClick={() => onFeedback(feedbackMessageId, true)}
          >
            <i className="bi bi-hand-thumbs-up" />
          </button>
          <button
            type="button"
            className={`chatbot-message__feedback-btn btn btn-sm ${
              message.feedbackHelpful === false
                ? 'chatbot-message__feedback-btn--active'
                : ''
            }`}
            aria-label="Esta respuesta no me ayudó"
            onClick={() => onFeedback(feedbackMessageId, false)}
          >
            <i className="bi bi-hand-thumbs-down" />
          </button>
        </div>
      )}
    </article>
  );
}
