import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/* ── data ──────────────────────────────────────────── */
const services = [
  {
    title: 'Página Web',
    description: 'Te mereces un sitio web\nque haga todo lo que necesitas.',
    // Reemplaza src con tu imagen real
    img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
  },
  {
    title: 'App Móvil',
    description: 'Aplicaciones nativas e híbridas\npara cualquier dispositivo.',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  },
  {
    title: 'Soluciones IA',
    description: 'Automatiza procesos complejos\ncon inteligencia artificial.',
    img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  },
];

/* ── Bytecode isotipo ── */
const SwirlMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <img src="/isotipo.svg" alt="" aria-hidden="true" className={className} />
);

/* ══════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════ */
const Home: React.FC = () => {
  const [slide, setSlide] = useState(0);

  return (
    <div className="overflow-x-hidden">

      {/* ─────────────────────────────────────────────
          1. HERO
      ───────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center text-center overflow-hidden">

        {/* Fondo espacio */}
        <div className="absolute inset-0">
          <img src="/hero.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-[#040e1f]/55" />
        </div>

        {/* Líneas de constelación */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Triángulo superior-izquierdo */}
          <polygon points="0,0 280,0 0,340" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
          <line x1="0" y1="170" x2="170" y2="0" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="80" y1="0" x2="280" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          {/* Triángulo superior-derecho */}
          <polygon points="1440,0 1170,0 1440,310" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
          <line x1="1440" y1="155" x2="1300" y2="0" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <line x1="1370" y1="0" x2="1440" y2="230" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          {/* Líneas interiores */}
          <line x1="130" y1="360" x2="390" y2="190" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="390" y1="190" x2="530" y2="430" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="1070" y1="110" x2="890" y2="330" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          {/* Nodos */}
          <circle cx="390" cy="190" r="2.5" fill="rgba(255,255,255,0.4)" />
          <circle cx="130" cy="360" r="2" fill="rgba(255,255,255,0.3)" />
          <circle cx="890" cy="330" r="2" fill="rgba(255,255,255,0.3)" />
          <circle cx="1070" cy="110" r="2.5" fill="rgba(255,255,255,0.4)" />
        </svg>

        {/* Contenido */}
        <div className="relative z-10 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-black mb-10 leading-tight"
          >
            Un sitio web<br />
            Hace tus ideas realidad
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <Link
              to="/contacto"
              className="btn-cyan text-lg px-12 py-3 shadow-[0_0_28px_rgba(0,188,212,0.5)]"
            >
              Conectar
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          2. SERVICES CARD SLIDER
      ───────────────────────────────────────────── */}
      <section className="bg-[#060c1d] pt-4 pb-20 px-4">
        <div className="max-w-sm mx-auto">

          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0b1222] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
            >
              {/* Header del card */}
              <div className="px-6 pt-6 pb-3 text-center">
                <p className="text-primary-cyan font-semibold text-sm tracking-wide">
                  Haz crecer tu negocio
                </p>
                <p className="text-white/70 text-xs mt-1">
                  Te mereces un sitio web que haga{' '}
                  <span className="text-primary-cyan">todo lo que necesitas.</span>
                </p>
              </div>

              {/* Imagen con overlay */}
              <div className="relative mx-3 mb-3 rounded-2xl overflow-hidden h-60">
                <img
                  src={services[slide].img}
                  alt={services[slide].title}
                  className="w-full h-full object-cover"
                />
                {/* Degradado oscuro */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Texto en el overlay */}
                <div className="absolute bottom-4 left-4 right-14">
                  <p className="font-bold text-white text-sm">{services[slide].title}</p>
                  <p className="text-gray-300 text-xs mt-1 leading-snug whitespace-pre-line">
                    {services[slide].description}
                  </p>
                </div>

                {/* Badge swirl */}
                <div className="absolute bottom-3 right-3 w-9 h-9 bg-primary-cyan rounded-full flex items-center justify-center">
                  <SwirlMark className="w-4 h-6" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Puntos de paginación */}
          <div className="flex justify-center mt-5 gap-2">
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  slide === i ? 'w-8 bg-gray-400' : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          3. HERRAMIENTAS
      ───────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Título con líneas laterales */}
          <div className="flex items-center gap-6 mb-12">
            <div className="flex-1 h-px bg-gray-200" />
            <h2 className="text-gray-800 text-sm font-bold uppercase tracking-[0.25em] whitespace-nowrap">
              Nuestras Herramientas
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Logos */}
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-14">

            {/* Laravel */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 50 52" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
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
              <svg viewBox="0 0 32 44" className="w-7 h-10" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA2D2E" d="M12.3 30.2s-1.8 1.1 1.3 1.4c3.8.5 5.7.4 9.9-.5 0 0 1.1.7 2.6 1.3C15.5 36.4 3.5 32.1 12.3 30.2z" />
                <path fill="#EA2D2E" d="M11.2 25.7s-2 1.9 1.3 2.3c5 .5 9 .6 15.8-.8 0 0 .8.8 2 1.2C15.2 32.5-.6 28.5 11.2 25.7z" />
                <path fill="#EA2D2E" d="M20.4 18.3c2.8 3.3-2.6 6.3-2.6 6.3s7.3-3.8 3.9-8.5C18.4 12.1 16 10 28.4 3c0 0-20.3 5-8 15.3z" />
                <path fill="#EA2D2E" d="M34.2 33.7s1.5 1.2-1.3 2.2c-4.8 1.5-19.9 1.9-24.1.1-1.5-.7 1.4-.6 1.4-.6s1.5.3 3.6.4c0 0-1.6-.5-2.5-.7L11.3 35z" />
                <path fill="#5382A1" d="M12.9 21.6s-5.8 1.4-2 1.9c1.6.2 4.8.2 7.7-.1 2.4-.2 4.8-.6 4.8-.6s-.8.4-1.5.8c-5.9 1.5-17.3.8-14-1.1 2.8-1.6 5-1 5-.9zM30.5 30.4c5.9-3.1 3.2-6.1 1.3-5.7-.5.1-.7.2-.7.2s.2-.3.5-.4c3.7-1.3 6.6 3.9-1.2 5.9 0 0 .09-.08.1-.01z" />
                <path fill="#5382A1" d="M22.9 0.8s3.3 3.3-3.1 8.4c-5.2 4.1-1.2 6.4 0 9.1-3-2.7-5.3-5.1-3.8-7.3 2.2-3.4 8.3-5 6.9-10.2z" />
                <path fill="#5382A1" d="M13.8 43.9c5.7.4 14.5-.2 14.7-2.9 0 0-.4 1-4.7 1.8-5 .9-11 .8-14.6.2 0 0 .7.6 4.6.9z" />
                <path fill="#5382A1" d="M11.6 39.3c-6 -1.7.1-5.3.1-5.3-6.3 1.7-7.2 5.3-2 6.7 5.5 1.5 12.3.3 12.3.3s-3.9 1-10.4-1.7z" />
              </svg>
              <span className="font-bold text-gray-800 text-base">Java</span>
            </div>

            {/* MongoDB */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 18 38" className="w-4 h-9" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4DB33D" d="M9 0C9 0 1.5 10.5 1.5 20C1.5 24.7 4.8 28.7 9 30C13.2 28.7 16.5 24.7 16.5 20C16.5 10.5 9 0 9 0Z" />
                <path fill="#3FA037" d="M9 30C9 30 8.4 30.4 8.4 38H9.6C9.6 30.4 9 30 9 30Z" />
                <path fill="#1F8B4C" d="M9 30C9 30 9.6 30.4 9.6 38H9C9 38 9 30 9 30Z" />
              </svg>
              <span className="font-bold text-gray-800 text-base">MongoDB</span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          4. IA SECTION
      ───────────────────────────────────────────── */}
      <section className="relative bg-[#060c1d] overflow-hidden">
        {/* Blob cyan orgánico en la parte superior */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 260" className="w-full" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0,0 L1440,0 L1440,100 C1300,230 1000,260 700,190 C400,120 150,220 0,140 Z"
              fill="#00bcd4"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-36 md:py-48">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Texto */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black text-primary-cyan leading-snug mb-5">
                Comenzar nunca ha sido<br />
                tan fácil gracias a la IA
              </h2>
              <p className="text-white/80 text-base mb-3 leading-relaxed">
                No hace falta tener experiencia.
              </p>
              <p className="text-white/40 text-xs italic leading-relaxed">
                IA de diseño con IA, uno de los mejores<br />
                inventos de TIME de 2025*
              </p>
            </div>

            {/* Imágenes */}
            {/* Reemplaza los src con tus imágenes reales */}
            <div className="w-full lg:w-1/2 flex gap-4 h-80 md:h-96">
              <div className="w-1/2 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80"
                  alt="Inteligencia artificial"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="w-1/2 rounded-3xl overflow-hidden shadow-2xl mt-10">
                <img
                  src="https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&q=80"
                  alt="Desarrollo tecnológico"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. CLIENTES / CONFIANZA
      ───────────────────────────────────────────── */}
      <section className="bg-[#060c1d] border-t border-white/10 py-24 px-6 relative overflow-hidden">

        {/* Triángulos decorativos (inferior derecha) */}
        <div className="absolute bottom-0 right-0 pointer-events-none opacity-70" aria-hidden="true">
          <svg viewBox="0 0 320 320" className="w-64 h-64">
            <polygon points="160,10 310,310 10,310" fill="none" stroke="#00bcd4" strokeWidth="1.2" />
            <polygon points="210,60 310,310 110,310" fill="none" stroke="#00bcd4" strokeWidth="0.8" />
            <polygon points="255,115 310,310 200,310" fill="#00bcd4" opacity="0.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">

            {/* Grid de logos */}
            <div className="w-full lg:w-5/12">
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto lg:mx-0">

                {/* Fila 1 */}
                <div className="bg-white rounded-2xl p-3 flex items-center justify-center aspect-square shadow-lg">
                  {/* Apple */}
                  <svg viewBox="0 0 814 1000" className="w-9 h-9" fill="#111">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-42.8-157.2-113.8C200 432.4 200 208.9 205.5 127.3 212.7 45.7 267.2 0 320.4 0c68.5 0 140.9 41.8 184.4 41.8 27.4 0 90.4-41.8 167.7-41.8 29.4 0 116.4 12.5 179.4 99.3zm-61.3-192.7c24.6-29.6 41.3-71.7 41.3-113.9 0-1.5-.1-3-.2-4.5-39.4 1.5-86.7 26.1-114.7 58-21.6 24.6-41.3 66.7-41.3 109.4 0 1.8.2 3.6.3 4.2.3 0 .8.1 1.3.1 35.5 0 79.7-23.8 113.3-53.3z" />
                  </svg>
                </div>
                <div className="bg-white rounded-2xl p-2 flex items-center justify-center aspect-square shadow-lg">
                  {/* Pepsi */}
                  <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <circle cx="50" cy="50" r="48" fill="#004B93" />
                    <path d="M50 2 A48 48 0 0 1 98 50 L50 50 Z" fill="#EE1C23" />
                    <path d="M2 50 A48 48 0 0 1 50 2 L50 50 Z" fill="white" />
                    <path d="M50 50 A48 48 0 0 1 2 50 Z" fill="white" />
                    <ellipse cx="50" cy="50" rx="12" ry="48" fill="white" opacity="0.6" />
                  </svg>
                </div>
                <div className="bg-primary-cyan rounded-2xl aspect-square shadow-lg" />

                {/* Fila 2 */}
                <div className="bg-primary-cyan rounded-2xl aspect-square shadow-lg" />
                <div className="bg-white rounded-2xl p-2 flex items-center justify-center aspect-square shadow-lg">
                  {/* Burger King */}
                  <div className="text-center leading-tight">
                    <div className="bg-[#C8102E] text-white text-[7px] font-black rounded-full px-2 py-0.5 mb-0.5 tracking-tight">
                      BURGER
                    </div>
                    <div className="text-[#F5A623] font-black text-[11px] tracking-tight">KING</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-3 flex items-center justify-center aspect-square shadow-lg">
                  {/* Nike swoosh */}
                  <svg viewBox="0 0 100 40" className="w-12" fill="#111">
                    <path d="M0 38 L92 2 C97 -0.5 103 2.5 101 9 C100 13 94 17 88 19 L16 38 Z" />
                  </svg>
                </div>

                {/* Fila 3 — Google span 3 */}
                <div className="col-span-3 bg-white rounded-2xl px-4 py-3 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </div>

              </div>
            </div>

            {/* Texto "14 Millones" */}
            <div className="w-full lg:w-7/12 text-center lg:text-left">
              <p className="text-white/50 uppercase tracking-[0.3em] text-sm mb-3">
                Con la confianza de
              </p>
              <h2 className="text-6xl md:text-8xl font-black text-white leading-none mb-4">
                14 Millones
              </h2>
              <p className="text-white/70 text-xl md:text-2xl leading-relaxed">
                de emprendedores en todo el mundo
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
