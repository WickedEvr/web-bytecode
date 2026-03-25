import React from 'react';
import { motion } from 'framer-motion';

const Portafolio: React.FC = () => {
  const items = [
    { id: 1, title: 'Google Project', description: 'Rediseño integral de la plataforma de búsquedas con un enfoque en accesibilidad.' },
    { id: 2, title: 'Tech Solutions', description: 'Ecosistema digital para la gestión de datos masivos en la nube.' },
    { id: 3, title: 'Cloud App', description: 'Aplicación móvil multiplataforma para el control de inventarios.' },
    { id: 4, title: 'Cyber Web', description: 'Portal corporativo con altos estándares de seguridad y rendimiento.' },
  ];

  return (
    <div className="bg-space">
      <div className="network-overlay min-h-screen">
        
        {/* Header */}
        <section className="section-container text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-8"
          >
            Portafolio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Explora algunos de nuestros trabajos más recientes. Nos enorgullece ofrecer 
            soluciones que no solo cumplen con los objetivos de negocio, sino que superan 
            las expectativas de los usuarios.
          </motion.p>
        </section>

        {/* Portfolio Grid */}
        <section className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col space-y-6"
              >
                <div className="bg-sky-900/40 p-4 md:p-8 rounded-[32px] border border-white/10 group overflow-hidden">
                  <div className="w-full aspect-[16/10] bg-gray-200/20 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                     {/* iMac / Multi-screen placeholder */}
                     <span className="text-white/40 font-bold">iMac SCREEN IMAGE</span>
                  </div>
                </div>
                <div className="px-4">
                  <div className="flex items-center space-x-2 mb-2">
                     <span className="text-2xl font-bold uppercase tracking-widest">Google</span>
                  </div>
                  <p className="text-gray-400 text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Portafolio;
