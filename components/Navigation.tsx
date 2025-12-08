import React, { useState, useEffect } from 'react';
import { PageType } from '../types';
import { Menu, X, Instagram, Twitter, ArrowRight } from 'lucide-react';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isScrolled: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isScrolled }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleNavigate = (page: PageType) => {
    setIsOpen(false);
    onNavigate(page);
  };

  return (
    <>
      {/* 
        Floating Glass Capsule Header 
        Centered horizontally, floating from the top.
      */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] md:w-auto md:min-w-[400px] max-w-5xl">
        <div className="relative group">
            {/* The Glass Pill */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg transition-all duration-300 group-hover:bg-black/60" />
            
            <div className="relative px-6 py-3 flex items-center justify-between md:justify-center md:gap-x-12">
                
                {/* Logo Area */}
                <div 
                  className="text-lg font-bold tracking-tight cursor-pointer text-white flex items-center space-x-2"
                  onClick={() => handleNavigate('home')}
                >
                  <span>WXZ STUDIO</span>
                </div>

                {/* Desktop Divider (Hidden on mobile) */}
                <div className="hidden md:block w-px h-4 bg-white/20"></div>

                {/* Menu Trigger */}
                <button 
                  onClick={() => setIsOpen(true)}
                  className="flex items-center space-x-2 text-xs font-bold tracking-widest text-white hover:text-accent transition-colors"
                >
                  <span>MENU</span>
                  <div className="p-1 rounded-full bg-white/10">
                    <Menu size={14} />
                  </div>
                </button>
            </div>
        </div>
      </header>

      {/* 
        Full Screen Menu Modal 
        Redesigned: Clean, Dark, Glassmorphism, Rounded Corners
      */}
      <div 
        className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-all duration-500 ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0 delay-200'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Modal Content */}
        <div 
          className={`relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 shadow-2xl overflow-hidden rounded-[2rem] text-white transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'
          }`}
        >
          {/* Close Button */}
          <div className="absolute top-6 right-6 z-20">
             <button 
                 onClick={() => setIsOpen(false)}
                 className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/20 hover:rotate-90 transition-all duration-300 border border-white/5"
               >
                 <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
             
             {/* Left Col: Navigation Links */}
             <div className="space-y-2">
                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-6 block">Navigation</span>
                
                <div className="space-y-6">
                    <button 
                        onClick={() => handleNavigate('home')} 
                        className="group flex items-center justify-between w-full text-left"
                    >
                        <span className="text-3xl md:text-4xl font-display font-bold text-white group-hover:text-accent transition-colors">HOME</span>
                        <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent" />
                    </button>

                    <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-white/40 tracking-widest uppercase block mb-1">Portfolio</span>
                        <button 
                            onClick={() => handleNavigate('video')} 
                            className="block text-xl text-white/70 hover:text-white transition-colors"
                        >
                            Video Production
                        </button>
                        <button 
                            onClick={() => handleNavigate('graphic')} 
                            className="block text-xl text-white/70 hover:text-white transition-colors"
                        >
                            Graphic Design
                        </button>
                    </div>

                    <button 
                        onClick={() => handleNavigate('contact')} 
                        className="group flex items-center justify-between w-full text-left pt-2"
                    >
                        <span className="text-3xl md:text-4xl font-display font-bold text-white group-hover:text-accent transition-colors">CONTACT</span>
                        <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent" />
                    </button>
                </div>
             </div>

             {/* Right Col: Info */}
             <div className="flex flex-col justify-end space-y-8 border-t md:border-t-0 border-white/10 pt-8 md:pt-0">
                <div>
                   <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2 block">Connect</span>
                   <div className="flex space-x-4">
                      <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white hover:text-black transition-colors">
                        <Twitter size={18} />
                      </a>
                      <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white hover:text-black transition-colors">
                        <Instagram size={18} />
                      </a>
                   </div>
                </div>

                <div>
                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2 block">Legal</span>
                    <div className="flex flex-col space-y-1 text-xs text-white/60">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <span className="pt-2 opacity-40">© 2026 WXZ STUDIO</span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;