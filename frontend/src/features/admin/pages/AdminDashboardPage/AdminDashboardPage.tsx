import { useEffect, useState } from 'react';
import { listAdminChallenges } from '../../api/challenges.api';
import { listHumanBooks } from '../../api/human-books.api';
import { listAdminNews } from '../../api/news-admin.api';
import { listUsers } from '../../api/users.api';
import { DashboardActivity } from '../../components/dashboard/DashboardActivity/DashboardActivity';
import {
  DashboardStats,
  type DashboardStatistic,
} from '../../components/dashboard/DashboardStats/DashboardStats';
import type { AdminChallenge } from '../../types/challenges.types';
import type { AdminHumanBook } from '../../types/human-books.types';
import type { AdminNewsItem } from '../../types/news-admin.types';
import type { AdminUser } from '../../types/users.types';
import './AdminDashboardPage.css';

type DashboardDataState = {
  news: AdminNewsItem[];
  challenges: AdminChallenge[];
  humanBooks: AdminHumanBook[];
  users: AdminUser[];
};

const EMPTY_DASHBOARD_DATA: DashboardDataState = {
  news: [],
  challenges: [],
  humanBooks: [],
  users: [],
};

export const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] =
    useState<DashboardDataState>(EMPTY_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [newsResponse, challengesResponse, humanBooksResponse, usersResponse] =
          await Promise.all([
            listAdminNews(),
            listAdminChallenges(),
            listHumanBooks(),
            listUsers(),
          ]);

        if (!isMounted) {
          return;
        }

        setDashboardData({
          news: newsResponse.success && newsResponse.data ? newsResponse.data : [],
          challenges:
            challengesResponse.success && challengesResponse.data
              ? challengesResponse.data
              : [],
          humanBooks:
            humanBooksResponse.success && humanBooksResponse.data
              ? humanBooksResponse.data
              : [],
          users: usersResponse.success && usersResponse.data ? usersResponse.data : [],
        });

        if (
          !newsResponse.success ||
          !challengesResponse.success ||
          !humanBooksResponse.success ||
          !usersResponse.success
        ) {
          setErrorMessage(
            'No se pudo cargar todo el dashboard en tiempo real. Mostramos los datos disponibles.',
          );
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setDashboardData(EMPTY_DASHBOARD_DATA);
        setErrorMessage('No se pudo cargar la información del dashboard.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const publishedNews = dashboardData.news.filter(
    (item) => item.status === 'PUBLISHED' && !item.deletedAt,
  );
  const activeChallenges = dashboardData.challenges.filter(
    (item) => item.isActive && !item.deletedAt,
  );
  const activeHumanBooks = dashboardData.humanBooks.filter((item) => !item.deletedAt);
  const realHeroes = dashboardData.users.filter((item) => item.isRealHero && !item.deletedAt);

  const latestPublishedNews = getLatestByDate(
    publishedNews,
    (item) => item.publishedAt || item.createdAt,
  );
  const latestUpdatedChallenge = getLatestByDate(
    activeChallenges,
    (item) => item.updatedAt,
  );
  const latestHumanBook = getLatestByDate(activeHumanBooks, (item) => item.createdAt);
  const latestRealHero = getLatestByDate(realHeroes, (item) => item.updatedAt);

  const stats: DashboardStatistic[] = [
    {
      label: 'Noticias publicadas',
      value: formatCount(publishedNews.length),
      detail: latestPublishedNews
        ? truncateText(latestPublishedNews.title, 34)
        : 'Sin noticias publicadas todavía',
      icon: <i className="bi bi-newspaper" aria-hidden="true" />,
    },
    {
      label: 'Retos activos',
      value: formatCount(activeChallenges.length),
      detail: latestUpdatedChallenge
        ? `Último: ${truncateText(latestUpdatedChallenge.title, 28)}`
        : 'Sin retos activos todavía',
      icon: <i className="bi bi-bullseye" aria-hidden="true" />,
    },
    {
      label: 'Libros humanos',
      value: formatCount(activeHumanBooks.length),
      detail: latestHumanBook
        ? `${truncateText(latestHumanBook.title, 32)} · ${latestHumanBook.region.name}`
        : 'Sin libros humanos registrados',
      icon: <i className="bi bi-book-half" aria-hidden="true" />,
    },
    {
      label: 'Superhéroes reales',
      value: formatCount(realHeroes.length),
      detail: latestRealHero
        ? `Último: ${truncateText(
            `${latestRealHero.name} ${latestRealHero.surname}`.trim(),
            28,
          )}`
        : 'Sin superhéroes reales todavía',
      icon: <i className="bi bi-people-fill" aria-hidden="true" />,
    },
  ];

  const activities = [
    latestPublishedNews
      ? `Noticia publicada: ${truncateText(latestPublishedNews.title, 58)}`
      : 'Aún no se ha publicado ninguna noticia.',
    latestUpdatedChallenge
      ? `Reto actualizado: ${truncateText(latestUpdatedChallenge.title, 58)}`
      : 'Aún no hay retos activos actualizados.',
    latestHumanBook
      ? `Nuevo libro humano: ${truncateText(latestHumanBook.title, 52)} en ${latestHumanBook.region.name}`
      : 'Aún no hay libros humanos registrados.',
    latestRealHero
      ? `Superhéroe real marcado: ${truncateText(
          `${latestRealHero.name} ${latestRealHero.surname}`.trim(),
          52,
        )}`
      : 'Aún no se ha marcado ningún superhéroe real.',
  ];

  return (
    <section className="admin-dashboard-page">
      {errorMessage ? (
        <div className="alert alert-warning mb-0" role="status">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="alert alert-light mb-0" role="status">
          Cargando dashboard...
        </div>
      ) : null}

      <DashboardStats stats={stats} />
      <DashboardActivity items={activities} />
    </section>
  );
};

function getLatestByDate<T>(items: T[], resolveDate: (item: T) => string | null | undefined) {
  return [...items].sort((left, right) => {
    const leftTimestamp = parseDate(resolveDate(left));
    const rightTimestamp = parseDate(resolveDate(right));
    return rightTimestamp - leftTimestamp;
  })[0];
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatCount(value: number) {
  return new Intl.NumberFormat('es-ES').format(value);
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
