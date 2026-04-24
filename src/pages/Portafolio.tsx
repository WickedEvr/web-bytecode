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
      <div className="flex-grow flex flex-col relative z-10 pointer-events-none">
        
        {/* HERO SECTION: Espaciado dinámico vertical (vh) para asegurar que nada se desborde sin scroll */}
        <section className="pt-[clamp(3rem,9vh,6rem)] pb-[clamp(1rem,3vh,3rem)] px-6 text-center text-white relative z-10 pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            // El margen inferior también se adapta a la altura de la pantalla
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-[clamp(1rem,3vh,2rem)] tracking-wide drop-shadow-2xl"
          >
            <SpotlightText>Portafolio</SpotlightText>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/95 text-base md:text-xl lg:text-2xl max-w-[90%] md:max-w-3xl mx-auto leading-relaxed font-light drop-shadow-lg"
          >
            <SpotlightText>
              Ayudo a marcas y empresas a consolidar su presencia tecnológica mediante
              productos innovadores, escalables y visualmente potentes.
            </SpotlightText>
          </motion.div>
        </section>

        {/* CARRUSEL 3D */}
        <section className="w-full relative z-10 pointer-events-auto flex-grow flex items-center justify-center min-h-[50vh] md:min-h-[60vh] pb-[clamp(2rem,5vh,6rem)]">
          {/* WRAPPER DE ESCALA ULTRA-PRECISO:
              - Móvil (por defecto): 70%
              - md (Tablets horizontales): 80%
              - lg (Laptops estándar de 13"/14"): 85%
              - xl (Monitores de PC estándar): 95%
              - 2xl (Monitores gigantes/iMacs): 100%
          */}
          <div className="w-full flex justify-center origin-center scale-[0.70] md:scale-[0.80] lg:scale-[0.85] xl:scale-[0.95] 2xl:scale-100 transition-transform duration-300">
            <Carousel3D projects={projects} />
          </div>
        </section>
      </div>

      {/* EL FOOTER */}
      <div className="relative z-10 pointer-events-auto mt-auto">
        <AltFooter />
      </div>
    </div>
  );
};

export default Portafolio;