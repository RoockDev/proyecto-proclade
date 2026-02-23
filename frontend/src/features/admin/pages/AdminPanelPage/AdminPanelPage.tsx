export const AdminPanelPage = () => {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h1 className="h3 mb-3">Panel de administración</h1>
              <p className="mb-2">
                Ruta <code>/admin</code> operativa.
              </p>
              <p className="mb-0 text-muted">
                En el siguiente bloque montaremos el layout del panel (sidebar + topbar +
                contenido) y después los componentes del dashboard mockeado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
