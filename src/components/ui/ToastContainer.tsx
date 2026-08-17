import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, bounce: 0.4 }}
            className={`pointer-events-auto flex items-start gap-3 w-80 rounded-xl border p-4 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md ${
              toast.type === 'error'
                ? 'border-red-500/20 bg-red-950/80 text-red-100'
                : toast.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-950/80 text-emerald-100'
                : 'border-blue-500/20 bg-blue-950/80 text-blue-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
            </div>
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-1 hover:bg-white/10 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
