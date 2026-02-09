import { HOME_STATS } from '../../mocks/home.mocks';
import './StatsSection.css';

export const StatsSection = () => {
  return (
    <section className="home-stats section-padding">
      <div className="container">
        <div className="row text-center g-4">
          {HOME_STATS.map((stat) => (
            <div key={stat.label} className="col-6 col-md-3">
              <h2 className="home-stats__value">{stat.value}</h2>
              <p className="home-stats__label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
