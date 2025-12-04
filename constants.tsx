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
  { path: '/videos', label: 'VIDEOS', icon: <Film size={18} /> },
  { path: '/graphic-portfolio', label: 'GRAPHIC', icon: <ImageIcon size={18} /> },
  { path: '/contact', label: 'CONTACT', icon: <Mail size={18} /> },
];

export const SERVICES: Service[] = [
  {
    title: '商业活动',
    description: '会议、发布会、展览、典礼等各类活动的现场拍摄与后期记录制作。捕捉关键时刻，留存品牌记忆。',
    icon: <Mic className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#FF512F] to-[#DD2476]', // Pink/Red
    image: 'https://picsum.photos/seed/service1/800/600'
  },
  {
    title: '产品拍摄',
    description: '为电商及广告客户提供高质量的产品视频和摄影。通过光影艺术，突出产品特性与美感，提升转化率。',
    icon: <Camera className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#4facfe] to-[#00f2fe]', // Blue/Cyan
    image: 'https://picsum.photos/seed/service2/800/600'
  },
  {
    title: '品牌宣传',
    description: '制作企业宣传片、品牌故事片和形象 TVC。以电影级的叙事手法，提升品牌知名度与市场影响力。',
    icon: <Video className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#434343] to-[#000000]', // Dark/Mono
    image: 'https://picsum.photos/seed/service3/800/600'
  },
  {
    title: '视觉设计',
    description: '提供品牌 VI、海报、社交媒体图文等全方位的平面设计与视觉传达服务。构建统一且独特的品牌视觉识别系统。',
    icon: <Palette className="text-white" size={32} />,
    colorTheme: 'bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC]', // Purple/Soft
    image: 'https://picsum.photos/seed/service4/800/600'
  },
];

export const CLIENTS: Client[] = [
  { id: 1, name: 'Google', logoInitial: 'G' },
  { id: 2, name: 'Samsung', logoInitial: 'S' },
  { id: 3, name: 'Nike', logoInitial: 'N' },
  { id: 4, name: 'Vogue', logoInitial: 'V' },
  { id: 5, name: 'Tesla', logoInitial: 'T' },
  { id: 6, name: 'Sony', logoInitial: 'S' },
  { id: 7, name: 'Adobe', logoInitial: 'A' },
  { id: 8, name: 'Dior', logoInitial: 'D' },
];

export const VIDEO_CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'brand', label: 'BRAND FILM' },
  { id: 'event', label: 'EVENT' },
  { id: 'documentary', label: 'DOCUMENTARY' },
  { id: 'product', label: 'COMMERCIAL' },
];

export const VIDEO_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'v1',
    title: '2024 SHOWREEL',
    category: 'Brand Film',
    clientName: 'WXZ STUDIO',
    location: 'GLOBAL',
    year: '2024',
    filterTags: ['brand'],
    mediaSrc: 'https://picsum.photos/seed/video1/1920/1080', 
    type: 'video',
    stats: {
      views: '12.5K',
      likes: '3.2K',
      rating: 5,
      quote: "A VISUAL MASTERPIECE"
    }
  },
  {
    id: 'v2',
    title: 'SEOUL FASHION WEEK',
    category: 'Event Recap',
    clientName: 'SFW ORGANIZER',
    location: 'SEOUL',
    year: '2023',
    filterTags: ['event', 'brand'],
    mediaSrc: 'https://picsum.photos/seed/video2/1920/1080',
    type: 'video',
    stats: {
      views: '45.2K',
      likes: '8.9K',
      rating: 5,
      quote: "CAPTURED THE VIBE PERFECTLY"
    }
  },
  {
    id: 'v3',
    title: 'VOGUE GALA DINNER',
    category: 'Event Highlight',
    clientName: 'VOGUE KOREA',
    location: 'BUSAN',
    year: '2023',
    filterTags: ['event'],
    mediaSrc: 'https://picsum.photos/seed/video3/1920/1080',
    type: 'video',
    stats: {
      views: '8.1K',
      likes: '1.5K',
      rating: 5,
      quote: "ELEGANT AND TIMELESS"
    }
  },
  {
    id: 'v4',
    title: 'DUTY FREE CAMPAIGN',
    category: 'Commercial',
    clientName: 'SHINSEGAE',
    location: 'INCHEON',
    year: '2024',
    filterTags: ['product', 'brand'],
    mediaSrc: 'https://picsum.photos/seed/video4/1920/1080',
    type: 'video',
    stats: {
      views: '102K',
      likes: '15K',
      rating: 5,
      quote: "HIGH CONVERSION VISUALS"
    }
  },
   {
    id: 'v5',
    title: 'URBAN EXPLORER',
    category: 'Documentary',
    clientName: 'NAT GEO',
    location: 'TOKYO',
    year: '2023',
    filterTags: ['brand', 'documentary'],
    mediaSrc: 'https://picsum.photos/seed/video5/1920/1080',
    type: 'video',
    stats: {
      views: '33K',
      likes: '4K',
      rating: 5,
      quote: "RAW AND REAL"
    }
  },
  {
    id: 'v6',
    title: 'COFFEE CULTURE',
    category: 'Documentary',
    clientName: 'BLUE BOTTLE',
    location: 'KYOTO',
    year: '2023',
    filterTags: ['brand', 'documentary'],
    mediaSrc: 'https://picsum.photos/seed/video6/1920/1080',
    type: 'video',
    stats: {
      views: '19K',
      likes: '2K',
      rating: 5,
      quote: "AROMATIC VISUALS"
    }
  },
   {
    id: 'v7',
    title: 'NEON NIGHTS',
    category: 'Experimental',
    clientName: 'PERSONAL',
    location: 'HONG KONG',
    year: '2022',
    filterTags: ['brand'],
    mediaSrc: 'https://picsum.photos/seed/video7/1920/1080',
    type: 'video',
    stats: {
      views: '11K',
      likes: '2.5K',
      rating: 5,
      quote: "CYBERPUNK AESTHETIC"
    }
  },
];

export const GRAPHIC_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'g1',
    title: 'Pure Skin Identity',
    category: 'Branding',
    clientName: 'PURE SKIN',
    year: '2024',
    filterTags: ['branding'],
    mediaSrc: 'https://picsum.photos/seed/graphic1/1200/1200',
    type: 'image',
  },
  {
    id: 'g2',
    title: 'IOPE Launch KV',
    category: 'Social Media',
    clientName: 'IOPE',
    year: '2024',
    filterTags: ['social'],
    mediaSrc: 'https://picsum.photos/seed/graphic2/1200/1600',
    type: 'image',
  },
  {
    id: 'g3',
    title: 'Fan Meeting Poster',
    category: 'Poster Design',
    clientName: 'ENT. AGENCY',
    year: '2023',
    filterTags: ['poster'],
    mediaSrc: 'https://picsum.photos/seed/graphic3/1200/1600',
    type: 'image',
  },
   {
    id: 'g4',
    title: 'Waterbomb Festival',
    category: 'Key Visual',
    clientName: 'WATERBOMB',
    year: '2023',
    filterTags: ['poster'],
    mediaSrc: 'https://picsum.photos/seed/graphic4/1200/1600',
    type: 'image',
  },
];