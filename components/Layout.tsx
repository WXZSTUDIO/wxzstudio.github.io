import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { X, BookHeart } from 'lucide-react';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-primary selection:bg-white/20">
      
      {/* Top Gradient Mask for Logo and Menu readability */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-[998] pointer-events-none"></div>

      {/* Top Bar - Z-Index 1001 to stay above the menu overlay (which is 1000) */}
      <header className="fixed top-0 left-0 right-0 z-[1001] py-6 px-6 md:px-12 flex justify-between items-start pointer-events-none">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-display font-bold tracking-widest text-white pointer-events-auto mix-blend-difference z-[1001] mt-2">
          WXZ<span className="font-light">STUDIO</span>
        </NavLink>

        {/* 
            Ticket Menu Button 
        */}
        <button 
          onClick={toggleMenu}
          className="pointer-events-auto z-[1001] group relative w-14 h-14 bg-[#FBF9F3] text-black shadow-2xl transition-transform hover:scale-105 flex flex-col items-center justify-center gap-1.5"
          style={{
            // CSS Mask to create the "Ticket" inverted radius effect at corners
            mask: `radial-gradient(circle 8px at 0 0, transparent 0, transparent 100%) 0 0,
                   radial-gradient(circle 8px at 100% 0, transparent 0, transparent 100%) 100% 0,
                   radial-gradient(circle 8px at 0 100%, transparent 0, transparent 100%) 0 100%,
                   radial-gradient(circle 8px at 100% 100%, transparent 0, transparent 100%) 100% 100%`,
            maskRepeat: 'no-repeat',
            // Fallback for mask compositing
            WebkitMask: `radial-gradient(circle 6px at top left, transparent 6px, black 6.5px) top left,
                         radial-gradient(circle 6px at top right, transparent 6px, black 6.5px) top right,
                         radial-gradient(circle 6px at bottom right, transparent 6px, black 6.5px) bottom right,
                         radial-gradient(circle 6px at bottom left, transparent 6px, black 6.5px) bottom left`,
            WebkitMaskSize: '51% 51%',
            WebkitMaskRepeat: 'no-repeat',
            backgroundColor: '#FBF9F3'
          }}
        >
          {isMenuOpen ? (
            <X size={28} strokeWidth={2.5} />
          ) : (
            <>
              <div className="w-6 h-0.5 bg-black rounded-full"></div>
              <div className="w-6 h-0.5 bg-black rounded-full"></div>
              <div className="w-6 h-0.5 bg-black rounded-full"></div>
            </>
          )}
        </button>
      </header>

      {/* Ticket Menu Overlay - Z-Index 1000 to cover everything else */}
      <div 
        className={`fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      >
        {/* The Open Ticket Card */}
        <div 
          className={`absolute top-6 right-6 md:right-12 w-[300px] bg-[#FBF9F3] text-black shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-top-right transform ${
            isMenuOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            // Same ticket shape for the menu container
             WebkitMask: `radial-gradient(circle 6px at top left, transparent 6px, black 6.5px) top left,
                         radial-gradient(circle 6px at top right, transparent 6px, black 6.5px) top right,
                         radial-gradient(circle 6px at bottom right, transparent 6px, black 6.5px) bottom right,
                         radial-gradient(circle 6px at bottom left, transparent 6px, black 6.5px) bottom left`,
            WebkitMaskSize: '51% 51%',
            WebkitMaskRepeat: 'no-repeat',
          }}
        >
          {/* Top "Tear" visual spacer to push content down from where the button sits */}
          <div className="h-20 w-full"></div>

          <div className="px-8 pb-8 pt-2">
             <nav className="flex flex-col space-y-4">
               {NAV_LINKS.map((link, idx) => (
                 <NavLink
                   key={link.path}
                   to={link.path}
                   onClick={() => setIsMenuOpen(false)}
                   className={({ isActive }) =>
                     `group flex items-baseline gap-4 text-3xl font-display font-bold uppercase transition-colors ${
                       isActive ? 'text-black' : 'text-gray-300 hover:text-black'
                     }`
                   }
                 >
                   <span className="text-xs font-mono font-medium text-gray-400 -translate-y-2">0{idx + 1}</span>
                   {link.label}
                 </NavLink>
               ))}
             </nav>
          </div>

          {/* Bottom Section with dotted line */}
          <div className="relative pt-6 pb-8 px-8">
             {/* Perforation Line */}
             <div className="absolute top-0 left-4 right-4 border-t-2 border-dashed border-gray-300"></div>
             
             <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-6 pt-2">
                <span className="cursor-pointer hover:text-black transition-colors">Cookie</span>
                <span className="cursor-pointer hover:text-black transition-colors">Terms</span>
                <span className="cursor-pointer hover:text-black transition-colors">Privacy</span>
             </div>

             <div className="flex gap-4 mb-8 text-xs font-bold uppercase tracking-widest items-center">
                {/* WeChat Icon */}
                <button 
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#07C160] hover:text-white transition-all duration-300"
                  onClick={() => navigator.clipboard.writeText('icf304').then(() => alert('WeChat ID: icf304 Copied!'))}
                  title="WeChat: icf304"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                       <path d="M8 12.6c0-3.4 3.6-6.1 8-6.1 4.4 0 8 2.7 8 6.1 0 1.9-1.1 3.6-2.9 4.7.1.6.4 1.3.8 1.9-1.2.2-3-.5-3.8-1.4-1 .5-2 .8-2.1.8-4.4 0-8-2.7-8-6zm-10.5 0c0-3.8 3.3-7 7.5-7 4.1 0 7.5 3.2 7.5 7 0 3.8-3.3 7-7.5 7-.9 0-1.7-.2-2.5-.5-.8.8-2.3 1.4-3.4 1.2.4-.6.6-1.2.5-1.8-1.6-1.1-2.6-2.6-2.6-4.4z"/>
                    </svg>
                </button>
                
                {/* RED (XiaoHongShu) Icon - Represented by BookHeart (Little Red Book) */}
                <a 
                   href="https://xhslink.com/m/4FrLqFlYhZj" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FF2442] hover:text-white transition-all duration-300"
                   title="XiaoHongShu"
                >
                    <BookHeart className="w-5 h-5" />
                </a>
             </div>

             <div className="text-[9px] text-gray-400 uppercase tracking-widest">
               © 2024. WXZ Studio.
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full relative z-0">
        {children}
      </main>

    </div>
  );
};