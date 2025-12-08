import React, { useState, useRef, useEffect } from 'react';
import { ServiceItem, PageType } from '../types';
import { ArrowRight, Plus, Minus, Copy, Check, ArrowUpRight, Star } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: PageType) => void;
}

interface ServiceItemExtended extends ServiceItem {
  enTitle: string;
  image: string;
}

interface HeroSlide {
  id: string;
  title: React.ReactNode; // Allow JSX for line breaks
  subtitle: string;
  category: string;
  director: string;
  year: string;
  videoSrc: string;
  review?: {
    stars: number;
    quote: string;
    source: string;
  };
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const servicesRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const footerTextRef = useRef<HTMLDivElement>(null);
  
  // Footer Accordion State
  const [openSection, setOpenSection] = useState<string | null>('terms');
  const [copied, setCopied] = useState(false);
  const wechatID = 'icf304';

  // Parallax Effect for Footer Text
  useEffect(() => {
    const handleScroll = () => {
        if (footerRef.current && footerTextRef.current) {
            const rect = footerRef.current.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            
            // If footer is in view
            if (rect.top < viewHeight && rect.bottom > 0) {
                // Calculate relative progress (0 when top of section hits bottom of viewport)
                const distance = viewHeight - rect.top;
                // Parallax translation
                const parallaxValue = distance * 0.1; 
                footerTextRef.current.style.transform = `translateY(${parallaxValue}px)`;
            }
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wechatID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const footerItems = [
    {
      id: 'terms',
      label: '服务条款 (Service Terms)',
      content: (
        <div className="text-secondary space-y-4 text-sm leading-relaxed py-2">
           <p>
            <span className="text-white font-medium block mb-1">预约与定金</span>
            对于首次预约本服务的客户，在确认拍摄排期时，需缴纳商议总金额的 50% 作为预约定金。若因非不可抗力原因在预定拍摄日期当天取消服务，该定金将不予退还。
          </p>
          <p>
            <span className="text-white font-medium block mb-1">创意材料</span>
            我们强烈建议您提供详细的拍摄剧本。若无具体剧本，您有责任在拍摄前大致说明拍摄角度、构图意向或创意概念。
          </p>
          <p>
            <span className="text-white font-medium block mb-1">后期制作</span>
            后期剪辑工作（包括但不限于素材筛选、画面调色及特效制作）将独立于拍摄服务，另行单独计费，除非合约中已明确约定。
          </p>
          <p>
            <span className="text-white font-medium block mb-1">知识产权</span>
            除非提前声明或签署保密合约，否则视为您默认同意服务方在拍摄结束一周后，将相关素材用于作品展示或宣传。
          </p>
        </div>
      )
    },
    {
      id: 'connect',
      label: '联系方式 (Connect)',
      content: (
        <div className="space-y-6 py-2">
          {/* WeChat */}
          <div className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">微信 WeChat</span>
              <button 
                onClick={handleCopy}
                className="text-xs text-secondary hover:text-accent transition-colors flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check size={12} />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>复制 ID</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-secondary text-sm font-mono">{wechatID}</div>
          </div>

          {/* XiaoHongShu */}
          <div className="group">
             <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">小红书 Red</span>
              <a 
                href="https://xhslink.com/m/4FrLqFlYhZj" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-secondary hover:text-accent transition-colors flex items-center space-x-1"
              >
                <ArrowUpRight size={12} />
                <span>访问主页</span>
              </a>
            </div>
            <div className="text-secondary text-sm">分享更多拍摄花絮与作品动态</div>
          </div>
        </div>
      )
    },
    {
      id: 'copyright',
      label: '版权信息 (Copyright)',
      content: (
        <div className="text-secondary text-sm py-2 space-y-2">
          <p>© 2026 WXZ STUDIO.</p>
          <p>All visual content is protected by copyright. Unauthorized use is prohibited.</p>
        </div>
      )
    }
  ];

  // 1. Hero Slides Data (Updated to Showreel)
  const heroSlides: HeroSlide[] = [
    {
      id: '01',
      title: <>2024 <br/> SHOWREEL</>,
      subtitle: '精选年度最佳影像作品与创意瞬间。',
      category: 'Showreel',
      director: 'WXZ STUDIO',
      year: '2024',
      videoSrc: 'https://wxzstudio.github.io/videos/portfolio-2024-showreel.mp4',
      review: {
        stars: 5,
        quote: "VIBRANT AND ELECTRIFYING",
        source: "FASHION DAILY"
      }
    }
  ];

  // Services Data - Images are no longer used in render but kept in data structure
  const services: ServiceItemExtended[] = [
    { 
      title: '商业活动', 
      enTitle: 'Events',
      description: '会议、发布会、展览、典礼等各类活动的现场拍摄与后期记录制作',
      image: '', 
    },
    { 
      title: '产品拍摄', 
      enTitle: 'Product',
      description: '为电商及广告客户提供高质量的产品视频和摄影，突出产品特性',
      image: '', 
    },
    { 
      title: '品牌宣传', 
      enTitle: 'Campaign',
      description: '制作企业宣传片、品牌故事片和形象 TVC，提升品牌知名度',
      image: '', 
    },
    { 
      title: '视觉设计', 
      enTitle: 'Design',
      description: '提供品牌 VI、海报、社交媒体图文等全方位的平面设计服务',
      image: '', 
    },
  ];

  // Helper to generate text-based SVG logos
  const textToSvg = (text: string, fontSize: number = 40) => {
    // Escape XML special characters to prevent broken SVGs (e.g. "high & gogo")
    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Simple SVG with centered text, black fill (will be inverted by CSS)
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="'Inter', sans-serif" font-weight="900" font-size="${fontSize}" fill="black" letter-spacing="2">
          ${safeText}
        </text>
      </svg>
    `.trim();
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  // Client List with Generated SVGs
  const clients = [
    { id: 1, name: 'Aekyung', logo: textToSvg('AEKYUNG') },
    { id: 2, name: 'Amore Pacific', logo: textToSvg('AMORE PACIFIC', 32) },
    { id: 3, name: 'COSRX', logo: textToSvg('COSRX') },
    { id: 4, name: 'HERA', logo: textToSvg('HERA') },
    { id: 5, name: 'high & gogo', logo: textToSvg('high & gogo', 36) },
    { id: 6, name: 'i-dle', logo: textToSvg('(G)I-DLE') },
    { id: 7, name: 'IOPE', logo: textToSvg('IOPE') },
    { id: 8, name: 'Leaders', logo: textToSvg('LEADERS') },
    { id: 9, name: 'Vital Beautie', logo: textToSvg('VITAL BEAUTIE', 32) },
    { id: 10, name: 'Shinsegae', logo: textToSvg('SHINSEGAE', 36) },
    { id: 11, name: 'Q.one', logo: textToSvg('Q.one') },
    { id: 12, name: 'ZB1', logo: textToSvg('ZEROBASEONE', 28) },
  ];

  return (
    <div className="animate-fade-in">
      
      {/* 
        FILM STRIP HERO SECTION 
      */}
      <div className="relative bg-background">
        {heroSlides.map((slide, index) => (
          <section 
            key={slide.id} 
            className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-6 overflow-hidden bg-background"
            style={{ zIndex: index + 1 }}
          >
            {/* The "Film Frame" - Rounded Container */}
            <div className="relative w-full h-full md:h-[95%] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black group">
              
              {/* Video Background */}
              <div className="absolute inset-0">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                >
                  <source src={slide.videoSrc} type="video/mp4" />
                </video>
                {/* Cinematic Grain/Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40 pointer-events-none" />
              </div>

              {/* UI Overlay - Top Row */}
              <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-start pointer-events-none z-10">
                {/* Year/ID */}
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-[0.2em] text-accent mb-1">{slide.year}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">Project {slide.id}</span>
                </div>

                {/* Review / Award */}
                {slide.review && (
                  <div className="text-right hidden md:block">
                     <div className="flex space-x-1 justify-end mb-2 text-accent">
                        {[...Array(slide.review.stars)].map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                     </div>
                     <p className="text-lg font-display font-bold leading-tight max-w-[200px] text-white">
                       "{slide.review.quote}"
                     </p>
                     <p className="text-[10px] text-white/50 uppercase mt-1 tracking-wider">
                       {slide.review.source}
                     </p>
                  </div>
                )}
              </div>

              {/* UI Overlay - Bottom Area */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  
                  {/* Left: Title & Info Grid */}
                  <div className="max-w-4xl w-full">
                     {/* Horizontal Lines for "Siena" look */}
                     <div className="w-12 h-[1px] bg-accent mb-6" />
                     
                     <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.9] uppercase font-display">
                       {slide.title}
                     </h2>

                     <div className="grid grid-cols-2 md:grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-xs md:text-sm border-t border-white/20 pt-4 max-w-lg">
                        <div className="text-white/40 uppercase tracking-widest py-1">Director</div>
                        <div className="text-white font-medium py-1 uppercase">{slide.director}</div>
                        
                        <div className="text-white/40 uppercase tracking-widest border-t border-white/10 md:border-0 py-1">Category</div>
                        <div className="text-white font-medium border-t border-white/10 md:border-0 py-1 uppercase">{slide.category}</div>

                        <div className="col-span-2 mt-4 text-white/70 font-light leading-relaxed">
                          {slide.subtitle}
                        </div>
                     </div>
                  </div>

                  {/* Button Removed Here */}

                </div>
              </div>

            </div>
          </section>
        ))}
      </div>

      {/* Services Section - Redesigned: No Image, Vertical Dividers, Reduced Height */}
      <section ref={servicesRef} className="bg-black border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <h2 className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase mb-12">Services</h2>
            
            {/* Grid container with top border and vertical dividers via item borders */}
            <div className="grid grid-cols-1 md:grid-cols-4 border-t border-white/10">
              {services.map((service, idx) => (
                <div 
                  key={idx} 
                  className="group relative h-[260px] flex flex-col justify-between p-8 border-b md:border-b-0 border-white/10 md:border-r last:border-r-0 hover:bg-white/5 transition-colors duration-500"
                >
                    {/* Top Content */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wide group-hover:text-accent transition-colors duration-300">
                        {service.title}
                        </h3>
                        <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-xs">
                        {service.description}
                        </p>
                    </div>
                    
                    {/* Bottom Content / Decoration */}
                    <div>
                        <span className="text-[10px] font-bold tracking-widest text-neutral-600 group-hover:text-white uppercase block border-t border-white/5 group-hover:border-accent/50 pt-4 w-12 transition-all duration-300">
                        {service.enTitle}
                        </span>
                    </div>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* 
        Clients Wall - Updated: Dark Theme + Infinite Marquee + Services Style Header + Gradients
      */}
      <section className="bg-black text-white py-16 md:py-24 relative z-50 border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 md:mb-12">
           {/* Updated Header Style to match Services */}
          <h2 className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase">Trusted by</h2>
        </div>
        
        {/* Infinite Scrolling Container */}
        <div className="relative w-full flex overflow-hidden">
          
          {/* Left Fade Gradient */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          
          {/* Right Fade Gradient */}
          <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {/* First set of logos */}
          <div className="flex animate-scroll whitespace-nowrap">
            {clients.map((client) => (
              <div key={`set1-${client.id}`} className="w-[200px] h-[100px] md:w-[250px] md:h-[120px] flex-shrink-0 flex items-center justify-center px-8 border-r border-white/5 grayscale brightness-0 invert opacity-50 hover:opacity-100 transition-opacity duration-300">
                 <img 
                    src={client.logo} 
                    alt={client.name} 
                    className="max-w-full max-h-full object-contain"
                 />
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless looping */}
          <div className="flex animate-scroll whitespace-nowrap" aria-hidden="true">
            {clients.map((client) => (
               <div key={`set2-${client.id}`} className="w-[200px] h-[100px] md:w-[250px] md:h-[120px] flex-shrink-0 flex items-center justify-center px-8 border-r border-white/5 grayscale brightness-0 invert opacity-50 hover:opacity-100 transition-opacity duration-300">
                  <img 
                     src={client.logo} 
                     alt={client.name} 
                     className="max-w-full max-h-full object-contain"
                  />
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section - Updated Title */}
      <section ref={footerRef} className="flex flex-col md:flex-row bg-black border-t border-border relative z-50">
        {/* Left Column: Typography with Parallax & Metallic Gradient */}
        <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-[600px] overflow-hidden border-b md:border-b-0 md:border-r border-border bg-black flex items-center justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-30 pointer-events-none" />

             <div ref={footerTextRef} className="relative z-10 text-center select-none will-change-transform px-4">
                <h2 className="text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9] 
                  bg-[linear-gradient(135deg,#fff_0%,#888_25%,#fff_50%,#888_75%,#fff_100%)] bg-[length:200%_auto] animate-shine bg-clip-text text-transparent">
                  WXZ<br/>
                  STUDIO
                </h2>
                <div className="mt-6 flex justify-center space-x-4">
                    <div className="h-[1px] w-12 bg-white/20"></div>
                    <span className="text-xs font-mono text-white/40 tracking-widest">EST. 2026</span>
                    <div className="h-[1px] w-12 bg-white/20"></div>
                </div>
             </div>
        </div>

        {/* Right Column: Accordion */}
        <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-24 bg-background flex flex-col justify-center">
           <div className="max-w-md w-full mx-auto md:mx-0">
              {/* Updated Header Style to match Trusted By/Services */}
              <h2 className="text-sm font-bold tracking-[0.2em] text-white/40 uppercase mb-8 md:mb-12">
                Get in Touch
              </h2>
              <div className="space-y-0 border-t border-border mt-8">
                {footerItems.map((item) => {
                  const isOpen = openSection === item.id;
                  return (
                    <div key={item.id} className="border-b border-border">
                      <button
                        onClick={() => toggleSection(item.id)}
                        className="w-full py-6 flex items-center justify-between text-left group transition-colors"
                      >
                        <span className={`text-base font-medium transition-colors duration-300 ${isOpen ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                          {item.label}
                        </span>
                        <span className={`transition-transform duration-300 text-secondary group-hover:text-accent ${isOpen ? 'rotate-180 text-white' : ''}`}>
                          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                        </span>
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
                      >
                        {item.content}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;