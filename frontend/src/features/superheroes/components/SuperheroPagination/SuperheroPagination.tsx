import './SuperheroPagination.css';

type SuperheroPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const SuperheroPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: SuperheroPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildVisiblePages(currentPage, totalPages);

  return (
    <nav className="superhero-pagination" aria-label="Paginación de superhéroes">
      <button
        type="button"
        className="superhero-pagination__btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <i className="bi bi-chevron-left" aria-hidden="true" />
        <span>Anterior</span>
      </button>

      <div className="superhero-pagination__pages">
        {pages.map((page, index) =>
          page === 'dots' ? (
            <span className="superhero-pagination__dots" key={`dots-${index}`}>
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              type="button"
              className={`superhero-pagination__page ${page === currentPage ? 'is-active' : ''}`}
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
        className="superhero-pagination__btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <span>Siguiente</span>
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
