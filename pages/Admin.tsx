import React, { useState, useEffect } from 'react';
import { PageType, PortfolioItem } from '../types';
import { getPortfolioData, savePortfolioData } from '../data';
import { Lock, LogIn, Save, ArrowLeft, RefreshCw } from 'lucide-react';

interface AdminProps {
  onNavigate: (page: PageType) => void;
}

const Admin: React.FC<AdminProps> = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Data State
  const [videoItems, setVideoItems] = useState<PortfolioItem[]>([]);
  const [graphicItems, setGraphicItems] = useState<PortfolioItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (isAuthenticated) {
        setVideoItems(getPortfolioData('video'));
        setGraphicItems(getPortfolioData('graphic'));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '0414') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleVideoChange = (id: string, newTitle: string) => {
    setVideoItems(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
    setSaveStatus('idle');
  };

  const handleGraphicChange = (id: string, newTitle: string) => {
    setGraphicItems(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
    setSaveStatus('idle');
  };

  const handleSave = () => {
    setSaveStatus('saving');
    savePortfolioData('video', videoItems);
    savePortfolioData('graphic', graphicItems);
    
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleReset = () => {
      if(window.confirm('Are you sure you want to reset all changes? This will clear local edits and revert to the original code values.')) {
          localStorage.removeItem('wxz_video_items');
          localStorage.removeItem('wxz_graphic_items');
          // Reload from source
          setVideoItems(getPortfolioData('video'));
          setGraphicItems(getPortfolioData('graphic'));
      }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md p-8 bg-surface border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white/5 border border-white/10">
                <Lock className="text-accent" size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-8 font-display">WXZ Admin</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-accent focus:outline-none transition-colors"
                placeholder="Enter password"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center space-x-2"
            >
                <LogIn size={18} />
                <span>Login</span>
            </button>
          </form>
          
          <button 
            onClick={() => onNavigate('home')}
            className="w-full mt-4 text-secondary text-sm hover:text-white transition-colors text-center"
          >
            Back to Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => onNavigate('home')} 
                    className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-bold font-display">Content Manager</h1>
            </div>
            
            <div className="flex space-x-3">
                 <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/40 transition-colors flex items-center space-x-2 text-sm font-medium"
                >
                    <RefreshCw size={16} />
                    <span>Reset Defaults</span>
                </button>
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className={`px-8 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all ${
                        saveStatus === 'saved' 
                        ? 'bg-green-500 text-black' 
                        : 'bg-accent text-black hover:bg-white'
                    }`}
                >
                    <Save size={18} />
                    <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}</span>
                </button>
            </div>
        </div>

        {/* Video Section */}
        <div className="mb-12">
            <h2 className="text-xl font-bold text-accent mb-6 border-b border-white/10 pb-2">Video Portfolio Titles</h2>
            <div className="space-y-4">
                {videoItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-full md:w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                             {/* Preview Thumbnail */}
                             <div className="absolute inset-0 flex items-center justify-center text-xs text-secondary">
                                 Video ID: {item.id}
                             </div>
                        </div>
                        <div className="flex-grow">
                             <label className="text-xs text-secondary uppercase tracking-wider mb-1 block">Title</label>
                             <input 
                                type="text"
                                value={item.title}
                                onChange={(e) => handleVideoChange(item.id, e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:border-accent focus:outline-none"
                             />
                        </div>
                         <div className="flex-grow">
                             <label className="text-xs text-secondary uppercase tracking-wider mb-1 block">Category</label>
                             <div className="px-3 py-2 text-white/50 bg-black/50 border border-white/5 rounded cursor-not-allowed">
                                 {item.category}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

         {/* Graphic Section */}
         <div className="mb-12">
            <h2 className="text-xl font-bold text-accent mb-6 border-b border-white/10 pb-2">Graphic Portfolio Titles</h2>
            <div className="space-y-4">
                {graphicItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-full md:w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                             <img src={item.src} className="w-full h-full object-cover opacity-50" />
                        </div>
                        <div className="flex-grow">
                             <label className="text-xs text-secondary uppercase tracking-wider mb-1 block">Title</label>
                             <input 
                                type="text"
                                value={item.title}
                                onChange={(e) => handleGraphicChange(item.id, e.target.value)}
                                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white focus:border-accent focus:outline-none"
                             />
                        </div>
                        <div className="flex-grow">
                             <label className="text-xs text-secondary uppercase tracking-wider mb-1 block">Category</label>
                             <div className="px-3 py-2 text-white/50 bg-black/50 border border-white/5 rounded cursor-not-allowed">
                                 {item.category}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;