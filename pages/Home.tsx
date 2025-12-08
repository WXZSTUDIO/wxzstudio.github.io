import React, { useState, useRef, useEffect } from 'react';
import { ServiceItem, PageType } from '../types';
import { ArrowRight, ChevronDown, ChevronUp, Camera, ShoppingBag, Clapperboard, Palette, LucideIcon, Plus, Minus, Copy, Check, ArrowUpRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: PageType) => void;
}

interface ServiceItemExtended extends ServiceItem {
  icon: LucideIcon;
  enTitle: string;
  image: string;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [showAllClients, setShowAllClients] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const [servicesInView, setServicesInView] = useState(false);
  
  // Footer Accordion State
  const [openSection, setOpenSection] = useState<string | null>('terms');
  const [copied, setCopied] = useState(false);
  const wechatID = 'icf304';

  // Ensure video autoplay and loop
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play().catch(e => console.error("Autoplay failed", e));
    }
  }, []);

  // Intersection Observer for Services Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setServicesInView(true);
        }
      },
      { threshold: 0.1 } 
    );

    if (servicesRef.current) {
      observer.observe(servicesRef.current);
    }

    return () => observer.disconnect();
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

  const services: ServiceItemExtended[] = [
    { 
      title: '商业活动', 
      enTitle: 'Commercial Events',
      description: '会议、发布会、展览、典礼等各类活动的现场拍摄与后期记录制作。',
      icon: Camera,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'
    },
    { 
      title: '产品拍摄', 
      enTitle: 'Product Photography',
      description: '为电商及广告客户提供高质量的产品视频和摄影，突出产品特性与美感。',
      icon: ShoppingBag,
      image: 'https://images.unsplash.com/photo-1550614000-4b9519e02d48?q=80&w=2070&auto=format&fit=crop'
    },
    { 
      title: '品牌宣传', 
      enTitle: 'Brand Campaign',
      description: '制作企业宣传片、品牌故事片和形象 TVC，提升品牌知名度与市场影响力。',
      icon: Clapperboard,
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop'
    },
    { 
      title: '视觉设计', 
      enTitle: 'Visual Design',
      description: '提供品牌 VI、海报、社交媒体图文等全方位的平面设计与视觉传达服务。',
      icon: Palette,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop'
    },
  ];

  // Placeholder client list
  const clients = Array.from({ length: 18 }, (_, i) => ({ id: i + 1, name: `Client ${i + 1}` }));
  const visibleClients = showAllClients ? clients : clients.slice(0, 9);

  // Footer Accordion Items
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

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden border-b border-border">
        {/* Main Hero Video - Using hosted path */}
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
            <source src="https://wxzstudio.github.io/videos/hero-showreel.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent flex items-end pb-12 md:pb-24 px-6 md:px-12 pointer-events-none">
           <div className="max-w-3xl pointer-events-auto">
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-4 md:mb-6 leading-[1.1]">
                Capturing <br/> The Moment.
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-xl mb-8 font-light drop-shadow-md font-sans">
                WXZ STUDIO 专注于高端视觉影像制作，为品牌讲述动人故事。
              </p>
              <button 
                onClick={() => onNavigate('contact')}
                className="group flex items-center space-x-2 bg-accent text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors duration-300"
              >
                <span>开始合作</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </section>

      {/* Services Section - Studio Herrstrom Style Redesign */}
      <section ref={servicesRef} className="relative bg-black text-white overflow-hidden py-0 border-b border-border">
        
        {/* Animated Crosshair Lines Background - Absolute Positioned */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            {/* Vertical Center Line */}
            <div 
                className="w-px bg-white/20 transition-all duration-[1.5s] ease-in-out"
                style={{ height: servicesInView ? '100%' : '0%' }}
            />
            {/* Horizontal Center Line */}
            <div 
                className="absolute h-px bg-white/20 transition-all duration-[1.5s] ease-in-out"
                style={{ width: servicesInView ? '100%' : '0%' }}
            />
        </div>

        {/* Header - Positioned absolutely to top left in some designs, but here keeping flow */}
        <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 pointer-events-none">
             <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white/50">Our Services</h2>
        </div>

        {/* 2x2 Full Width Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-auto md:h-screen">
            {services.map((service, idx) => {
              return (
                <div 
                  key={idx} 
                  className="group relative h-[50vh] md:h-[50vh] overflow-hidden flex flex-col justify-center items-center text-center p-8"
                >
                    {/* Hover Background Image */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0">
                        <img 
                            src={service.image} 
                            alt={service.title} 
                            className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-[1.5s] ease-out filter brightness-[0.6]"
                        />
                    </div>

                    {/* Default Background (Black) */}
                    <div className="absolute inset-0 bg-black z-[-1]" />

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center transition-all duration-300">
                        {/* English Title - Large Display */}
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tighter group-hover:text-white transition-colors duration-300 text-white">
                            {service.enTitle}
                        </h3>
                        
                        {/* Chinese Title - Subtitle Style */}
                        <span className="text-lg md:text-xl font-light text-secondary mb-6 block group-hover:text-accent transition-colors duration-300">
                            {service.title}
                        </span>

                        {/* Description - Fades in up on hover */}
                        <p className="text-sm md:text-base text-white/80 max-w-sm leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75 hidden md:block">
                            {service.description}
                        </p>
                        
                        {/* Mobile: Description always visible but dimmer */}
                        <p className="text-xs text-white/60 max-w-xs md:hidden mt-2">
                            {service.description}
                        </p>

                        <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                            <div className="p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-colors cursor-pointer">
                                <ArrowUpRight size={24} />
                            </div>
                        </div>
                    </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Clients Wall */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold tracking-tight mb-8 md:mb-12 uppercase">Selected Clients</h2>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-px bg-border border border-border">
            {visibleClients.map((client) => (
              <div key={client.id} className="bg-background aspect-square flex items-center justify-center p-4 group">
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-accent transition-colors">
                        <span className="text-xs md:text-sm font-bold text-neutral-600 group-hover:text-accent transition-colors">C{client.id}</span>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:hidden mt-8 text-center">
            <button 
              onClick={() => setShowAllClients(!showAllClients)}
              className="inline-flex items-center space-x-2 text-sm text-secondary border border-border px-6 py-2 rounded-full hover:bg-accent hover:text-black hover:border-accent transition-all duration-300"
            >
              <span>{showAllClients ? '收起' : '展示全部'}</span>
              {showAllClients ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </section>

      {/* New Split Footer Section (Replacing Notice Section) */}
      <section className="flex flex-col md:flex-row bg-black border-t border-border">
        {/* Left Column: Camera Image */}
        <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-[600px] overflow-hidden border-b md:border-b-0 md:border-r border-border">
           <div className="absolute inset-0 bg-black/20 pointer-events-none z-10" />
           <img 
             src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop" 
             alt="Professional Camera Gear Top Down" 
             className="w-full h-full object-cover object-center opacity-80 grayscale hover:grayscale-0 transition-all duration-1000"
           />
           <div className="absolute bottom-8 left-8 z-20">
              <Camera className="text-accent mb-4" size={32} strokeWidth={1.5} />
              <p className="text-white/60 text-xs tracking-widest uppercase">Professional Equipment</p>
           </div>
        </div>

        {/* Right Column: Accordion */}
        <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-24 bg-background flex flex-col justify-center">
           <div className="max-w-md w-full mx-auto md:mx-0">
              <h2 className="text-3xl font-bold tracking-tight mb-6 text-white">
                Ready to start <br/>
                <span className="text-secondary">your next project?</span>
              </h2>
              <div className="space-y-0 border-t border-border mt-12">
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