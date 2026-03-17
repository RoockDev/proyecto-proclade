import { useCallback, useState } from 'react';
import { NewsTable } from '../../components/news/NewsTable/NewsTable';
import { NewsToolbar } from '../../components/news/NewsToolbar/NewsToolbar';
import { useAdminNewsList } from '../../hooks/useAdminNewsList';
import './AdminNewsPage.css';

export const AdminNewsPage = () => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleNewsError = useCallback(
    (message: string) => setFeedback(message),
    [],
  );

  const { filteredNews, isFetching, search, setSearch } = useAdminNewsList({
    onError: handleNewsError,
  });

  const handleCreateNews = () => {
    setFeedback(
      'En el siguiente bloque implementaremos el formulario para crear y editar noticias.',
    );
  };

  return (
    <section className="admin-news-page">
      <header className="admin-news-page__header">
        <p className="admin-news-page__eyebrow">Panel de administración</p>
        <h1 className="admin-news-page__title">Gestión de noticias</h1>
        <p className="admin-news-page__description">
          Lista de noticias en tiempo real con búsqueda cliente para administración.
        </p>
      </header>

      <NewsToolbar
        search={search}
        onSearchChange={setSearch}
        onNew={handleCreateNews}
      />

      {feedback ? (
        <p className="admin-news-page__feedback" role="status">
          {feedback}
        </p>
      ) : null}

      {isFetching ? (
        <p className="admin-news-page__state">Cargando noticias...</p>
      ) : null}

      <NewsTable news={filteredNews} />
    </section>
  );
};
