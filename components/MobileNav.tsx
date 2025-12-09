import React from 'react';
import { PageType } from '../types';
import { Home, Video, Image, Mail } from 'lucide-react';

interface MobileNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home' as PageType, label: '首页', icon: Home },
    { id: 'video' as PageType, label: '视频', icon: Video },
    { id: 'graphic' as PageType, label: '设计', icon: Image },
    { id: 'contact' as PageType, label: '联系', icon: Mail },
  ];

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    window.scrollTo(0, 0);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
              />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;