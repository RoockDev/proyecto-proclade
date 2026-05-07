import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import './TutorialVideoModal.css';

type TutorialVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  durationLabel: string;
  videoEmbedUrl: string;
  videoWatchUrl: string;
};

export const TutorialVideoModal = ({
  isOpen,
  onClose,
  title,
  durationLabel,
  videoEmbedUrl,
  videoWatchUrl,
}: TutorialVideoModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="tutorial-video-modal__backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <section
        className="tutorial-video-modal__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-video-title"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="tutorial-video-modal__close"
          aria-label="Cerrar vídeo tutorial"
          onClick={onClose}
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>

        <header className="tutorial-video-modal__header">
          <h2 id="tutorial-video-title" className="tutorial-video-modal__title">
            {title}
          </h2>
          <p className="tutorial-video-modal__subtitle">
            Guía rápida para registro, inicio de sesión, navegación y uso de funciones públicas.
          </p>
        </header>

        <p className="tutorial-video-modal__duration">{durationLabel}</p>

        <div className="tutorial-video-modal__frame-wrap">
          <iframe
            title="Vídeo tutorial de uso público de Equipo PUCH"
            src={videoEmbedUrl}
            className="tutorial-video-modal__frame"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <a
          className="tutorial-video-modal__external-link"
          href={videoWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver en YouTube
        </a>
      </section>
    </div>
  );
};
