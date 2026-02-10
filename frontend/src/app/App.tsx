import { useState } from 'react';
import { HomePage } from '../features/home/pages/HomePage/HomePage';
import { LoginPage } from '../features/auth/pages/LoginPage/LoginPage';

// Cuando tengamos routing, esto se sustituye por el router
export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'login'>('home');

  const handleAccessClick = () => setCurrentView('login');
  const handleBackToHome = () => setCurrentView('home');

  if (currentView === 'login') {
    return <LoginPage onBack={handleBackToHome} />;
  }

  return <HomePage onAccessClick={handleAccessClick} />;
}
