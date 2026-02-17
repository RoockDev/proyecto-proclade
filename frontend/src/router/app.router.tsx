import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../features/home/pages/HomePage/HomePage';
import { AuthPage } from '../features/auth/pages/AuthPage/AuthPage';
import { PublicLayout } from './layouts/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';

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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
