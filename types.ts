import React from 'react';

export type Category = 'all' | 'branding' | 'social' | 'poster' | 'event' | 'product' | 'brand' | 'documentary';

export interface PortfolioStats {
  views: string;
  likes: string;
  rating: number; // 1-5
  quote: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string; // Display name
  clientName?: string; // e.g. "VOGUE"
  location?: string; // e.g. "SEOUL"
  year: string;
  filterTags: Category[]; // Logic tags
  mediaSrc: string; // Image URL or Video URL
  type: 'image' | 'video';
  stats?: PortfolioStats;
}

export interface Client {
  id: number;
  name: string;
  logoInitial: string; // Fallback text
  logoSrc?: string; // Path to logo image
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorTheme: string; // Tailwind gradient classes
  image?: string; // Optional background image for the card
}