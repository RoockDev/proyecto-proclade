import { useCallback, useEffect, useState } from 'react';
import { listAdminSuperheroes } from '../api/admin-superheroes.api';
import type {
  AdminSuperheroRow,
  AdminSuperheroesListData,
  SuperheroStatus,
} from '../types/superheroes.types';

type UseAdminSuperheroesListOptions = {
  pageSize?: number;
  onError?: (message: string) => void;
};

export const useAdminSuperheroesList = ({
  pageSize = 10,
  onError,
}: UseAdminSuperheroesListOptions = {}) => {
  const [superheroes, setSuperheroes] = useState<AdminSuperheroRow[]>([]);
  const [listData, setListData] = useState<AdminSuperheroesListData | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SuperheroStatus | ''>('');
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await listAdminSuperheroes({
        page,
        pageSize,
        search: search || undefined,
        status: showDeleted ? undefined : statusFilter || undefined,
        deleted: showDeleted || undefined,
      });

      if (response.success && response.data) {
        setListData(response.data);
        setSuperheroes(response.data.items);
      }
    } catch (error) {
      console.error('Error al cargar superhéroes', error);
      onError?.('No se pudo actualizar la lista de superhéroes.');
    } finally {
      setIsFetching(false);
    }
  }, [onError, page, pageSize, search, statusFilter, showDeleted]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, showDeleted]);

  const totalPages = listData?.totalPages ?? 0;
  const pageInfo = listData?.page ?? page;

  return {
    superheroes,
    page: pageInfo,
    totalPages,
    pageSize,
    total: listData?.total ?? 0,
    isFetching,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    pageChange: setPage,
    refresh,
    showDeleted,
    setShowDeleted,
  };
};
