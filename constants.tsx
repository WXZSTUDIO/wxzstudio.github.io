import React from 'react';
import { ServiceItem, PortfolioItem, Client } from './types';
import { Home, Video, Image as ImageIcon, Mail } from 'lucide-react';

export const SERVICES: ServiceItem[] = [
  {
    id: 'event',
    title: 'COMMERCIAL EVENT',
    description: '会议、发布会、展览、典礼等各类活动的现场拍摄与后期记录制作。',
    image: 'https://images.unsplash.com/photo-1505373877741-e15124c94fa2?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'product',
    title: 'PRODUCT SHOOT',
    description: '为电商及广告客户提供高质量的产品视频和摄影，突出产品特性与美感。',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'brand',
    title: 'BRAND IDENTITY',
    description: '制作企业宣传片、品牌故事片和形象 TVC，提升品牌知名度与市场影响力。',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'visual',
    title: 'VISUAL DESIGN',
    description: '提供品牌 VI、海报、社交媒体图文等全方位的平面设计与视觉传达服务。',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799314348d?q=80&w=800&auto=format&fit=crop'
  }
];

export const VIDEO_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'v1',
    title: '2024年度混剪',
    category: '品牌宣传',
    type: 'video',
    src: 'assets/videos/portfolio/video-01.mp4',
    tags: ['brand', 'product']
  },
  {
    id: 'v2',
    title: '首尔时装周',
    category: '商业活动',
    type: 'video',
    src: 'assets/videos/portfolio/video-02.mp4',
    tags: ['brand', 'event']
  },
  {
    id: 'v3',
    title: '高端晚宴',
    category: '商业活动',
    type: 'video',
    src: 'assets/videos/portfolio/video-03.mp4',
    tags: ['event']
  },
  {
    id: 'v4',
    title: '新世界免税店 x 首尔月',
    category: '产品拍摄',
    type: 'video',
    src: 'assets/videos/portfolio/video-04.mp4',
    tags: ['brand', 'product']
  }
];

export const GRAPHIC_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'g1',
    title: '护肤品牌 Logo & VI',
    category: '品牌标识',
    type: 'image',
    src: 'assets/portfolio/graphic-01.jpg',
    tags: ['branding']
  },
  {
    id: 'g2',
    title: 'IOPE 新品推广',
    category: '社媒视觉',
    type: 'image',
    src: 'assets/portfolio/graphic-02.jpg',
    tags: ['social']
  },
  {
    id: 'g3',
    title: '见面会海报',
    category: '海报设计',
    type: 'image',
    src: 'assets/portfolio/graphic-03.jpg',
    tags: ['poster']
  }
];

// Using the client paths from the original static HTML
export const CLIENTS: Client[] = [
  { id: 'c1', name: 'Client 1', logo: 'assets/images/clients/client01.png' },
  { id: 'c2', name: 'Client 2', logo: 'assets/images/clients/client02.png' },
  { id: 'c3', name: 'Client 3', logo: 'assets/images/clients/client03.png' },
  { id: 'c4', name: 'Client 4', logo: 'assets/images/clients/client04.png' },
  { id: 'c5', name: 'Client 5', logo: 'assets/images/clients/client05.png' },
  { id: 'c6', name: 'Client 6', logo: 'assets/images/clients/client06.png' },
  { id: 'c7', name: 'Client 7', logo: 'assets/images/clients/client07.png' },
  { id: 'c8', name: 'Client 8', logo: 'assets/images/clients/client08.png' },
  { id: 'c9', name: 'Client 9', logo: 'assets/images/clients/client09.png' },
  { id: 'c10', name: 'Client 10', logo: 'assets/images/clients/client10.png' },
];

export const NAV_ITEMS = [
  { label: 'HOME', path: '/', icon: <Home size={20} /> },
  { label: 'VIDEO', path: '/video', icon: <Video size={20} /> },
  { label: 'GRAPHIC', path: '/graphic', icon: <ImageIcon size={20} /> },
  { label: 'CONTACT', path: '/contact', icon: <Mail size={20} /> },
];