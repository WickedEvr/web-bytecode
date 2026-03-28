import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const FONT = "'Sansation', sans-serif";
const CYAN = '#0CA3C6';

const services = [
  {
    title: 'Página Web',
    description: 'Te mereces un sitio web\nque haga todo lo que necesitas.',
    img: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&q=80',
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

const SwirlMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <img src="/isotipo.svg" alt="" aria-hidden="true" className={className} />
);

/* ─── Logo grid cell ────────────────────────────────── */
const LogoCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: boolean }> = ({
  children,
  className = 'bg-white',
  colSpan = false,
}) => (
  <div
    className={`flex items-center justify-center ${colSpan ? 'col-span-3 py-4' : 'aspect-square'} ${className}`}
    style={{ borderRadius: '22px', boxShadow: '0px 0px 26.2px rgba(255,255,255,0.33)' }}
  >
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════ */
const Home: React.FC = () => {
  const [slide, setSlide] = useState(0);

  return (
    <div className="overflow-x-hidden" style={{ fontFamily: FONT }}>

      {/* ─────────────────────────────────────────────
          1. HERO — dark space background
      ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden select-none" style={{ marginTop: 0 }}>

        {/* Galaxy image */}
        <div className="absolute inset-0" style={{ top: 0 }} aria-hidden="true">
          <img src="/hero.png" alt="" className="w-full h-full object-cover" style={{ objectPosition: 'center 20%', transform: 'scale(1.1)', transformOrigin: 'top center' }} />
          <div className="absolute inset-0" style={{ background: 'rgba(4,14,31,0.45)' }} />
        </div>

        {/* Esquina superior derecha */}
        <img
          src="/esquina-arriba.svg"
          aria-hidden="true"
          className="absolute top-0 left-0 pointer-events-none z-10"
          style={{ width: '40%' }}
        />

        {/* Esquina inferior derecha */}
        <img
          src="/esquina-abajo.svg"
          aria-hidden="true"
          className="absolute bottom-0 right-0 pointer-events-none z-10"
          style={{ width: '40%' }}
        />

        {/* Sombra general arriba — debajo de sombra-arriba */}
        <img
          src="/sombra-general.svg"
          aria-hidden="true"
          className="absolute top-0 left-0 w-full pointer-events-none z-[9]"
        />

        {/* Sombra arriba */}
        <img
          src="/sombra-arriba.svg"
          aria-hidden="true"
          className="absolute top-0 left-0 w-full pointer-events-none z-10"
        />
        <img
          src="/sombra-arriba.svg"
          aria-hidden="true"
          className="absolute top-0 left-0 w-full pointer-events-none z-10"
          style={{ opacity: 0.5 }}
        />



        {/* Text + CTA */}
        <div className="relative z-10 w-full px-4 flex flex-col items-center text-center select-none">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-bold text-white leading-tight mb-14 text-center w-full"
            style={{ fontFamily: FONT, fontSize: 'clamp(2.6rem, 9.1vw, 6.5rem)' }}
          >
            Un sitio web<br />
            Hace tus ideas realidad
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex justify-center"
          >
            <Link to="/contacto" className="btn-cyan not-italic" style={{ width: '340px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sansation'", fontStyle: 'normal', fontWeight: 400, fontSize: '44px', lineHeight: '49px', textAlign: 'center', color: '#FFFFFF' }}>
              <span style={{ fontFamily: 'Sansation', fontWeight: 400, fontStyle: 'normal', fontSize: '52px', lineHeight: '100%', letterSpacing: '0', textAlign: 'center' }}>Conectar</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          2. SEGUNDA SECCIÓN — sombra-segunda como fondo
      ───────────────────────────────────────────── */}
      <div className="relative z-10" style={{ marginTop: '-8%' }}>
        <img
          src="/sombra-segunda.svg"
          aria-hidden="true"
          className="w-full pointer-events-none select-none block"
        />

        {/* Contenido encima del fondo */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-start px-5 select-none"
          style={{ paddingTop: '4%' }}
        >
          {/* Títulos */}
          <p style={{ color: CYAN, fontFamily: FONT, fontSize: 'clamp(2.24rem, 5.6vw, 3.36rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.6rem', textAlign: 'center' }}>
            Haz crecer tu negocio
          </p>
          <p style={{ color: '#ffffff', fontFamily: FONT, fontSize: 'clamp(1.4rem, 3.5vw, 2.03rem)', fontWeight: 400, lineHeight: 1.5, textAlign: 'center', marginBottom: '1.5rem' }}>
            Te mereces un sitio web que haga{' '}
            <span style={{ color: CYAN }}>todo lo que necesitas.</span>
          </p>

          {/* Tarjeta de servicio */}
          <div className="w-full" style={{ maxWidth: '85%' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                style={{ borderRadius: '1.5rem', overflow: 'hidden', position: 'relative', zIndex: 10 }}
              >
                {/* Imagen */}
                <div style={{ position: 'relative', height: '738px' }}>
                  <img
                    src={services[slide].img}
                    alt={services[slide].title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 20%' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.38) 42%, rgba(0,0,0,0.04) 68%, transparent 100%)' }} />

                  {/* Texto inferior izquierdo */}
                  <div style={{ position: 'absolute', bottom: '60px', left: '60px', right: '150px' }}>
                    <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '3.8rem', color: '#fff', lineHeight: 1.25, margin: 0 }}>
                      {services[slide].title}
                    </p>
                    <p style={{ fontFamily: FONT, fontSize: '2.5rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.15, marginTop: '14px', whiteSpace: 'pre-line' }}>
                      {services[slide].description}
                    </p>
                  </div>

                  {/* Badge isotipo — esquina inferior derecha */}
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '110px', height: '100px' }}>
                    <svg viewBox="0 0 110 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
                      <path d="M0,100 C0,30 70,0 110,0 L110,100 Z" fill={CYAN} />
                    </svg>
                    <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
                      <SwirlMark className="w-9 h-12" />
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Dots de paginación */}
            <div className="flex justify-center mt-5 gap-2 items-center">
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    height: '6px',
                    borderRadius: '9999px',
                    transition: 'width 0.3s, background-color 0.3s',
                    width: slide === i ? '40px' : '8px',
                    background: slide === i ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* SVG blanco — ancho completo, encima del fondo negro */}
          <img
            src="/segunda-blanca.svg"
            aria-hidden="true"
            className="pointer-events-none select-none"
            style={{ position: 'absolute', bottom: '-32%', left: 0, width: '100%', zIndex: 5 }}
          />
        </div>
      </div>


      {/* ─────────────────────────────────────────────
          3. HERRAMIENTAS — white section
      ───────────────────────────────────────────── */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Title with side lines */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gray-200" />
            <h2
              className="text-gray-600 text-xs font-semibold uppercase tracking-[0.25em] whitespace-nowrap"
              style={{ fontFamily: FONT }}
            >
              Nuestras Herramientas
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Brand logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">

            {/* Laravel */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 50 52" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FF2D20" d="M49.626 11.564a.809.809 0 0 1 .028.209v10.972a.8.8 0 0 1-.402.694l-9.209 5.302V39.68a.801.801 0 0 1-.402.694L20.42 51.01a.814.814 0 0 1-.095.043.832.832 0 0 1-.145.028.8.8 0 0 1-.147 0 .838.838 0 0 1-.14-.03.818.818 0 0 1-.096-.044L.402 40.375A.8.8 0 0 1 0 39.681V6.812a.834.834 0 0 1 .028-.21.826.826 0 0 1 .138-.24.807.807 0 0 1 .116-.1.83.83 0 0 1 .12-.069L10.14.095a.8.8 0 0 1 .8 0l9.546 5.503.084.063.115.1.086.12.052.121.028.21v21.231l8.008-4.613V7.024a.838.838 0 0 1 .028-.21.826.826 0 0 1 .138-.24.821.821 0 0 1 .116-.1.83.83 0 0 1 .12-.07l9.538-5.5a.8.8 0 0 1 .8 0l9.546 5.505a.8.8 0 0 1 .402.694v.461zm-1.572 10.667V12.2l-3.359 1.933-4.648 2.677v10.042l8.007-4.621zM39.586 48.39V38.348l-4.58 2.614-13.105 7.48V58.56l17.685-10.17zM1.6 7.701v31.88L19.285 49.75V39.645l-9.205-5.255a.822.822 0 0 1-.158-.113.801.801 0 0 1-.073-.078.808.808 0 0 1-.129-.234.812.812 0 0 1-.044-.19V12.281L1.6 7.701zm8.938-6.124L2.53 6.19l8.008 4.611 8.008-4.611L10.538 1.577zm4.55 25.252 4.648-2.676V7.024L11.38 9.96 6.732 12.64v23.131l6.357-3.942zm24.99-18.187-8.007 4.612 8.007 4.614 8.008-4.614-8.008-4.612zm-.401 10.677-4.648-2.677-3.359-1.933v10.039l4.648 2.676 3.359 1.935V19.32zm-17.28 9.651 13.105-7.546-6.196-3.566-12.604 7.26 5.695 3.852zm12.703 4.395-1.601-.921-10.846-6.239-8.008 4.611 9.203 5.248 11.252-2.699z" />
              </svg>
              <span className="font-bold text-gray-800 text-sm" style={{ fontFamily: FONT }}>Laravel</span>
            </div>

            {/* GitHub */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#181717">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="font-bold text-gray-800 text-sm" style={{ fontFamily: FONT }}>GitHub</span>
            </div>

            {/* PHP */}
            <div
              className="text-white font-black italic px-5 py-2 rounded-full text-sm tracking-wider"
              style={{ background: '#8892BF', fontFamily: FONT }}
            >
              php
            </div>

            {/* Java */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 32 44" className="w-6 h-9" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA2D2E" d="M12.3 30.2s-1.8 1.1 1.3 1.4c3.8.5 5.7.4 9.9-.5 0 0 1.1.7 2.6 1.3C15.5 36.4 3.5 32.1 12.3 30.2z" />
                <path fill="#EA2D2E" d="M11.2 25.7s-2 1.9 1.3 2.3c5 .5 9 .6 15.8-.8 0 0 .8.8 2 1.2C15.2 32.5-.6 28.5 11.2 25.7z" />
                <path fill="#EA2D2E" d="M20.4 18.3c2.8 3.3-2.6 6.3-2.6 6.3s7.3-3.8 3.9-8.5C18.4 12.1 16 10 28.4 3c0 0-20.3 5-8 15.3z" />
                <path fill="#5382A1" d="M12.9 21.6s-5.8 1.4-2 1.9c1.6.2 4.8.2 7.7-.1 2.4-.2 4.8-.6 4.8-.6s-.8.4-1.5.8c-5.9 1.5-17.3.8-14-1.1 2.8-1.6 5-1 5-.9zM30.5 30.4c5.9-3.1 3.2-6.1 1.3-5.7-.5.1-.7.2-.7.2s.2-.3.5-.4c3.7-1.3 6.6 3.9-1.2 5.9 0 0 .09-.08.1-.01z" />
                <path fill="#5382A1" d="M22.9 0.8s3.3 3.3-3.1 8.4c-5.2 4.1-1.2 6.4 0 9.1-3-2.7-5.3-5.1-3.8-7.3 2.2-3.4 8.3-5 6.9-10.2z" />
                <path fill="#5382A1" d="M13.8 43.9c5.7.4 14.5-.2 14.7-2.9 0 0-.4 1-4.7 1.8-5 .9-11 .8-14.6.2 0 0 .7.6 4.6.9z" />
                <path fill="#5382A1" d="M11.6 39.3c-6 -1.7.1-5.3.1-5.3-6.3 1.7-7.2 5.3-2 6.7 5.5 1.5 12.3.3 12.3.3s-3.9 1-10.4-1.7z" />
              </svg>
              <span className="font-bold text-gray-800 text-sm" style={{ fontFamily: FONT }}>Java</span>
            </div>

            {/* MongoDB */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 18 38" className="w-4 h-8" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4DB33D" d="M9 0C9 0 1.5 10.5 1.5 20C1.5 24.7 4.8 28.7 9 30C13.2 28.7 16.5 24.7 16.5 20C16.5 10.5 9 0 9 0Z" />
                <path fill="#3FA037" d="M9 30C9 30 8.4 30.4 8.4 38H9.6C9.6 30.4 9 30 9 30Z" />
                <path fill="#1F8B4C" d="M9 30C9 30 9.6 30.4 9.6 38H9C9 38 9 30 9 30Z" />
              </svg>
              <span className="font-bold text-gray-800 text-sm" style={{ fontFamily: FONT }}>MongoDB</span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          4. IA SECTION — cyan blob + two panels
      ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#060c1d', minHeight: '500px' }}
      >
        {/* Cyan organic blob — top-left */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 600 520" className="w-full h-full" preserveAspectRatio="xMinYMin slice">
            <path
              d="M0,0 L360,0 C380,0 400,10 400,30 C400,80 360,140 300,185 C240,230 160,255 100,265 C50,272 10,270 0,265 Z"
              fill={CYAN}
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-start px-6 pt-16 pb-20 max-w-5xl mx-auto gap-6">

          {/* Left text */}
          <div className="w-full md:w-5/12 pt-6">
            <h2
              className="text-2xl font-bold leading-snug mb-3"
              style={{ color: CYAN, fontFamily: FONT }}
            >
              Comenzar nunca ha sido<br />
              tan fácil gracias a la IA
            </h2>
            <p
              className="text-white text-sm mb-2"
              style={{ fontFamily: FONT }}
            >
              No hace falta tener experiencia.
            </p>
            <p
              className="text-xs italic leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.38)', fontFamily: FONT }}
            >
              IA de diseño con IA, uno de los mejores<br />
              inventos de TIME de 2025*
            </p>
          </div>

          {/* Right panels — staggered */}
          <div className="w-full md:w-7/12 flex gap-4 items-start">
            {/* Panel 1 — taller, starts at top */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 overflow-hidden"
              style={{
                borderRadius: '2.25rem',
                height: '21rem',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80"
                alt="Inteligencia artificial"
                className="w-full h-full object-cover object-top"
              />
            </motion.div>
            {/* Panel 2 — shorter, pushed down */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-hidden"
              style={{
                borderRadius: '2.25rem',
                height: '16rem',
                marginTop: '6rem',
                boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&q=80"
                alt="Desarrollo tecnológico"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. CLIENTS — logo grid + 14 Millones
      ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{ background: '#060c1d' }}
      >
        {/* Triangle decoration — bottom-right */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none"
          style={{ opacity: 0.75 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 300 280" className="w-44 h-40">
            <polygon points="150,10 290,270 10,270" fill="none" stroke={CYAN} strokeWidth="1.5" />
            <polygon points="190,55 290,270 90,270" fill="none" stroke={CYAN} strokeWidth="1" />
            <polygon points="230,105 290,270 170,270" fill={CYAN} opacity="0.5" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Logo grid */}
            <div className="shrink-0">
              <div className="grid grid-cols-3 gap-3" style={{ width: '285px' }}>

                {/* Apple */}
                <LogoCell>
                  <svg viewBox="0 0 814 1000" className="w-10 h-10" fill="#111">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-42.8-157.2-113.8C200 432.4 200 208.9 205.5 127.3 212.7 45.7 267.2 0 320.4 0c68.5 0 140.9 41.8 184.4 41.8 27.4 0 90.4-41.8 167.7-41.8 29.4 0 116.4 12.5 179.4 99.3zm-61.3-192.7c24.6-29.6 41.3-71.7 41.3-113.9 0-1.5-.1-3-.2-4.5-39.4 1.5-86.7 26.1-114.7 58-21.6 24.6-41.3 66.7-41.3 109.4 0 1.8.2 3.6.3 4.2.3 0 .8.1 1.3.1 35.5 0 79.7-23.8 113.3-53.3z" />
                  </svg>
                </LogoCell>

                {/* Pepsi */}
                <LogoCell>
                  <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <circle cx="50" cy="50" r="48" fill="#004B93" />
                    <path d="M50 2 A48 48 0 0 1 98 50 L50 50 Z" fill="#EE1C23" />
                    <path d="M2 50 A48 48 0 0 1 50 2 L50 50 Z" fill="white" />
                    <path d="M50 50 A48 48 0 0 1 2 50 Z" fill="white" />
                    <ellipse cx="50" cy="50" rx="12" ry="48" fill="white" opacity="0.6" />
                  </svg>
                </LogoCell>

                {/* Cyan square */}
                <div
                  className="aspect-square"
                  style={{ background: CYAN, borderRadius: '22px', boxShadow: '0px 0px 26.2px rgba(255,255,255,0.33)' }}
                />

                {/* Cyan square */}
                <div
                  className="aspect-square"
                  style={{ background: CYAN, borderRadius: '22px', boxShadow: '0px 0px 26.2px rgba(255,255,255,0.33)' }}
                />

                {/* Burger King */}
                <LogoCell>
                  <div className="text-center leading-tight">
                    <div className="bg-[#C8102E] text-white text-[7px] font-black rounded-full px-2 py-0.5 mb-0.5 tracking-tight">
                      BURGER
                    </div>
                    <div className="text-[#F5A623] font-black text-[11px] tracking-tight">KING</div>
                  </div>
                </LogoCell>

                {/* Nike */}
                <LogoCell>
                  <svg viewBox="0 0 100 40" className="w-12" fill="#111">
                    <path d="M0 38 L92 2 C97 -0.5 103 2.5 101 9 C100 13 94 17 88 19 L16 38 Z" />
                  </svg>
                </LogoCell>

                {/* Google — full width */}
                <LogoCell colSpan>
                  <span className="text-2xl font-bold" style={{ fontFamily: FONT }}>
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </LogoCell>

              </div>
            </div>

            {/* "14 Millones" */}
            <div className="text-center lg:text-left">
              <p
                className="uppercase tracking-[0.3em] text-sm mb-2"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: FONT }}
              >
                Con la confianza de
              </p>
              <h2
                className="text-6xl md:text-8xl font-bold leading-none mb-3"
                style={{ color: CYAN, fontFamily: FONT }}
              >
                14 Millones
              </h2>
              <p
                className="text-xl leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.72)', fontFamily: FONT }}
              >
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
