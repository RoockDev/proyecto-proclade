import { HeroSection } from '../../sections/HeroSection/HeroSection';
import { StatsSection } from '../../sections/StatsSection/StatsSection';
import { LatestNewsSection } from '../../sections/LatestNewsSection/LatestNewsSection';
import { CtaSection } from '../../sections/CtaSection/CtaSection';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <LatestNewsSection />
      <CtaSection />
    </>
  );
};
