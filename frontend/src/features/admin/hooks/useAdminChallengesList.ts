import { useCallback, useEffect, useMemo, useState } from 'react';
import { listAdminChallenges } from '../api/challenges.api';
import type { AdminChallenge } from '../types/challenges.types';

type UseAdminChallengesListOptions = {
  onError?: (message: string) => void;
};

export const useAdminChallengesList = ({
  onError,
}: UseAdminChallengesListOptions = {}) => {
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await listAdminChallenges();
      if (response.success) {
        setChallenges(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      onError?.('No se pudo cargar la lista de retos.');
    } finally {
      setIsFetching(false);
    }
  }, [onError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredChallenges = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return challenges;
    return challenges.filter((item) =>
      item.title.toLowerCase().includes(term),
    );
  }, [challenges, search]);

  return { filteredChallenges, isFetching, refresh, search, setSearch };
};
