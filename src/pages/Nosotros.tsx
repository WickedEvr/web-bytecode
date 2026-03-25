import React from 'react';
import { motion } from 'framer-motion';

const Nosotros: React.FC = () => {
  const values = [
    { title: 'Misión', content: 'Nuestra misión es transformar ideas en realidades digitales impactantes, utilizando la tecnología como motor de innovación para nuestros clientes.' },
    { title: 'Visión', content: 'Ser referentes globales en el desarrollo de software y diseño digital, destacados por nuestra excelencia técnica y compromiso con la calidad.' },
    { title: 'Valores', content: 'Innovación, Integridad, Excelencia y Colaboración son los pilares que guían cada uno de nuestros proyectos y relaciones.' }
  ];

  return (
    <div className="bg-space">
      <div className="network-overlay min-h-screen">
        
        {/* Main Section */}
        <section className="section-container flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-6xl font-bold mb-8"
            >
              Nosotros
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 leading-relaxed"
            >
              Somos un equipo apasionado de desarrolladores, diseñadores y estrategas digitales. 
              En Bytecode, no solo creamos sitios web; construimos las bases tecnológicas para el 
              futuro de tu marca. Con años de experiencia en el mercado, nos especializamos en 
              soluciones a medida que combinan estética y funcionalidad.
            </motion.p>
          </div>
          
          <div className="w-full md:w-1/2 relative">
            <div className="absolute -inset-4 bg-primary-cyan rounded-3xl rotate-3 opacity-20 animate-pulse"></div>
            <div className="relative glass-panel p-4 border-2 border-primary-cyan/50 aspect-[4/5] overflow-hidden">
               <div className="w-full h-full bg-gradient-to-br from-primary-cyan/20 to-secondary-blue/20 rounded-xl flex items-center justify-center">
                 <span className="text-primary-cyan font-bold text-lg">IMAGEN TECH</span>
               </div>
            </div>
          </div>
        </section>

        {/* Mission/Vision Section */}
        <section className="bg-sky-900/30 py-24 px-6 mt-20 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel p-8 hover:border-primary-cyan transition-colors"
              >
                <h3 className="text-3xl font-bold mb-6 text-primary-cyan">{item.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Nosotros;
