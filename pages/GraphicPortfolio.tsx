import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../types';
import { getPortfolioData } from '../data';
import { Star, ZoomIn } from 'lucide-react';

// Immersive Graphic Card
const GraphicCard: React.FC<{ 
  item: PortfolioItem; 
  index: number;
}> = ({ item, index }) => {
  
  // Determine grid classes based on featured status or manual span
  const getGridClasses = () => {
    if (item.featured) return "md:col-span-2 md:row-span-2";
    if (item.span === '2x1') return "md:col-span-2 md:row-span-1";
    if (item.span === '1x2') return "md:col-span-1 md:row-span-2";
    return "md:col-span-1 md:row-span-1";
  };

  return (
    <div 
      className={`group relative rounded-sm overflow-hidden cursor-zoom-in bg-surface border border-white/5 ${getGridClasses()} opacity-0 animate-fade-in-up`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Layer */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={item.src} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0" 
          loading="lazy"
        />
      </div>

      {/* Vignette & Overlay */}
      <div className="absolute inset-0 vignette opacity-50 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

      {/* Zoom Icon Hint */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white">
          <ZoomIn size={18} />
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
      
       {/* Border Highlight */}
       <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors duration-300 pointer-events-none rounded-sm" />
    </div>
  );
};

const GraphicPortfolio: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    setItems(getPortfolioData('graphic'));
  }, []);

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.tags.includes(filter));

  const filters = [
    { key: 'all', label: '全部 (All)' },
    { key: 'branding', label: '品牌 (Branding)' },
    { key: 'social', label: '社媒 (Social)' },
    { key: 'poster', label: '海报 (Poster)' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="pt-12 px-6 md:px-12 mb-12 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-7xl font-display font-bold mb-4 tracking-tighter">Graphic Design</h2>
        <p className="text-secondary text-lg max-w-2xl font-light">
          Visual Identity, Art Direction, and Digital Design.
        </p>
      </div>

      <div className="flex space-x-2 md:space-x-4 mb-12 overflow-x-auto no-scrollbar pb-2 px-6 md:px-12">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-6 py-2 rounded-full text-sm font-display tracking-wide transition-all duration-300 whitespace-nowrap ${
              filter === f.key
                ? 'bg-accent text-black font-bold'
                : 'bg-white/5 text-secondary border border-white/10 hover:border-white hover:text-white backdrop-blur-sm'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Mosaic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[300px] md:auto-rows-[350px] gap-4 md:gap-6 grid-flow-dense">
          {filteredItems.map((item, index) => (
            <GraphicCard 
              key={item.id} 
              item={item} 
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraphicPortfolio;