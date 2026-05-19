import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../../components/layout/Header/Header";
import { Footer } from "../../components/layout/Footer/Footer";
import { ChatbotWidget } from "../../features/chatbot/components/ChatbotWidget/ChatbotWidget";
import { CookiePreferencesModal } from "../../features/privacy/components/CookiePreferencesModal/CookiePreferencesModal";
import "./PublicLayout.css";

export function PublicLayout() {
  const location = useLocation();
  const [showCookieModal, setShowCookieModal] = useState(false);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));
    let timeoutId: number | null = null;

    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    });

    return () => {
      window.cancelAnimationFrame(frameId);

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [location.hash, location.pathname]);

  return (
    <div className="public-layout">
      <Header />
      <main className="public-layout__content">
        <Outlet />
      </main>
      <Footer onCookiePreferencesClick={() => setShowCookieModal(true)} />
      <ChatbotWidget />
      {showCookieModal && (
        <CookiePreferencesModal onClose={() => setShowCookieModal(false)} />
      )}
    </div>
  );
}
