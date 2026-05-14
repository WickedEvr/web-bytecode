import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// 1. Importación de Layouts (Se mantienen estáticos porque son compartidos y ligeros)
import MainLayout from './layouts/MainLayout';
import AltLayout from './layouts/AltLayout';
import LegalLayout from './layouts/LegalLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import RoleGuard from './components/admin/RoleGuard';

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

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminContactos = lazy(() => import('./pages/admin/Contactos'));
const AdminReclamos = lazy(() => import('./pages/admin/Reclamos'));
const AdminCotizador = lazy(() => import('./pages/admin/Cotizador'));
const AdminUsuarios = lazy(() => import('./pages/admin/Usuarios'));
const AdminConfiguracion = lazy(() => import('./pages/admin/Configuracion'));
const AdminSeguridad = lazy(() => import('./pages/admin/Seguridad'));
const AdminCMS = lazy(() => import('./pages/admin/CMS'));
const AdminAuditoria = lazy(() => import('./pages/admin/Auditoria'));

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

          {/* 🔴 RUTAS ADMIN */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="contactos" element={<RoleGuard allowedRoles={['admin', 'support_agent']}><AdminContactos /></RoleGuard>} />
            <Route path="reclamos" element={<RoleGuard allowedRoles={['admin', 'support_agent', 'legal_reviewer']}><AdminReclamos /></RoleGuard>} />
            <Route path="cotizador" element={<RoleGuard allowedRoles={['admin', 'partner_designer']}><AdminCotizador /></RoleGuard>} />
            <Route path="usuarios" element={<RoleGuard allowedRoles={['admin']}><AdminUsuarios /></RoleGuard>} />
            <Route path="configuracion" element={<RoleGuard allowedRoles={['admin']}><AdminConfiguracion /></RoleGuard>} />
            <Route path="seguridad" element={<RoleGuard allowedRoles={['admin']}><AdminSeguridad /></RoleGuard>} />
            <Route path="cms" element={<RoleGuard allowedRoles={['admin']}><AdminCMS /></RoleGuard>} />
            <Route path="auditoria" element={<RoleGuard allowedRoles={['admin']}><AdminAuditoria /></RoleGuard>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
