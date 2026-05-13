import { HOME_REAL_HEROES_COUNTER } from "../../content/home.content";
import "./RealHeroesCounterSection.css";

export const RealHeroesCounterSection = () => {
  const formattedValue =
    typeof HOME_REAL_HEROES_COUNTER.value === "number"
      ? HOME_REAL_HEROES_COUNTER.value.toLocaleString("es-ES")
      : HOME_REAL_HEROES_COUNTER.value;

  return (
    <section className="real-heroes-counter section-padding gradient-teal reveal-up reveal-delay-4">
      <div className="container text-center">
        <h2 className="real-heroes-counter__title">
          ¿Quieres convertirte en un superhéroe real?
        </h2>
        <p className="real-heroes-counter__description">
          Cada persona que colabora, dona o difunde puede formar parte del
          cambio. No hay límite para quienes deciden actuar.
        </p>

        <p className="real-heroes-counter__value">{formattedValue}</p>
        <p className="real-heroes-counter__label">
          {HOME_REAL_HEROES_COUNTER.label}
        </p>
      </div>
    </section>
  );
};
