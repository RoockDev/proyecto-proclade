import './HeroSection.css';
import { HeroBadge } from './parts/HeroBadge';
import { HeroActions } from './parts/HeroActions';
import { HeroStatsCard } from './parts/HeroStatsCard';
import { HeroIllustration } from './parts/HeroIllustration';

export const HeroSection = () => {
  return (
    <section className="home-hero gradient-hero section-padding">
      <div className="container">
        <div className="home-hero__grid">
          <div className="home-hero__content">
            <HeroBadge />
            <h1 className="home-hero__title">Personas que cuentan y te cuentan</h1>
            <p className="home-hero__subtitle">
              Unidas contra el hambre. Un proyecto de Fundación PROCLADE para sensibilizar, educar y movilizar a las personas frente al hambre en el mundo.
            </p>
            <HeroActions />
            <HeroStatsCard />
          </div>

          <HeroIllustration />
        </div>
      </div>
    </section>
  );
};
