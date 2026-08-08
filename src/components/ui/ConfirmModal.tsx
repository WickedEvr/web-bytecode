import React from 'react';
import ShineBorder from './shine-border';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export type ConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Confirmar Acción',
  message,
  onConfirm,
  onCancel,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const color = isDanger ? ["#ef4444", "#991b1b", "#ef4444"] : ["#f59e0b", "#b45309", "#f59e0b"];
  const shadowColor = isDanger ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)';
  const iconBg = isDanger ? 'bg-red-500/10' : 'bg-amber-500/10';
  const iconColor = isDanger ? 'text-red-500' : 'text-amber-500';
  const btnBg = isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <ShineBorder 
        borderRadius={16} 
        borderWidth={1.5} 
        color={color} 
        className={`w-full max-w-sm bg-[#0a0a0a] shadow-[0_0_50px_-12px_${shadowColor}]`}
      >
        <div className="p-6 text-center">
          <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
            {isDanger ? (
              <AlertCircle className={`h-7 w-7 ${iconColor}`} />
            ) : (
              <AlertTriangle className={`h-7 w-7 ${iconColor}`} />
            )}
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white/90">{title}</h2>
          <p className="mb-6 text-sm text-white/60">{message}</p>
          <div className="flex gap-3 justify-center">
            <button 
              type="button"
              onClick={onCancel} 
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {cancelText}
            </button>
            <button 
              type="button"
              onClick={() => {
                onConfirm();
              }} 
              className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${btnBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </ShineBorder>
    </div>
  );
};
