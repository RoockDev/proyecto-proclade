import { LATEST_NEWS } from '../../mocks/home.news.mock';
import './LatestNewsSection.css';

export const LatestNewsSection = () => {
  return (
    <section className="home-news section-padding">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="home-news__title">Ultimas noticias</h2>
          <p className="home-news__subtitle">
            Mantente al dia de nuestras actividades y avances.
          </p>
        </div>

        <div className="row g-4">
          {LATEST_NEWS.map((news) => (
            <div className="col-md-6 col-lg-4" key={news.title}>
              <article className="card home-news__card h-100">
                <img
                  src={news.image}
                  className="card-img-top home-news__image"
                  alt={news.title}
                />

                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge home-news__badge">{news.tag}</span>
                    <small className="home-news__date">
                      {new Date(news.date).toLocaleDateString('es-ES')}
                    </small>
                  </div>

                  <h3 className="home-news__card-title">{news.title}</h3>
                  <p className="home-news__excerpt">{news.excerpt}</p>

                  <a href="#" className="home-news__link mt-auto">
                    Leer mas <i className="bi bi-arrow-right" />
                  </a>
                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <a href="#" className="btn btn-brand-outline">
            Ver todas las noticias <i className="bi bi-arrow-right ms-2" />
          </a>
        </div>
      </div>
    </section>
  );
};
