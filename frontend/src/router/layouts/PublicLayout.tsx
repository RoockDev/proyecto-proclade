import { Outlet } from 'react-router-dom';
import { Header } from '../../components/layout/Header/Header';
import { Footer } from '../../components/layout/Footer/Footer';
import { ChatbotWidget } from '../../features/chatbot/components/ChatbotWidget/ChatbotWidget';
import './PublicLayout.css';

export function PublicLayout() {
  return (
    <div className="public-layout">
      <Header />
      <main className="public-layout__content">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
