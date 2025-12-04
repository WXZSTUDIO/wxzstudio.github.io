import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import { VIDEO_PORTFOLIO, GRAPHIC_PORTFOLIO } from './constants';

const App = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/videos" element={<Videos />} />
          <Route 
            path="/work" 
            element={<Navigate to="/videos" replace />} 
          />
          <Route 
            path="/video-portfolio" 
            element={<Navigate to="/videos" replace />} 
          />
          <Route 
            path="/graphic-portfolio" 
            element={
              <Portfolio 
                title="Graphic Design" 
                items={GRAPHIC_PORTFOLIO} 
                categories={[
                  { id: 'all', label: '全部' },
                  { id: 'branding', label: '品牌标识' },
                  { id: 'social', label: '社媒视觉' },
                  { id: 'poster', label: '海报设计' }
                ]}
              />
            } 
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;