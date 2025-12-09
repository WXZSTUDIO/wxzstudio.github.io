export type PageType = 'home' | 'video' | 'graphic' | 'contact' | 'admin';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description?: string; // Short description for overlay
  tags: string[]; // for filtering
  src: string; // video url or image url
  type: 'video' | 'image';
  featured?: boolean; // Determines if it's a Hero item
  span?: '1x1' | '2x1' | '1x2' | '2x2'; // Layout hint
}

export interface ServiceItem {
  title: string;
  description: string;
}

export interface ClientItem {
  id: number;
  name: string;
  logo?: string; // Optional URL for logo
}