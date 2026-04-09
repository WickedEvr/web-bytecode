import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const services = [
  {
    label: 'Servicios',
    title: 'Página Web',
    description:
      'Creamos soluciones digitales multiplataforma que fusionan estética de vanguardia con arquitectura técnica robusta y escalable.',
    img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=80',
  },
  {
    label: 'Servicios',
    title: 'App Móvil',
    description:
      'Desarrollamos aplicaciones nativas e híbridas con experiencias de usuario excepcionales para iOS y Android.',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1400&q=80',
  },
  {
    label: 'Servicios',
    title: 'Inteligencia Artificial',
    description:
      'Integramos modelos de IA para automatizar procesos complejos y potenciar la toma de decisiones estratégicas.',
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=80',
  },
  {
    label: 'Servicios',
    title: 'Marketing Digital',
    description:
      'Estrategias basadas en datos para maximizar tu visibilidad online y convertir audiencias en clientes fieles.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80',
  },
];

const Servicios: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const total = services.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <div className="overflow-x-hidden font-sansation">

      {/* ── HERO CAROUSEL ── */}
      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden">

        {/* Imagen de fondo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={services[current].img}
              alt={services[current].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Flecha izquierda */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
          aria-label="Anterior"
        >
          <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Flecha derecha */}
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors"
          aria-label="Siguiente"
        >
          <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Contenido inferior */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="absolute bottom-0 left-0 right-0 z-10 px-8 md:px-16 pb-12"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">

              {/* Izquierda — info del servicio */}
              <div className="max-w-xs md:max-w-sm">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                  {services[current].label}
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-primary-cyan mb-4 leading-tight">
                  {services[current].title}
                </h2>
                <p className="text-white/75 text-sm leading-relaxed">
                  {services[current].description}
                </p>
              </div>

              {/* Derecha — CTA */}
              <div className="shrink-0 text-center md:text-right">
                <p className="text-white font-bold text-lg md:text-xl mb-4">
                  Obtén mucha más<br />información
                </p>
                <Link
                  to="/contacto"
                  className="inline-block bg-primary-cyan text-white font-bold px-10 py-3 rounded-full hover:bg-cyan-500 transition-colors"
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
            {/* Duplicado para loop seamless */}
            <img src="/logos/laravel.svg" alt="" aria-hidden="true" style={{ height: 'clamp(30px, 4.7vw, 54px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
            <img src="/logos/github.svg"  alt="" aria-hidden="true" style={{ height: 'clamp(32px, 4.9vw, 56px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
            <img src="/logos/php.svg"     alt="" aria-hidden="true" style={{ height: 'clamp(40px, 6.6vw, 76px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
            <img src="/logos/JAVA.svg"    alt="" aria-hidden="true" style={{ height: 'clamp(44px, 7.5vw, 86px)', width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
            <img src="/logos/mongodb.svg" alt="" aria-hidden="true" style={{ height: 'clamp(48px, 8vw, 92px)',   width: 'auto', opacity: 0.9, filter: 'grayscale(100%)', flexShrink: 0 }} />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Servicios;
