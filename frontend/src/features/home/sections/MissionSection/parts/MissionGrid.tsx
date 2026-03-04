import type { ReactNode } from 'react';
import '../MissionSection.css';

type MissionGridProps = {
  children: ReactNode;
};

export const MissionGrid = ({ children }: MissionGridProps) => (
  <div className="mission-section__grid">{children}</div>
);
