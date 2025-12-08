import React, { useState, useEffect } from 'react';
import { PageType } from './types';
import Navigation from './components/Navigation';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import VideoPortfolio from './pages/VideoPortfolio';
import GraphicPortfolio from './pages/GraphicPortfolio';
import Contact from './pages/Contact';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'video':
        return <VideoPortfolio />;
      case 'graphic':
        return <GraphicPortfolio />;
      case 'contact':
        return <Contact />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-primary">
      {/* Desktop Header */}
      <Navigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isScrolled={isScrolled} 
      />

      {/* Main Content Area */}
      <main className="flex-grow pt-16 md:pt-20 pb-24 md:pb-0">
        {renderPage()}
      </main>

      {/* Footer (Hidden on Home and Contact as they have custom elaborate footers) */}
      {currentPage !== 'home' && currentPage !== 'contact' && (
        <footer className="border-t border-border py-12 px-6 md:px-12 text-center md:text-left text-sm text-secondary">
          <div className="max-w-7xl mx-auto">
            <p>&copy; 2026 WXZ STUDIO. All Rights Reserved.</p>
          </div>
        </footer>
      )}

      {/* Mobile Sticky Navigation */}
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;