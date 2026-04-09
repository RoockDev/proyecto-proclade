import { AdminDataTable, type AdminTableColumn } from '../../shared/AdminDataTable/AdminDataTable';
import type { AdminHumanBook } from '../../../types/human-books.types';
import './HumanBooksTable.css';

type HumanBooksTableProps = {
  books: AdminHumanBook[];
  onEdit: (book: AdminHumanBook) => void;
  onDelete: (book: AdminHumanBook) => void;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const HumanBooksTable = ({ books, onEdit, onDelete }: HumanBooksTableProps) => {
  const columns: AdminTableColumn<AdminHumanBook>[] = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (book: AdminHumanBook) => book.name,
    },
    {
      key: 'title',
      header: 'Título',
      cell: (book: AdminHumanBook) => book.title,
    },
    {
      key: 'region',
      header: 'Delegación',
      cell: (book: AdminHumanBook) => book.region.name,
    },
    {
      key: 'pdf',
      header: 'PDF',
      cell: (book: AdminHumanBook) => (
        <span className="human-books-table__pdf-info">
          <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
          {formatFileSize(book.pdfSize)}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Actualizado',
      cell: (book: AdminHumanBook) => new Date(book.updatedAt).toLocaleString(),
    },
    {
      key: 'actions',
      header: 'Acciones',
      cell: (book: AdminHumanBook) => (
        <div className="human-books-table__actions human-books-table__actions--center">
          <button
            type="button"
            onClick={() => onEdit(book)}
            aria-label={`Editar ${book.name}`}
            className="human-books-table__icon-button human-books-table__icon-button--tool"
          >
            <i className="bi bi-tools" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(book)}
            aria-label={`Eliminar ${book.name}`}
            className="human-books-table__icon-button human-books-table__icon-button--delete"
          >
            <i className="bi bi-x-circle" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="human-books-table">
      <AdminDataTable<AdminHumanBook>
        columns={columns}
        rows={books}
        getRowKey={(book) => book.id.toString()}
        emptyMessage="No hay libros humanos que coincidan."
      />
    </div>
  );
};
