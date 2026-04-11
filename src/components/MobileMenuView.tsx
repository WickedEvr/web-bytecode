import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
            <div
              className="flex min-h-[100svh] flex-1 overflow-y-auto px-6"
              onClick={(event) => event.stopPropagation()}
              style={{
                paddingTop: 'max(2rem, env(safe-area-inset-top))',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
              }}
            >
              <div className="mx-auto flex w-full max-w-[22rem] flex-1 flex-col items-center justify-start text-center"
                style={{ gap: 'clamp(1rem, 3.5vh, 2.5rem)', paddingTop: 'clamp(1.5rem, 6vh, 4rem)', paddingBottom: 'clamp(6rem, 16vh, 11rem)' }}>
                <motion.div
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.45 }}
                >
                  <Link
                    to="/"
                    onClick={onClose}
                    className="block outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
                    aria-label="Ir a inicio"
                  >
                    <img
                      src="/designs/logo_en_blanco.svg"
                      alt="Bytecode Logo"
                      className="h-auto w-[min(38vw,8.4rem)] object-contain"
                    />
                  </Link>
                </motion.div>

                <nav className="flex w-full flex-col items-center" style={{ gap: 'clamp(0.5rem, 2vh, 1.25rem)' }}>
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
                        className="block text-center font-bold tracking-[0.08em] text-white transition-all duration-300 hover:scale-105 hover:text-[#06CFD6] hover:drop-shadow-[0_0_8px_rgba(6,207,214,0.8)] outline-none"
                        style={{ fontSize: 'clamp(1.6rem, 7vh, 2.8rem)' }}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.56, duration: 0.45 }}
                  className="w-full"
                >
                  <Link
                    to="/contacto"
                    onClick={onClose}
                    className="block w-full rounded-full border-2 border-[#0CA3C6] bg-transparent px-8 font-extrabold tracking-[0.22em] text-white shadow-[0_0_20px_rgba(12,163,198,0.22)] transition-all duration-300 ease-in-out hover:bg-[#0CA3C6] hover:shadow-[0_0_36px_rgba(12,163,198,0.55)] active:scale-95 outline-none"
                    style={{ fontSize: 'clamp(0.9rem, 4.5vw, 1.35rem)', padding: 'clamp(0.6rem, 1.8vh, 1rem) 2rem' }}
                  >
                    Conectar
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Gráfico inferior — igual que en desktop */}
            <motion.div
              className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[min(88%,22rem)] -translate-x-1/2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
            >
              <img
                src="/designs/elemento_inferior_menu_interactivo.svg"
                alt=""
                aria-hidden="true"
                className="h-auto w-full translate-y-[20%] object-contain opacity-100 mix-blend-screen"
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
                className="absolute left-8 top-8 z-20 outline-none transition-transform duration-300 hover:scale-105 active:scale-95 lg:left-12 lg:top-10 xl:left-24 xl:top-16"
                aria-label="Ir a inicio"
              >
                <img
                  src="/designs/logo_en_blanco.svg"
                  alt="Bytecode Logo"
                  className="h-auto w-[clamp(10rem,15vw,15rem)] object-contain pointer-events-none"
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
                  src="/designs/elemento_inferior_menu_interactivo.svg"
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
                className="absolute left-8 top-8 z-30 p-2 text-white outline-none transition-all duration-300 hover:-translate-x-2 hover:scale-110 lg:left-14 lg:top-10 xl:left-24 xl:top-20"
                aria-label="Cerrar menu"
              >
                <ArrowLeft
                  strokeWidth={2.5}
                  className="h-[clamp(2.1rem,3vw,3.1rem)] w-[clamp(2.1rem,3vw,3.1rem)] transition-transform duration-300 hover:rotate-12"
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
                        className="inline-block text-center text-[clamp(2.3rem,4.4vw,4.5rem)] font-bold tracking-[0.08em] text-white transition-all duration-300 outline-none hover:scale-105 hover:text-[#06CFD6] hover:drop-shadow-[0_0_8px_rgba(6,207,214,0.8)] group-hover:scale-105 group-hover:text-[#06CFD6] group-hover:drop-shadow-[0_0_8px_rgba(6,207,214,0.8)]"
                      >
                        {link.name}
                      </Link>
                      <span className="pointer-events-none absolute -bottom-2 left-1/2 h-1.5 w-0 bg-[#06CFD6] shadow-[0_0_15px_rgba(6,207,214,0.6)] transition-all duration-300 ease-out group-hover:left-0 group-hover:w-full" />
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
                    className="inline-block rounded-full border-[3px] border-[#0CA3C6] bg-transparent px-[clamp(2.75rem,6vw,5rem)] py-[clamp(0.95rem,1.8vw,1.45rem)] text-[clamp(1.15rem,2.1vw,2rem)] font-extrabold tracking-[0.18em] text-white shadow-[0_0_20px_rgba(12,163,198,0.2)] transition-all duration-300 ease-in-out hover:border-transparent hover:bg-[#0CA3C6] hover:shadow-[0_0_40px_rgba(12,163,198,0.6)] active:scale-95 outline-none"
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
