import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../features/home/pages/HomePage/HomePage';
import { AuthPage } from '../features/auth/pages/AuthPage/AuthPage';
import { AdminLayout } from '../features/admin/components/layout/AdminLayout/AdminLayout';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage/AdminDashboardPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage/AdminUsersPage';
import { AdminSectionPage } from '../features/admin/pages/AdminSectionPage/AdminSectionPage';
import { PublicLayout } from './layouts/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { SuperheroesPage } from './pages/SuperheroesPage';
import { NoticiasPage } from './pages/NoticiasPage';
import { ColaboraPage } from './pages/ColaboraPage';

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
        path: 'superheroes',
        element: <SuperheroesPage />,
      },
      {
        path: 'noticias',
        element: <NoticiasPage />,
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
        element: <AdminSectionPage section="Noticias" />,
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
        element: <AdminSectionPage section="Delegaciones" />,
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
