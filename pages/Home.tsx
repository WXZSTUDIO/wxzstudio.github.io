import React, { useState, useEffect, useRef } from 'react';
import { VIDEO_PORTFOLIO, SERVICES, CLIENTS } from '../constants';
import { ArrowRight, Star, ChevronLeft, ChevronRight, ArrowUpRight, Heart, Eye } from 'lucide-react';
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

        {/* Content Overlay */}
        <div className="absolute inset-0 z-30 container mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-24 md:pb-20">
           
           <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full">
             
             {/* Left: Title & Info */}
             <div className="mb-8 md:mb-0 max-w-3xl text-left">
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
                  
                  {/* Adjusted Text Sizes for Mobile Proportion */}
                  <h1 className="text-4xl sm:text-5xl md:text-8xl font-display font-black leading-[0.9] text-white uppercase tracking-tighter mb-4 md:mb-6 break-words text-left">
                     {currentItem.title}
                  </h1>

                  <p className="text-white/60 text-sm md:text-base max-w-lg leading-relaxed font-light mb-8 line-clamp-2 md:line-clamp-none text-left">
                     {currentItem.stats?.quote || "An immersive visual experience crafted by WXZ Studio."}
                  </p>
                  
                  {/* Metadata Grid */}
                  <div className="flex gap-12 border-t border-white/20 pt-4 justify-start">
                     <div>
                        <span className="block text-[9px] text-gray-400 uppercase tracking-widest mb-1 text-left">导演 / Director</span>
                        <span className="block text-xs font-bold uppercase text-left">{currentItem.clientName || 'Limor Pinhasov'}</span>
                     </div>
                     <div>
                        <span className="block text-[9px] text-gray-400 uppercase tracking-widest mb-1 text-left">类别 / Category</span>
                        <span className="block text-xs font-bold uppercase text-left">{currentItem.filterTags[0]}</span>
                     </div>
                  </div>
                </div>
             </div>

             {/* Right: Stats & Ticket Button */}
             <div className="flex flex-col items-start md:items-end gap-8 w-full md:w-auto">
                
                {/* Stats (Likes/Views) - Replaces Critical Acclaim */}
                <div className="hidden md:flex flex-col items-end gap-4 text-right mb-2">
                     <div className="flex flex-col items-end animate-fade-in-right delay-100">
                        <div className="flex items-center gap-2 text-white mb-1">
                          <Eye size={18} className="text-white/70" />
                          <span className="text-2xl font-display font-bold">{currentItem.stats?.views || '10K'}</span>
                        </div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">浏览量 / VIEWS</p>
                     </div>

                     <div className="flex flex-col items-end animate-fade-in-right delay-200">
                        <div className="flex items-center gap-2 text-white mb-1">
                          <Heart size={18} className="text-red-500 fill-current" />
                          <span className="text-2xl font-display font-bold">{currentItem.stats?.likes || '1.2K'}</span>
                        </div>
                         <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">点赞数 / LIKES</p>
                     </div>
                </div>

                <Link 
                   to="/video-portfolio"
                   className="group relative inline-block transition-transform hover:scale-105"
                >
                   {/* Custom CSS Ticket Shape Button - Optimized with Separate Masks */}
                   <div 
                      className="relative flex items-center w-64 h-16 border border-white rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                      style={{
                          // Standard non-composite mask approach: Top layer + Bottom layer
                          mask: `
                            radial-gradient(circle 8px at 70% 0, transparent 8px, black 8.5px) top / 100% 51% no-repeat,
                            radial-gradient(circle 8px at 70% 100%, transparent 8px, black 8.5px) bottom / 100% 51% no-repeat
                          `,
                          WebkitMask: `
                            radial-gradient(circle 8px at 70% 0, transparent 8px, black 8.5px) top / 100% 51% no-repeat,
                            radial-gradient(circle 8px at 70% 100%, transparent 8px, black 8.5px) bottom / 100% 51% no-repeat
                          `
                      }}
                   >
                        {/* Dashed Vertical Divider */}
                        <div className="absolute top-3 bottom-3 left-[70%] border-l border-dashed border-white/50 -ml-[0.5px]"></div>
                        
                        {/* Left Side Text */}
                        <div className="w-[70%] flex items-center justify-center pl-2">
                           <span className="text-base font-bold tracking-[0.25em] text-white">EXPLORE</span>
                        </div>
                        
                        {/* Right Side Icon */}
                        <div className="w-[30%] flex items-center justify-center">
                           <ArrowRight size={24} className="text-white group-hover:translate-x-1 transition-transform" />
                        </div>
                   </div>
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
                 <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-4">服务内容</h2>
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
      <section className="pt-24 pb-0 bg-black border-t border-white/5 overflow-hidden">
        {/* Updated Client Header to match Service Header Size */}
        <div className="container mx-auto px-6 mb-16 text-center">
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tight mb-4">服务客户</h2>
             <div className="w-24 h-1 bg-white mx-auto"></div>
        </div>

        {/* Marquee Track */}
        <div className="relative w-full flex overflow-hidden mask-linear-fade mb-24">
           {/* Linear Gradient Mask for fade edges */}
           <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-black to-transparent z-20"></div>
           <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-black to-transparent z-20"></div>

           <div className="flex animate-scroll whitespace-nowrap hover:[animation-play-state:paused] items-center">
              {/* Duplicate list multiple times to ensure seamless infinite scroll */}
              {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, index) => (
                 <div key={`${client.id}-${index}`} className="flex items-center justify-center mx-8 md:mx-16 w-64 md:w-80 opacity-80 hover:opacity-100 transition-opacity duration-300">
                    {client.logoSrc ? (
                       // Significantly Enlarged Client Logos (h-48 mobile, h-64 desktop) and Brighter
                       <img 
                          src={client.logoSrc} 
                          alt={client.name} 
                          className="max-w-full h-48 md:h-64 object-contain grayscale-0 brightness-200 hover:brightness-200 transition-all duration-500" 
                       />
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
            Updated to Chinese Service Terms, Right Angle Bottom, and Fade Transparency
        */}
        <div className="container mx-auto px-4 md:px-12">
            <div 
                className="w-full max-w-6xl mx-auto rounded-t-[2.5rem] rounded-b-none bg-gradient-to-b from-[#111] to-black border-t border-x border-white/10 p-8 md:p-12 relative overflow-hidden group"
            >
                {/* Subtle Gradient Glow Background */}
                <div className="absolute top-[-50%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-900/20 transition-colors duration-1000"></div>

                <div className="relative z-10 flex flex-col gap-8 pb-24">
                    {/* Header */}
                    <div className="border-b border-white/10 pb-6 mb-2">
                        <h4 className="text-2xl font-bold text-white mb-2">服务条款</h4>
                        <p className="text-secondary text-sm">Service Terms</p>
                    </div>

                    {/* Content - Two Column Grid for better readability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 text-secondary text-xs md:text-sm font-light leading-relaxed">
                        <div className="space-y-8">
                             <div>
                                <p className="mb-4 text-white/40 text-[10px]">
                                    本服务条款（“条款”）适用于您的摄影/摄像服务预约及相关事宜。确认预约即表示您同意本条款；如果您不同意，请勿进行预约。
                                </p>
                             </div>
                             <div>
                                <h5 className="text-white font-bold mb-2">预约与定金</h5>
                                <p>对于首次预约本服务的客户，在确认拍摄排期时，需缴纳商议总金额的 50% 作为预约定金。若因非不可抗力原因在预定拍摄日期当天取消服务，该定金将不予退还。</p>
                            </div>
                            <div>
                                <h5 className="text-white font-bold mb-2">创意材料与沟通</h5>
                                <p>我们强烈建议您提供详细的拍摄剧本。若无具体剧本，您有责任在拍摄前大致说明拍摄角度、构图意向或创意概念，以确保交付结果符合预期。</p>
                            </div>
                            <div>
                                <h5 className="text-white font-bold mb-2">服务范围与后期处理</h5>
                                <p>我们的拍摄服务提供灵活的后期处理方案。后期剪辑工作（包括但不限于素材筛选、画面调色及特效制作）将独立于拍摄服务，另行单独计费，除非合约中已对整体打包费用作出明确约定。此举旨在保障您在后期制作流程中拥有充分的自主选择权，并确保所有服务成本的透明化。</p>
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                             <div>
                                <h5 className="text-white font-bold mb-2">付款与超时费用</h5>
                                <p>剩余款项应在拍摄结束后的 24 小时内结清。关于拍摄时长的计算，若实际拍摄时间超出原定计划 30 分钟，将按照拟定的单价标准，以 1 小时为单位加收超时费用。</p>
                            </div>
                            <div>
                                <h5 className="text-white font-bold mb-2">交付与数据保留</h5>
                                <p>拍摄素材上传至交付平台后，您有责任在 30 日内完成下载并自行归档保存。对于因逾期未下载而导致的数据丢失，服务方不承担责任。</p>
                            </div>
                             <div>
                                <h5 className="text-white font-bold mb-2">宣传与知识产权</h5>
                                <p>除非您提前声明或签署特定的保密合约，否则即视为您默认同意服务方在拍摄结束一周后，将相关素材发布至社交媒体平台用于作品展示或宣传用途。</p>
                            </div>
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