import React from 'react';
import { motion } from 'framer-motion';

const projects = [
  {
    id: 1,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&q=80',
  },
  {
    id: 2,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=700&q=80',
  },
  {
    id: 3,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&q=80',
  },
  {
    id: 4,
    name: 'Google',
    description: 'Elevamos los estándares de desarrollo mediante productos multiplataforma que priorizan la excelencia técnica y la usabilidad.',
    img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=80',
  },
];

const Portafolio: React.FC = () => {
  return (
    <div className="bg-[#024F79] w-full h-full flex-grow font-sansation overflow-x-hidden flex flex-col ">
      
      {/* 1. HERO SECTION */}
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
          Ayudo a marcas y empresas a consolidar su presencia tecnológica mediante productos innovadores, escalables y visualmente potentes.
        </motion.p>
      </section>

      {/* 2. GRID DE PROYECTOS */}
      <section className="px-6 pb-32 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative group bg-gradient-to-br from-[#026B9B] to-[#024F79] rounded-[40px] overflow-hidden border border-[#06CFD6]/20 shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
            >
              <div className="p-8 md:p-10 flex flex-col items-center relative z-10 h-full">
                {/* Imagen del Proyecto / Mockup */}
                <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-8 relative shadow-lg bg-[#060C1D]/20">
                  <img
                    src={project.img}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* Contenido Textual */}
                <div className="w-full flex-1 flex flex-col">
                  <h3 className="text-white font-bold text-3xl md:text-4xl mb-4 text-center">{project.name}</h3>
                  <p className="text-white/80 text-base md:text-lg leading-relaxed text-justify">
                    {project.description}
                  </p>
                </div>
              </div>
              
              {/* Elemento Decorativo Esquina Inferior Izquierda */}
              <img 
                src="/designs/elemento_esquina_inferior_izquierda_de_portafolio.svg" 
                alt="" 
                className="absolute bottom-0 left-0 w-36 h-36 md:w-48 md:h-48 object-contain pointer-events-none opacity-80"
              />
            </motion.article>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Portafolio;
