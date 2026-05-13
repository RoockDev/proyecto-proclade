import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../features/home/pages/HomePage/HomePage';
import { AuthPage } from '../features/auth/pages/AuthPage/AuthPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage/ResetPasswordPage';
import { AdminLayout } from '../features/admin/components/layout/AdminLayout/AdminLayout';
import { AdminChallengesPage } from '../features/admin/pages/AdminChallengesPage/AdminChallengesPage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage/AdminDashboardPage';
import { AdminHumanBooksPage } from '../features/admin/pages/AdminHumanBooksPage/AdminHumanBooksPage';
import { AdminNewsPage } from '../features/admin/pages/AdminNewsPage/AdminNewsPage';
import { AdminRegionsPage } from '../features/admin/pages/AdminRegionsPage/AdminRegionsPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage/AdminUsersPage';
import { AdminSuperheroesPage } from '../features/admin/pages/AdminSuperheroesPage/AdminSuperheroesPage';
import { AdminChatbotPage } from '../features/admin/pages/AdminChatbotPage/AdminChatbotPage';
import { PublicLayout } from './layouts/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { ColaboraPage } from './pages/ColaboraPage';
import { NewsListPage } from '../features/news/pages/NewsListPage/NewsListPage';
import { NewsDetailPage } from '../features/news/pages/NewsDetailPage/NewsDetailPage';
import { HumanLibrariesPage } from '../features/human-libraries/pages/HumanLibrariesPage/HumanLibrariesPage';
import { ContactoPage } from './pages/ContactoPage';

const SuperheroesPage = lazy(() =>
  import('../features/superheroes/pages/SuperheroesPage/SuperheroesPage').then((module) => ({
    default: module.SuperheroesPage,
  })),
);

const superheroesFallback = (
  <section className="section-padding">
    <div className="container text-center">
      <div className="spinner-border text-secondary" role="status" />
    </div>
  </section>
);

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'auth/login',
        element: <AuthPage mode="login" />,
      },
      {
        path: 'auth/register',
        element: <AuthPage mode="register" />,
      },
      {
        path: 'auth/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'superheroes',
        element: (
          <Suspense fallback={superheroesFallback}>
            <SuperheroesPage />
          </Suspense>
        ),
      },
      {
        path: 'noticias',
        element: <NewsListPage />,
      },
      {
        path: 'noticias/:slug',
        element: <NewsDetailPage />,
      },
      {
        path: 'bibliotecas-humanas',
        element: <HumanLibrariesPage />,
      },
      {
        path: 'bibliotecas-humanas/:delegationSlug',
        element: <HumanLibrariesPage />,
      },
      {
        path: 'colabora',
        element: <ColaboraPage />,
      },
      {
        path: 'contacto',
        element: <ContactoPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'noticias',
        element: <AdminNewsPage />,
      },
      {
        path: 'retos',
        element: <AdminChallengesPage />,
      },
      {
        path: 'libros',
        element: <AdminHumanBooksPage />,
      },
      {
        path: 'superheroes',
        element: <AdminSuperheroesPage />,
      },
      {
        path: 'delegaciones',
        element: <AdminRegionsPage />,
      },
      {
        path: 'usuarios',
        element: <AdminUsersPage />,
      },
      {
        path: 'chatbot',
        element: <AdminChatbotPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
