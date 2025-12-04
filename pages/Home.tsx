import React, { useRef, useState, useEffect, useMemo } from 'react';
import { VIDEO_PORTFOLIO, VIDEO_CATEGORIES } from '../constants';
import { Play, X } from 'lucide-react';
import { PortfolioItem } from '../types';

const Videos = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [selectedVideo, setSelectedVideo] = useState<PortfolioItem | null>(null);
  const [filter, setFilter] = useState('all');
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return filter === 'all' 
      ? VIDEO_PORTFOLIO 
      : VIDEO_PORTFOLIO.filter(item => item.filterTags.includes(filter as any));
  }, [filter]);

  // Initial Scroll Animation to Center
  useEffect(() => {
    // Small timeout to ensure DOM is ready and layout is stable
    const timer = setTimeout(() => {
      if (scrollRef.current && filteredItems.length > 0) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        // Calculate center position
        // Total scrollable distance is scrollWidth - clientWidth
        // We want to be at 50% of that
        const centerPosition = (scrollWidth - clientWidth) / 2;
        
        // Smooth scroll to center
        scrollRef.current.scrollTo({
          left: centerPosition,
          behavior: 'smooth'
        });

        // Trigger snap behavior after animation
        setTimeout(() => {
            setHasInitialScrolled(true);
        }, 1000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filteredItems]); // Re-run if items change (e.g. filter)

  // Drag to scroll logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollSnapType = 'none';
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (scrollRef.current) {
        scrollRef.current.style.scrollSnapType = 'x mandatory';
        scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (scrollRef.current) {
        scrollRef.current.style.scrollSnapType = 'x mandatory';
        scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle Touch for Mobile
  const handleTouchStart = () => {
     if(scrollRef.current) scrollRef.current.style.scrollSnapType = 'none';
  }
  const handleTouchEnd = () => {
     if(scrollRef.current) scrollRef.current.style.scrollSnapType = 'x mandatory';
  }

  // Update progress bar on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const totalScroll = scrollWidth - clientWidth;
    
    // Avoid division by zero
    if (totalScroll <= 0) {
        setProgress(50); 
        return;
    }

    const currentProgress = (scrollLeft / totalScroll) * 100;
    
    // CLAMP values between 0 and 100 to prevent rubber-banding (overscroll) from breaking the visual
    const clampedProgress = Math.max(0, Math.min(100, currentProgress));
    
    setProgress(clampedProgress);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      // Initial calculation
      handleScroll(); 
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [filteredItems]);

  // Helper to check if media is video file
  const isVideoFile = (src: string) => src.endsWith('.mp4') || src.endsWith('.mov') || src.endsWith('.webm');

  return (
    <div className="h-screen w-full bg-[#050505] overflow-hidden flex flex-col justify-center relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      {/* Header Area 
          - Updated: top-16 (was 24) to pull it up
          - Updated: mb-10 (was 6) to push content away
      */}
      <div className="absolute top-16 md:top-24 left-0 right-0 z-30 flex flex-col items-center animate-fade-in">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 border-b border-white/10 pb-1 mb-8 md:mb-6">
          作品浏览 / FOOTAGE MODE
        </span>

        {/* Categories Filter */}
        <div className="flex gap-4 md:gap-8 overflow-x-auto max-w-[90vw] no-scrollbar px-4 pb-2">
          {VIDEO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                  setFilter(cat.id);
                  setHasInitialScrolled(false);
              }}
              className={`text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 whitespace-nowrap ${
                filter === cat.id ? 'text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 
        Horizontal Scroll Container 
        - Padding is set to 50vw - card_width/2 to ensure first and last items can be centered
        - Card width is roughly 280px (mobile) / 360px (desktop)
      */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-4 md:gap-16 px-[calc(50vw-140px)] md:px-[calc(50vw-180px)] overflow-x-auto no-scrollbar h-[60vh] w-full cursor-grab active:cursor-grabbing z-20 snap-x snap-mandatory"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {filteredItems.map((item, index) => (
          <div 
            key={item.id}
            className="flex-shrink-0 group relative flex flex-col items-center justify-center snap-center transition-opacity duration-500"
          >
            {/* The "Poster" Card */}
            <div 
              className="relative w-[280px] md:w-[360px] aspect-[2/3] overflow-hidden rounded-sm bg-[#111] border border-white/5 transition-all duration-500 group-hover:scale-105 group-hover:border-white/20 shadow-2xl"
              onClick={() => !isDragging && setSelectedVideo(item)}
            >
              {/* Image or Video Thumbnail */}
              {item.type === 'video' && isVideoFile(item.mediaSrc) ? (
                  <video 
                    src={item.mediaSrc}
                    muted
                    playsInline
                    loop
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0 pointer-events-none"
                    onMouseOver={e => e.currentTarget.play()}
                    onMouseOut={e => e.currentTarget.pause()}
                  />
              ) : (
                  <img 
                    src={item.mediaSrc} 
                    alt={item.title} 
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                  />
              )}
              
              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                 <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-black/20">
                    <Play fill="white" size={24} className="ml-1" />
                 </div>
              </div>

              {/* Top Film Holes Decoration */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-black/50 flex justify-between px-2 items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20"></div>)}
              </div>
            </div>

            {/* Metadata (Below Card) */}
            <div className="mt-8 text-center w-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 select-none">
               <h3 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-tighter mb-2">{item.title}</h3>
               
               <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest border-t border-b border-white/10 py-1 w-full max-w-[200px] mx-auto">
                 <span>年份 <b className="text-white">{item.year}</b></span>
                 <span>地点 <b className="text-white">{item.location || 'N/A'}</b></span>
               </div>
            </div>
          </div>
        ))}

        {/* Empty State if no items */}
        {filteredItems.length === 0 && (
           <div className="w-full text-center text-white/30 font-mono text-sm">
              该分类下暂无内容
           </div>
        )}
      </div>

      {/* 
         Bottom Progress Bar 
         - Updated width: w-[70vw] for mobile to be visually centered better
         - Updated bottom: bottom-8 for better mobile clearance
      */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-[70vw] md:w-80 h-12 flex flex-col items-center justify-center z-20 pointer-events-none animate-fade-in-up">
         
         {/* The Scale Container */}
         <div className="relative w-full h-full flex items-center justify-between px-4">
            
            {/* Ticks Background */}
            <div className="absolute inset-0 flex justify-between items-center px-4">
               {[...Array(21)].map((_, i) => {
                  const isMajor = i % 5 === 0;
                  return (
                    <div 
                      key={i} 
                      className={`w-[1px] bg-white/30 ${isMajor ? 'h-4 bg-white/50' : 'h-2'}`}
                    ></div>
                  );
               })}
            </div>

            {/* The Moving Indicator - Hollow Rounded Rectangle 
                - Updated logic: left is % based, transform handles centering of the thumb itself
            */}
            <div 
               className="absolute top-1/2 -translate-y-1/2 w-8 h-5 border-2 border-white rounded-[4px] shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-75 ease-out bg-black/50 backdrop-blur-[1px]"
               style={{ 
                   left: `${progress}%`,
                   transform: 'translate(-50%, -50%)' // Center the thumb on the point
               }} 
            />
         </div>
      </div>

      {/* Video Modal - Cinematic Style */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in p-4 md:p-12">
          
          <div className="w-full h-full max-w-[1400px] flex flex-col justify-center relative">
             <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                {/* 
                   Video Player Area
                */}
                <div className="w-full h-full flex items-center justify-center bg-[#111] relative">
                    {selectedVideo.type === 'video' && isVideoFile(selectedVideo.mediaSrc) ? (
                        <video 
                            src={selectedVideo.mediaSrc}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <>
                            <img src={selectedVideo.mediaSrc} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            <div className="z-10 text-center">
                                <Play size={48} fill="white" className="mx-auto mb-4 opacity-80" />
                                <p className="text-white/50 font-mono text-sm">正在播放: {selectedVideo.title}</p>
                            </div>
                        </>
                    )}
                </div>
             </div>
             
             <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                   <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-2">{selectedVideo.title}</h2>
                   <p className="text-white/50 text-sm font-mono">{selectedVideo.category} — {selectedVideo.year}</p>
                </div>
                
                 {/* Close Button - Positioned tighter to content */}
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="group"
                >
                   <div className="bg-[#FBF9F3] text-black px-6 py-2 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform">
                      <span className="text-[10px] font-bold tracking-widest uppercase">关闭</span>
                      <div className="bg-black text-white p-0.5 rounded-full">
                         <X size={12} />
                      </div>
                   </div>
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Videos;