import React, { useState, useRef, useEffect } from 'react';
import { PortfolioItem } from '../types';
import { getPortfolioData } from '../data';
import { Play, X, Star } from 'lucide-react';

// Helper to extract YouTube ID
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Shared Filter Component
const Filter: React.FC<{ 
  filters: { key: string; label: string }[]; 
  activeFilter: string; 
  onFilterChange: (f: string) => void;
}> = ({ filters, activeFilter, onFilterChange }) => (
  <div className="flex space-x-2 md:space-x-4 mb-12 overflow-x-auto no-scrollbar pb-2 px-6 md:px-12">
    {filters.map(filter => (
      <button
        key={filter.key}
        onClick={() => onFilterChange(filter.key)}
        className={`px-6 py-2 rounded-full text-sm font-display tracking-wide transition-all duration-300 whitespace-nowrap ${
          activeFilter === filter.key
            ? 'bg-accent text-black font-bold'
            : 'bg-white/5 text-secondary border border-white/10 hover:border-white hover:text-white backdrop-blur-sm'
        }`}
      >
        {filter.label}
      </button>
    ))}
  </div>
);

// Immersive Video Card
const VideoCard: React.FC<{ 
  item: PortfolioItem; 
  onClick: () => void;
  index: number;
}> = ({ item, onClick, index }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const youtubeId = getYouTubeId(item.src);

  // Play preview on hover (only for local videos)
  useEffect(() => {
    if (youtubeId) return; // Skip auto-play for YouTube
    if (!videoRef.current) return;
    if (isHovered) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, youtubeId]);

  // Determine grid classes based on featured status or manual span
  const getGridClasses = () => {
    if (item.featured) return "md:col-span-2 md:row-span-2";
    if (item.span === '2x1') return "md:col-span-2 md:row-span-1";
    if (item.span === '1x2') return "md:col-span-1 md:row-span-2";
    return "md:col-span-1 md:row-span-1";
  };

  return (
    <div 
      className={`group relative rounded-sm overflow-hidden cursor-pointer bg-surface border border-white/5 ${getGridClasses()} opacity-0 animate-fade-in-up`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Media Layer */}
      <div className="absolute inset-0 w-full h-full">
        {youtubeId ? (
          <img 
            src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          >
              <source src={item.src} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Vignette & Overlay */}
      <div className="absolute inset-0 vignette transition-opacity duration-500 opacity-60 group-hover:opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

      {/* Play Icon - Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
           <Play size={28} className="text-white fill-white ml-1" />
        </div>
      </div>

      {/* Content Layer */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 flex flex-col justify-end items-start transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        
        {item.featured && (
          <div className="mb-3 px-3 py-1 rounded-full bg-accent/90 text-black text-[10px] font-bold uppercase tracking-widest flex items-center space-x-1 shadow-[0_0_10px_rgba(255,201,0,0.3)]">
            <Star size={10} fill="currentColor" />
            <span>Featured</span>
          </div>
        )}

        <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-md">
          {item.title}
        </h3>
        
        <div className="flex items-center space-x-3 text-xs md:text-sm font-medium tracking-wide">
          <span className="text-accent uppercase">{item.category}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/80 font-light truncate max-w-[200px]">{item.description}</span>
        </div>
      </div>

      {/* Hover Lift Effect */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors duration-300 pointer-events-none rounded-sm" />
    </div>
  );
};

const VideoPortfolio: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<PortfolioItem | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    setPortfolioItems(getPortfolioData('video'));
  }, []);

  const filteredItems = filter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.tags.includes(filter));

  const handleClose = () => {
    setSelectedVideo(null);
  };

  const renderLightboxContent = () => {
    if (!selectedVideo) return null;
    const youtubeId = getYouTubeId(selectedVideo.src);

    if (youtubeId) {
      // YouTube Iframe - maintain 16:9 aspect ratio
      return (
        <div className="w-full max-w-6xl aspect-video bg-black rounded-sm overflow-hidden shadow-2xl border border-white/10">
           <iframe 
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={selectedVideo.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    
    // Native Video - Dynamic sizing (Vertical/Horizontal)
    return (
      <div className="relative max-w-[95vw] max-h-[85vh] flex items-center justify-center">
        <video 
          src={selectedVideo.src} 
          controls 
          autoPlay 
          playsInline
          className="max-w-full max-h-[85vh] w-auto h-auto rounded-sm shadow-2xl border border-white/10 outline-none"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="pt-12 px-6 md:px-12 mb-12 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-7xl font-display font-bold mb-4 tracking-tighter">Selected Works</h2>
        <p className="text-secondary text-lg max-w-2xl font-light">
          A collection of cinematic moments and visual storytelling.
        </p>
      </div>

      <Filter 
        activeFilter={filter}
        onFilterChange={setFilter}
        filters={[
          { key: 'all', label: '全部 (All)' },
          { key: 'brand', label: '品牌 (Brand)' },
          { key: 'event', label: '活动 (Event)' },
          { key: 'celebrity', label: '明星 (Celeb)' },
          { key: 'graduation', label: '毕设 (Grad)' },
        ]}
      />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Mosaic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[300px] md:auto-rows-[350px] gap-4 md:gap-6 grid-flow-dense">
          {filteredItems.map((item, index) => (
            <VideoCard 
              key={item.id} 
              item={item} 
              index={index} 
              onClick={() => setSelectedVideo(item)} 
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={handleClose} // Clicking backdrop closes modal
        >
          <button 
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            className="absolute top-6 right-6 p-2 text-white/50 hover:text-accent transition-colors z-20"
          >
            <X size={32} />
          </button>
          
          {/* Prevent clicking video from closing modal */}
          <div onClick={(e) => e.stopPropagation()}>
            {renderLightboxContent()}
          </div>
          
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none px-4">
            <h3 className="text-2xl font-display font-bold text-white mb-2">{selectedVideo.title}</h3>
            <p className="text-secondary">{selectedVideo.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPortfolio;