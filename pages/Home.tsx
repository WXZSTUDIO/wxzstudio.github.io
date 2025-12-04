import React, { useState, useEffect, useRef } from 'react';
import { VIDEO_PORTFOLIO, SERVICES, CLIENTS } from '../constants';
import { ArrowRight, Star, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % VIDEO_PORTFOLIO.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + VIDEO_PORTFOLIO.length) % VIDEO_PORTFOLIO.length);
  };

  const currentItem = VIDEO_PORTFOLIO[currentSlide];

  return (
    <div className="flex flex-col w-full bg-background overflow-x-hidden">
      
      {/* 
        ========================================
        HERO SLIDER SECTION (Cinematic Style) 
        ========================================
      */}
      <section className="relative h-screen w-full overflow-hidden bg-black text-white">
        
        {/* Background Image/Video Layer */}
        {VIDEO_PORTFOLIO.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
             {/* Vignette Overlays */}
             <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-black via-black/60 to-transparent z-20 pointer-events-none" />
             <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />
             
             {/* Image */}
             <img 
               src={item.mediaSrc} 
               alt={item.title}
               className="w-full h-full object-cover animate-[pulse_10s_ease-in-out_infinite]"
               style={{ animationDuration: '20s' }} // Slow zoom effect
             />
          </div>
        ))}

        {/* 
           Critical Acclaim - Positioned Top Right 
        */}
        <div className="absolute top-28 right-6 md:right-12 z-40 hidden md:flex flex-col items-end gap-6 text-right">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex flex-col items-end animate-fade-in-right" style={{ animationDelay: `${i * 0.1}s`}}>
                  <div className="flex gap-0.5 text-white mb-1">
                    {[...Array(5)].map((__, j) => <Star key={j} size={10} fill="currentColor" />)}
                  </div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/50 mb-0.5">Critical Acclaim</p>
                  <p className="text-xs font-bold uppercase text-white max-w-[120px] leading-tight shadow-black drop-shadow-md">
                    {i === 0 ? '"A Fascinating Voyage"' : i === 1 ? '"A Film Based on True Story"' : '"Riveting Soundtrack"'}
                  </p>
              </div>
            ))}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-30 container mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-12 md:pb-20">
           
           <div className="flex flex-col md:flex-row items-end justify-between w-full">
             
             {/* Left: Title & Info */}
             <div className="mb-8 md:mb-0 max-w-3xl">
                <div key={`text-${currentSlide}`} className="animate-fade-in-up">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/70">
                        {currentItem.year}
                     </span>
                     <div className="w-12 h-[1px] bg-white/30"></div>
                     <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/70">
                        {currentItem.category}
                     </span>
                  </div>
                  
                  <h1 className="text-5xl md:text-8xl font-display font-black leading-[0.9] text-white uppercase tracking-tighter mb-6">
                     {currentItem.title}
                  </h1>

                  <p className="text-white/60 text-sm md:text-base max-w-lg leading-relaxed font-light mb-8">
                     {currentItem.stats?.quote || "An immersive visual experience crafted by WXZ Studio."}
                  </p>
                  
                  {/* Metadata Grid */}
                  <div className="flex gap-12 border-t border-white/20 pt-4">
                     <div>
                        <span className="block text-[9px] text-gray-400 uppercase tracking-widest mb-1">Director</span>
                        <span className="block text-xs font-bold uppercase">{currentItem.clientName || 'Limor Pinhasov'}</span>
                     </div>
                     <div>
                        <span className="block text-[9px] text-gray-400 uppercase tracking-widest mb-1">Category</span>
                        <span className="block text-xs font-bold uppercase">{currentItem.filterTags[0]}</span>
                     </div>
                  </div>
                </div>
             </div>

             {/* Right: Ticket Button Only (Acclaim moved to top) */}
             <div className="flex flex-col items-end gap-12">
                <Link 
                   to="/video-portfolio"
                   className="group relative block w-48 h-16 bg-transparent transition-transform hover:scale-105"
                >
                   {/* Ticket Body with 'Bites' */}
                   <div 
                      className="absolute inset-0 bg-transparent border border-white flex items-center"
                      style={{
                         mask: `radial-gradient(circle 8px at 0 50%, transparent 8px, black 8.5px) 0 50%,
                                radial-gradient(circle 8px at 100% 50%, transparent 8px, black 8.5px) 100% 50%`,
                         maskRepeat: 'no-repeat',
                         maskSize: '100% 100%',
                         WebkitMask: `radial-gradient(circle 8px at 0 50%, transparent 8px, black 8.5px) 0 50%,
                                      radial-gradient(circle 8px at 100% 50%, transparent 8px, black 8.5px) 100% 50%`,
                         WebkitMaskRepeat: 'no-repeat',
                         WebkitMaskSize: '100% 100%'
                      }}
                   >
                       {/* Visible Border Container */}
                       <div className="w-full h-full border border-white flex items-center justify-between px-6 bg-black/30 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                          <span className="text-sm font-bold tracking-[0.2em] text-white">EXPLORE</span>
                          <div className="absolute left-[70%] top-0 bottom-0 w-[1px] border-l border-dashed border-white/50"></div>
                          <ArrowRight size={20} className="text-white ml-auto" />
                       </div>
                   </div>

                   {/* Corner Borders Pseudo-elements */}
                   <div className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-r border-white bg-black z-20" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)', left: '-8px' }}></div>
                   <div className="absolute right-[-1px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-l border-white bg-black z-20" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)', right: '-8px' }}></div>
                </Link>
             </div>
           </div>
        </div>
      </section>

      {/* 
        ========================================
        SERVICES SECTION (Column Process Style)
        ========================================
      */}
      <section className="py-24 bg-[#08090A]">
        <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-4">Our Services</h2>
                 <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>

            {/* Service Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-white/20 min-h-[500px]">
                {SERVICES.map((service, index) => (
                    <div 
                        key={index} 
                        className="group relative border-r border-white/20 last:border-r-0 flex flex-col justify-between p-6 md:p-8 hover:bg-[#111] transition-colors duration-500 overflow-hidden"
                    >
                        {/* Hover Image Background */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 z-0">
                            <img src={service.image} className="w-full h-full object-cover grayscale" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        </div>

                        {/* Top Content */}
                        <div className="relative z-10">
                            {/* Number Badge */}
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold font-mono text-sm mb-8 group-hover:scale-110 transition-transform">
                                {index + 1}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-3xl font-display font-bold text-white uppercase leading-none break-words hyphens-auto mb-4 group-hover:translate-x-2 transition-transform duration-300">
                                {service.title}
                            </h3>
                        </div>

                        {/* Bottom Content */}
                        <div className="relative z-10 mt-12 md:mt-0">
                            <div className="h-[1px] w-8 bg-white/50 mb-6 group-hover:w-16 transition-all duration-500"></div>
                            <p className="text-secondary text-sm font-light leading-relaxed group-hover:text-white transition-colors">
                                {service.description}
                            </p>
                            
                            <div className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50 group-hover:text-white cursor-pointer transition-colors">
                                <span>Read More</span>
                                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 
        ========================================
        CLIENTS SECTION (Infinite Marquee)
        ========================================
      */}
      <section className="pt-24 pb-12 bg-black border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-6 mb-12 text-center">
           <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 block mb-4">Trusted By Industry Leaders</span>
        </div>

        {/* Marquee Track */}
        <div className="relative w-full flex overflow-hidden mask-linear-fade mb-20">
           {/* Linear Gradient Mask for fade edges */}
           <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-black to-transparent z-20"></div>
           <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-black to-transparent z-20"></div>

           <div className="flex animate-scroll whitespace-nowrap hover:[animation-play-state:paused]">
              {/* Duplicate list multiple times to ensure seamless infinite scroll */}
              {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, index) => (
                 <div key={`${client.id}-${index}`} className="flex items-center justify-center mx-8 md:mx-16 w-32 md:w-48 opacity-40 hover:opacity-100 transition-opacity duration-300">
                    {client.logoSrc ? (
                       <img src={client.logoSrc} alt={client.name} className="max-w-full h-12 object-contain grayscale" />
                    ) : (
                       <span className="text-2xl md:text-4xl font-display font-bold text-white uppercase tracking-tighter whitespace-nowrap">
                          {client.name}
                       </span>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* 
            Footer Info / Service Terms Area
            Style inspired by the iPhone card screenshot: Dark, Rounded, subtle border
        */}
        <div className="container mx-auto px-4 md:px-12">
            <div className="w-full max-w-6xl mx-auto rounded-[2.5rem] bg-[#101010] border border-white/10 p-8 md:p-12 relative overflow-hidden group">
                {/* Subtle Gradient Glow Background */}
                <div className="absolute top-[-50%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-900/20 transition-colors duration-1000"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-16">
                    {/* Left: Brand or Main Statement */}
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">WXZ STUDIO</h4>
                        <p className="text-secondary text-sm max-w-sm">
                            Creating visual experiences that transcend the ordinary. Based in Seoul, working globally.
                        </p>
                    </div>

                    {/* Right: Stats/Links Style Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 w-full md:w-auto">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Legal</span>
                            <a href="#" className="text-sm text-white hover:text-blue-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-sm text-white hover:text-blue-400 transition-colors">Privacy Policy</a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Social</span>
                            <a href="#" className="text-sm text-white hover:text-blue-400 transition-colors">Instagram</a>
                            <a href="#" className="text-sm text-white hover:text-blue-400 transition-colors">LinkedIn</a>
                        </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Contact</span>
                            <span className="text-sm text-white">hello@wxz.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;