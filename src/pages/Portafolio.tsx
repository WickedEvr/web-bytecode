import React from 'react';
import { motion } from 'framer-motion';

const SwirlMark = () => (
  <img src="/isotipo.svg" alt="" aria-hidden="true" className="w-5 h-5" />
);

const projects = [
  {
    id: 1,
    name: 'Google',
    description:
      'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80',
  },
  {
    id: 2,
    name: 'Google',
    description:
      'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=700&q=80',
  },
  {
    id: 3,
    name: 'Google',
    description:
      'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&q=80',
  },
  {
    id: 4,
    name: 'Google',
    description:
      'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=80',
  },
];

const Portafolio: React.FC = () => {
  return (
    <div className="bg-[#0891b2] overflow-x-hidden">

      {/* ── HEADER ── */}
      <section className="pt-16 pb-12 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black text-white mb-5"
        >
          Portafolio
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-white/80 text-sm md:text-base max-w-lg mx-auto leading-relaxed"
        >
          Ayudo a marcas y empresas a consolidar su presencia tecnológica
          mediante productos innovadores, escalables y visualmente potentes.
        </motion.p>
      </section>

      {/* ── GRID DE PROYECTOS ── */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Card */}
              <div className="bg-[#0e7490] rounded-3xl overflow-hidden shadow-xl">
                {/* Imagen con badge */}
                <div className="relative">
                  <img
                    src={project.img}
                    alt={project.name}
                    className="w-full h-48 object-cover"
                  />
                  {/* Badge swirl */}
                  <div className="absolute bottom-3 right-3 w-9 h-9 bg-primary-cyan rounded-full flex items-center justify-center shadow-lg">
                    <SwirlMark />
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-white font-black text-xl mb-2">{project.name}</h3>
                  <p className="text-white/70 text-xs leading-relaxed">{project.description}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Portafolio;
