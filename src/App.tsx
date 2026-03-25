// ✅ App.tsx — Fix 2 & 3: Rutas /condiciones, /privacidad y fallback 404 registradas
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Portafolio from './pages/Portafolio';
import Servicios from './pages/Servicios';
import Contacto from './pages/Contacto';
import Confirmacion from './pages/Confirmacion';
import LibroReclamaciones from './pages/LibroReclamaciones';
import Condiciones from './pages/Condiciones';
import Privacidad from './pages/Privacidad';
import NotFound from './pages/NotFound';
import { useEffect } from 'react';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/portafolio" element={<Portafolio />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/reclamaciones" element={<LibroReclamaciones />} />
          <Route path="/condiciones" element={<Condiciones />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
