import React, { useRef, useState, useEffect } from 'react';
import { VIDEO_PORTFOLIO } from '../constants';
import { Play, X } from 'lucide-react';
import { PortfolioItem } from '../types';

const Work = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<PortfolioItem | null>(null);

  // Drag to scroll logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Update progress bar on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const totalScroll = scrollWidth - clientWidth;
    const currentProgress = (scrollLeft / totalScroll) * 100;
    setProgress(currentProgress);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-center relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      {/* Header / Title */}
      <div className="absolute top-8 left-0 right-0 text-center z-10 pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">Footage Mode</span>
      </div>

      {/* 
        Horizontal Scroll Container 
        - 'no-scrollbar' class hides standard scrollbars
        - Flex container for horizontal layout
      */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-8 md:gap-16 px-8 md:px-[20vw] overflow-x-auto no-scrollbar h-[70vh] w-full cursor-grab active:cursor-grabbing z-20"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {VIDEO_PORTFOLIO.map((item, index) => (
          <div 
            key={item.id}
            className="flex-shrink-0 group relative flex flex-col items-center justify-center animate-fade-in-right"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* The "Poster" Card */}
            <div 
              className="relative w-[280px] md:w-[360px] aspect-[2/3] overflow-hidden rounded-sm bg-[#111] border border-white/5 transition-transform duration-500 group-hover:scale-105 group-hover:border-white/20 shadow-2xl"
              onClick={() => !isDragging && setSelectedVideo(item)}
            >
              {/* Image */}
              <img 
                src={item.mediaSrc} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
              />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-black/20">
                    <Play fill="white" size={24} className="ml-1" />
                 </div>
              </div>

              {/* Top Film Holes Decoration (Optional visual flare) */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-black/50 flex justify-between px-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20"></div>)}
              </div>
            </div>

            {/* Metadata (Below Card) */}
            <div className="mt-8 text-center w-full">
               <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tighter mb-2">{item.title}</h3>
               
               {/* Divider Line Style from Reference */}
               <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest border-t border-b border-white/10 py-1 w-full max-w-[200px] mx-auto">
                 <span>Year <b className="text-white">{item.year}</b></span>
                 <span>Loc <b className="text-white">{item.location || 'N/A'}</b></span>
               </div>
               
               <p className="text-[10px] text-white/30 uppercase mt-2 tracking-[0.2em]">{item.category}</p>
            </div>
          </div>
        ))}
        
        {/* End Padding to allow scrolling past last item */}
        <div className="w-[10vw] flex-shrink-0" />
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 md:w-64 h-8 flex flex-col items-center justify-center gap-2 z-20 pointer-events-none">
         {/* Ticks */}
         <div className="flex justify-between w-full px-1">
            {[...Array(11)].map((_, i) => (
              <div key={i} className={`w-[1px] h-1.5 ${i % 5 === 0 ? 'bg-white/50 h-2.5' : 'bg-white/20'}`}></div>
            ))}
         </div>
         {/* The Track */}
         <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded-full">
            {/* The Indicator */}
            <div 
              className="absolute top-0 left-0 h-full bg-white transition-all duration-100 ease-out"
              style={{ width: '20px', left: `${progress}%` }} // Simplified visual: a moving block
            />
         </div>
      </div>


      {/* Video Modal - Cinematic Style */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in p-4 md:p-12">
          
          {/* Custom "Ticket" Close Button */}
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-8 right-8 z-50 group"
          >
             <div className="bg-[#F2F2F2] text-black px-4 py-2 rounded-lg flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
                <span className="text-xs font-bold tracking-widest uppercase">Close</span>
                <div className="bg-black text-white p-1 rounded-md">
                   <X size={14} />
                </div>
             </div>
          </button>
          
          <div className="w-full h-full max-w-[1400px] flex flex-col justify-center">
             <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                {/* 
                   Video Player Placeholder
                   Replace img with: <video src={selectedVideo.mediaSrc} controls autoPlay className="w-full h-full" />
                */}
                <div className="w-full h-full flex items-center justify-center bg-[#111] relative">
                    <img src={selectedVideo.mediaSrc} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    <div className="z-10 text-center">
                        <Play size={48} fill="white" className="mx-auto mb-4 opacity-80" />
                        <p className="text-white/50 font-mono text-sm">Playing: {selectedVideo.title}</p>
                    </div>
                </div>
             </div>
             
             <div className="mt-8 flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                   <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{selectedVideo.title}</h2>
                   <p className="text-white/50 text-sm font-mono">{selectedVideo.category} — {selectedVideo.year}</p>
                </div>
                <div className="hidden md:block text-right">
                   <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Client</p>
                   <p className="text-white font-bold">{selectedVideo.clientName}</p>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Work;