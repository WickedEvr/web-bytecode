import React from 'react';
import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Confirmacion: React.FC = () => {
  return (
    <div className="bg-space">
      <div className="network-overlay min-h-[80vh] flex items-center justify-center">
        <section className="section-container text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="text-primary-cyan mb-8 animate-bounce">
              <Rocket size={120} strokeWidth={1} className="drop-shadow-[0_0_15px_rgba(0,188,212,0.8)]" />
            </div>
            
            <h1 className="text-5xl font-bold mb-6">Solicitud enviada</h1>
            
            <p className="text-xl text-gray-300 mb-12">
              Muchas gracias por confiar en nosotros. Un especialista de nuestro equipo 
              se pondrá en contacto contigo muy pronto para hacer realidad tus ideas.
            </p>
            
            <Link to="/" className="btn-cyan px-12 uppercase tracking-widest">
              Volver al inicio
            </Link>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Confirmacion;
