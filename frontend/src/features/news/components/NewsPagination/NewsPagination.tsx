import './NewsPagination.css';

type NewsPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const NewsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: NewsPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildVisiblePages(currentPage, totalPages);

  return (
    <nav className="news-pagination" aria-label="Paginación de noticias">
      <button
        type="button"
        className="news-pagination__btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="bi bi-chevron-left" aria-hidden="true" />
        Anterior
      </button>

      <div className="news-pagination__pages">
        {pages.map((page, index) =>
          page === 'dots' ? (
            <span className="news-pagination__dots" key={`dots-${index}`}>
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              type="button"
              className={`news-pagination__page ${page === currentPage ? 'is-active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className="news-pagination__btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
        <i className="bi bi-chevron-right" aria-hidden="true" />
      </button>
    </nav>
  );
};

function buildVisiblePages(currentPage: number, totalPages: number): Array<number | 'dots'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'dots', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'dots',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'dots',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'dots',
    totalPages,
  ];
}
