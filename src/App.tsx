// App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Importamos ambos Layouts 1
import MainLayout from './layouts/MainLayout';
import AltLayout from './layouts/AltLayout';
import ContactLayout from './layouts/ContactLayout';

// Importamos las páginas
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
      
      <Routes>
        {/* 🟢 GRUPO 1: Header Normal + Footer Normal */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/condiciones" element={<Condiciones />} />
          <Route path="/privacidad" element={<Privacidad />} />
        </Route>
        
        {/* 🔵 GRUPO 2: AltHeader + AltFooter */}
        <Route element={<AltLayout />}>
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/portafolio" element={<Portafolio />} />
          <Route path="/servicios" element={<Servicios />} />
        </Route>

        {/* 🟠 GRUPO 3: AltHeader + ContactFooter */}
        <Route element={<ContactLayout />}>
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/reclamaciones" element={<LibroReclamaciones />} />
        </Route>

        {/* 🔴 SIN LAYOUT (Pantalla completa) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
