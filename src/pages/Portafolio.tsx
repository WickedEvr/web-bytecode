import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import Carousel3D, { type Project } from '../components/Carousel3D';
import AltFooter from '../components/AltFooter';
import SpotlightText from '../components/SpotlightText';


// 1. IMPORTACIÓN DIFERIDA (Mejora drásticamente el rendimiento de carga inicial)
const AuroraBackground = lazy(() => import('../components/AuroraBackground'));

const projects: Project[] = [
  { id: 1, name: 'Google 1', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80', tags: ['React', 'TypeScript'] },
  { id: 2, name: 'Google 2', img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=700&q=80', tags: ['Next.js', 'GSAP'] },
  { id: 3, name: 'Google 3', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&q=80', tags: ['Vite', 'Tailwind'] },
  { id: 4, name: 'Google 4', img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=80', tags: ['Laravel', 'PHP'] },
];

const Portafolio: React.FC = () => {
  return (
    // 2. Quitamos el color de fondo sólido para que el 3D respire
    <div className="w-full min-h-screen font-sansation overflow-x-hidden flex flex-col relative bg-[#020611]">

      {/* 3. FONDO 3D FIJO: Se queda quieto mientras el usuario hace scroll */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-[#020611] flex items-center justify-center">
          </div>
        }>
          <AuroraBackground />
        </Suspense>
      </div>

      {/* 4. CONTENEDOR FRONTAL: z-10 para estar sobre el 3D */}
      <div className="flex-grow flex flex-col relative z-10 pointer-events-none">
        
        {/* HERO SECTION */}
        <section className="pt-24 pb-26.5 px-6 text-center text-white relative z-10 pointer-events-none">
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold mb-8 tracking-wide drop-shadow-2xl"
          >
            {/* Envolvemos la palabra Portafolio */}
            <SpotlightText>Portafolio</SpotlightText>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/95 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light drop-shadow-lg"
          >
            {/* Envolvemos también el párrafo */}
            <SpotlightText>
              Ayudo a marcas y empresas a consolidar su presencia tecnológica mediante
              productos innovadores, escalables y visualmente potentes.
            </SpotlightText>
          </motion.div>

        </section>

        {/* CARRUSEL 3D */}
        <section className="w-full pb-32 relative z-10 pointer-events-auto">
          <Carousel3D projects={projects} />
        </section>
      </div>

      {/* EL FOOTER: Al tener z-10, bloqueará el 3D por detrás, creando un efecto de tarjeta */}
      <div className="relative z-10 pointer-events-auto">
        <AltFooter />
      </div>
      
    </div>
  );
};

export default Portafolio;