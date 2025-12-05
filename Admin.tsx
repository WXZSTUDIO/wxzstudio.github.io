import React, { useState, useRef } from 'react';
import { useData } from './DataContext';
import { Lock, LayoutDashboard, Video, Image as ImageIcon, Users, LogOut, Plus, Trash2, Save, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PortfolioItem, Client } from './types';

// --- Login Screen ---
const Login = () => {
  const { login } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <Lock className="text-white" size={24} />
          </div>
        </div>
        <h2 className="text-2xl font-display uppercase tracking-widest text-center mb-8">WXZ Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-3 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center uppercase tracking-wider">{error}</p>}
          <button type="submit" className="w-full bg-white text-black py-3 font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">
            Access Dashboard
          </button>
        </form>
        <div className="mt-6 text-center">
             <Link to="/" className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest">Return Home</Link>
        </div>
      </div>
    </div>
  );
};

// --- Module Editors ---

const ServicesEditor = () => {
  const { services, updateService } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display uppercase tracking-wide border-b border-zinc-800 pb-4">Manage Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded relative group">
             <div className="mb-4 aspect-video bg-black relative overflow-hidden">
                <img src={service.image} alt="" className="w-full h-full object-cover opacity-60" />
             </div>
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Title</label>
                   <input 
                      className="w-full bg-black border border-zinc-700 p-2 text-sm"
                      value={service.title}
                      onChange={(e) => updateService(service.id, { title: e.target.value })}
                   />
                </div>
                <div>
                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Description</label>
                   <textarea 
                      className="w-full bg-black border border-zinc-700 p-2 text-sm h-24"
                      value={service.description}
                      onChange={(e) => updateService(service.id, { description: e.target.value })}
                   />
                </div>
                <div>
                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Image URL</label>
                   <input 
                      className="w-full bg-black border border-zinc-700 p-2 text-xs text-zinc-400"
                      value={service.image}
                      onChange={(e) => updateService(service.id, { image: e.target.value })}
                   />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PortfolioEditor = ({ type }: { type: 'video' | 'image' }) => {
  const { videoPortfolio, graphicPortfolio, addVideoItem, addGraphicItem, deleteVideoItem, deleteGraphicItem, updateVideoItem, updateGraphicItem } = useData();
  
  const items = type === 'video' ? videoPortfolio : graphicPortfolio;
  const addItem = type === 'video' ? addVideoItem : addGraphicItem;
  const deleteItem = type === 'video' ? deleteVideoItem : deleteGraphicItem;
  const updateItem = type === 'video' ? updateVideoItem : updateGraphicItem;

  const handleAddNew = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: 'New Work',
      category: type === 'video' ? '品牌宣传' : '品牌标识',
      type: type,
      src: '',
      tags: []
    };
    addItem(newItem);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-display uppercase tracking-wide">Manage {type === 'video' ? 'Video' : 'Graphic'} Portfolio</h2>
        <button onClick={handleAddNew} className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200">
           <Plus size={14} /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col md:flex-row gap-6 items-start">
             <div className="w-full md:w-48 aspect-video bg-black shrink-0 relative overflow-hidden border border-zinc-800">
                {item.src ? (
                  type === 'video' ? 
                    <video src={item.src} className="w-full h-full object-cover" /> :
                    <img src={item.src} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon /></div>
                )}
             </div>
             
             <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Title</label>
                   <input 
                      className="w-full bg-black border border-zinc-700 p-2 text-sm"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                   />
                </div>
                <div>
                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Category</label>
                   <input 
                      className="w-full bg-black border border-zinc-700 p-2 text-sm"
                      value={item.category}
                      onChange={(e) => updateItem(item.id, { category: e.target.value })}
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Source URL / Path</label>
                   <div className="flex gap-2">
                      <input 
                          className="w-full bg-black border border-zinc-700 p-2 text-sm font-mono text-zinc-400"
                          value={item.src}
                          onChange={(e) => updateItem(item.id, { src: e.target.value })}
                          placeholder={type === 'video' ? "assets/videos/..." : "assets/images/..."}
                      />
                   </div>
                </div>
                <div className="md:col-span-2">
                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Tags (comma separated)</label>
                   <input 
                      className="w-full bg-black border border-zinc-700 p-2 text-sm"
                      value={item.tags.join(', ')}
                      onChange={(e) => updateItem(item.id, { tags: e.target.value.split(',').map(t => t.trim()) })}
                   />
                </div>
             </div>

             <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-400 p-2">
                <Trash2 size={20} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientsEditor = () => {
  const { clients, addClient, deleteClient } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        addClient({
          id: Date.now().toString(),
          name: file.name.split('.')[0],
          logo: base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-display uppercase tracking-wide">Manage Clients</h2>
        <div className="relative">
           <input 
             type="file" 
             ref={fileInputRef}
             className="hidden" 
             accept="image/*"
             onChange={handleFileUpload}
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200"
           >
             <Upload size={14} /> Upload Logo
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
         {clients.map(client => (
            <div key={client.id} className="relative group bg-zinc-900 border border-zinc-800 h-32 flex items-center justify-center p-4">
               <img src={client.logo} alt={client.name} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
               <button 
                  onClick={() => deleteClient(client.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
               >
                  <X size={12} />
               </button>
               <div className="absolute bottom-2 left-2 text-[8px] text-zinc-500 uppercase tracking-widest truncate max-w-full opacity-0 group-hover:opacity-100">{client.name}</div>
            </div>
         ))}
      </div>
    </div>
  );
};


export const AdminPanel = () => {
  const { isAuthenticated, logout } = useData();
  const [activeTab, setActiveTab] = useState<'services' | 'video' | 'graphic' | 'clients'>('services');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'services': return <ServicesEditor />;
      case 'video': return <PortfolioEditor type="video" />;
      case 'graphic': return <PortfolioEditor type="image" />;
      case 'clients': return <ClientsEditor />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col h-auto md:h-screen sticky top-0">
        <div className="mb-12">
           <h1 className="text-xl font-display font-bold tracking-[0.2em] uppercase">WXZ<br/>Admin</h1>
        </div>
        
        <nav className="flex-grow space-y-2">
           <button 
             onClick={() => setActiveTab('services')}
             className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors rounded ${activeTab === 'services' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
           >
              <LayoutDashboard size={16} /> Services
           </button>
           <button 
             onClick={() => setActiveTab('video')}
             className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors rounded ${activeTab === 'video' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
           >
              <Video size={16} /> Video Work
           </button>
           <button 
             onClick={() => setActiveTab('graphic')}
             className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors rounded ${activeTab === 'graphic' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
           >
              <ImageIcon size={16} /> Graphic Work
           </button>
           <button 
             onClick={() => setActiveTab('clients')}
             className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-colors rounded ${activeTab === 'clients' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
           >
              <Users size={16} /> Clients
           </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800 space-y-4">
           <Link to="/" className="flex items-center gap-3 text-xs text-zinc-500 hover:text-white uppercase tracking-widest px-4">
              Return to Site
           </Link>
           <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:text-red-400 uppercase tracking-widest"
           >
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
         {renderContent()}
      </main>
    </div>
  );
};
