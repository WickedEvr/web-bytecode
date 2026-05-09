import React from 'react';
import { Settings, RefreshCw } from 'lucide-react';

const AdminConfiguracion: React.FC = () => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-[#06CFD6]" />
          <div>
            <h2 className="text-xl font-bold text-white">Configuración del Sistema</h2>
            <p className="text-sm text-white/60">Gestión de variables globales y catálogos.</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-[#06CFD6]">
          <RefreshCw className="h-4 w-4" /> Refrescar
        </button>
      </header>

      <div className="flex h-[360px] flex-col items-center justify-center text-center text-white/50">
        Módulo de configuración (system_settings) en construcción...
      </div>
    </div>
  );
};

export default AdminConfiguracion;
