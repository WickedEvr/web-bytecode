import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminUser } from './AdminLayout';

type RoleGuardProps = {
  children: React.ReactNode;
  requiredPermission: string;
};

const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredPermission }) => {
  const { admin } = useOutletContext<{ admin: AdminUser }>();

  if (!admin) return null;
  if (admin.roles?.includes('super_admin')) return <>{children}</>;
  if (admin.permissions?.includes(requiredPermission)) return <>{children}</>;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/60">
      No tienes permiso para acceder a esta vista.
    </div>
  );
};

export default RoleGuard;
