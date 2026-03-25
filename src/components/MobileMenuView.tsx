import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
          className="fixed inset-0 z-[100] flex flex-col md:flex-row w-full h-full font-sansation overflow-hidden"
        >
          {/* Lado Izquierdo: Espacio / Logo / Gráfico */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120, duration: 0.6 }}
            className="relative w-full md:w-1/2 h-1/2 md:h-full bg-black overflow-hidden flex flex-col justify-center px-10 md:px-24 z-10"
          >
            {/* Fondo de Estrellas Vibrante */}
            <div className="absolute inset-0 z-0 bg-black" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(12,163,198,0.2)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,207,214,0.15)_0%,_transparent_40%)]" />
            {/* Simulation of vibrant stars */}
            <div className="absolute inset-0 opacity-60 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen" />
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] rotate-180 mix-blend-screen" />

            {/* Logo - Corrección 5: Aumentar escala */}
            <div className="absolute top-10 left-10 md:top-16 md:left-16 z-20">
              <img 
                src="/src/desings/logo_en_blanco.svg" 
                alt="Bytecode Logo" 
                className="h-14 md:h-20 w-auto object-contain" 
              />
            </div>

            {/* Texto Central - Corrección 1: Agrandar significativamente */}
            <div className="z-20 mt-20 md:mt-0">
              <h2 className="text-white text-6xl md:text-8xl font-normal leading-[1.1] tracking-tight">
                Prepárate<br />
                para el<br />
                <span className="text-[#06CFD6] font-bold">despegue!</span>
              </h2>
              <p className="text-white mt-6 text-2xl md:text-3xl font-light italic opacity-90">
                Conoce sobre nosotros
              </p>
            </div>

            {/* Gráfico Geométrico - Corrección 3: Reubicar y rotar al borde inferior */}
            <motion.div 
              className="absolute bottom-0 left-0 w-full z-0 pointer-events-none origin-bottom-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src="/src/desings/elemento.svg" 
                alt="Elemento Decorativo" 
                className="w-full h-auto object-contain opacity-20 mix-blend-screen transform translate-y-1/4"
                style={{ 
                  filter: 'brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(1914%) hue-rotate(174deg) brightness(98%) contrast(98%)' 
                }}
              />
            </motion.div>
          </motion.div>

          {/* Lado Derecho: Panel Cyan / Menú - Corrección 4: Entrada lateral derecha */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120, duration: 0.6 }}
            className="relative w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-[#0CA3C6] to-[#06CFD6] md:rounded-l-[60px] flex flex-col justify-between py-10 px-10 md:py-16 md:px-24 z-20 shadow-[-40px_0_60px_rgba(0,0,0,0.5)]"
          >
            
            {/* Flecha de Retorno */}
            <button 
              onClick={onClose}
              className="text-white hover:scale-110 hover:-translate-x-2 transition-all duration-300 self-start p-2 group"
              aria-label="Cerrar menú"
            >
              <ArrowLeft size={48} strokeWidth={2} className="group-hover:rotate-12 transition-transform" />
            </button>

            {/* Enlaces del Menú */}
            <nav className="flex flex-col items-center justify-center gap-8 md:gap-12 flex-1">
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
                    className="text-white text-4xl md:text-6xl font-bold tracking-wider group-hover:text-[#060c1d] group-hover:scale-110 transition-all duration-300 inline-block"
                  >
                    {link.name}
                  </button>
                  {/* Animación de subrayado tecnológico */}
                  <span className="absolute -bottom-2 left-1/2 w-0 h-1.5 bg-[#060c1d] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,12,29,0.3)]" />
                </motion.div>
              ))}
            </nav>

            {/* Botón Conectar */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex justify-center mt-6 md:mt-0"
            >
              <button 
                onClick={() => handleNavClick('/contacto')}
                className="bg-white text-[#0CA3C6] font-bold text-2xl md:text-3xl px-16 py-4 rounded-full hover:bg-transparent hover:text-white border-[3px] border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] active:scale-95 transition-all duration-300 ease-in-out uppercase tracking-widest"
              >
                Conectar
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuView;
