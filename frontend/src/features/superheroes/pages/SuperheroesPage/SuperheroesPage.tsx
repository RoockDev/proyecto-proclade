import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSuperheroesList } from '../../api/superheroes.api';
import { SuperheroDetailModal } from '../../components/SuperheroDetailModal/SuperheroDetailModal';
import { SuperheroGrid } from '../../components/SuperheroGrid/SuperheroGrid';
import { SuperheroPagination } from '../../components/SuperheroPagination/SuperheroPagination';
import type { SuperheroItem, SuperheroListState } from '../../types/superheroes.types';
import './SuperheroesPage.css';

const PAGE_SIZE = 8;

export const SuperheroesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<SuperheroListState['items']>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rawPageParam = searchParams.get('page');
  const selectedHeroSlug = searchParams.get('hero');
  const currentPage = sanitizePage(rawPageParam);

  useEffect(() => {
    if (rawPageParam === null || rawPageParam !== String(currentPage)) {
      setSearchParams(buildSuperheroSearchParams(currentPage, selectedHeroSlug), {
        replace: true,
      });
    }
  }, [currentPage, rawPageParam, selectedHeroSlug, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadSuperheroes = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getSuperheroesList(currentPage, PAGE_SIZE);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'No se pudo cargar el listado de superhéroes.');
        }

        if (!isMounted) {
          return;
        }

        setItems(response.data.items);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } catch {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setTotalItems(0);
        setTotalPages(0);
        setErrorMessage(
          'No se pudo cargar la información de superhéroes. Inténtalo de nuevo más tarde.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSuperheroes();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setSearchParams(buildSuperheroSearchParams(totalPages), { replace: true });
    }
  }, [currentPage, totalPages, setSearchParams]);

  const selectedHero = useMemo(
    () =>
      selectedHeroSlug
        ? items.find((item) => item.slug === selectedHeroSlug) ?? null
        : null,
    [items, selectedHeroSlug],
  );

  useEffect(() => {
    if (!selectedHeroSlug || isLoading) {
      return;
    }

    if (!selectedHero) {
      setSearchParams(buildSuperheroSearchParams(currentPage), {
        replace: true,
      });
    }
  }, [currentPage, isLoading, selectedHero, selectedHeroSlug, setSearchParams]);

  const listState: SuperheroListState = useMemo(
    () => ({
      items,
      page: currentPage,
      pageSize: PAGE_SIZE,
      total: totalItems,
      totalPages,
    }),
    [currentPage, items, totalItems, totalPages],
  );

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > Math.max(listState.totalPages, 1)) {
      return;
    }

    if (nextPage === currentPage) {
      return;
    }

    setSearchParams(buildSuperheroSearchParams(nextPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHero = (hero: SuperheroItem) => {
    setSearchParams(buildSuperheroSearchParams(currentPage, hero.slug));
  };

  const handleCloseHeroModal = () => {
    setSearchParams(buildSuperheroSearchParams(currentPage));
  };

  return (
    <div className="superheroes-page">
      <section className="superheroes-page__hero page-hero gradient-hero reveal-up">
        <div className="container text-center">
          <span className="page-hero__eyebrow">Historias reales</span>
          <h1>Superhéroes del Equipo PUCH</h1>
          <p>
            Testimonios visuales de personas que impulsan la transformación
            comunitaria con compromiso, cooperación y esperanza.
          </p>
        </div>
      </section>

      <section className="superheroes-page__content section-padding reveal-up">
        <div className="container">
          {errorMessage && (
            <div className="alert alert-warning superheroes-page__alert" role="status">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="superheroes-page__state" role="status" aria-live="polite">
              <div className="spinner-border text-secondary" role="presentation" />
              <p>Cargando superhéroes...</p>
            </div>
          ) : listState.items.length === 0 ? (
            <div className="superheroes-page__state superheroes-page__state--empty">
              <i className="bi bi-people" aria-hidden="true" />
              <p>Estamos preparando las historias de los superhéroes. Pronto las compartiremos.</p>
            </div>
          ) : (
            <>
              <SuperheroGrid items={listState.items} onOpenHero={handleOpenHero} />

              <SuperheroPagination
                currentPage={listState.page}
                totalPages={listState.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>

      {selectedHero && (
        <SuperheroDetailModal
          hero={selectedHero}
          onClose={handleCloseHeroModal}
        />
      )}
    </div>
  );
};

function sanitizePage(value: string | null): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildSuperheroSearchParams(page: number, heroSlug?: string | null) {
  const nextParams = new URLSearchParams();
  nextParams.set('page', String(page));

  if (heroSlug) {
    nextParams.set('hero', heroSlug);
  }

  return nextParams;
}
