import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { SystemHealthBanner } from '../components/SystemHealthBanner';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout with persistent navbar, footer, scroll restoration,
 * and system health monitoring banner.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      <SystemHealthBanner />
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
