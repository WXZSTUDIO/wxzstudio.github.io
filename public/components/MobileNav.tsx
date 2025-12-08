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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-accent' : 'text-neutral-500'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] scale-90">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;