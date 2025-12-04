import React, { useState } from 'react';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const WECHAT_ID = 'icf304';

  const handleCopy = () => {
    navigator.clipboard.writeText(WECHAT_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-12 bg-background flex flex-col items-center">
      <div className="container mx-auto px-6 max-w-2xl text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
           <span className="text-xs uppercase tracking-[0.2em] text-white/70">联系我们</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">共创未来 / Let's Create</h2>
        <p className="text-secondary mb-16 text-lg">
          我们要随时准备讨论新的项目、创意想法，或成为您愿景的一部分。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* WeChat Card */}
          <div 
            className="group relative p-8 rounded-2xl bg-surface border border-border hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden"
            onClick={handleCopy}
          >
             {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-16 h-16 rounded-2xl bg-[#07C160]/10 flex items-center justify-center text-[#07C160] mb-2 group-hover:scale-110 transition-transform">
               {/* Simple SVG for WeChat-like icon if needed, or just text */}
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                 <path d="M18.5 12.6c0-3.4-3.6-6.1-8-6.1-4.4 0-8 2.7-8 6.1 0 1.9 1.1 3.6 2.9 4.7-.1.6-.4 1.3-.8 1.9 1.2.2 3-.5 3.8-1.4 1 .5 2 .8 2.1.8 4.4 0 8-2.7 8-6z"/>
               </svg>
            </div>
            
            <div className="z-10">
              <p className="text-sm text-secondary uppercase tracking-widest mb-2">微信 WeChat</p>
              <p className="text-2xl font-bold text-white tracking-wide">{WECHAT_ID}</p>
            </div>

            <button className="flex items-center gap-2 text-xs font-medium text-white/50 group-hover:text-white transition-colors z-10 px-4 py-2 rounded-full border border-white/5 group-hover:border-white/20 bg-white/5">
              {copied ? <><Check size={14} /> 已复制</> : <><Copy size={14} /> 点击复制</>}
            </button>
          </div>

          {/* XiaoHongShu Card */}
          <a 
            href="https://xhslink.com/m/4FrLqFlYhZj" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative p-8 rounded-2xl bg-surface border border-border hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-6 overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="w-16 h-16 rounded-2xl bg-[#FF2442]/10 flex items-center justify-center text-[#FF2442] mb-2 group-hover:scale-110 transition-transform">
                <span className="font-bold text-xl">Red</span>
             </div>

             <div className="z-10">
              <p className="text-sm text-secondary uppercase tracking-widest mb-2">社交媒体</p>
              <p className="text-2xl font-bold text-white tracking-wide">小红书</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-white/50 group-hover:text-white transition-colors z-10 px-4 py-2 rounded-full border border-white/5 group-hover:border-white/20 bg-white/5">
               <span>访问主页</span> <ArrowUpRight size={14} />
            </div>
          </a>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border w-full">
           <p className="text-sm text-secondary">
             Based in Seoul & Available Worldwide.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;