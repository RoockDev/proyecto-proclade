import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminUser } from '../types/users.types';
import { listUsers } from '../api/users.api';

type UseUsersListOptions = {
  onError?: (message: string) => void;
};

const orderUsers = (users: AdminUser[]) =>
  [...users].sort((a, b) => {
    if (!!a.deletedAt === !!b.deletedAt) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return a.deletedAt ? 1 : -1;
  });

export const useUsersList = ({ onError }: UseUsersListOptions = {}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<'active' | 'deleted' | 'all'>('active');
  const [isFetching, setIsFetching] = useState(false);

  const refreshUsers = useCallback(async () => {
    setIsFetching(true);
    try {
      const includeDeleted = viewFilter !== 'active';
      const response = await listUsers(includeDeleted);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios', error);
      onError?.('No se pudo actualizar la lista de usuarios.');
    } finally {
      setIsFetching(false);
    }
  }, [onError, viewFilter]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const orderedUsers = useMemo(() => orderUsers(users), [users]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = orderedUsers.filter((user) => {
      if (viewFilter === 'active') return !user.deletedAt;
      if (viewFilter === 'deleted') return Boolean(user.deletedAt);
      return true;
    });

    if (!term) return base;

    return base.filter((user) =>
      user.name.toLowerCase().includes(term) ||
      user.surname.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term),
    );
  }, [orderedUsers, search, viewFilter]);

  return {
    filteredUsers,
    isFetching,
    refreshUsers,
    search,
    setSearch,
    viewFilter,
    setViewFilter,
  };
};
