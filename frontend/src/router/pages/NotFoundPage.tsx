import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="container py-5 text-center">
      <h1 className="mb-3">404</h1>
      <p className="mb-4">La pagina solicitada no existe.</p>
      <Link to="/" className="btn btn-brand">
        Volver al inicio
      </Link>
    </section>
  );
}
