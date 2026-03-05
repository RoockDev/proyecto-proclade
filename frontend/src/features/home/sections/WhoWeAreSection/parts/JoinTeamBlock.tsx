import type { HomeJoinReason } from '../../../types/home.types';

type JoinTeamBlockProps = {
  title: string;
  intro: string;
  reasons: HomeJoinReason[];
  closingMessage: string;
};

export const JoinTeamBlock = ({
  title,
  intro,
  reasons,
  closingMessage,
}: JoinTeamBlockProps) => (
  <div className="who-we-are__join">
    <h3>{title}</h3>
    <p>{intro}</p>
    <ul>
      {reasons.map((reason) => (
        <li key={reason.id}>{reason.text}</li>
      ))}
    </ul>
    <p className="who-we-are__closing">{closingMessage}</p>
  </div>
);
