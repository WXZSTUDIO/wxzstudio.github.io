import { Video, Camera, Mic, Palette, PlayCircle, Image as ImageIcon, Home, Mail, Film } from 'lucide-react';
import { PortfolioItem, Client, Service } from './types';

// ==========================================
// 📁 文件上传指南 / FILE UPLOAD GUIDE
// ==========================================
// 1. 将您的视频文件放入 public/assets/videos/ 文件夹
// 2. 将您的图片文件放入 public/assets/images/ 文件夹
// 3. 将客户Logo放入 public/assets/clients/ 文件夹
// ==========================================

export const NAV_LINKS = [
  { path: '/', label: 'HOME', icon: <Home size={18} /> },
  { path: '/videos', label: 'FILMS', icon: <Film size={18} /> },
  { path: '/graphic-portfolio', label: 'GRAPHIC', icon: <ImageIcon size={18} /> },
  { path: '/contact', label: 'CONTACT', icon: <Mail size={18} /> },
];

export const SERVICES: Service[] = [
  {
    title: '商业活动',
    description: '会议、发布会、展览、典礼等各类活动的现场拍摄与后期记录制作。捕捉关键时刻，留存品牌记忆。',
    icon: <Mic className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#FF512F] to-[#DD2476]', // Pink/Red
    image: 'https://image.pollinations.ai/prompt/conference%20event%20photography%20professional%20camera%20dark%20cinematic?width=800&height=600&nologo=true'
  },
  {
    title: '产品拍摄',
    description: '为电商及广告客户提供高质量的产品视频和摄影。通过光影艺术，突出产品特性与美感，提升转化率。',
    icon: <Camera className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#4facfe] to-[#00f2fe]', // Blue/Cyan
    image: 'https://image.pollinations.ai/prompt/luxury%20product%20photography%20studio%20lighting%20cosmetics?width=800&height=600&nologo=true'
  },
  {
    title: '品牌宣传',
    description: '制作企业宣传片、品牌故事片和形象 TVC。以电影级的叙事手法，提升品牌知名度与市场影响力。',
    icon: <Video className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#434343] to-[#000000]', // Dark/Mono
    image: 'https://image.pollinations.ai/prompt/film%20set%20cinema%20camera%20crew%20behind%20the%20scenes?width=800&height=600&nologo=true'
  },
  {
    title: '视觉设计',
    description: '提供品牌 VI、海报、社交媒体图文等全方位的平面设计与视觉传达服务。构建统一且独特的品牌视觉识别系统。',
    icon: <Palette className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC]', // Purple/Soft
    image: 'https://image.pollinations.ai/prompt/graphic%20design%20workspace%20minimalist%20creative%20studio?width=800&height=600&nologo=true'
  },
];

export const CLIENTS: Client[] = [
  { id: 1, name: 'AEKYUNG', logoInitial: 'A', logoSrc: '/assets/clients/AEKYUNG.png' },
  { id: 2, name: 'AMOREPACIFIC', logoInitial: 'A', logoSrc: '/assets/clients/AMOREPACIFIC.png' },
  { id: 3, name: 'COSRX', logoInitial: 'C', logoSrc: '/assets/clients/COSRX.png' },
  { id: 4, name: 'HERA', logoInitial: 'H', logoSrc: '/assets/clients/HERA.png' },
  { id: 5, name: 'high&gogo', logoInitial: 'h', logoSrc: '/assets/clients/high&gogo.png' },
  { id: 6, name: '(G)I-DLE', logoInitial: 'I', logoSrc: '/assets/clients/i-dle.png' },
  { id: 7, name: 'IOPE', logoInitial: 'I', logoSrc: '/assets/clients/IOPE.png' },
  { id: 8, name: 'LEADERS', logoInitial: 'L', logoSrc: '/assets/clients/LEADERS.png' },
  { id: 9, name: 'VITALBEAUTIE', logoInitial: 'V', logoSrc: '/assets/clients/VITALBEAUTIE.png' },
  { id: 10, name: 'SHINSEGAE', logoInitial: 'S', logoSrc: '/assets/clients/SHINSEGAE.png' },
  { id: 11, name: 'Q.one', logoInitial: 'Q', logoSrc: '/assets/clients/Q.one.png' },
  { id: 12, name: 'ZB1', logoInitial: 'Z', logoSrc: '/assets/clients/ZB1.png' },
];

export const VIDEO_CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'brand', label: '品牌影片' },
  { id: 'event', label: '活动记录' },
  { id: 'documentary', label: '纪录片' },
  { id: 'product', label: '商业广告' },
];

// Helper to generate consistent diverse images
const getCinematicImage = (prompt: string) => 
  `https://image.pollinations.ai/prompt/cinematic%20shot%20of%20${encodeURIComponent(prompt)}%20high%20quality%204k?width=1920&height=1080&nologo=true&seed=${Math.floor(Math.random()*1000)}`;

export const VIDEO_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'v1',
    title: '2024 年度混剪',
    category: '品牌形象',
    clientName: 'WXZ STUDIO',
    location: '全球',
    year: '2024',
    filterTags: ['brand'],
    mediaSrc: 'https://image.pollinations.ai/prompt/cinematic%20showreel%20montage%20diverse%20scenes%20camera%20lens%20flare%20dark%20moody?width=1920&height=1080&nologo=true', 
    type: 'video',
    stats: {
      views: '12.5K',
      likes: '3,240',
      rating: 5,
      quote: "视觉盛宴，震撼人心"
    }
  },
  {
    id: 'v2',
    title: '首尔时装周',
    category: '活动回顾',
    clientName: 'SFW 主办方',
    location: '首尔',
    year: '2023',
    filterTags: ['event', 'brand'],
    mediaSrc: 'https://image.pollinations.ai/prompt/seoul%20fashion%20week%20runway%20models%20futuristic%20clothing%20neon%20lights?width=1920&height=1080&nologo=true',
    type: 'video',
    stats: {
      views: '45.2K',
      likes: '8,900',
      rating: 5,
      quote: "完美捕捉现场氛围"
    }
  },
  {
    id: 'v3',
    title: 'VOGUE 晚宴',
    category: '活动集锦',
    clientName: 'VOGUE KOREA',
    location: '釜山',
    year: '2023',
    filterTags: ['event'],
    mediaSrc: 'https://image.pollinations.ai/prompt/elegant%20gala%20dinner%20luxury%20champagne%20glass%20bokeh%20evening%20gown?width=1920&height=1080&nologo=true',
    type: 'video',
    stats: {
      views: '8.1K',
      likes: '1,520',
      rating: 5,
      quote: "优雅而永恒的记录"
    }
  },
  {
    id: 'v4',
    title: '免税店宣传片',
    category: '商业广告',
    clientName: '新世界百货',
    location: '仁川',
    year: '2024',
    filterTags: ['product', 'brand'],
    mediaSrc: 'https://image.pollinations.ai/prompt/luxury%20shopping%20mall%20duty%20free%20cosmetics%20perfume%20bright%20clean?width=1920&height=1080&nologo=true',
    type: 'video',
    stats: {
      views: '102K',
      likes: '15,000',
      rating: 5,
      quote: "高转化率的视觉呈现"
    }
  },
   {
    id: 'v5',
    title: '城市探索者',
    category: '纪录片',
    clientName: '国家地理',
    location: '东京',
    year: '2023',
    filterTags: ['brand', 'documentary'],
    mediaSrc: 'https://image.pollinations.ai/prompt/tokyo%20street%20photography%20rain%20neon%20cyberpunk%20vibe%20umbrella?width=1920&height=1080&nologo=true',
    type: 'video',
    stats: {
      views: '33K',
      likes: '4,100',
      rating: 5,
      quote: "真实而充满力量"
    }
  },
  {
    id: 'v6',
    title: '咖啡文化',
    category: '人文纪录',
    clientName: 'BLUE BOTTLE',
    location: '京都',
    year: '2023',
    filterTags: ['brand', 'documentary'],
    mediaSrc: 'https://image.pollinations.ai/prompt/japanese%20coffee%20shop%20barista%20pouring%20coffee%20warm%20light%20wood%20texture?width=1920&height=1080&nologo=true',
    type: 'video',
    stats: {
      views: '19K',
      likes: '2,300',
      rating: 5,
      quote: "充满香气的视觉体验"
    }
  },
   {
    id: 'v7',
    title: '霓虹之夜',
    category: '实验短片',
    clientName: '个人项目',
    location: '香港',
    year: '2022',
    filterTags: ['brand'],
    mediaSrc: 'https://image.pollinations.ai/prompt/hong%20kong%20neon%20signs%20reflection%20puddle%20wong%20kar%20wai%20style?width=1920&height=1080&nologo=true',
    type: 'video',
    stats: {
      views: '11K',
      likes: '2,550',
      rating: 5,
      quote: "赛博朋克美学"
    }
  },
];

export const GRAPHIC_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'g1',
    title: 'Pure Skin 品牌识别',
    category: '品牌设计',
    clientName: 'PURE SKIN',
    year: '2024',
    filterTags: ['branding'],
    mediaSrc: 'https://image.pollinations.ai/prompt/minimalist%20skincare%20brand%20identity%20mockup%20pastel%20colors?width=1200&height=1200&nologo=true',
    type: 'image',
  },
  {
    id: 'g2',
    title: 'IOPE 发布会主视觉',
    category: '社媒视觉',
    clientName: 'IOPE',
    year: '2024',
    filterTags: ['social'],
    mediaSrc: 'https://image.pollinations.ai/prompt/cosmetic%20product%20launch%20key%20visual%20science%20blue%20future?width=1200&height=1600&nologo=true',
    type: 'image',
  },
  {
    id: 'g3',
    title: '粉丝见面会海报',
    category: '海报设计',
    clientName: 'ENT. AGENCY',
    year: '2023',
    filterTags: ['poster'],
    mediaSrc: 'https://image.pollinations.ai/prompt/kpop%20concert%20poster%20design%20dynamic%20typography%20colorful?width=1200&height=1600&nologo=true',
    type: 'image',
  },
   {
    id: 'g4',
    title: 'Waterbomb 音乐节',
    category: '主视觉设计',
    clientName: 'WATERBOMB',
    year: '2023',
    filterTags: ['poster'],
    mediaSrc: 'https://image.pollinations.ai/prompt/music%20festival%20poster%20water%20splash%20summer%20energy?width=1200&height=1600&nologo=true',
    type: 'image',
  },
];