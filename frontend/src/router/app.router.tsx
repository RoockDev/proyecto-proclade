import { createBrowserRouter, Link, useNavigate } from 'react-router-dom';
import { HomePage } from '../features/home/pages/HomePage/HomePage';
import { LoginPage } from '../features/auth/pages/LoginPage/LoginPage';

function HomeRoute() {
  const navigate = useNavigate();


  return <HomePage onAccessClick={() => navigate('/auth/login')} />;
}

function LoginRoute() {
  const navigate = useNavigate();

  
  return <LoginPage onBack={() => navigate('/')} />;
}

function RegisterRoute() {
  const navigate = useNavigate();

  
  return <LoginPage onBack={() => navigate('/')} />;
}

function NotFoundRoute() {
  return (
    <main className="container py-5 text-center">
      <h1 className="mb-3">404</h1>
      <p className="mb-4">La pagina solicitada no existe.</p>
      <Link to="/" className="btn btn-brand">
        Volver al inicio
      </Link>
    </main>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomeRoute />,
  },
  {
    path: '/auth/login',
    element: <LoginRoute />,
  },
  {
    path: '/auth/register',
    element: <RegisterRoute />,
  },
  {
    path: '*',
    element: <NotFoundRoute />,
  },
]);
