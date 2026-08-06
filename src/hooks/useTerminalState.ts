import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminUser } from '../components/admin/AdminLayout';

type StatusInfo = {
  isTerminal?: boolean;
};

export const useTerminalState = (statusInfo?: StatusInfo) => {
  let admin: AdminUser | null = null;
  try {
    const context = useOutletContext<{ admin?: AdminUser } | null>();
    if (context?.admin) {
      admin = context.admin;
    }
  } catch {
    // Fuera del contexto de Outlet
  }

  const isReadOnly = useMemo(() => {
    if (statusInfo?.isTerminal !== true) return false;
    if (admin?.roles?.includes('super_admin')) return false;
    return true;
  }, [statusInfo, admin]);

  return {
    isReadOnly,
    // Helper to pass directly to form components
    formProps: isReadOnly ? { readOnly: true, disabled: true } : {},
  };
};
