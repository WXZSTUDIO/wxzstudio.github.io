import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { X } from 'lucide-react';

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
                {/* WeChat Icon - Actual Logo Path */}
                <button 
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#07C160] hover:text-white transition-all duration-300"
                  onClick={() => navigator.clipboard.writeText('icf304').then(() => alert('WeChat ID: icf304 Copied!'))}
                  title="WeChat: icf304"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                       <path d="M8.69 14.3c-4.47 0-8.1 3.24-8.1 7.23 0 2.27 1.18 4.3 3.03 5.66-.3.94-.97 2.5-1.12 2.87-.15.4-.07.78.3.78.18 0 .5-.05 2.22-1.14 1.13.56 2.4.88 3.74.88 4.47 0 8.1-3.24 8.1-7.23 0-4-3.63-7.24-8.1-7.24zm14.28-7.7c-4.2 0-7.6 3.03-7.6 6.77 0 .28.02.55.06.82.7.1 1.43.16 2.18.16 5.42 0 9.82-3.56 9.82-7.94 0-4.38-4.4-7.93-9.82-7.93-5.4 0-9.8 3.55-9.8 7.93 0 .7.12 1.4.32 2.05 1.4-1.1 3.16-1.8 5.04-1.8 4.2 0 7.6 3.04 7.6 6.78 0 .1-.02.2-.03.3.06 0 .12-.02.18-.02 1.26 0 2.46.3 3.5.83 1.62 1.02 1.93 1.07 2.1 1.07.34 0 .42-.36.28-.73-.13-.35-.77-1.8-1.05-2.68 1.73-1.28 2.84-3.18 2.84-5.3 0-3.74-3.2-6.78-7.14-6.78z" transform="translate(0 -2) scale(0.9)"/>
                    </svg>
                </button>
                
                {/* XiaoHongShu Icon - Actual Logo Path */}
                <a 
                   href="https://xhslink.com/m/4FrLqFlYhZj" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#FF2442] hover:text-white transition-all duration-300"
                   title="XiaoHongShu"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                       <path d="M4.3 0h15.4C22.1 0 24 1.9 24 4.3v15.4c0 2.4-1.9 4.3-4.3 4.3H4.3C1.9 24 0 22.1 0 19.7V4.3C0 1.9 1.9 0 4.3 0z" fill="none"/>
                       <path d="M20.5 7.6c-.6-1.6-1.7-2.9-3-3.9-1.3-1-2.9-1.5-4.6-1.5H11c-1.7 0-3.3.5-4.6 1.5-1.3 1-2.4 2.3-3 3.9-.1.3-.2.6-.2.9 0 .2.1.3.3.4.2.1.4.1.6 0 .3-.1.6-.2.8-.4 1.1-1.3 2.7-2.1 4.5-2.1h1.9c1.7 0 3.4.8 4.5 2.1.3.3.6.4.8.4.2 0 .4-.1.6-.2.2-.1.3-.2.3-.4-.1-.2-.2-.5-.3-.7zM12 21.8c-2.4 0-4.6-.9-6.3-2.4-.4-.3-.7-.8-.9-1.2-.2-.5-.3-1-.3-1.5 0-1.1.4-2.1 1.2-2.9.8-.8 1.8-1.2 2.9-1.2.5 0 1 .1 1.5.3.4.2.8.5 1.2.9.2.2.5.2.7 0 .2-.2.2-.5 0-.7-.6-.6-1.2-1-1.9-1.2-.5-.2-1.1-.3-1.6-.3-1.7 0-3.2.7-4.3 1.8-1.1 1.1-1.8 2.6-1.8 4.3 0 .9.2 1.7.5 2.5.4.8 1 1.5 1.7 2.1 1.6 1.4 3.7 2.2 5.9 2.2s4.3-.8 5.9-2.2c.7-.6 1.3-1.3 1.7-2.1.3-.8.5-1.6.5-2.5 0-1.7-.7-3.2-1.8-4.3-1.1-1.1-2.6-1.8-4.3-1.8-.5 0-1.1.1-1.6.3-.7.2-1.3.6-1.9 1.2-.2.2-.2.5 0 .7.2.2.5.2.7 0 .4-.4.8-.7 1.2-.9.5-.2 1-.3 1.5-.3 1.1 0 2.1.4 2.9 1.2.8.8 1.2 1.8 1.2 2.9 0 .5-.1 1-.3 1.5-.2.5-.5.9-.9 1.2-1.7 1.5-3.9 2.4-6.3 2.4z"/>
                    </svg>
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