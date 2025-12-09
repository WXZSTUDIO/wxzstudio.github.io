import { PortfolioItem } from './types';

// Initial Data for Video Portfolio
export const initialVideoItems: PortfolioItem[] = [
    {
      id: '2',
      title: 'SEOUL FASHION WEEK',
      category: 'Event',
      description: 'Runway coverage and backstage moments.',
      tags: ['event', 'brand'],
      src: 'https://wxzstudio.github.io/videos/portfolio-seoul-fashion.mp4',
      type: 'video',
      span: '2x1'
    },
    {
      id: '3',
      title: 'GALA NIGHT',
      category: 'Event',
      description: 'Luxury dinner event documentation.',
      tags: ['event'],
      src: 'https://wxzstudio.github.io/videos/portfolio-night.mp4',
      type: 'video',
      span: '1x1'
    },
    {
      id: '4',
      title: 'SHINSEGAE x SEOUL',
      category: 'Product',
      description: 'Duty free shop promotional campaign.',
      tags: ['product', 'brand'],
      src: 'https://wxzstudio.github.io/videos/portfolio-shinsegae.mp4',
      type: 'video',
      span: '1x1'
    },
     {
      id: '5',
      title: 'ZB1 SIDE SHOT',
      category: 'Celebrity Side Shot',
      description: 'Exclusive idol focus cam.',
      tags: ['celebrity'],
      src: 'https://wxzstudio.github.io/videos/240114_zb1.mp4',
      type: 'video',
      span: '1x2'
    },
    {
      id: '6',
      title: 'GRADUATION 2024',
      category: 'Graduation Exhibition',
      description: 'Artistic graduation showcase.',
      tags: ['graduation'],
      src: 'https://wxzstudio.github.io/videos/240313-CHENLU.mp4',
      type: 'video',
      span: '1x1'
    }
];

// Initial Data for Graphic Portfolio
export const initialGraphicItems: PortfolioItem[] = [
    { 
        id: '1', 
        title: 'SKINCARE BRAND VI', 
        category: 'Branding', 
        description: 'Complete visual identity system for organic skincare.',
        tags: ['branding'], 
        src: 'https://picsum.photos/id/20/1200/1200', 
        type: 'image',
        featured: true,
        span: '2x2'
    },
    { 
        id: '2', 
        title: 'IOPE CAMPAIGN', 
        category: 'Social', 
        description: 'Social media visual direction.',
        tags: ['social'], 
        src: 'https://picsum.photos/id/26/800/600', 
        type: 'image',
        span: '2x1' 
    },
    { 
        id: '3', 
        title: 'FAN MEET POSTER', 
        category: 'Poster', 
        description: 'Key visual for celebrity event.',
        tags: ['poster'], 
        src: 'https://picsum.photos/id/28/600/900', 
        type: 'image',
        span: '1x2' 
    },
    { 
        id: '4', 
        title: 'SUMMER DRINKS', 
        category: 'Packaging', 
        description: 'Label design series.',
        tags: ['branding', 'poster'], 
        src: 'https://picsum.photos/id/36/800/800', 
        type: 'image',
        span: '1x1' 
    },
    { 
        id: '5', 
        title: 'TECH SUMMIT 2024', 
        category: 'Key Visual', 
        description: 'Main conference branding.',
        tags: ['poster'], 
        src: 'https://picsum.photos/id/42/800/600', 
        type: 'image',
        span: '1x1'
    },
    { 
        id: '6', 
        title: 'HOLIDAY SPECIAL', 
        category: 'Social', 
        description: 'Festive marketing assets.',
        tags: ['social'], 
        src: 'https://picsum.photos/id/48/800/800', 
        type: 'image',
        span: '1x1'
    },
];

// Helper to get data (preferring LocalStorage)
export const getPortfolioData = (type: 'video' | 'graphic') => {
    const storageKey = type === 'video' ? 'wxz_video_items' : 'wxz_graphic_items';
    const initial = type === 'video' ? initialVideoItems : initialGraphicItems;
    
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            return JSON.parse(stored) as PortfolioItem[];
        }
    } catch (e) {
        console.error("Failed to load from storage", e);
    }
    return initial;
};

// Helper to save data
export const savePortfolioData = (type: 'video' | 'graphic', items: PortfolioItem[]) => {
    const storageKey = type === 'video' ? 'wxz_video_items' : 'wxz_graphic_items';
    localStorage.setItem(storageKey, JSON.stringify(items));
};