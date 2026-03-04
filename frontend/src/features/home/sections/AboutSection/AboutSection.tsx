import { SectionTitle } from '../../components/SectionTitle/SectionTitle';
import './AboutSection.css';

export const AboutSection = () => {
  return (
    <section className="about-section section-padding">
      <div className="container text-center">
        <SectionTitle
          title="¿Qué es Equipo PUCH?"
          description="Equipo PUCH (Personas Unidas Contra el Hambre) es una campaña de sensibilización y movilización ciudadana impulsada por Fundación PROCLADE. Nuestro objetivo es generar conciencia crítica sobre la realidad del hambre y promover acciones concretas que contribuyan al ODS 2: Hambre Cero."
        />
      </div>
    </section>
  );
};
