import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DelegationContactPanel } from '../../components/DelegationContactPanel/DelegationContactPanel';
import { DelegationTabs } from '../../components/DelegationTabs/DelegationTabs';
import { HumanBooksPanel } from '../../components/HumanBooksPanel/HumanBooksPanel';
import { getPublicRegions, getPublishedHumanBooks } from '../../api/human-libraries.api';
import { HUMAN_LIBRARY_HERO } from '../../constants/human-libraries.constants';
import type {
  DelegationTab,
  HumanBookApiItem,
  PublicRegionApiItem,
} from '../../types/human-libraries.types';
import {
  mapDelegationContacts,
  mapDelegationTabs,
  mapHumanBooksByRegion,
} from '../../utils/human-libraries.mapper';
import './HumanLibrariesPage.css';

export const HumanLibrariesPage = () => {
  const navigate = useNavigate();
  const { delegationSlug } = useParams<{ delegationSlug?: string }>();
  const [activeDelegationId, setActiveDelegationId] = useState<number | null>(null);
  const [regions, setRegions] = useState<PublicRegionApiItem[]>([]);
  const [books, setBooks] = useState<HumanBookApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [regionsResponse, booksResponse] = await Promise.all([
          getPublicRegions(),
          getPublishedHumanBooks(),
        ]);

        if (!regionsResponse.success) {
          throw new Error('No se pudo cargar la sección de bibliotecas humanas.');
        }

        if (!isMounted) {
          return;
        }

        const nextRegions = Array.isArray(regionsResponse.data) ? regionsResponse.data : [];

        setRegions(nextRegions);
        setBooks(
          booksResponse.success && Array.isArray(booksResponse.data) ? booksResponse.data : [],
        );

        if (!booksResponse.success) {
          setErrorMessage(
            'No hemos podido cargar los libros humanos ahora mismo. Puedes seguir consultando las delegaciones.',
          );
        }

        setActiveDelegationId((previousDelegationId) => {
          if (nextRegions.length === 0) {
            return null;
          }

          const stillExists = nextRegions.some((region) => region.id === previousDelegationId);

          if (stillExists && previousDelegationId !== null) {
            return previousDelegationId;
          }

          return nextRegions[0].id;
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          'No hemos podido cargar la sección ahora mismo. Inténtalo de nuevo en unos minutos.',
        );
        setRegions([]);
        setBooks([]);
        setActiveDelegationId(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const tabs = useMemo<DelegationTab[]>(() => mapDelegationTabs(regions), [regions]);
  const tabsBySlug = useMemo(
    () => new Map(tabs.map((tab) => [tab.slug, tab])),
    [tabs],
  );
  const contactsByDelegation = useMemo(
    () => mapDelegationContacts(regions),
    [regions],
  );
  const booksByDelegation = useMemo(
    () => mapHumanBooksByRegion(books),
    [books],
  );

  const activeContact = activeDelegationId ? contactsByDelegation[activeDelegationId] : null;
  const activeBooks = activeDelegationId ? booksByDelegation[activeDelegationId] ?? [] : [];

  useEffect(() => {
    if (isLoading || tabs.length === 0) {
      return;
    }

    const normalizedSlug = delegationSlug?.toLowerCase();
    const matchedTab = normalizedSlug ? tabsBySlug.get(normalizedSlug) : null;
    const targetTab = matchedTab ?? tabs[0];

    if (activeDelegationId !== targetTab.id) {
      setActiveDelegationId(targetTab.id);
    }

    if (normalizedSlug !== targetTab.slug) {
      navigate(`/bibliotecas-humanas/${targetTab.slug}`, { replace: true });
    }
  }, [
    activeDelegationId,
    delegationSlug,
    isLoading,
    navigate,
    tabs,
    tabsBySlug,
  ]);

  const handleDelegationChange = (delegationId: number) => {
    const targetTab = tabs.find((tab) => tab.id === delegationId);

    if (!targetTab) {
      return;
    }

    setActiveDelegationId(delegationId);
    navigate(`/bibliotecas-humanas/${targetTab.slug}`);
  };

  return (
    <div className="human-libraries-page">
      <section className="human-libraries-page__hero page-hero gradient-hero">
        <div className="container text-center">
          <h1>{HUMAN_LIBRARY_HERO.title}</h1>
          <p>{HUMAN_LIBRARY_HERO.subtitle}</p>
        </div>
      </section>

      <section className="human-libraries-page__content section-padding">
        <div className="container">
          {errorMessage && (
            <div className="alert alert-warning human-libraries-page__alert" role="status">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="human-libraries-page__state" role="status" aria-live="polite">
              <div className="spinner-border text-secondary" role="presentation" />
              <p>Cargando bibliotecas humanas...</p>
            </div>
          ) : tabs.length === 0 ? (
            <div className="human-libraries-page__state human-libraries-page__state--empty">
              <i className="bi bi-geo-alt" aria-hidden="true" />
              <p>No hay delegaciones activas publicadas en este momento.</p>
            </div>
          ) : activeContact ? (
            <>
              <DelegationTabs
                tabs={tabs}
                activeDelegation={activeDelegationId ?? tabs[0].id}
                onChange={handleDelegationChange}
              />

              <div className="row g-4">
                <div className="col-12 col-lg-5">
                  <DelegationContactPanel contact={activeContact} />
                </div>
                <div className="col-12 col-lg-7">
                  <HumanBooksPanel
                    delegationLabel={activeContact.label}
                    books={activeBooks}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="human-libraries-page__state human-libraries-page__state--empty">
              <i className="bi bi-exclamation-circle" aria-hidden="true" />
              <p>No hemos podido preparar los datos de esta delegación.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
