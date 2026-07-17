import { useMemo } from 'react';

type StatusInfo = {
  isTerminal?: boolean;
};

export const useTerminalState = (statusInfo?: StatusInfo) => {
  const isReadOnly = useMemo(() => {
    return statusInfo?.isTerminal === true;
  }, [statusInfo]);

  return {
    isReadOnly,
    // Helper to pass directly to form components
    formProps: isReadOnly ? { readOnly: true, disabled: true } : {},
  };
};
