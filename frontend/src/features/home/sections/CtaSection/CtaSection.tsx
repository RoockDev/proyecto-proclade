import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HOME_TUTORIAL_CONTENT } from '../../content/home.content';
import { TutorialVideoModal } from './TutorialVideoModal';
import './CtaSection.css';

export const CtaSection = () => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const tutorialTriggerRef = useRef<HTMLButtonElement>(null);

  const openTutorial = () => {
    setIsTutorialOpen(true);
  };

  const closeTutorial = () => {
    setIsTutorialOpen(false);
    tutorialTriggerRef.current?.focus();
  };

  return (
    <>
      <section className="home-cta section-padding reveal-up reveal-delay-6">
        <div className="container text-center">
          <h2 className="home-cta__title">Únete al cambio</h2>
          <p className="home-cta__text">
            Cada acción cuenta. Colabora con tu tiempo, tu historia o tu
            donación para construir un mundo sin hambre.
          </p>

          <div className="home-cta__actions">
            <Link to="/colabora" className="btn btn-light btn-lg home-cta__btn-main">
              Colabora ahora <i className="bi bi-arrow-right ms-2" />
            </Link>

            <button
              ref={tutorialTriggerRef}
              type="button"
              className="btn btn-outline-light btn-lg home-cta__btn-tutorial"
              aria-label="Abrir vídeo tutorial para aprender a usar la web de Equipo PUCH"
              onClick={openTutorial}
            >
              <i className="bi bi-play-circle me-2" />
              {HOME_TUTORIAL_CONTENT.ctaLabel}
            </button>

            <a
              href="https://www.fundacionproclade.org/dona/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light btn-lg home-cta__btn-alt"
            >
              <i className="bi bi-heart-fill me-2" />
              Donar
            </a>
          </div>
        </div>
      </section>

      <TutorialVideoModal
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
        title={HOME_TUTORIAL_CONTENT.modalTitle}
        durationLabel={HOME_TUTORIAL_CONTENT.durationLabel}
        videoEmbedUrl={HOME_TUTORIAL_CONTENT.videoEmbedUrl}
        videoWatchUrl={HOME_TUTORIAL_CONTENT.videoWatchUrl}
      />
    </>
  );
};
