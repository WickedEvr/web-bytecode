import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import AltFooter from '../components/AltFooter'; // 1. IMPORTAMOS EL FOOTER

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
    // 2. CONTENEDOR PRINCIPAL: bg-white para que herede el color de la sección Herramientas
    <div className="w-full min-h-screen bg-white font-sansation overflow-x-hidden flex flex-col">

      {/* Contenedor de contenido para empujar el footer hacia abajo */}
      <div className="flex-grow flex flex-col">
        
        {/* ── HERO CAROUSEL ── */}
        {/* Sin bg-white aquí, el carrusel se encarga de su propio fondo oscuro */}
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
        {/* Cambié py-16 a pt-16 pb-32 para dar espacio antes de la tarjeta flotante del footer */}
        <section className="bg-white pt-16 pb-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-12">
              <div className="flex-1 h-px bg-gray-200" />
              <h2 className="text-gray-800 text-sm font-bold uppercase tracking-[0.25em] whitespace-nowrap">
                Nuestras Herramientas
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-14">

              {/* Laravel */}
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 50 52" className="w-7 h-7">
                  <path fill="#FF2D20" d="M49.626 11.564a.809.809 0 0 1 .028.209v10.972a.8.8 0 0 1-.402.694l-9.209 5.302V39.68a.801.801 0 0 1-.402.694L20.42 51.01a.814.814 0 0 1-.095.043.832.832 0 0 1-.145.028.8.8 0 0 1-.147 0 .838.838 0 0 1-.14-.03.818.818 0 0 1-.096-.044L.402 40.375A.8.8 0 0 1 0 39.681V6.812a.834.834 0 0 1 .028-.21.826.826 0 0 1 .138-.24.807.807 0 0 1 .116-.1.83.83 0 0 1 .12-.069L10.14.095a.8.8 0 0 1 .8 0l9.546 5.503.084.063.115.1.086.12.052.121.028.21v21.231l8.008-4.613V7.024a.838.838 0 0 1 .028-.21.826.826 0 0 1 .138-.24.821.821 0 0 1 .116-.1.83.83 0 0 1 .12-.07l9.538-5.5a.8.8 0 0 1 .8 0l9.546 5.505a.8.8 0 0 1 .402.694v.461zm-1.572 10.667V12.2l-3.359 1.933-4.648 2.677v10.042l8.007-4.621zM39.586 48.39V38.348l-4.58 2.614-13.105 7.48V58.56l17.685-10.17zM1.6 7.701v31.88L19.285 49.75V39.645l-9.205-5.255a.822.822 0 0 1-.158-.113.801.801 0 0 1-.073-.078.808.808 0 0 1-.129-.234.812.812 0 0 1-.044-.19V12.281L1.6 7.701zm8.938-6.124L2.53 6.19l8.008 4.611 8.008-4.611L10.538 1.577zm4.55 25.252 4.648-2.676V7.024L11.38 9.96 6.732 12.64v23.131l6.357-3.942zm24.99-18.187-8.007 4.612 8.007 4.614 8.008-4.614-8.008-4.612zm-.401 10.677-4.648-2.677-3.359-1.933v10.039l4.648 2.676 3.359 1.935V19.32zm-17.28 9.651 13.105-7.546-6.196-3.566-12.604 7.26 5.695 3.852zm12.703 4.395-1.601-.921-10.846-6.239-8.008 4.611 9.203 5.248 11.252-2.699z" />
                </svg>
                <span className="font-bold text-gray-800 text-base">Laravel</span>
              </div>

              {/* GitHub */}
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#181717">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="font-bold text-gray-800 text-base">GitHub</span>
              </div>

              {/* PHP */}
              <div className="flex items-center gap-2 bg-[#8892BF] text-white font-black italic px-5 py-2 rounded-lg text-lg tracking-wider">
                php
              </div>

              {/* Java */}
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 32 44" className="w-7 h-10">
                  <path fill="#EA2D2E" d="M12.3 30.2s-1.8 1.1 1.3 1.4c3.8.5 5.7.4 9.9-.5 0 0 1.1.7 2.6 1.3C15.5 36.4 3.5 32.1 12.3 30.2z" />
                  <path fill="#EA2D2E" d="M11.2 25.7s-2 1.9 1.3 2.3c5 .5 9 .6 15.8-.8 0 0 .8.8 2 1.2C15.2 32.5-.6 28.5 11.2 25.7z" />
                  <path fill="#EA2D2E" d="M20.4 18.3c2.8 3.3-2.6 6.3-2.6 6.3s7.3-3.8 3.9-8.5C18.4 12.1 16 10 28.4 3c0 0-20.3 5-8 15.3z" />
                  <path fill="#5382A1" d="M12.9 21.6s-5.8 1.4-2 1.9c1.6.2 4.8.2 7.7-.1 2.4-.2 4.8-.6 4.8-.6s-.8.4-1.5.8c-5.9 1.5-17.3.8-14-1.1 2.8-1.6 5-1 5-.9zM30.5 30.4c5.9-3.1 3.2-6.1 1.3-5.7-.5.1-.7.2-.7.2s.2-.3.5-.4c3.7-1.3 6.6 3.9-1.2 5.9 0 0 .09-.08.1-.01z" />
                  <path fill="#5382A1" d="M22.9 0.8s3.3 3.3-3.1 8.4c-5.2 4.1-1.2 6.4 0 9.1-3-2.7-5.3-5.1-3.8-7.3 2.2-3.4 8.3-5 6.9-10.2z" />
                </svg>
                <span className="font-bold text-gray-800 text-base">Java</span>
              </div>

              {/* MongoDB */}
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 18 38" className="w-4 h-9">
                  <path fill="#4DB33D" d="M9 0C9 0 1.5 10.5 1.5 20C1.5 24.7 4.8 28.7 9 30C13.2 28.7 16.5 24.7 16.5 20C16.5 10.5 9 0 9 0Z" />
                  <path fill="#3FA037" d="M9 30C9 30 8.4 30.4 8.4 38H9.6C9.6 30.4 9 30 9 30Z" />
                </svg>
                <span className="font-bold text-gray-800 text-base">MongoDB</span>
              </div>

            </div>
          </div>
        </section>

      </div>

      {/* 3. EL FOOTER: Ahora sus lados transparentes mostrarán el bg-white de esta vista */}
      <AltFooter />

    </div>
  );
};

export default Servicios;