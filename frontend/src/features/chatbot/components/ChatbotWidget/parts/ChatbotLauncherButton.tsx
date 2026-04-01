type ChatbotLauncherButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export function ChatbotLauncherButton({
  isOpen,
  onClick,
}: ChatbotLauncherButtonProps) {
  return (
    <button
      type="button"
      className={`chatbot-launcher ${isOpen ? 'chatbot-launcher--open' : ''}`}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="chatbot-panel"
      aria-label={isOpen ? 'Cerrar asistente PUCH' : 'Abrir asistente PUCH'}
    >
      <span className="chatbot-launcher__icon" aria-hidden="true">
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} />
      </span>
      <span className="chatbot-launcher__text">
        {isOpen ? 'Cerrar chat' : 'Asistente PUCH'}
      </span>
    </button>
  );
}
