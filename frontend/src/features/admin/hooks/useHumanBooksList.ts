import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminHumanBook } from '../types/human-books.types';
import { listHumanBooks } from '../api/human-books.api';

type UseHumanBooksListOptions = {
  onError?: (message: string) => void;
};

export const useHumanBooksList = ({ onError }: UseHumanBooksListOptions = {}) => {
  const [books, setBooks] = useState<AdminHumanBook[]>([]);
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const refreshBooks = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await listHumanBooks();
      if (response.success && response.data) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error('Error al cargar libros humanos', error);
      onError?.('No se pudo actualizar la lista de libros humanos.');
    } finally {
      setIsFetching(false);
    }
  }, [onError]);

  useEffect(() => {
    refreshBooks();
  }, [refreshBooks]);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;

    return books.filter(
      (book) =>
        book.name.toLowerCase().includes(term) ||
        book.title.toLowerCase().includes(term) ||
        book.region.name.toLowerCase().includes(term),
    );
  }, [books, search]);

  return {
    filteredBooks,
    isFetching,
    refreshBooks,
    search,
    setSearch,
  };
};
