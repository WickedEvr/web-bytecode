import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Using lucide-react for the back arrow, it's in package.json

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col md:flex-row w-full h-full font-sansation"
        >
          {/* Lado Izquierdo: Espacio / Logo / Gráfico */}
          <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-black overflow-hidden flex flex-col justify-center px-10 md:px-20 z-10">
            {/* Fondo de Estrellas (simulado con radial gradients o imagen) */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none mix-blend-screen" />

            {/* Logo */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
              <img src="/src/desings/logo_en_blanco.svg" alt="Bytecode Logo" className="h-10 md:h-12 w-auto object-contain" />
            </div>

            {/* Texto Central */}
            <div className="z-20 mt-16 md:mt-0">
              <h2 className="text-white text-4xl md:text-6xl font-normal leading-tight tracking-wide">
                Prepárate<br />
                para el<br />
                <span className="text-[#06CFD6] font-bold">despegue!</span>
              </h2>
              <p className="text-white mt-4 text-lg md:text-xl font-light italic">
                Conoce sobre nosotros
              </p>
            </div>

            {/* Gráfico Geométrico */}
            {/* Se ajustó la rotación y posición para que parezcan montañas o red en la esquina inferior izquierda */}
            <motion.div 
              className="absolute -bottom-[20%] -left-[10%] w-[120%] md:w-[150%] z-0 pointer-events-none"
              whileHover={{ x: 5, y: -5 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              <img 
                src="/src/desings/elemento.svg" 
                alt="Elemento Decorativo" 
                className="w-full h-full object-cover opacity-10 mix-blend-screen rotate-12"
                style={{ filter: 'brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(1914%) hue-rotate(174deg) brightness(98%) contrast(98%)' }}
              />
            </motion.div>
          </div>

          {/* Lado Derecho: Panel Cyan / Menú */}
          <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-[#0CA3C6] to-[#06CFD6] md:rounded-l-[40px] flex flex-col justify-between py-8 px-10 md:py-12 md:px-20 z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.3)]">
            
            {/* Flecha de Retorno */}
            <button 
              onClick={onClose}
              className="text-white hover:scale-110 transition-transform duration-300 self-start p-2"
              aria-label="Cerrar menú"
            >
              <ArrowLeft size={32} strokeWidth={2.5} />
            </button>

            {/* Enlaces del Menú */}
            <nav className="flex flex-col items-center justify-center gap-6 md:gap-10 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="group relative"
                >
                  <button
                    onClick={() => handleNavClick(link.path)}
                    className="text-white text-3xl md:text-5xl font-bold tracking-wider group-hover:text-[#060c1d] group-hover:scale-105 transition-all duration-300 inline-block"
                  >
                    {link.name}
                  </button>
                  {/* Animación de subrayado */}
                  <span className="absolute -bottom-2 left-1/2 w-0 h-1 bg-[#060c1d] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out" />
                </motion.div>
              ))}
            </nav>

            {/* Botón Conectar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex justify-center mt-4 md:mt-0"
            >
              <button 
                onClick={() => handleNavClick('/contacto')}
                className="bg-white text-[#0CA3C6] font-bold text-xl md:text-2xl px-12 py-3 rounded-full hover:bg-transparent hover:text-white border-2 border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300 ease-in-out"
              >
                Conectar
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuView;
