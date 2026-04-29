import type { AdminChallenge } from '../../../types/challenges.types';
import './ChallengeCard.css';

type ChallengeCardProps = {
  challenge: AdminChallenge;
  onEdit: (challenge: AdminChallenge) => void;
  onUpdateAmount: (challenge: AdminChallenge) => void;
  onDelete: (challenge: AdminChallenge) => void;
  onToggleActive: (challenge: AdminChallenge) => void;
};

export const ChallengeCard = ({
  challenge,
  onEdit,
  onUpdateAmount,
  onDelete,
  onToggleActive,
}: ChallengeCardProps) => {
  const progress = challenge.targetAmount > 0
    ? Math.min((challenge.currentAmount / challenge.targetAmount) * 100, 100)
    : 0;

  const formatAmount = (cents: number) => {
    const euros = cents / 100;
    return euros.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  return (
    <article className="challenge-card">
      <div className="challenge-card__header">
        <h3 className="challenge-card__title">{challenge.title}</h3>
        <span
          className={`challenge-card__status challenge-card__status--${challenge.isActive ? 'active' : 'inactive'}`}
        >
          {challenge.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="challenge-card__amounts">
        <div className="challenge-card__amount-row">
          <span className="challenge-card__amount-label">Recaudado</span>
          <span className="challenge-card__amount-value">
            {formatAmount(challenge.currentAmount)}
          </span>
        </div>
        <div className="challenge-card__amount-row">
          <span className="challenge-card__amount-label">Objetivo</span>
          <span className="challenge-card__amount-value">
            {formatAmount(challenge.targetAmount)}
          </span>
        </div>
      </div>

      <div className="challenge-card__progress">
        <div className="challenge-card__progress-bar">
          <div
            className="challenge-card__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="challenge-card__progress-text">
          {progress.toFixed(0)}%
        </span>
      </div>

      <div className="challenge-card__actions">
        <button
          type="button"
          className="challenge-card__icon-button challenge-card__icon-button--tool"
          onClick={() => onEdit(challenge)}
          aria-label={`Editar ${challenge.title}`}
        >
          <i className="bi bi-tools" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`challenge-card__icon-button challenge-card__icon-button--status ${
            challenge.isActive ? 'challenge-card__icon-button--status-active' : ''
          }`}
          onClick={() => onToggleActive(challenge)}
          aria-label={
            challenge.isActive
              ? `Marcar ${challenge.title} como inactivo`
              : `Marcar ${challenge.title} como activo`
          }
        >
          <i
            className={`bi ${challenge.isActive ? 'bi-eye-slash' : 'bi-eye'}`}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="challenge-card__icon-button challenge-card__icon-button--delete"
          onClick={() => onDelete(challenge)}
          aria-label={`Eliminar ${challenge.title}`}
        >
          <i className="bi bi-x-circle" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="challenge-card__icon-button challenge-card__icon-button--confirm"
          onClick={() => onUpdateAmount(challenge)}
          aria-label={`Actualizar monto de ${challenge.title}`}
        >
          <span className="challenge-card__icon-button-symbol">€</span>
        </button>
      </div>
    </article>
  );
};
