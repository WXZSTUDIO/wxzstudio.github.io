import React from 'react';
import { PageType } from '../types';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isScrolled: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isScrolled }) => {
  const navItems: { id: PageType; label: string }[] = [
    { id: 'home', label: '首页' },
    { id: 'video', label: '视频作品' },
    { id: 'graphic', label: '平面设计' },
    { id: 'contact', label: '联系方式' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-background/80 backdrop-blur-md border-border' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="text-xl md:text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onNavigate('home')}
        >
          WXZ STUDIO
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`text-sm tracking-wide transition-colors duration-200 ${
                    currentPage === item.id 
                      ? 'text-accent font-medium' 
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;