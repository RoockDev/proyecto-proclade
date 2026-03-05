import { HOME_REAL_HEROES_COUNTER } from '../../content/home.content';
import './RealHeroesCounterSection.css';

export const RealHeroesCounterSection = () => {
  const formattedValue = HOME_REAL_HEROES_COUNTER.value.toLocaleString('es-ES');

  return (
    <section className="real-heroes-counter section-padding gradient-teal reveal-up reveal-delay-4">
      <div className="container text-center">
        <h2 className="real-heroes-counter__title">
          ¿Cuántos superhéroes se han sumado al Equipo PUCH?
        </h2>
        <p className="real-heroes-counter__description">
          Cada persona que colabora, dona o difunde se convierte en un
          superhéroe real.
        </p>

        <p className="real-heroes-counter__value">{formattedValue}</p>
        <p className="real-heroes-counter__label">
          {HOME_REAL_HEROES_COUNTER.label}
        </p>
      </div>
    </section>
  );
};
