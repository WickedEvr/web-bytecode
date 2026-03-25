import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Smartphone, Brain, BarChart } from 'lucide-react';

const Servicios: React.FC = () => {
  const serviceList = [
    {
      title: 'Página Web',
      description: 'Desarrollo de sitios web de alto rendimiento, optimizados para SEO y conversión.',
      icon: <Globe size={48} className="text-primary-cyan" />
    },
    {
      title: 'App Móvil',
      description: 'Aplicaciones nativas e híbridas para iOS y Android con las mejores experiencias de usuario.',
      icon: <Smartphone size={48} className="text-primary-cyan" />
    },
    {
      title: 'Inteligencia Artificial',
      description: 'Integración de modelos de IA para automatizar procesos y potenciar la toma de decisiones.',
      icon: <Brain size={48} className="text-primary-cyan" />
    },
    {
      title: 'Marketing Digital',
      description: 'Estrategias basadas en datos para aumentar tu visibilidad y atraer clientes potenciales.',
      icon: <BarChart size={48} className="text-primary-cyan" />
    }
  ];

  return (
    <div className="bg-space">
      <div className="network-overlay min-h-screen">
        <section className="section-container text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-8"
          >
            Nuestros Servicios
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-16"
          >
            Ofrecemos un abanico completo de soluciones digitales para llevar tu negocio 
            al siguiente nivel tecnológico.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceList.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-panel p-10 text-left hover:border-primary-cyan transition-all group"
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-3xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  {service.description}
                </p>
                <Link to="/contacto" className="text-primary-cyan font-bold flex items-center group-hover:translate-x-2 transition-transform">
                  Saber más <span className="ml-2">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Servicios;
