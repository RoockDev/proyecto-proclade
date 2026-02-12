import { Header } from "../../../../components/layout/Header/Header";
import { Footer } from "../../../../components/layout/Footer/Footer";
import { HeroSection } from "../../sections/HeroSection/HeroSection";
import { StatsSection } from '../../sections/StatsSection/StatsSection';
import { LatestNewsSection } from '../../sections/LatestNewsSection/LatestNewsSection';
import { CtaSection } from '../../sections/CtaSection/CtaSection';

interface HomePageProps {
  onAccessClick?: () => void;
}

export const HomePage = ({ onAccessClick }: HomePageProps) => {
  return (
    <>
      <Header onAccessClick={onAccessClick} />

      <main>
        <HeroSection />
        <StatsSection/>
        <LatestNewsSection />
        <CtaSection />

      </main>

      <Footer />
    </>
  );
};
