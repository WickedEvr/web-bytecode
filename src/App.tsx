import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// 1. Importación de Layouts (Se mantienen estáticos porque son compartidos y ligeros)
import MainLayout from './layouts/MainLayout';
import AltLayout from './layouts/AltLayout';
import ContactLayout from './layouts/ContactLayout';

// 2. Code Splitting: Importamos las páginas de forma dinámica
// Esto genera archivos .js separados que solo se descargan cuando el usuario visita la ruta.
const Home = lazy(() => import('./pages/Home'));
const Nosotros = lazy(() => import('./pages/Nosotros'));
const Portafolio = lazy(() => import('./pages/Portafolio'));
const Servicios = lazy(() => import('./pages/Servicios'));
const Contacto = lazy(() => import('./pages/Contacto'));
const Confirmacion = lazy(() => import('./pages/Confirmacion'));
const LibroReclamaciones = lazy(() => import('./pages/LibroReclamaciones'));
const Condiciones = lazy(() => import('./pages/Condiciones'));
const Privacidad = lazy(() => import('./pages/Privacidad'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Componente de carga (Fallback)
// Puedes personalizarlo con un Spinner o un esqueleto de carga
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#060c1d]">
    <div className="animate-pulse text-cyan-400 font-sansation text-xl">Cargando...</div>
  </div>
);

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
      
      {/* 3. Suspense envuelve las rutas para manejar el estado de carga de los componentes lazy */}
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </Router>
  );
};

export default App;