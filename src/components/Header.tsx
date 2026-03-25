import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';


/* ── Montañas decorativas (panel izquierdo del menú) ── */
const Mountains = () => (
  <svg
    viewBox="0 0 400 180"
    className="w-full"
    preserveAspectRatio="xMidYMax meet"
    aria-hidden="true"
  >
    {/* Fondo de triángulos sólidos */}
    <polygon points="0,180 60,80 120,130 180,40 260,110 320,60 400,100 400,180" fill="rgba(0,188,212,0.08)" />
    {/* Líneas wireframe */}
    <polyline points="0,180 60,80 120,130 180,40 260,110 320,60 400,100" fill="none" stroke="rgba(0,188,212,0.35)" strokeWidth="1.2" />
    <polyline points="0,180 40,110 90,150 150,70 230,130 290,85 360,115 400,180" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    {/* Nodos */}
    <circle cx="60" cy="80" r="2.5" fill="rgba(0,188,212,0.7)" />
    <circle cx="180" cy="40" r="3" fill="rgba(0,188,212,0.9)" />
    <circle cx="320" cy="60" r="2.5" fill="rgba(0,188,212,0.7)" />
    <line x1="60" y1="80" x2="180" y2="40" stroke="rgba(0,188,212,0.25)" strokeWidth="1" />
    <line x1="180" y1="40" x2="320" y2="60" stroke="rgba(0,188,212,0.25)" strokeWidth="1" />
  </svg>
);

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Nosotros', path: '/nosotros' },
  { name: 'Portafolio', path: '/portafolio' },
  { name: 'Servicios', path: '/servicios' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* ── BARRA PRINCIPAL ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 py-4 flex items-center justify-between">
        {/* Izquierda: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img src="/logoBlancoBytecode.svg" alt="Bytecode" className="h-7 w-auto" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white ml-1 p-1"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Derecha: Conectar + Sociales */}
        <div className="flex items-center gap-4">
          <Link
            to="/contacto"
            className="border border-white/70 text-white text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-white hover:text-[#060c1d] transition-colors"
          >
            Conectar
          </Link>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-primary-cyan transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-primary-cyan transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── MENÚ INTERACTIVO (split-screen) ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex"
          >
            {/* Panel izquierdo — oscuro */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-1/2 bg-[#060c1d] flex flex-col justify-between overflow-hidden"
            >
              {/* Logo */}
              <div className="p-6">
                <img src="/logoBlancoBytecode.svg" alt="Bytecode" className="h-6 w-auto" />
              </div>

              {/* Texto central */}
              <div className="px-6 pb-8">
                <h2 className="text-white text-3xl md:text-4xl font-black leading-tight mb-3">
                  Prepárate<br />para el<br />
                  <span className="text-primary-cyan">despegue!</span>
                </h2>
                <p className="text-white/50 text-xs italic">Conoce sobre nosotros</p>
              </div>

              {/* Montañas decorativas */}
              <div className="absolute bottom-0 left-0 right-0">
                <Mountains />
              </div>
            </motion.div>

            {/* Panel derecho — cyan */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="w-1/2 bg-primary-cyan flex flex-col"
            >
              {/* Botón cerrar */}
              <div className="p-5">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>

              {/* Links de navegación */}
              <nav className="flex-1 flex flex-col items-center justify-center gap-6">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => handleNavClick(link.path)}
                    className="text-white font-bold text-2xl md:text-3xl hover:opacity-70 transition-opacity tracking-wide"
                  >
                    {link.name}
                  </motion.button>
                ))}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.34 }}
                  onClick={() => handleNavClick('/contacto')}
                  className="mt-2 border-2 border-white text-white font-bold text-lg px-10 py-2 rounded-full hover:bg-white hover:text-primary-cyan transition-all tracking-wide"
                >
                  Conectar
                </motion.button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
