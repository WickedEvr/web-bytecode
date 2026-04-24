import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AltFooter from '../components/AltFooter';
import SEO from '../components/SEO';

const services = [
  {
    label: 'Servicios',
    title: 'Página Web',
    description:
      'Creamos soluciones digitales multiplataforma que fusionan estética de vanguardia con arquitectura técnica robusta y escalable.',
    img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=2560&q=90',
  },
  {
    label: 'Servicios',
    title: 'App Móvil',
    description:
      'Desarrollamos aplicaciones nativas e híbridas con experiencias de usuario excepcionales para iOS y Android.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=2560&q=90',
  },
  {
    label: 'Servicios',
    title: 'App de Escritorio',
    description:
      'Desarrollamos aplicaciones de escritorio con interfaces intuitivas y funcionalidades avanzadas.',
    img: '/DesktopApp.webp',
  },
];

const Servicios: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const total = services.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  useEffect(() => {
    // Crea un temporizador que ejecuta 'next' cada 5 segundos
    const autoplayTimer = setInterval(() => {
      next();
    }, 5000); 

    // Función de limpieza: detiene el temporizador si el usuario sale de la vista
    return () => clearInterval(autoplayTimer);
  }, []); // El array vacío asegura que el temporizador se inicie solo una vez

  return (
    <div className="w-full bg-white font-sansation overflow-x-hidden flex flex-col select-none">
      <SEO 
        title="Servicios" 
        description="Descubre nuestros servicios de desarrollo de páginas web, aplicaciones móviles y software de escritorio a medida."
      />

      <div className="flex-grow flex flex-col">

        {/* ── HERO CAROUSEL ── */}
        <section className="relative h-[calc(100vh-3.25rem)] md:h-[calc(100vh-5.5rem)] overflow-hidden bg-[#020611]">

          {/* Imagen de fondo */}
          <AnimatePresence>
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={services[current].img}
                alt={services[current].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-[#020611] via-[#020611]/80 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Flecha izquierda */}
          <button
            onClick={prev}
            className="absolute left-10 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-[#06CFD6] hover:scale-110 hover:drop-shadow-[0_0_18px_rgba(6,207,214,0.8)] transition-all duration-300 group"
            aria-label="Anterior"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg viewBox="7 4 10 16" className="w-16 h-28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.div>
          </button>

          {/* Flecha derecha */}
          <button
            onClick={next}
            className="absolute right-10 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-[#06CFD6] hover:scale-110 hover:drop-shadow-[0_0_18px_rgba(6,207,214,0.8)] transition-all duration-300 group"
            aria-label="Siguiente"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg viewBox="7 4 10 16" className="w-16 h-28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.div>
          </button>

          {/* Contenido inferior */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute bottom-0 left-0 right-0 z-10 px-8 md:px-16 pb-20"
            >
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">

                {/* IZQUIERDA — Info del servicio */}
                <div className="flex-1 max-w-2xl w-full">
                  <p className="text-white text-xl md:text-2xl font-light tracking-wide mb-2">
                    {services[current].label}
                  </p>
                  <h2 className="text-6xl md:text-[5rem] font-black text-[#0CA3C6] mb-6 leading-none tracking-tight">
                    {services[current].title}
                  </h2>
                  <p className="text-white/90 text-lg md:text-xl leading-relaxed font-light">
                    {services[current].description}
                  </p>
                </div>

                {/* CENTRO — Línea separadora vertical */}
                <div className="hidden md:block w-[1.5px] self-stretch bg-white/50 mx-4"></div>

                {/* DERECHA — CTA */}
                <div className="shrink-0 flex flex-col justify-center items-center text-center w-full md:w-auto md:min-w-[300px]">
                  <p className="text-white font-bold text-2xl md:text-3xl mb-6 leading-tight">
                    Obtén mucha más<br />información
                  </p>
                  <Link
                    to="/contacto"
                    className="w-full md:w-auto inline-block bg-[#06CFD6] hover:bg-[#0CA3C6] text-white font-bold text-2xl md:text-3xl px-24 py-5 rounded-[20px] shadow-[0_4px_15px_rgba(6,207,214,0.4)] hover:shadow-[0_8px_25px_rgba(6,207,214,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 outline-none"
                  >
                    Conectar
                  </Link>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

        </section>

        {/* ── HERRAMIENTAS ── */}
        <section className="bg-white pb-12 px-6" style={{ position: 'relative', zIndex: 20, paddingTop: '3rem' }}>
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="flex items-center gap-3 mb-8 md:mb-10 w-full">
              <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
              <h2 style={{ fontFamily: 'Sansation', fontWeight: 700, fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)', lineHeight: 1.2, textAlign: 'center', color: '#3C3C3B', flexShrink: 0, padding: '0 0.5rem' }}>
                Nuestras Herramientas
              </h2>
              <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
            </div>
          </div>

          <style>{`
            @keyframes marquee-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-25%); }
            }
            .logos-track {
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
              width: max-content;
              animation: marquee-scroll 18s linear infinite;
            }
            .logos-track img {
              margin: 0 clamp(1.2rem, 3vw, 2.5rem);
              flex-shrink: 0;
            }
          `}</style>
          <div style={{ position: 'relative', width: '90vw', margin: '0 auto', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', opacity: 0.8 }}>
            <div className="logos-track">
              {[0, 1, 2, 3].map(copy => (
                <React.Fragment key={copy}>
                  <img src="/logos/laravel.svg" alt={copy === 0 ? 'Laravel' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(28px, 4.7vw, 54px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/github.svg"  alt={copy === 0 ? 'GitHub' : ''}  aria-hidden={copy !== 0} style={{ height: 'clamp(30px, 4.9vw, 56px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/php.svg"     alt={copy === 0 ? 'PHP' : ''}     aria-hidden={copy !== 0} style={{ height: 'clamp(36px, 6.6vw, 76px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/JAVA.svg"    alt={copy === 0 ? 'Java' : ''}    aria-hidden={copy !== 0} style={{ height: 'clamp(40px, 7.5vw, 86px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/mongodb.svg" alt={copy === 0 ? 'MongoDB' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(44px, 8vw, 92px)',   width: 'auto', filter: 'grayscale(100%)' }} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Footer con degradado blanco → oscuro */}
      <div className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-white from-50% to-[#020611] z-0" aria-hidden="true"></div>
        <div className="relative z-10">
          <AltFooter />
        </div>
      </div>

    </div>
  );
};

export default Servicios;