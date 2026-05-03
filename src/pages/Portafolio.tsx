import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import Carousel3D, { type Project } from '../components/Carousel3D';
import AltFooter from '../components/AltFooter';
import SpotlightText from '../components/SpotlightText';
import SEO from '../components/SEO';

const AuroraBackground = lazy(() => import('../components/AuroraBackground'));

const projects: Project[] = [
  { id: 1, name: 'Google 1', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80', tags: ['React', 'TypeScript'] },
  { id: 2, name: 'Google 2', img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=700&q=80', tags: ['Next.js', 'GSAP'] },
  { id: 3, name: 'Google 3', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&q=80', tags: ['Vite', 'Tailwind'] },
  { id: 4, name: 'Google 4', img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=80', tags: ['Laravel', 'PHP'] },
];

const Portafolio: React.FC = () => {
  return (
    <div className="w-full min-h-screen font-sansation overflow-x-hidden flex flex-col relative bg-[#020611] select-none">
      <SEO 
        title="Portafolio" 
        description="Explora nuestros proyectos destacados y descubre cómo ayudamos a marcas y empresas a consolidar su presencia tecnológica."
      />

      {/* 3. FONDO 3D FIJO */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-[#020611] flex items-center justify-center">
          </div>
        }>
          <AuroraBackground />
        </Suspense>
      </div>

      {/* 4. CONTENEDOR FRONTAL */}
      <div className="w-full h-[100dvh] flex flex-col relative z-10 pointer-events-none pt-[3rem]">
        
        {/* HERO SECTION */}
        <section className="px-6 text-center text-white relative z-10 pointer-events-none flex-shrink-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[85px] font-bold mb-4 md:mb-6 tracking-wide drop-shadow-2xl transition-all"
          >
            <SpotlightText>Portafolio</SpotlightText>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/95 text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl max-w-[90%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto leading-relaxed font-light drop-shadow-lg transition-all"
          >
            <SpotlightText>
              Ayudamos a marcas y empresas a consolidar su presencia tecnológica mediante
              productos innovadores, escalables y visualmente potentes.
            </SpotlightText>
          </motion.div>
        </section>

        {/* CARRUSEL 3D */}
        <section className="w-full relative z-10 pointer-events-auto flex-grow flex items-center justify-center xl:-mt-[11vh] 2xl:-mt-[10vh]">
          <div className="w-full flex justify-center origin-center scale-[0.70] md:scale-[0.80] lg:scale-[0.85] xl:scale-[0.8] 2xl:scale-[1] transition-transform duration-500">
            <Carousel3D projects={projects} />
          </div>
        </section>
      </div>

      {/* EL FOOTER */}
      <div className="relative z-10 pointer-events-auto -mt-[5vh] md:-mt-[8vh] lg:-mt-[14vh] xl:-mt-[10vh]">
        <AltFooter />
      </div>
    </div>
  );
};

export default Portafolio;