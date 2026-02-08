import { Header } from "../../../../components/layout/Header/Header";
import { Footer } from "../../../../components/layout/Footer/Footer";
import { HeroSection } from "../../sections/HeroSection/HeroSection";
import { StatsSection } from '../../sections/StatsSection/StatsSection';
import { LatestNewsSection } from '../../sections/LatestNewsSection/LatestNewsSection';
import { CtaSection } from '../../sections/CtaSection/CtaSection';




export const HomePage = () => {
  return (
    <>
      <Header />

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
