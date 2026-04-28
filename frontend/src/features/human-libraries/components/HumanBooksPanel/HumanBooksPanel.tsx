import type { HumanBookCardView } from '../../types/human-libraries.types';
import './HumanBooksPanel.css';

type HumanBooksPanelProps = {
  delegationLabel: string;
  books: HumanBookCardView[];
};

export const HumanBooksPanel = ({ delegationLabel, books }: HumanBooksPanelProps) => {
  if (books.length === 0) {
    return (
      <article className="human-books-panel">
        <h2 className="human-books-panel__title">Libros humanos</h2>
        <div className="human-books-panel__empty">
          <i className="bi bi-journal-text" aria-hidden="true" />
          <p>Aún no hay libros humanos en {delegationLabel}.</p>
          <span>Próximamente añadiremos historias de esta delegación.</span>
        </div>
      </article>
    );
  }

  return (
    <article className="human-books-panel">
      <h2 className="human-books-panel__title">Libros humanos</h2>
      <div className="human-books-panel__list">
        {books.map((book) => (
          <div className="human-books-panel__card" key={book.id}>
            <div className="human-books-panel__card-header">
              <span className="human-books-panel__avatar" aria-hidden="true">
                <i className="bi bi-person" />
              </span>
              <div>
                <h3>{book.name}</h3>
                <p>{book.title}</p>
              </div>
            </div>

            <p className="human-books-panel__summary">{book.summary}</p>

            <a
              className="human-books-panel__download btn btn-sm btn-brand-outline"
              href={book.downloadUrl}
              target="_blank"
              rel="noreferrer"
            >
              Descargar PDF
            </a>
          </div>
        ))}
      </div>
    </article>
  );
};
