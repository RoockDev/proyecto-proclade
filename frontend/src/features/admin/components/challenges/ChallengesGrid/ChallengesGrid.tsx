import type { AdminChallenge } from '../../../types/challenges.types';
import { ChallengeCard } from '../ChallengeCard/ChallengeCard';
import './ChallengesGrid.css';

type ChallengesGridProps = {
  challenges: AdminChallenge[];
  onEdit: (challenge: AdminChallenge) => void;
  onUpdateAmount: (challenge: AdminChallenge) => void;
  onDelete: (challenge: AdminChallenge) => void;
  onToggleActive: (challenge: AdminChallenge) => void;
};

export const ChallengesGrid = ({
  challenges,
  onEdit,
  onUpdateAmount,
  onDelete,
  onToggleActive,
}: ChallengesGridProps) => {
  if (challenges.length === 0) {
    return (
      <p className="challenges-grid__empty">No se encontraron retos.</p>
    );
  }

  return (
    <div className="challenges-grid">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onEdit={onEdit}
          onUpdateAmount={onUpdateAmount}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
