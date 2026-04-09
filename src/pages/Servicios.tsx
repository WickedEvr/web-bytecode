import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AltFooter from '../components/AltFooter';

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

  return (
    <div className="w-full min-h-screen bg-white font-sansation overflow-x-hidden flex flex-col">

      <div className="flex-grow flex flex-col">

        {/* ── HERO CAROUSEL ── */}
        <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[#020611]">

          {/* Imagen de fondo */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
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
            <div className="flex items-center gap-4 mb-10 w-full">
              <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
              <h2 style={{ fontFamily: 'Sansation', fontStyle: 'normal', fontWeight: 700, fontSize: '40px', lineHeight: '45px', textAlign: 'center', color: '#3C3C3B', width: '420px', flexShrink: 0 }}>
                Nuestras Herramientas
              </h2>
              <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
            </div>
          </div>

          <style>{`
            @keyframes marquee-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .logos-track {
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
              gap: clamp(2rem, 5vw, 4rem);
              width: max-content;
              animation: marquee-scroll 16s linear infinite;
            }
          `}</style>
          <div style={{ position: 'relative', width: '80vw', margin: '0 auto', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)', opacity: 0.8 }}>
            <div className="logos-track">
              <img src="/logos/laravel.svg" alt="Laravel" style={{ height: 'clamp(30px, 4.7vw, 54px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/github.svg"  alt="GitHub"  style={{ height: 'clamp(32px, 4.9vw, 56px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/php.svg"     alt="PHP"     style={{ height: 'clamp(40px, 6.6vw, 76px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/JAVA.svg"    alt="Java"    style={{ height: 'clamp(44px, 7.5vw, 86px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/mongodb.svg" alt="MongoDB" style={{ height: 'clamp(48px, 8vw, 92px)',   width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/laravel.svg" alt="" aria-hidden="true" style={{ height: 'clamp(30px, 4.7vw, 54px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/github.svg"  alt="" aria-hidden="true" style={{ height: 'clamp(32px, 4.9vw, 56px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/php.svg"     alt="" aria-hidden="true" style={{ height: 'clamp(40px, 6.6vw, 76px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/JAVA.svg"    alt="" aria-hidden="true" style={{ height: 'clamp(44px, 7.5vw, 86px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
              <img src="/logos/mongodb.svg" alt="" aria-hidden="true" style={{ height: 'clamp(48px, 8vw, 92px)',   width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
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
