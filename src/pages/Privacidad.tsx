// ✅ Privacidad.tsx — Fix 2: Página nueva para la ruta /privacidad (placeholder)
import React from 'react';

const Privacidad: React.FC = () => {
  return (
    <div className="bg-space min-h-screen">
      <div className="network-overlay py-32 px-6">
        <section className="max-w-3xl mx-auto glass-panel p-8 md:p-16 space-y-6">
          <h1 className="text-4xl font-bold uppercase tracking-widest text-primary-cyan">
            Política de Privacidad
          </h1>
          <p className="text-gray-400">Página en construcción.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacidad;
