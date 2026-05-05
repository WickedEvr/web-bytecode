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
    imgMobile: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=1200&q=90&crop=top',
  },
  {
    label: 'Servicios',
    title: 'App Móvil',
    description:
      'Desarrollamos aplicaciones nativas e híbridas con experiencias de usuario excepcionales para iOS y Android.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=2560&q=90',
    imgMobile: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&h=1200&q=90&crop=top',
  },
  {
    label: 'Servicios',
    title: 'App de Escritorio',
    description:
      'Desarrollamos aplicaciones de escritorio con interfaces intuitivas y funcionalidades avanzadas.',
    img: '/DesktopApp.webp',
    imgMobile: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&h=1200&q=90&crop=top',
  },
];

const Servicios: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const total = services.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  useEffect(() => {
    const autoplayTimer = setInterval(() => {
      next();
    }, 5000); 
    return () => clearInterval(autoplayTimer);
  }, [current]);

  const titleSizes = {
    'Página Web': 'text-[2.3rem] md:text-[3.6rem] sm:text-[2.8rem] lg:text-5xl xl:text-[5rem]'
  };

  const title = services[current].title;
  const sizeClass = titleSizes[title as keyof typeof titleSizes] || 'text-[2.6rem] sm:text-[3.2rem] md:text-[3.6rem] lg:text-6xl xl:text-[5rem]';

  return (
    <div className="w-full bg-white font-sansation overflow-x-hidden flex flex-col select-none">
      <SEO 
        title="Servicios" 
        description="Descubre nuestros servicios de desarrollo de páginas web, aplicaciones móviles y software de escritorio a medida."
      />

      <div className="flex-grow flex flex-col">

        {/* ── SECCIÓN PRINCIPAL UNIFICADA (Mobile-First) ── */}
        <section className="relative flex flex-col h-[calc(100vh-3rem)] lg:h-[calc(100vh-5.5rem)] bg-[#020611] overflow-hidden">
          
          {/* CAPA 1: Imágenes de fondo dinámicas */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence>
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                {/* Imagen Móvil */}
                <img
                  src={services[current].imgMobile} 
                  alt={services[current].title}
                  draggable={false}
                  className="w-full h-full object-cover opacity-70 lg:hidden"
                />
                {/* Imagen Escritorio */}
                <img
                  src={services[current].img}
                  alt={services[current].title}
                  draggable={false}
                  className="hidden lg:block w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Degradados protectores unificados */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent lg:hidden" />
            <div className="hidden lg:block absolute inset-0 bg-black/10" />
            <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-[#020611] via-[#020611]/80 to-transparent" />
          </div>

          {/* Flechas Laterales (Solo Escritorio) */}
          <button onClick={prev} className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 z-20 text-white/70 transition-all duration-300 group outline-none lg:hover:text-[#06CFD6] lg:hover:scale-110 lg:hover:drop-shadow-[0_0_18px_rgba(6,207,214,0.8)]" aria-label="Anterior">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <svg viewBox="7 4 10 16" className="w-16 h-28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </motion.div>
          </button>
          <button onClick={next} className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 z-20 text-white/70 transition-all duration-300 group outline-none lg:hover:text-[#06CFD6] lg:hover:scale-110 lg:hover:drop-shadow-[0_0_18px_rgba(6,207,214,0.8)]" aria-label="Siguiente">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <svg viewBox="7 4 10 16" className="w-16 h-28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </motion.div>
          </button>

          {/* CAPA 3: Contenido e Interacción */}
          <div className="relative z-10 flex-1 flex flex-col lg:justify-end px-6 lg:px-8 xl:px-16 pt-[clamp(4rem,10vh,7rem)] lg:pt-0 pb-[clamp(2rem,6vh,4rem)] lg:pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${current}`}
                initial={{ opacity: 0, y: 24, x: 0 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -12, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="mt-auto lg:mt-0 flex flex-col lg:flex-row items-center lg:items-end justify-between w-full lg:max-w-7xl lg:mx-auto gap-6 lg:gap-16"
              >
                {/* IZQUIERDA — Info del servicio */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:flex-1 lg:max-w-2xl -mt-50">
                  <p className="text-white/90 lg:text-white text-[1.5rem] md:text-[1.8rem] lg:text-2xl xl:text-3xl font-light tracking-wide mb-1 lg:mb-2">
                    {services[current].label}
                  </p>

                  {/* Contenedor Título + Flechas Móviles */}
                  <div className="flex items-center justify-between w-full lg:w-auto mb-5 lg:mb-6">
                    <button onClick={prev} className="lg:hidden -ml-3 p-2 text-gray-300 active:scale-90 transition-all outline-none lg:hover:text-white" aria-label="Anterior">
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                        <svg viewBox="0 0 24 24" className="w-11 h-11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      </motion.div>
                    </button>
                      
                    <h2
                      className={`px-2 lg:px-0 font-bold text-[#06CFD6] lg:text-[#0CA3C6] leading-tight lg:leading-none tracking-tight drop-shadow-lg lg:drop-shadow-none ${sizeClass}`}
                    >
                      {services[current].title}
                    </h2>
                    
                    <button onClick={next} className="lg:hidden -mr-3 p-2 text-gray-300 active:scale-90 transition-all outline-none lg:hover:text-white" aria-label="Siguiente">
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                        <svg viewBox="0 0 24 24" className="w-11 h-11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </motion.div>
                    </button>
                  </div>

                  <p className="text-white/90 text-[1rem] sm:text-[1.1rem] md:text-[1.5rem] lg:text-lg xl:text-xl leading-relaxed font-light text-justify lg:text-left mb-5 lg:mb-0 w-full px-2 lg:px-0 drop-shadow-md lg:drop-shadow-none">
                    {services[current].description}
                  </p>
                </div>

                {/* CENTRO — Línea separadora vertical (Solo Escritorio) */}
                <div className="hidden lg:block w-[1.5px] self-stretch bg-white/50 mx-4"></div>

                {/* DERECHA — Call to Action */}
                <div className="w-full lg:w-auto lg:shrink-0 flex flex-col items-center justify-center text-center lg:min-w-[300px] -mt-5">
                  <p className="text-white font-bold text-[clamp(1rem,4.5vw,1.25rem)] md:text-[clamp(1.2rem,5vw,1.5rem)] lg:text-2xl xl:text-3xl mb-3 min-[400px]:mb-4 lg:mb-6 leading-tight drop-shadow-md lg:drop-shadow-none">
                    Obtén mucha más <br className="hidden lg:block" />
                    información
                  </p>
                  <Link
                    to="/contacto"
                    className="w-full lg:w-auto inline-block text-center bg-[#06CFD6] text-white font-bold text-[1.5rem] md:text-[2rem] min-[400px]:text-[1.35rem] lg:text-2xl xl:text-3xl px-8 lg:px-24 py-3 min-[400px]:py-4 lg:py-5 rounded-[1.5rem] lg:rounded-[20px] shadow-[0_4px_15px_rgba(6,207,214,0.3)] lg:shadow-[0_4px_15px_rgba(6,207,214,0.4)] lg:hover:bg-[#0CA3C6] lg:hover:shadow-[0_8px_25px_rgba(6,207,214,0.6)] lg:hover:-translate-y-1 active:scale-95 lg:active:translate-y-0 lg:active:scale-100 transition-all duration-300 outline-none"
                  >
                    Conectar
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── HERRAMIENTAS ── */}
        <section className="bg-white pb-12 px-6" style={{ position: 'relative', zIndex: 20, paddingTop: '3rem' }}>
          <div className="w-full md:w-[85%] mx-auto flex flex-col items-center">
            {/* Mobile exact group */}
            <div className="md:hidden relative w-[358px] flex items-center justify-center mb-8">
              <div className="absolute left-0 w-[93px]" style={{ height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
              <h2
                className="w-[178px]"
                style={{ fontFamily: 'Sansation', fontStyle: 'normal', fontWeight: 700, fontSize: '24px', lineHeight: '27px', textAlign: 'center', color: '#3C3C3B', flexShrink: 0, zIndex: 1 }}
              >
                Nuestras Herramientas
              </h2>
              <div className="absolute right-0 w-[93px]" style={{ height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
            </div>

            {/* Desktop fluid group */}
            <div className="hidden md:flex items-center gap-3 mb-16 w-full">
              <div className="flex-1 h-0 border-t-[2px] border-[#3C3C3B]" />
              <h2
                style={{ fontFamily: 'Sansation', fontWeight: 700, fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)', lineHeight: 1.2, textAlign: 'center', color: '#3C3C3B', flexShrink: 0, padding: '0 0.5rem' }}
              >
                Nuestras Herramientas
              </h2>
              <div className="flex-1 h-0 border-t-[2px] border-[#3C3C3B]" />
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
                  <img src="/logos/laravel.svg" alt={copy === 0 ? 'Laravel' : ''} aria-hidden={copy !== 0} draggable={false} style={{ height: 'clamp(28px, 4.7vw, 54px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/github.svg"  alt={copy === 0 ? 'GitHub' : ''}  aria-hidden={copy !== 0} draggable={false} style={{ height: 'clamp(30px, 4.9vw, 56px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/php.svg"     alt={copy === 0 ? 'PHP' : ''}     aria-hidden={copy !== 0} draggable={false} style={{ height: 'clamp(36px, 6.6vw, 76px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/JAVA.svg"    alt={copy === 0 ? 'Java' : ''}    aria-hidden={copy !== 0} draggable={false} style={{ height: 'clamp(40px, 7.5vw, 86px)', width: 'auto', filter: 'grayscale(100%)' }} />
                  <img src="/logos/mongodb.svg" alt={copy === 0 ? 'MongoDB' : ''} aria-hidden={copy !== 0} draggable={false} style={{ height: 'clamp(44px, 8vw, 92px)',   width: 'auto', filter: 'grayscale(100%)' }} />
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
