import type { MissionCard as MissionCardModel } from '../../../types/home.types';
import '../MissionSection.css';

type MissionCardProps = {
  card: MissionCardModel;
};

export const MissionCard = ({ card }: MissionCardProps) => (
  <article className="mission-card">
    <div className="mission-card__icon">
      <i className={`bi ${card.icon}`} aria-hidden />
    </div>
    <h3 className="mission-card__title">{card.title}</h3>
    <p className="mission-card__text">{card.description}</p>
  </article>
);
