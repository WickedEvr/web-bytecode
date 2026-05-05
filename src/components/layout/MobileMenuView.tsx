import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

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

const glowFilter = {
  filter:
    'brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(1914%) hue-rotate(174deg) brightness(98%) contrast(98%)',
};

const MobileMenuView: React.FC<MobileMenuViewProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !menuRef.current) {
        return;
      }

      const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const focusTimeout = setTimeout(() => {
      menuRef.current?.focus();
    }, 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] min-h-[100svh] w-full overflow-hidden font-sansation select-none"
          onClick={onClose}
        >
          <div className="absolute inset-0 z-0 bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(12,163,198,0.25)_0%,_transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,207,214,0.2)_0%,_transparent_40%)]" />
            <div
              className="absolute inset-0 opacity-70 mix-blend-screen"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
            />
            <div
              className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
            />
          </div>

          <div className="relative z-10 flex min-h-[100svh] w-full flex-col lg:hidden overflow-hidden">
            {/* Botón Cerrar (X) para Móvil y Tablet */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              onClick={onClose}
              className="absolute right-4 z-50 p-2 text-white outline-none transition-all duration-300 active:scale-95 md:right-8 lg:hover:rotate-90 lg:hover:scale-110 lg:hover:text-[#06CFD6] lg:hover:drop-shadow-[0_0_12px_rgba(6,207,214,0.8)]"
              style={{ top: 'max(1.5rem, env(safe-area-inset-top))' }}
              aria-label="Cerrar menú"
            >
              <X strokeWidth={2.5} className="h-9 w-9 md:h-12 md:w-12" />
            </motion.button>
            
            <div
              className="flex min-h-[100svh] flex-1 overflow-y-auto px-6"
              onClick={(event) => event.stopPropagation()}
              style={{
                paddingTop: 'max(2rem, env(safe-area-inset-top))',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
              }}
            >
              {/* Contenedor principal */}
              <div 
                className="mx-auto flex w-full max-w-[22rem] md:max-w-[40rem] flex-1 flex-col items-center text-center"
                style={{ paddingTop: 'clamp(1.5rem, 6vh, 4rem)', paddingBottom: 'clamp(5rem, 12vh, 11rem)' }}
              >
                {/* 1. LOGO */}
                <motion.div
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.45 }}
                  className="shrink-0"
                >
                  <Link
                    to="/"
                    onClick={onClose}
                    className="group block outline-none transition-transform duration-300 active:scale-95 lg:hover:scale-105"
                    aria-label="Ir a inicio"
                  >
                    <img
                      src="/vectors/designs/logo_en_blanco.svg"
                      alt="Bytecode Logo"
                      className="h-auto w-[min(32vw,7.5rem)] md:w-[14rem] object-contain transition-all duration-300 lg:group-hover:drop-shadow-[0_0_15px_rgba(6,207,214,0.8)]"
                    />
                  </Link>
                </motion.div>

                {/* 2. GRUPO CENTRAL (Enlaces + Botón) */}
                <div className="flex flex-1 w-full flex-col items-center justify-center gap-6 md:gap-16 my-auto py-4 md:py-8">
                  {/* Navegación */}
                  <nav className="flex w-full flex-col items-center gap-5 md:gap-8">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 + i * 0.08, duration: 0.4 }}
                      >
                        <Link
                          to={link.path}
                          onClick={onClose}
                          className="block text-center font-bold tracking-[0.08em] text-white transition-all duration-300 outline-none text-[clamp(1.4rem,5.5vh,2rem)] md:text-[3.2rem] lg:hover:scale-105 lg:hover:text-[#06CFD6] lg:hover:drop-shadow-[0_0_8px_rgba(6,207,214,0.8)]"
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  {/* Botón CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.56, duration: 0.45 }}
                    className="w-full flex justify-center mt-5"
                  >
                    <Link
                      to="/contacto"
                      onClick={onClose}
                      className="inline-block rounded-full border-2 md:border-4 border-[#0CA3C6] bg-transparent font-extrabold tracking-[0.22em] text-white shadow-[0_0_20px_rgba(12,163,198,0.22)] transition-all duration-300 ease-in-out active:scale-95 outline-none text-[clamp(0.95rem,4.5vw,1.3rem)] md:text-[1.8rem] px-10 py-2.5 md:px-14 md:py-5 lg:hover:bg-[#0CA3C6] lg:hover:shadow-[0_0_36px_rgba(12,163,198,0.55)]"
                    >
                      Conectar
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* 3. GRÁFICO INFERIOR */}
            <motion.div
              className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[min(88%,22rem)] md:w-[40rem] -translate-x-1/2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
            >
              <img
                src="/vectors/designs/elemento_inferior_menu_interactivo.svg"
                alt=""
                aria-hidden="true"
                className="h-auto w-full translate-y-[12%] md:translate-y-[20%] object-contain opacity-100 mix-blend-screen"
                style={{ filter: 'brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(1914%) hue-rotate(174deg) brightness(98%) contrast(98%)' }}
              />
            </motion.div>
          </div>

          <div
            className="relative z-10 hidden min-h-[100svh] w-full overflow-hidden lg:flex"
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120, duration: 0.6 }}
              className="relative flex min-w-0 basis-[44%] flex-col justify-center overflow-hidden px-8 py-[clamp(2rem,5vh,4rem)] lg:basis-[46%] lg:px-12 xl:pl-24 xl:pr-10"
            >
              <Link
                to="/"
                onClick={onClose}
                className="group absolute left-8 top-8 z-20 outline-none transition-transform duration-300 active:scale-95 lg:left-12 lg:top-10 lg:hover:scale-105 xl:left-24 xl:top-16"
                aria-label="Ir a inicio"
              >
                <img
                  src="/vectors/designs/logo_en_blanco.svg"
                  alt="Bytecode Logo"
                  className="h-auto w-[clamp(10rem,15vw,15rem)] object-contain pointer-events-none transition-all duration-300 lg:group-hover:drop-shadow-[0_0_15px_rgba(6,207,214,0.8)]"
                />
              </Link>

              <div className="relative z-20 mx-auto w-full max-w-[32rem] pt-[clamp(3rem,8vh,5.5rem)] lg:max-w-[36rem] xl:ml-24 xl:mr-0">
                <h2 className="text-[clamp(3rem,6vw,5.8rem)] font-light leading-[0.98] tracking-tight text-white">
                  <span className="block">Prepárate</span>
                  <span className="block">para el</span>
                  <span className="block font-bold text-[#06CFD6]">despegue!</span>
                </h2>
                <p className="mt-5 text-[clamp(1.25rem,2.2vw,2.2rem)] font-light italic text-white/95">
                  Conoce sobre nosotros
                </p>
              </div>

              <motion.div
                className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[min(88%,36rem)] -translate-x-1/2"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.8 }}
              >
                <img
                  src="/vectors/designs/elemento_inferior_menu_interactivo.svg"
                  alt="Elemento Decorativo Inferior"
                  className="h-auto w-full translate-y-[20%] object-contain opacity-100 mix-blend-screen lg:translate-y-[26%]"
                  style={glowFilter}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120, duration: 0.6 }}
              className="relative flex min-w-0 basis-[56%] flex-col justify-center overflow-hidden bg-gradient-to-r from-transparent via-transparent to-[#026B9B]/30 px-8 py-[clamp(2rem,5vh,4rem)] lg:basis-[54%] lg:px-14 xl:px-24"
            >
              <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-3/4 bg-[radial-gradient(ellipse_at_right,_rgba(6,207,214,0.1)_0%,_transparent_70%)] mix-blend-screen" />

              <button
                onClick={onClose}
                className="absolute left-8 top-8 z-30 p-2 text-white outline-none transition-all duration-300 lg:left-14 lg:top-10 lg:hover:-translate-x-2 lg:hover:scale-110 xl:left-24 xl:top-20"
                aria-label="Cerrar menu"
              >
                <ArrowLeft
                  strokeWidth={2.5}
                  className="h-[clamp(2.1rem,3vw,3.1rem)] w-[clamp(2.1rem,3vw,3.1rem)] transition-transform duration-300 lg:hover:rotate-12"
                />
              </button>

              <div className="relative z-10 mx-auto flex w-full max-w-[34rem] flex-col items-center justify-center gap-[clamp(1.5rem,4vh,3.5rem)] lg:max-w-[38rem]">
                <nav className="flex w-full flex-col items-center gap-[clamp(0.9rem,2.2vh,2.25rem)]">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.32 + i * 0.08, duration: 0.45 }}
                      className="group relative w-fit"
                    >
                      <Link
                        to={link.path}
                        onClick={onClose}
                        className="inline-block text-center text-[clamp(2.3rem,4.4vw,4.5rem)] font-bold tracking-[0.08em] text-white transition-all duration-300 outline-none lg:hover:scale-105 lg:hover:text-[#06CFD6] lg:hover:drop-shadow-[0_0_8px_rgba(6,207,214,0.8)] lg:group-hover:scale-105 lg:group-hover:text-[#06CFD6] lg:group-hover:drop-shadow-[0_0_8px_rgba(6,207,214,0.8)]"
                      >
                        {link.name}
                      </Link>
                      <span className="pointer-events-none absolute -bottom-2 left-1/2 h-1.5 w-0 bg-[#06CFD6] shadow-[0_0_15px_rgba(6,207,214,0.6)] transition-all duration-300 ease-out lg:group-hover:left-0 lg:group-hover:w-full" />
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.66, duration: 0.45 }}
                  className="pt-[clamp(0.25rem,1vh,1rem)]"
                >
                  <Link
                    to="/contacto"
                    onClick={onClose}
                    className="inline-block rounded-full border-[3px] border-[#0CA3C6] bg-transparent px-[clamp(2.75rem,6vw,5rem)] py-[clamp(0.95rem,1.8vw,1.45rem)] text-[clamp(1.15rem,2.1vw,2rem)] font-extrabold tracking-[0.18em] text-white shadow-[0_0_20px_rgba(12,163,198,0.2)] transition-all duration-300 ease-in-out active:scale-95 outline-none lg:hover:border-transparent lg:hover:bg-[#0CA3C6] lg:hover:shadow-[0_0_40px_rgba(12,163,198,0.6)]"
                  >
                    Conectar
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuView;
