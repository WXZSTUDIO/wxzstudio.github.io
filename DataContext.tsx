import React, { createContext, useContext, useState, useEffect } from 'react';
import { SERVICES, VIDEO_PORTFOLIO, GRAPHIC_PORTFOLIO, CLIENTS } from './constants';
import { ServiceItem, PortfolioItem, Client } from './types';

interface DataContextType {
  isAuthenticated: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  
  services: ServiceItem[];
  updateService: (id: string, data: Partial<ServiceItem>) => void;
  
  videoPortfolio: PortfolioItem[];
  addVideoItem: (item: PortfolioItem) => void;
  updateVideoItem: (id: string, data: Partial<PortfolioItem>) => void;
  deleteVideoItem: (id: string) => void;
  
  graphicPortfolio: PortfolioItem[];
  addGraphicItem: (item: PortfolioItem) => void;
  updateGraphicItem: (id: string, data: Partial<PortfolioItem>) => void;
  deleteGraphicItem: (id: string) => void;
  
  clients: Client[];
  addClient: (client: Client) => void;
  deleteClient: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('wxz_auth') === 'true';
  });

  const login = (u: string, p: string) => {
    if (u === 'admin' && p === '0414') {
      setIsAuthenticated(true);
      localStorage.setItem('wxz_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('wxz_auth');
  };

  // --- Data State (Initialize from LocalStorage OR Constants) ---
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('wxz_services');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  const [videoPortfolio, setVideoPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('wxz_video');
    return saved ? JSON.parse(saved) : VIDEO_PORTFOLIO;
  });

  const [graphicPortfolio, setGraphicPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('wxz_graphic');
    return saved ? JSON.parse(saved) : GRAPHIC_PORTFOLIO;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('wxz_clients');
    return saved ? JSON.parse(saved) : CLIENTS;
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('wxz_services', JSON.stringify(services)), [services]);
  useEffect(() => localStorage.setItem('wxz_video', JSON.stringify(videoPortfolio)), [videoPortfolio]);
  useEffect(() => localStorage.setItem('wxz_graphic', JSON.stringify(graphicPortfolio)), [graphicPortfolio]);
  useEffect(() => localStorage.setItem('wxz_clients', JSON.stringify(clients)), [clients]);

  // --- Actions ---
  const updateService = (id: string, data: Partial<ServiceItem>) => {
    setServices(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  };

  const addVideoItem = (item: PortfolioItem) => setVideoPortfolio(prev => [item, ...prev]);
  const updateVideoItem = (id: string, data: Partial<PortfolioItem>) => {
    setVideoPortfolio(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  };
  const deleteVideoItem = (id: string) => setVideoPortfolio(prev => prev.filter(item => item.id !== id));

  const addGraphicItem = (item: PortfolioItem) => setGraphicPortfolio(prev => [item, ...prev]);
  const updateGraphicItem = (id: string, data: Partial<PortfolioItem>) => {
    setGraphicPortfolio(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  };
  const deleteGraphicItem = (id: string) => setGraphicPortfolio(prev => prev.filter(item => item.id !== id));

  const addClient = (client: Client) => setClients(prev => [...prev, client]);
  const deleteClient = (id: string) => setClients(prev => prev.filter(item => item.id !== id));

  return (
    <DataContext.Provider value={{
      isAuthenticated, login, logout,
      services, updateService,
      videoPortfolio, addVideoItem, updateVideoItem, deleteVideoItem,
      graphicPortfolio, addGraphicItem, updateGraphicItem, deleteGraphicItem,
      clients, addClient, deleteClient
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
