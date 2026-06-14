import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    let mounted = true;

    apiRequest<{ admin: { roles?: string[] } }>('/api/auth/me')
      .then((res) => {
        if (!mounted) return;
        const roles = res.admin.roles ?? [];
        if (allowedRoles && !roles.includes('super_admin') && !roles.some((role) => allowedRoles.includes(role))) {
          setAuthState('forbidden');
        } else {
          setAuthState('authenticated');
        }
      })
      .catch(() => {
        if (mounted) setAuthState('unauthenticated');
      });

    return () => {
      mounted = false;
    };
  }, [allowedRoles]);

  if (authState === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-[#040e1f] text-white">Cargando...</div>;
  }

  if (authState === 'unauthenticated') {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  if (authState === 'forbidden') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
