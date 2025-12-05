import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './constants';
import { Menu, X, ArrowUpRight, Copy, Check, ChevronRight, Play } from 'lucide-react';
import { DataProvider, useData } from './DataContext';
import { AdminPanel } from './Admin';

// --- Components ---

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide header on admin page
  if (location.pathname === '/admin') return null;

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 mix-blend-difference ${isScrolled ? 'py-4' : 'py-8'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-start">
        <Link to="/" className="text-xl font-display font-bold tracking-[0.2em] text-white uppercase group">
          <span className="block group-hover:-translate-y-1 transition-transform duration-300">WXZ</span>
          <span className="block text-xs font-sans font-normal tracking-[0.4em] text-zinc-400 group-hover:text-white transition-colors duration-300">Studio</span>
        </Link>
        
        {/* Desktop Nav - Minimal Line Style */}
        <nav className="hidden md:flex gap-12 pt-1">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`text-[10px] font-bold tracking-[0.25em] transition-all duration-300 relative group uppercase ${location.pathname === item.path ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              {item.label}
              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-px bg-white transition-all duration-500 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

const MobileNav = () => {
  const location = useLocation();
  if (location.pathname === '/admin') return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#050505] border-t border-white/10 z-50 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden group">
              {isActive && <div className="absolute top-0 left-0 w-full h-[1px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>}
              <div className={`transition-all duration-300 mb-1 ${isActive ? 'text-white scale-110' : 'text-zinc-600'}`}>
                {item.icon}
              </div>
              <span className={`text-[8px] tracking-[0.2em] uppercase font-medium ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Footer = () => {
  const location = useLocation();
  if (location.pathname === '/admin') return null;

  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-24 pb-32 md:pb-12 overflow-hidden relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 md:mb-32 gap-12">
          <div className="text-zinc-500 text-xs tracking-[0.2em] space-y-2 uppercase">
            <p>Subscribe to our newsletter</p>
            <div className="flex items-center gap-4 border-b border-zinc-800 pb-2 w-full md:w-64 pt-4">
              <span>Subscribe</span>
              <ArrowUpRight size={14} className="ml-auto" />
            </div>
          </div>
          
          <div className="flex gap-12 text-zinc-500 text-xs tracking-[0.2em] uppercase text-right">
             <div className="space-y-2">
               <p className="hover:text-white cursor-pointer transition-colors">Services</p>
               <p className="hover:text-white cursor-pointer transition-colors">Work</p>
               <p className="hover:text-white cursor-pointer transition-colors">About</p>
             </div>
             <div className="space-y-2">
               <p className="hover:text-white cursor-pointer transition-colors">Instagram</p>
               <p className="hover:text-white cursor-pointer transition-colors">Facebook</p>
               <p className="hover:text-white cursor-pointer transition-colors">LinkedIn</p>
             </div>
          </div>
        </div>
        
        {/* Massive Typography Footer */}
        <div className="relative border-t border-white/10 pt-4 md:pt-8">
           <div className="flex justify-between text-[8px] md:text-[10px] text-zinc-600 tracking-[0.1em] uppercase mb-2">
              <span>© 2026 WXZ STUDIO. All rights reserved.</span>
              <div className="flex gap-4">
                <span className="hidden md:inline">Contact Us | Privacy Policy</span>
                <Link to="/admin" className="opacity-0 hover:opacity-100 transition-opacity">Admin</Link>
              </div>
           </div>
           <h1 className="text-[13vw] leading-[0.8] font-display font-medium text-zinc-200 tracking-tighter text-center md:text-justify mix-blend-screen select-none pointer-events-none">
              WXZ STUDIO
           </h1>
        </div>
      </div>
    </footer>
  );
};

const VideoModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-zinc-400 transition-colors z-50 flex items-center gap-2 group"
      >
        <span className="text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
        <X size={40} strokeWidth={1} />
      </button>
      <div className="w-full h-full relative">
        <video controls autoPlay className="w-full h-full object-contain">
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

// --- Sections ---

const SplitHeader = ({ left, right }: { left: string, right: string }) => (
  <div className="flex items-center justify-between w-full py-12 md:py-24">
    <h2 className="text-5xl md:text-8xl font-display font-light text-white tracking-wide uppercase shrink-0">
      {left}
    </h2>
    <div className="h-px bg-white/20 w-full mx-6 md:mx-12 relative overflow-hidden">
       <div className="absolute inset-0 bg-white/40 -translate-x-full animate-[shimmer_3s_infinite]"></div>
    </div>
    <h2 className="text-5xl md:text-8xl font-display font-light text-white tracking-wide uppercase shrink-0">
      {right}
    </h2>
  </div>
);

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white pt-24 md:pt-0 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 h-full flex flex-col md:flex-row">
        
        {/* Left Content (Text) */}
        <div className="w-full md:w-5/12 pt-20 md:pt-48 pb-12 z-10 relative">
           <div className="mb-12 md:mb-24">
              <p className="text-zinc-500 text-xs max-w-[200px] leading-relaxed mb-8">
                Our family's dedication to this noble material reflects a deep respect for its history and potential.
              </p>
              <h1 className="text-7xl md:text-[8rem] leading-[0.85] font-display font-normal tracking-tight">
                ABOUT <br/> <span className="ml-12 md:ml-24">WXZ</span>
              </h1>
              <div className="w-24 h-px bg-white mt-12 mb-8"></div>
           </div>
        </div>

        {/* Right Content (Vertical Slices) */}
        <div className="w-full md:w-7/12 h-[50vh] md:h-screen relative flex gap-2 md:gap-4 justify-end items-start md:pt-32">
           {/* Slice 1 */}
           <div className="relative w-1/3 h-[80%] mt-12 md:mt-0 overflow-hidden bg-zinc-900 group">
              <video muted autoPlay loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                <source src="assets/videos/hero-bg.mp4" type="video/mp4" />
              </video>
              <div className="absolute bottom-4 left-4 text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">Video</div>
           </div>
           
           {/* Slice 2 */}
           <div className="relative w-1/3 h-full overflow-hidden bg-zinc-800 translate-y-8 md:translate-y-16 group">
              <img 
                src="assets/portfolio/graphic-02.jpg" 
                alt="Visual" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-black/20"></div>
           </div>

           {/* Slice 3 */}
           <div className="relative w-1/3 h-[90%] overflow-hidden bg-zinc-900 -translate-y-4 md:-translate-y-0 group">
               <video muted autoPlay loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 scale-125 group-hover:scale-100">
                <source src="assets/videos/portfolio/video-02.mp4" type="video/mp4" />
              </video>
              <div className="absolute bottom-0 left-0 p-6">
                 <p className="text-xs text-zinc-400 leading-relaxed max-w-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   For four generations, we've been crafting the legacy of metal transforming it.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Intro Text Section */}
      <div className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-6">
         <p className="text-xs font-serif italic text-zinc-500 mb-6">SINCE 2023</p>
         <h2 className="text-3xl md:text-5xl font-display font-light uppercase tracking-wide leading-tight text-zinc-300">
           We have been writing the <br/> history of visual for <span className="text-zinc-600">new</span><br/>
           <span className="text-zinc-600">generation</span>
         </h2>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const { services } = useData();
  const [s1, s2, s3, s4] = services;

  return (
    <section className="bg-[#050505] pb-32 px-6 md:px-12 border-t border-white/5">
      <div className="container mx-auto">
        <SplitHeader left="OUR" right="SERVICES" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
           {/* Service 1: Big Image Left */}
           <div className="md:row-span-2 relative aspect-[4/5] bg-black group overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
              <div className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-700 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${s1.image})` }}></div>
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                 <h3 className="text-3xl font-display uppercase mb-4 tracking-wide">{s1.title}</h3>
                 <p className="text-zinc-400 text-xs leading-relaxed max-w-xs border-l border-white/30 pl-4 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500">
                   {s1.description}
                 </p>
              </div>
           </div>

           {/* Service 2: Top Right */}
           <div className="aspect-square md:aspect-[16/9] relative bg-zinc-900 group overflow-hidden border-b border-white/10">
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center z-10 mix-blend-difference">
                     <h3 className="text-2xl font-display uppercase tracking-widest mb-2">{s2.title}</h3>
                     <p className="text-[10px] tracking-[0.3em] text-zinc-400">ECO-FRIENDLY</p>
                  </div>
               </div>
               <img src={s2.image} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-all duration-700 grayscale" alt=""/>
           </div>

           {/* Service 3 & 4: Split Bottom Right */}
           <div className="grid grid-cols-2 h-full bg-black">
              <div className="relative group border-r border-white/10 overflow-hidden">
                 <div className="absolute inset-0 bg-zinc-900"></div>
                 <div className="relative p-6 h-full flex flex-col justify-between z-10">
                    <ArrowUpRight className="self-end text-zinc-600 group-hover:text-white transition-colors" size={20} />
                    <div>
                       <h3 className="text-lg font-display uppercase tracking-wide mb-2 text-zinc-300 group-hover:text-white">{s3.title}</h3>
                    </div>
                 </div>
                 <img src={s3.image} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-500 grayscale" alt=""/>
              </div>
              <div className="relative group overflow-hidden">
                 <div className="absolute inset-0 bg-black"></div>
                 <div className="relative p-6 h-full flex flex-col justify-between z-10">
                    <ArrowUpRight className="self-end text-zinc-600 group-hover:text-white transition-colors" size={20} />
                    <div>
                       <h3 className="text-lg font-display uppercase tracking-wide mb-2 text-zinc-300 group-hover:text-white">{s4.title}</h3>
                    </div>
                 </div>
                 <img src={s4.image} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-500 grayscale" alt=""/>
              </div>
           </div>
        </div>

        {/* Feature Text Block */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div className="relative aspect-video bg-zinc-900 overflow-hidden grayscale opacity-80">
              <img src="assets/portfolio/graphic-01.jpg" alt="Detail" className="w-full h-full object-cover" />
           </div>
           <div>
              <h4 className="text-xl font-display uppercase tracking-widest mb-6">Disposal of Substances</h4>
              <p className="text-zinc-500 text-sm leading-7 font-light mb-8">
                By implementing eco-friendly disposal methods, we minimize our environmental impact and prevent harmful substances from polluting the ecosystem.
              </p>
              <div className="flex gap-4">
                 <div className="w-24 h-24 bg-zinc-900">
                    <img src="assets/portfolio/graphic-03.jpg" className="w-full h-full object-cover grayscale opacity-50" alt=""/>
                 </div>
                 <div className="w-24 h-24 bg-zinc-900">
                    <img src="assets/portfolio/graphic-02.jpg" className="w-full h-full object-cover grayscale opacity-50" alt=""/>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

const ClientsSection = () => {
  const { clients } = useData();

  return (
    <section className="bg-white text-black py-24 border-t border-zinc-200">
      <div className="container mx-auto px-6 md:px-12 mb-12">
        <h3 className="text-5xl font-display font-light tracking-wide uppercase">Partners</h3>
      </div>
      
      <div className="w-full overflow-hidden border-t border-b border-zinc-100 py-12">
        <div className="flex w-max animate-scroll">
          {[...clients, ...clients].map((client, i) => (
            <div key={`${client.id}-${i}`} className="w-64 px-12 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300">
              <img src={client.logo} alt={client.name} className="max-w-full max-h-16 object-contain grayscale" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePage = () => (
  <>
    <Hero />
    <ServicesSection />
    <ClientsSection />
  </>
);

const VideoPortfolio = () => {
  const { videoPortfolio } = useData();
  const [filter, setFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const filteredItems = filter === 'all' 
    ? videoPortfolio 
    : videoPortfolio.filter(item => item.tags.includes(filter));

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-32 px-6 md:px-12">
      <div className="container mx-auto">
        <SplitHeader left="VIDEO" right="WORKS" />
        
        <div className="flex justify-center mb-16">
           <div className="flex gap-8 text-[10px] font-bold tracking-[0.2em]">
            {['all', 'brand', 'event', 'product'].map(tag => (
              <button 
                key={tag}
                onClick={() => setFilter(tag)}
                className={`uppercase pb-2 border-b transition-all duration-300 ${filter === tag ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {filteredItems.map((item, idx) => (
            <div 
              key={item.id} 
              className={`group cursor-pointer relative bg-black aspect-video overflow-hidden border-b border-white/10 ${idx % 2 === 0 ? 'border-r' : ''}`}
              onClick={() => setSelectedVideo(item.src)}
            >
              <div className="absolute inset-0 bg-zinc-900">
                <video 
                  muted 
                  loop 
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                >
                  <source src={item.src} type="video/mp4" />
                </video>
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 pointer-events-none">
                 <div className="flex justify-between items-start">
                    <span className="text-[10px] text-white/50 tracking-widest font-mono">0{idx + 1}</span>
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                       <Play size={16} fill="white" className="text-white ml-1" />
                    </div>
                 </div>
                 
                 <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                    <h3 className="text-2xl font-display uppercase tracking-wide text-white mb-2">{item.title}</h3>
                    <div className="flex gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[9px] uppercase tracking-widest text-zinc-400 border border-white/10 px-2 py-1">{tag}</span>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedVideo && <VideoModal src={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </div>
  );
};

const GraphicPortfolio = () => {
  const { graphicPortfolio } = useData();
  const [filter, setFilter] = useState('all');

  const filteredItems = filter === 'all' 
    ? graphicPortfolio 
    : graphicPortfolio.filter(item => item.tags.includes(filter));

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-32 px-6 md:px-12">
      <div className="container mx-auto">
        <SplitHeader left="GRAPHIC" right="ARCHIVE" />
        
        <div className="flex justify-center mb-16">
           <div className="flex gap-8 text-[10px] font-bold tracking-[0.2em]">
            {['all', 'branding', 'social', 'poster'].map(tag => (
              <button 
                key={tag}
                onClick={() => setFilter(tag)}
                className={`uppercase pb-2 border-b transition-all duration-300 ${filter === tag ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Irregular Grid Layout for Graphics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="group relative aspect-[3/4] bg-black overflow-hidden">
               <div className="absolute inset-0 bg-zinc-900 transition-colors duration-500">
                  <img 
                    src={item.src} 
                    alt={item.title} 
                    className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                  />
               </div>
               
               <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="border-t border-white/20 pt-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                     <p className="text-[9px] text-zinc-400 tracking-[0.3em] uppercase mb-2">{item.category}</p>
                     <h3 className="text-xl font-display uppercase tracking-wide text-white">{item.title}</h3>
                  </div>
               </div>
               
               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-mono text-white/50">0{idx + 1}</span>
               </div>
            </div>
          ))}
          
          {/* Filler blocks to maintain grid aesthetics if needed */}
          <div className="hidden md:block aspect-[3/4] bg-black relative border-t border-white/10 p-8 flex flex-col justify-between">
             <ArrowUpRight size={24} className="text-zinc-700" />
             <p className="text-xs text-zinc-600 font-light leading-relaxed max-w-[150px]">
                Their multisensory nature transforms every wall into a visually and tactilely impactful composition.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const wechatID = 'icf304';

  const handleCopy = () => {
    navigator.clipboard.writeText(wechatID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-32 px-6 md:px-12 flex items-center">
      <div className="container mx-auto">
         <SplitHeader left="GET" right="IN TOUCH" />
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start border-t border-white/10 pt-12 md:pt-24">
            <div>
               <p className="text-xl md:text-2xl font-display font-light text-zinc-300 leading-snug mb-12">
                 We are always looking for new challenges and interesting partners. <br/>
                 Let's create something timeless together.
               </p>
               
               <div className="space-y-0 border-t border-white/10">
                  <div 
                    onClick={handleCopy}
                    className="group flex justify-between items-center py-8 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors px-4 -mx-4"
                  >
                     <div>
                        <span className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-2">WeChat</span>
                        <span className="text-3xl md:text-4xl font-display text-white">{wechatID}</span>
                     </div>
                     <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                     </div>
                  </div>
                  
                  <a 
                    href="https://xhslink.com/m/4FrLqFlYhZj"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex justify-between items-center py-8 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors px-4 -mx-4"
                  >
                     <div>
                        <span className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-2">Social</span>
                        <span className="text-3xl md:text-4xl font-display text-white">Xiaohongshu</span>
                     </div>
                     <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowUpRight size={20} />
                     </div>
                  </a>
               </div>
            </div>
            
            <div className="relative aspect-square md:aspect-[4/5] bg-zinc-900 overflow-hidden group">
               <img src="assets/portfolio/graphic-03.jpg" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-700" alt="Contact Visual"/>
               <div className="absolute bottom-8 left-8">
                  <p className="text-white text-lg font-display uppercase tracking-widest">WXZ Studio</p>
                  <p className="text-zinc-500 text-xs mt-1">Shanghai / Online</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- App Root ---

const App = () => {
  return (
    <DataProvider>
      <Router>
        <ScrollToTop />
        <div className="bg-[#050505] min-h-screen text-white selection:bg-white selection:text-black font-sans">
          <style>{`
            .stroke-text {
              -webkit-text-stroke: 1px rgba(255,255,255,0.3);
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <Header />
          <main className="w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/video" element={<VideoPortfolio />} />
              <Route path="/graphic" element={<GraphicPortfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
          <Footer />
          <MobileNav />
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;
