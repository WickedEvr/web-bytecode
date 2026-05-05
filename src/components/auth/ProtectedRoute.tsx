import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    let mounted = true;

    apiRequest('/api/auth/me')
      .then(() => {
        if (mounted) setAuthState('authenticated');
      })
      .catch(() => {
        if (mounted) setAuthState('unauthenticated');
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (authState === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-[#040e1f] text-white">Cargando...</div>;
  }

  if (authState === 'unauthenticated') {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
