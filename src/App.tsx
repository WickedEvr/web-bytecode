import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// 1. Importación de Layouts (Se mantienen estáticos porque son compartidos y ligeros)
import MainLayout from './layouts/MainLayout';
import AltLayout from './layouts/AltLayout';
import LegalLayout from './layouts/LegalLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';


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
const Admin = lazy(() => import('./pages/Admin'));
const AdminCotizador = lazy(() => import('./pages/admin/Cotizador'));
const AdminUsuarios = lazy(() => import('./pages/admin/Usuarios'));
const AdminConfiguracion = lazy(() => import('./pages/admin/Configuracion'));
const AdminCMS = lazy(() => import('./pages/admin/CMS'));
const NotFound = lazy(() => import('./pages/NotFound'));


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
      <Suspense fallback={null}>
        <Routes>
          {/* 🟢 GRUPO 1: Header Normal + Footer Normal */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            
          </Route>
          
          {/* 🔵 GRUPO 2: AltHeader + AltFooter */}
          <Route element={<AltLayout />}>
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/portafolio" element={<Portafolio />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/confirmacion" element={<Confirmacion />} />
            <Route path="/reclamaciones" element={<LibroReclamaciones />} />
          </Route>

          {/* 🔵 GRUPO 3: MainHeader + ContactFooter */}
          <Route element={<LegalLayout />}>
            <Route path="/condiciones" element={<Condiciones />} />
            <Route path="/privacidad" element={<Privacidad />} />
          </Route>

          {/* 🔴 SIN LAYOUT (Pantalla completa) */}
          <Route path="/admin/login" element={<Admin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/cotizador" element={<ProtectedRoute><AdminCotizador /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute><AdminUsuarios /></ProtectedRoute>} />
          <Route path="/admin/configuracion" element={<ProtectedRoute><AdminConfiguracion /></ProtectedRoute>} />
          <Route path="/admin/cms" element={<ProtectedRoute><AdminCMS /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
