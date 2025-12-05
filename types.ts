export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  type: 'video' | 'image';
  src: string;
  tags: string[];
}

export interface Client {
  id: string;
  name: string;
  logo: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}