import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChatbot } from '../../hooks/useChatbot';
import type { ChatbotCtaLink } from '../../types/chatbot.types';
import { QuickFaq } from '../QuickFaq/QuickFaq';
import { ChatbotLauncherButton } from './parts/ChatbotLauncherButton';
import { ChatbotMessageItem } from './parts/ChatbotMessageItem';
import './ChatbotWidget.css';

export function ChatbotWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    messages,
    isSending,
    errorMessage,
    sendMessage,
    loadSuggestions,
    sendFeedback,
  } = useChatbot();

  const pageContext = useMemo(
    () => buildPageContextFromPath(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    const node = messagesContainerRef.current;

    if (!node) {
      return;
    }

    node.scrollTop = node.scrollHeight;
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadSuggestions(pageContext);
  }, [isOpen, loadSuggestions, pageContext]);

  const handleToggle = () => {
    setIsOpen((previous) => !previous);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = draftMessage.trim();

    if (!nextMessage || isSending) {
      return;
    }

    setDraftMessage('');
    void sendMessage(nextMessage, pageContext);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isSending) {
      return;
    }

    setDraftMessage('');
    void sendMessage(suggestion, pageContext);
  };

  const handleCtaClick = (link: ChatbotCtaLink) => {
    if (isExternalLink(link.to)) {
      if (link.to.startsWith('http')) {
        window.open(link.to, '_blank', 'noopener,noreferrer');
        return;
      }

      window.location.href = link.to;
      return;
    }

    navigate(link.to);
    setIsOpen(false);
  };

  const handleFeedback = (messageId: number, helpful: boolean) => {
    void sendFeedback(messageId, helpful);
  };

  const shouldShowQuickFaq = useMemo(() => {
    return messages.length <= 1;
  }, [messages.length]);

  return (
    <aside className={`chatbot-widget ${isOpen ? 'chatbot-widget--open' : ''}`}>
      {isOpen && (
        <div id="chatbot-panel" className="chatbot-panel">
          <header className="chatbot-panel__header">
            <div>
              <p className="chatbot-panel__eyebrow">Asistente virtual</p>
              <h2 className="chatbot-panel__title">Equipo PUCH</h2>
            </div>
            <button
              type="button"
              className="chatbot-panel__close btn btn-sm"
              onClick={handleToggle}
              aria-label="Cerrar asistente"
            >
              <i className="bi bi-x-lg" />
            </button>
          </header>

          <div className="chatbot-panel__messages" ref={messagesContainerRef}>
            {messages.map((message) => (
              <ChatbotMessageItem
                key={message.id}
                message={message}
                onSuggestionClick={handleSuggestionClick}
                onCtaClick={handleCtaClick}
                onFeedback={handleFeedback}
                hideSuggestions={message.id === 'chatbot-welcome'}
              />
            ))}

            {shouldShowQuickFaq && (
              <QuickFaq
                disabled={isSending}
                onSelect={handleSuggestionClick}
              />
            )}

            {isSending && (
              <div className="chatbot-message chatbot-message--bot chatbot-message--typing">
                <span className="chatbot-typing-dot" />
                <span className="chatbot-typing-dot" />
                <span className="chatbot-typing-dot" />
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="chatbot-panel__error" role="status" aria-live="polite">
              {errorMessage}
            </p>
          )}

          <form className="chatbot-panel__composer" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="chatbot-input">
              Escribe tu mensaje
            </label>
            <textarea
              id="chatbot-input"
              className="chatbot-panel__input"
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Escribe tu pregunta..."
              rows={1}
              maxLength={1200}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  const formNode = event.currentTarget.form;

                  if (formNode) {
                    formNode.requestSubmit();
                  }
                }
              }}
            />
            <button
              type="submit"
              className="chatbot-panel__send btn btn-brand-gradient"
              disabled={isSending || draftMessage.trim().length === 0}
            >
              <i className="bi bi-send-fill" aria-hidden="true" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}

      <ChatbotLauncherButton isOpen={isOpen} onClick={handleToggle} />
    </aside>
  );
}

const buildPageContextFromPath = (pathname: string) => {
  return pathname.replace(/\//g, ' ').trim() || 'home';
};

const isExternalLink = (url: string) => {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:')
  );
};
