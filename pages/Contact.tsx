import React, { useState } from 'react';
import { Plus, Minus, Copy, Check, ArrowUpRight } from 'lucide-react';

type AccordionItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

const Contact: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('connect');
  const [copied, setCopied] = useState(false);
  const wechatID = 'icf304';

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

  const items: AccordionItem[] = [
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
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Left Column: Metallic Typography (Matching Home Footer) */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative bg-[#050505] border-b md:border-b-0 md:border-r border-border overflow-hidden flex items-center justify-center">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-30 pointer-events-none" />

        <div className="text-center px-4">
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

      {/* Right Column: Content & Accordion */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:p-24 bg-background">
        <div className="max-w-md w-full mx-auto md:mx-0">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Let's create <br/>
            <span className="text-secondary">something iconic.</span>
          </h2>
          <p className="text-secondary text-lg mb-12 leading-relaxed">
            Everything you need to get your visual project up and running. Professional grade production for brands and individuals.
          </p>

          <div className="space-y-0 border-t border-border">
            {items.map((item) => {
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
    </div>
  );
};

export default Contact;