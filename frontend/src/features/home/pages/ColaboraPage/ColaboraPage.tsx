import { Link } from 'react-router-dom';

export const ColaboraPage = () => {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 text-center">
          <h1 className="mb-3">Colabora</h1>
          <p className="text-secondary mb-4">
            Esta sección se desarrollará en la HU de Colabora. Desde Home ya
            puedes acceder al botón de donación externa de Fundación PROCLADE.
          </p>
          <Link to="/" className="btn btn-brand-outline">
            Volver a Home
          </Link>
        </div>
      </div>
    </section>
  );
};
