import React from 'react';
import { motion } from 'framer-motion';
import Carousel3D, { type Project } from '../components/Carousel3D';

const projects: Project[] = [
  {
    id: 1,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80',
    tags: ['React', 'TypeScript'],
  },
  {
    id: 2,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=700&q=80',
    tags: ['Next.js', 'GSAP'],
  },
  {
    id: 3,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&q=80',
    tags: ['Vite', 'Tailwind'],
  },
  {
    id: 4,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=80',
    tags: ['Laravel', 'PHP'],
  },
];

const Portafolio: React.FC = () => {
  return (
    <div className="bg-[#024F79] w-full h-full flex-grow font-sansation overflow-x-hidden flex flex-col">

      {/* 1. HERO SECTION — sin cambios */}
      <section className="pt-24 pb-16 px-6 text-center text-white relative z-10">
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


      {/* 2. CARRUSEL 3D — reemplaza el grid estático */}
      <section className="w-full pb-32 relative z-10">
        <Carousel3D projects={projects} />
      </section>

    </div>
  );
};

export default Portafolio;
