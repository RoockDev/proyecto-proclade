import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../features/home/pages/HomePage/HomePage';
import { AuthPage } from '../features/auth/pages/AuthPage/AuthPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage/ResetPasswordPage';
import { AdminLayout } from '../features/admin/components/layout/AdminLayout/AdminLayout';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage/AdminDashboardPage';
import { AdminNewsPage } from '../features/admin/pages/AdminNewsPage/AdminNewsPage';
import { AdminRegionsPage } from '../features/admin/pages/AdminRegionsPage/AdminRegionsPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage/AdminUsersPage';
import { AdminSectionPage } from '../features/admin/pages/AdminSectionPage/AdminSectionPage';
import { PublicLayout } from './layouts/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { SuperheroesPage } from './pages/SuperheroesPage';
import { ColaboraPage } from './pages/ColaboraPage';
import { NewsListPage } from '../features/news/pages/NewsListPage/NewsListPage';
import { NewsDetailPage } from '../features/news/pages/NewsDetailPage/NewsDetailPage';

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
        element: <SuperheroesPage />,
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
        path: 'colabora',
        element: <ColaboraPage />,
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
        element: <AdminSectionPage section="Retos" />,
      },
      {
        path: 'libros',
        element: <AdminSectionPage section="Libros Humanos" />,
      },
      {
        path: 'heroes',
        element: <AdminSectionPage section="Superheroes" />,
      },
      {
        path: 'superheroes-reales',
        element: <AdminSectionPage section="Superheroes reales" />,
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
