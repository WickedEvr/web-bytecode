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
    // Imagen: Un espacio de trabajo moderno enfocado en código web y diseño
    img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=2560&q=90',
  },
  {
    label: 'Servicios',
    title: 'App Móvil',
    description:
      'Desarrollamos aplicaciones nativas e híbridas con experiencias de usuario excepcionales para iOS y Android.',
    // Imagen: Alguien interactuando con el diseño de interfaz de una aplicación en un smartphone
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=2560&q=90',
  },
  {
    label: 'Servicios',
    title: 'App de Escritorio',
    description:
      'Desarrollamos aplicaciones de escritorio con interfaces intuitivas y funcionalidades avanzadas.',
    // Nueva Imagen: Setup profesional de monitor ultra-wide donde se ve el IDE (código) 
    // a la izquierda y el programa de escritorio con una interfaz de usuario real a la derecha.
    img: '/DesktopApp.webp',
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
        {/* EL CAMBIO: Añadimos bg-[#020611] a este section para que el fundido revele oscuridad y no luz */}
        <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[#020611]">

          {/* Imagen de fondo */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Si quieres que el fundido sea un poco más ágil, puedes bajar la duración de 0.6 a 0.4
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <img
                src={services[current].img}
                alt={services[current].title}
                className="w-full h-full object-cover"
              />
              
              {/* Capa base sutil */}
              <div className="absolute inset-0 bg-black/10" />

              {/* EL DARK FADE */}
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
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
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
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
                // Eliminamos el 'delay: 1.5' para que floten al mismo tiempo
              }}
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

                {/* CENTRO — Línea separadora vertical MÁS GRUESA */}
                {/* Cambiamos w-[1px] a w-[2px] y bg-white/30 a bg-white/50 */}
                <div className="hidden md:block w-[1.5px] self-stretch bg-white/50 mx-4"></div>

                {/* DERECHA — CTA (Botón) */}
                <div className="shrink-0 flex flex-col justify-center items-center text-center w-full md:w-auto md:min-w-[300px]">
                  <p className="text-white font-bold text-2xl md:text-3xl mb-6 leading-tight">
                    Obtén mucha más<br />información
                  </p>
                  <Link
                    to="/contacto"
                    // Mantenemos el tamaño y padding (text-3xl, px-24, py-5, rounded-[20px])
                    // Pero añadimos los colores, sombras y transformaciones exactas del AltHeader
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

      {/* LA MAGIA SUCEDE AQUÍ: Contenedor relativo para el footer */}
      <div className="relative w-full">
        {/* Fondo detrás del footer: Es blanco hasta la mitad (from-50%), luego hace el fade a #020611 */}
        <div className="absolute inset-0 bg-gradient-to-b from-white from-50% to-[#020611] z-0" aria-hidden="true"></div>

        {/* El footer se renderiza encima (z-10) y deja ver el degradado por sus bordes transparentes */}
        <div className="relative z-10">
          <AltFooter />
        </div>
      </div>

    </div>
  );
};

export default Servicios;