import { SectionTitle } from '../../components/SectionTitle/SectionTitle';
import { MISSION_CARDS } from '../../content/home.content';
import { MissionCard } from './parts/MissionCard';
import { MissionGrid } from './parts/MissionGrid';
import './MissionSection.css';

export const MissionSection = () => (
  <section className="mission-section section-padding gradient-warm">
    <div className="container">
      <SectionTitle
        title="¿Qué buscamos?"
        description="Tres formas en que actuamos contra el hambre, impulsando conciencia, corresponsabilidad y acción comunitaria."
      />
      <MissionGrid>
        {MISSION_CARDS.map((card) => (
          <MissionCard key={card.title} card={card} />
        ))}
      </MissionGrid>
    </div>
  </section>
);
