import { useCallback, useEffect, useMemo, useState } from 'react';
import { listRegions } from '../api/regions.api';
import type { AdminRegion } from '../types/regions.types';

type UseRegionsListOptions = {
  onError?: (message: string) => void;
};

const orderRegions = (regions: AdminRegion[]) =>
  [...regions].sort((a, b) => a.name.localeCompare(b.name, 'es'));

export const useRegionsList = ({ onError }: UseRegionsListOptions = {}) => {
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const refreshRegions = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await listRegions();
      if (response.success) {
        setRegions(Array.isArray(response.data) ? response.data : []);
        return;
      }

      onError?.(response.message || 'No se pudo cargar delegaciones.');
    } catch {
      onError?.('No se pudo actualizar la lista de delegaciones.');
    } finally {
      setIsFetching(false);
    }
  }, [onError]);

  useEffect(() => {
    refreshRegions();
  }, [refreshRegions]);

  const orderedRegions = useMemo(() => orderRegions(regions), [regions]);

  const filteredRegions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return orderedRegions;
    }

    return orderedRegions.filter((region) =>
      [region.name, region.email].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [orderedRegions, search]);

  return {
    filteredRegions,
    isFetching,
    refreshRegions,
    search,
    setSearch,
  };
};
