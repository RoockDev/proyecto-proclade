import { Link } from 'react-router-dom';
import { LATEST_NEWS } from '../../mocks/home.news.mock';
import './LatestNewsSection.css';

export const LatestNewsSection = () => {
  return (
    <section className="home-news section-padding reveal-up reveal-delay-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="home-news__title">Últimas noticias</h2>
          <p className="home-news__subtitle">
            Mantente al día de nuestras actividades y avances.
          </p>
        </div>

        <div className="row g-4">
          {LATEST_NEWS.map((news) => (
            <div className="col-md-6 col-lg-4" key={news.id}>
              <article className="card home-news__card h-100">
                <img
                  src={news.image}
                  className="card-img-top home-news__image"
                  alt={news.title}
                />

                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge home-news__badge">{news.tag}</span>
                    <time className="home-news__date" dateTime={news.date}>
                      {new Date(news.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  <h3 className="home-news__card-title">{news.title}</h3>
                  <p className="home-news__excerpt">{news.excerpt}</p>

                  <Link to={news.to} className="home-news__link mt-auto">
                    Leer más <i className="bi bi-arrow-right" />
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/noticias" className="btn btn-brand-gradient">
            Ver todas las noticias <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};
