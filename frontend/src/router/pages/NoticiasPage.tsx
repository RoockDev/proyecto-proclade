import { Link } from 'react-router-dom';

export const NoticiasPage = () => {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 text-center">
          <h1 className="mb-3">Noticias</h1>
          <p className="text-secondary mb-4">
            Esta sección se completará en la HU de gestión y listado de
            noticias. En Home mostramos una preview con 3 cards.
          </p>
          <Link to="/" className="btn btn-brand-outline">
            Volver a Home
          </Link>
        </div>
      </div>
    </section>
  );
};
