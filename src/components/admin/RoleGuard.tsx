import React from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import type { AdminUser } from './AdminLayout';

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { admin } = useOutletContext<{ admin: AdminUser }>();

  if (!admin) {
    return null; // Should not happen since AdminLayout waits for admin
  }

  const userRoles = admin.roles || [];

  const isSuperAdmin = userRoles.includes('super_admin');

  const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));

  if (!isSuperAdmin && !hasAllowedRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;