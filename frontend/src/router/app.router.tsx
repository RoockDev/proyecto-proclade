import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../features/home/pages/HomePage/HomePage';
import { AuthPage } from '../features/auth/pages/AuthPage/AuthPage';
import { AdminLayout } from '../features/admin/components/layout/AdminLayout/AdminLayout';
import { AdminPanelPage } from '../features/admin/pages/AdminPanelPage/AdminPanelPage';
import { PublicLayout } from './layouts/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminCampaignsPage } from '../features/admin/pages/AdminCampaignsPage/AdminCampaignsPage';
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
        element: <AdminPanelPage />,
      },
      {
        path: 'campanas',
        element: <AdminCampaignsPage />,
      },
    ],
  },
]);
