import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import stardustPattern from '../desings/stardust.png';

interface MobileMenuViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Nosotros', path: '/nosotros' },
  { name: 'Portafolio', path: '/portafolio' },
  { name: 'Servicios', path: '/servicios' },
];

const MobileMenuView: React.FC<MobileMenuViewProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavClick = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col md:flex-row w-full h-full font-sansation overflow-hidden select-none"
        >
          {/* Fondo Global de Estrellas */}
          <div className="absolute inset-0 z-0 bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(12,163,198,0.25)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,207,214,0.2)_0%,_transparent_40%)]" />
            <div className="absolute inset-0 opacity-70 mix-blend-screen" style={{ backgroundImage: `url(${stardustPattern})` }} />
            <div className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen" style={{ backgroundImage: `url(${stardustPattern})` }} />
          </div>

          {/* Lado Izquierdo: Espacio / Logo / Gráfico */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120, duration: 0.6 }}
            className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden flex flex-col justify-center px-10 md:pl-32 md:pr-10 z-10"
          >
            {/* Logo */}
            <button 
              onClick={() => handleNavClick('/')}
              className="absolute top-10 left-10 md:top-16 md:left-24 z-20 transition-transform duration-300 hover:scale-105 active:scale-95 outline-none"
              aria-label="Ir a inicio"
            >
              <img 
                src="/src/desings/logo_en_blanco.svg" 
                alt="Bytecode Logo" 
                className="h-15 md:h-22 w-auto object-contain pointer-events-none" 
              />
            </button>
            
            {/* Texto Central */}
            <div className="z-20 -mt-12 md:-mt-20 md:ml-24"> 
              <h2 className="text-white text-6xl md:text-8xl font-light leading-[1.05] tracking-tight inline-block" style={{ fontStyle: 'normal', display: 'inline-block' }}>
                <span style={{ display: 'block' }}>Prepárate</span>
                <span style={{ display: 'block' }}>para el</span>
                <span className="text-[#06CFD6] font-bold" style={{ display: 'block' }}>despegue!</span>
              </h2>
              <p className="text-white mt-8 text-2xl md:text-4xl font-light italic opacity-95">
                Conoce sobre nosotros
              </p>
            </div>

            {/* Gráfico Geométrico */}
            <motion.div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] z-0 pointer-events-none"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <img 
                src="/src/desings/elemento_inferior_menu_interactivo.svg" 
                alt="Elemento Decorativo Inferior" 
                className="w-full h-auto object-contain opacity-100 mix-blend-screen transform translate-y-1/4"
                style={{ 
                  filter: 'brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(1914%) hue-rotate(174deg) brightness(98%) contrast(98%)' 
                }}
              />
            </motion.div>
          </motion.div>
          
          {/* Lado Derecho: Menú 100% inmersivo */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120, duration: 0.6 }}
            className="relative w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-r from-transparent via-transparent to-[#026B9B]/30 flex flex-col py-10 px-10 md:py-20 md:px-24 z-20 overflow-hidden"
          >
            <div className="absolute inset-y-0 right-0 w-3/4 bg-[radial-gradient(ellipse_at_right,_rgba(6,207,214,0.1)_0%,_transparent_70%)] pointer-events-none z-0 mix-blend-screen" />

            {/* Flecha de Retorno */}
            <button 
              onClick={onClose}
              className="absolute top-10 left-10 md:top-20 md:left-24 text-white hover:scale-110 hover:-translate-x-2 transition-all duration-300 p-2 group z-30 outline-none"
              aria-label="Cerrar menú"
            >
              <ArrowLeft size={50} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform pointer-events-none" />
            </button>

            {/* Contenedor Central: Nav + Botón */}
            <div className="flex-1 flex flex-col items-center justify-center gap-12 md:gap-16 relative z-10 w-full"> 
              <nav className="flex flex-col items-center min-h-[350px] md:min-h-[420px] justify-between w-full"> 
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="group relative"
                  >
                    <button
                      onClick={() => handleNavClick(link.path)}
                      className="text-white text-4xl md:text-5xl font-bold tracking-wider group-hover:text-[#06CFD6] group-hover:drop-shadow-[0_0_8px_rgba(6,207,214,0.8)] group-hover:scale-110 transition-all duration-300 inline-block outline-none"
                    >
                      {link.name}
                    </button>
                    <span className="absolute -bottom-3 left-1/2 w-0 h-2 bg-[#06CFD6] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(6,207,214,0.6)] pointer-events-none" />
                  </motion.div>
                ))}
              </nav>

              {/* Botón Conectar */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-6 md:mt-10" 
              >
                <button 
                  onClick={() => handleNavClick('/contacto')}
                  className="bg-transparent text-white font-extrabold text-2xl md:text-4xl px-20 py-5 rounded-full hover:bg-[#0CA3C6] hover:border-transparent border-[4px] border-[#0CA3C6] shadow-[0_0_20px_rgba(12,163,198,0.2)] hover:shadow-[0_0_40px_rgba(12,163,198,0.6)] active:scale-95 transition-all duration-300 ease-in-out tracking-widest outline-none"
                >
                  Conectar
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuView;
