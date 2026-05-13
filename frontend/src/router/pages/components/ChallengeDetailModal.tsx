import { useEffect } from 'react';
import type { PublicChallenge } from '../../../features/challenges/api/challenges.api';
import './ChallengeDetailModal.css';

type ChallengeDetailModalProps = {
  challenge: PublicChallenge & {
    progress: number;
    remaining: number;
  };
  euroFormat: Intl.NumberFormat;
  onClose: () => void;
};

export const ChallengeDetailModal = ({
  challenge,
  euroFormat,
  onClose,
}: ChallengeDetailModalProps) => {
  const hasLongCopy = challenge.description.length > 420;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="challenge-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-detail-title"
    >
      <div
        className="challenge-detail-modal__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`challenge-detail-modal__content${
          hasLongCopy ? ' challenge-detail-modal__content--scrollable' : ''
        }`}
      >
        <button
          type="button"
          className="challenge-detail-modal__close"
          aria-label="Cerrar detalle del reto"
          onClick={onClose}
        >
          <i className="bi bi-x-lg" />
        </button>

        <div className="challenge-detail-modal__header">
          <span className="challenge-detail-modal__badge">Reto activo</span>
          <h2 id="challenge-detail-title" className="challenge-detail-modal__title">
            {challenge.title}
          </h2>
        </div>

        <div className="challenge-detail-modal__stats">
          <div className="challenge-detail-modal__stat">
            <span>Recaudado</span>
            <strong>{euroFormat.format(challenge.currentAmount)}</strong>
          </div>
          <div className="challenge-detail-modal__stat">
            <span>Objetivo</span>
            <strong>{euroFormat.format(challenge.targetAmount)}</strong>
          </div>
          <div className="challenge-detail-modal__stat">
            <span>Falta</span>
            <strong>{euroFormat.format(challenge.remaining)}</strong>
          </div>
          <div className="challenge-detail-modal__stat">
            <span>Avance</span>
            <strong>{challenge.progress}%</strong>
          </div>
        </div>

        <div className="challenge-detail-modal__progress-track" aria-hidden="true">
          <div style={{ width: `${challenge.progress}%` }} />
        </div>

        <div className="challenge-detail-modal__copy">
          <p>{challenge.description}</p>
        </div>
      </div>
    </div>
  );
};
