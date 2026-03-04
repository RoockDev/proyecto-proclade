import { HeroSection } from '../../sections/HeroSection/HeroSection';
import { AboutSection } from '../../sections/AboutSection/AboutSection';
import { MissionSection } from '../../sections/MissionSection/MissionSection';
import { WhoWeAreSection } from '../../sections/WhoWeAreSection/WhoWeAreSection';
import { RealHeroesCounterSection } from '../../sections/RealHeroesCounterSection/RealHeroesCounterSection';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <WhoWeAreSection />
      <RealHeroesCounterSection />
    </>
  );
};
