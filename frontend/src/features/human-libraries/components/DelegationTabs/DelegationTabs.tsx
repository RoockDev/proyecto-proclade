import type { DelegationTab } from '../../types/human-libraries.types';
import './DelegationTabs.css';

type DelegationTabsProps = {
  tabs: DelegationTab[];
  activeDelegation: number;
  onChange: (delegationId: number) => void;
};

export const DelegationTabs = ({
  tabs,
  activeDelegation,
  onChange,
}: DelegationTabsProps) => (
  <div className="delegation-tabs" role="tablist" aria-label="Delegaciones disponibles">
    {tabs.map((tab) => {
      const isActive = tab.id === activeDelegation;

      return (
        <button
          type="button"
          key={tab.id}
          role="tab"
          aria-selected={isActive}
          className={`delegation-tabs__button ${isActive ? 'delegation-tabs__button--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);
