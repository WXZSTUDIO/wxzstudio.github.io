import React, { useState } from 'react';
import { PortfolioItem, Category } from '../types';
import { Play, X, ArrowUpRight } from 'lucide-react';

interface PortfolioProps {
  title: string;
  items: PortfolioItem[];
  categories: { id: Category; label: string }[];
}

const Portfolio = ({ title, items, categories }: PortfolioProps) => {
  const [filter, setFilter] = useState<Category>('all');
  const [selectedVideo, setSelectedVideo] = useState<PortfolioItem | null>(null);

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.filterTags.includes(filter));

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section - Modern & Clean */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mb-4">{title}</h2>
            <p className="text-secondary text-lg max-w-md">
              精选案例展示，融合创意与技术的视觉呈现。
            </p>
          </div>
          
          {/* Filter Tabs - Minimal Underline Style */}
          <div className="flex flex-wrap gap-6 border-b border-white/10 pb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`text-sm font-medium transition-colors duration-300 relative pb-4 -mb-4 ${
                  filter === cat.id
                    ? 'text-white'
                    : 'text-secondary hover:text-white'
                }`}
              >
                {cat.label}
                {filter === cat.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Grid - 2 Column for Cinematic Feel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group cursor-pointer flex flex-col gap-4"
              onClick={() => item.type === 'video' ? setSelectedVideo(item) : null}
            >
              {/* Image Container */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface">
                <img 
                  src={item.mediaSrc} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
                
                {/* Overlay for Video */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Play className="text-white fill-current ml-1" size={24} />
                    </div>
                  </div>
                )}

                {/* Overlay for Image (Zoom Icon) */}
                {item.type === 'image' && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                        <ArrowUpRight size={20} />
                     </div>
                  </div>
                )}
              </div>

              {/* Text Info - Minimal below the card */}
              <div className="flex justify-between items-start px-1">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors">{item.title}</h3>
                  <span className="text-sm text-secondary font-medium tracking-wide uppercase">{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal - Improved UI */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-50 p-2 bg-white/5 rounded-full"
          >
            <X size={32} />
          </button>
          
          <div className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
             {/* 
                Video Player Placeholder
                Replace the <img> tag below with a <video> tag for real files:
                <video src={selectedVideo.mediaSrc} controls autoPlay className="w-full h-full" />
             */}
             <div className="w-full h-full flex items-center justify-center bg-surface relative group">
                <img src={selectedVideo.mediaSrc} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="z-10 text-center space-y-4">
                    <div className="inline-block p-4 rounded-full bg-white text-black mb-2">
                      <Play size={32} fill="currentColor" />
                    </div>
                    <p className="text-white font-medium text-lg">此处将播放视频文件</p>
                    <p className="text-white/50 text-sm font-mono">{selectedVideo.mediaSrc}</p>
                </div>
             </div>
          </div>
          
          <div className="absolute bottom-10 left-10 md:left-20 text-left pointer-events-none">
             <h3 className="text-3xl font-bold text-white mb-2">{selectedVideo.title}</h3>
             <span className="text-sm text-white/80 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
               {selectedVideo.category}
             </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;