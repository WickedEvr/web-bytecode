// ✅ Condiciones.tsx — Fix 2: Página nueva para la ruta /condiciones (placeholder)
import React from 'react';

const Condiciones: React.FC = () => {
  return (
    <div className="bg-space min-h-screen font-sansation">
      <div className="network-overlay py-32 px-6">
        <section className="max-w-3xl mx-auto glass-panel p-8 md:p-16 space-y-6">
          <h1 className="text-4xl font-bold uppercase tracking-widest text-primary-cyan">
            Términos y Condiciones
          </h1>
          <p className="text-gray-400">Página en construcción.</p>
        </section>
      </div>
    </div>
  );
};

export default Condiciones;
