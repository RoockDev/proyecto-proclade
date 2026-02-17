import { Outlet } from 'react-router-dom';
import { Header } from '../../components/layout/Header/Header';
import { Footer } from '../../components/layout/Footer/Footer';
import './PublicLayout.css';

export function PublicLayout() {
  return (
    <div className="public-layout">
      <Header />
      <main className="public-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
