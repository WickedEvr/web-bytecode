import React from 'react';
import { ClipboardList } from 'lucide-react';

const Auditoria: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Auditoría</h1>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <ClipboardList className="mx-auto mb-4 h-12 w-12 text-[#06CFD6]/50" />
        <h2 className="text-xl font-bold">Logs del Sistema</h2>
        <p className="text-white/60">Módulo en construcción (preparado para logs futuros).</p>
      </div>
    </div>
  );
};

export default Auditoria;
