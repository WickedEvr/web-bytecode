import React from 'react';
import { motion } from 'framer-motion';
import Carousel3D, { type Project } from '../components/Carousel3D';
import AltFooter from '../components/AltFooter'; // 1. IMPORTAMOS EL FOOTER AQUÍ

const projects: Project[] = [
  // ... (tus proyectos se mantienen igual) ...
  { id: 1, name: 'Google 1', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80', tags: ['React', 'TypeScript'] },
  { id: 2, name: 'Google 2', img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=700&q=80', tags: ['Next.js', 'GSAP'] },
  { id: 3, name: 'Google 3', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&q=80', tags: ['Vite', 'Tailwind'] },
  { id: 4, name: 'Google 4', img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=80', tags: ['Laravel', 'PHP'] },
];

const Portafolio: React.FC = () => {
  return (
    // EL CONTENEDOR PADRE: Aquí defines el fondo azul que envolverá todo, incluido el footer
    <div className="bg-[#024F79] w-full min-h-screen font-sansation overflow-x-hidden flex flex-col relative">

      {/* CONTENEDOR DE CONTENIDO: Usa flex-grow para empujar el footer hacia abajo si hay poco contenido */}
      <div className="flex-grow flex flex-col">
        {/* 1. HERO SECTION */}
        <section className="pt-24 pb-26.5 px-6 text-center text-white relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold mb-8 tracking-wide"
          >
            Portafolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/95 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light"
          >
            Ayudo a marcas y empresas a consolidar su presencia tecnológica mediante
            productos innovadores, escalables y visualmente potentes.
          </motion.p>
        </section>

        {/* 2. CARRUSEL 3D */}
        {/* Le damos un pb (padding-bottom) grande para separarlo del footer */}
        <section className="w-full pb-32 relative z-10">
          <Carousel3D projects={projects} />
        </section>
      </div>

      {/* 3. EL FOOTER: Como está dentro del div padre, el bg-[#024F79] fluye por detrás y a sus lados */}
      <AltFooter />
      
    </div>
  );
};

export default Portafolio;