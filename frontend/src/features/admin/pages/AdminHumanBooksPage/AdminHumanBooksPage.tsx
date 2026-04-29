import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AxiosError } from 'axios';
import { HumanBooksForm } from '../../components/human-books/HumanBooksForm/HumanBooksForm';
import { HumanBooksTable } from '../../components/human-books/HumanBooksTable/HumanBooksTable';
import { HumanBooksToolbar } from '../../components/human-books/HumanBooksToolbar/HumanBooksToolbar';
import {
  createHumanBook,
  deleteHumanBook,
  listRegionOptions,
  updateHumanBook,
} from '../../api/human-books.api';
import type { AdminHumanBook, HumanBookFormData, RegionOption } from '../../types/human-books.types';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useHumanBooksList } from '../../hooks/useHumanBooksList';
import './AdminHumanBooksPage.css';

const initialFormState: HumanBookFormData = {
  name: '',
  title: '',
  regionId: '',
  pdf: null,
};

export const AdminHumanBooksPage = () => {
  const [formData, setFormData] = useState<HumanBookFormData>(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedBook, setSelectedBook] = useState<AdminHumanBook | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [pendingDelete, setPendingDelete] = useState<AdminHumanBook | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const handleBooksError = useCallback((message: string) => {
    setFeedback(message);
    setFeedbackType('error');
  }, []);

  const {
    filteredBooks,
    refreshBooks,
    search,
    setSearch,
  } = useHumanBooksList({ onError: handleBooksError });

  const rowsPerPage = 4;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / rowsPerPage));
  const paginatedBooks = useMemo(
    () => filteredBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredBooks, page, rowsPerPage],
  );

  useEffect(() => {
    setPage(0);
  }, [filteredBooks.length, search]);

  useEffect(() => {
    if (page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setFeedback(null);
      setFeedbackType(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    listRegionOptions()
      .then((res) => {
        if (res.success && res.data) {
          setRegions(res.data);
        }
      })
      .catch(() => {
        setFeedback('No se pudieron cargar las delegaciones.');
        setFeedbackType('error');
      });
  }, []);

  const handleCreateNew = () => {
    setFormMode('create');
    setSelectedBook(null);
    setFormData(initialFormState);
    setFeedback(null);
    setFeedbackType(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedTitle = formData.title.trim();
    const regionId = Number(formData.regionId);

    if (!trimmedName || !trimmedTitle) {
      setFeedback('Completa nombre y título.');
      setFeedbackType('error');
      return;
    }

    if (!regionId) {
      setFeedback('Selecciona una delegación.');
      setFeedbackType('error');
      return;
    }

    if (formMode === 'create' && !formData.pdf) {
      setFeedback('Adjunta un archivo PDF.');
      setFeedbackType('error');
      return;
    }

    if (formMode === 'edit' && !selectedBook) {
      setFeedback('Selecciona un libro antes de editar.');
      setFeedbackType('error');
      return;
    }

    setIsProcessing(true);
    setFeedback(null);
    setFeedbackType(null);

    try {
      const response =
        formMode === 'create'
          ? await createHumanBook({
              name: trimmedName,
              title: trimmedTitle,
              regionId,
              pdf: formData.pdf!,
            })
          : await updateHumanBook({
              id: selectedBook!.id,
              name: trimmedName,
              title: trimmedTitle,
              regionId,
              ...(formData.pdf ? { pdf: formData.pdf } : {}),
            });

      if (response.success) {
        setFeedback(formMode === 'create' ? 'Libro humano creado con éxito.' : 'Libro humano actualizado.');
        setFeedbackType('success');
        setFormData(initialFormState);
        setFormMode('create');
        setSelectedBook(null);
        setIsFormOpen(false);
        await refreshBooks();
      } else {
        setFeedback(response.message || 'No se pudo guardar el libro humano.');
        setFeedbackType('error');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const serverMessage = axiosError.response?.data?.message;
      setFeedback(serverMessage || 'Error al intentar guardar el libro humano.');
      setFeedbackType('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (book: AdminHumanBook) => {
    setFormMode('edit');
    setSelectedBook(book);
    setFormData({
      name: book.name,
      title: book.title,
      regionId: String(book.regionId),
      pdf: null,
    });
    setFeedback(null);
    setFeedbackType(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsFormOpen(true);
  };

  const handleDelete = (book: AdminHumanBook) => {
    setPendingDelete(book);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setIsProcessing(true);
    setFeedback(null);
    setFeedbackType(null);
    try {
      const response = await deleteHumanBook(pendingDelete.id);
        if (response.success) {
          setFeedback('Libro humano eliminado.');
          setFeedbackType('success');
          await refreshBooks();
        } else {
          setFeedback(response.message || 'No se pudo eliminar el libro humano.');
          setFeedbackType('error');
        }
      } catch (error) {
        console.error('Error al eliminar libro humano', error);
        setFeedback('No se pudo eliminar el libro humano.');
        setFeedbackType('error');
      } finally {
        setIsProcessing(false);
        setPendingDelete(null);
      }
  };

  const handleFieldChange = (field: keyof HumanBookFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
    setFeedbackType(null);
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, pdf: file }));
    setFeedback(null);
    setFeedbackType(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormMode('create');
    setSelectedBook(null);
    setFormData(initialFormState);
    setFeedback(null);
    setFeedbackType(null);
  };

  return (
    <section className="admin-human-books-page">
      <HumanBooksToolbar
        search={search}
        onSearchChange={setSearch}
        onNew={handleCreateNew}
      />
      <div ref={formRef}>
        <HumanBooksForm
          isOpen={isFormOpen}
          formMode={formMode}
          formData={formData}
          regions={regions}
          feedback={feedback}
          isProcessing={isProcessing}
          onFieldChange={handleFieldChange}
          onFileChange={handleFileChange}
          onSubmit={handleFormSubmit}
          onReset={handleCreateNew}
          onClose={handleCloseForm}
        />
      </div>

      {feedback && feedbackType && (
        <div
          className={`admin-human-books-page__feedback-badge admin-human-books-page__feedback-badge--${feedbackType}`}
          role="status"
        >
          <i
            className={`bi ${
              feedbackType === 'success'
                ? 'bi-check-circle-fill'
                : 'bi-x-circle-fill'
            } admin-human-books-page__feedback-badge-icon`}
            aria-hidden="true"
          />
          {feedback}
        </div>
      )}

      <HumanBooksTable
        books={paginatedBooks}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="human-books-pagination">
        <div className="human-books-pagination__info">
          Mostrando {filteredBooks.length === 0 ? 0 : page * rowsPerPage + 1}-
          {Math.min(filteredBooks.length, (page + 1) * rowsPerPage)} de {filteredBooks.length}
        </div>
        <div className="human-books-pagination__controls">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            aria-label="Página anterior"
          >
            ←
          </button>
          <span>
            {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Eliminar libro humano"
        description={
          pendingDelete ? (
            <>
              ¿Quieres eliminar el libro{' '}
              <strong>{pendingDelete.name}</strong>? Esta acción marcará el recurso como eliminado.
            </>
          ) : undefined
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        isProcessing={isProcessing}
      />
    </section>
  );
};
