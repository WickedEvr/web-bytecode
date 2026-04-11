import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    title: 'App de Escritorio',
    description: 'Aplicaciones de escritorio con\ninterfaces modernas y robustas.',
    img: '/DesktopApp.webp',
  },
];

export const SwirlMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <img src="/isotipo.svg" alt="" aria-hidden="true" className={className} />
);

/* ─── Logo grid cell ────────────────────────────────── */
export const LogoCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: boolean }> = ({
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

/* ─── Testimonial Card ─────────────────────────────── */
const CARD_W = 'clamp(280px, 28vw, 380px)';
const AVATAR = 'clamp(100px, 11vw, 140px)';

const testimonials = [
  { name: 'María García',   role: 'Emprendedora', text: 'Excelente servicio, mi negocio creció enormemente. Totalmente conforme.', stars: 4 },
  { name: 'Dante Gallardo', role: 'CEO',          text: 'Muy bueno con el trabajo! Totalmente conforme.',                          stars: 5 },
  { name: 'Carlos Ruiz',    role: 'Director',     text: 'Profesionales de primer nivel, los recomiendo.',                          stars: 5 },
];

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#F5A523" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// slot: 0=centro(main)  1=derecha(atrás)  2=izquierda(atrás)
const TestimonialCard: React.FC<{ name: string; role: string; text: string; stars: number; slot: 0|1|2 }> = ({
  name, role, text, stars, slot,
}) => {
  const isMain = slot === 0;
  const slotStyle: React.CSSProperties =
    slot === 0 ? { transform: 'translate(-50%, -50%) scale(1)',     opacity: 1,    zIndex: 3 } :
    slot === 1 ? { transform: 'translate(22%,  -50%) scale(0.78)',  opacity: 0.52, zIndex: 1 } :
                 { transform: 'translate(-122%, -50%) scale(0.78)', opacity: 0.62, zIndex: 1 };
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      width: CARD_W,
      borderRadius: '26px',
      overflow: 'hidden',
      border: isMain ? '2px solid rgba(255,255,255,0.85)' : '1.5px solid rgba(255,255,255,0.25)',
      boxShadow: isMain
        ? '0 0 18px rgba(255,255,255,0.35), 0 0 36px rgba(12,163,198,0.35), 0 8px 28px rgba(0,0,0,0.5)'
        : '0 4px 16px rgba(0,0,0,0.4)',
      background: 'rgba(15,28,48,0.92)',
      transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease, box-shadow 0.55s ease',
      ...slotStyle,
    }}>
      {/* Zona oscura superior */}
      <div style={{ height: 'clamp(110px, 12vw, 160px)', position: 'relative', background: 'linear-gradient(160deg,#0d1e35 0%,#162d4a 100%)' }}>
        <div style={{
          position: 'absolute',
          bottom: `calc(-${AVATAR} / 2)`,
          left: '50%', transform: 'translateX(-50%)',
          width: AVATAR, height: AVATAR,
          borderRadius: '50%',
          border: isMain ? '3px solid #0CA3C6' : '2px solid rgba(12,163,198,0.5)',
          boxShadow: isMain ? '0 0 14px rgba(12,163,198,0.8)' : 'none',
          background: 'linear-gradient(135deg, #1a3a5c 0%, #0d1f33 100%)',
          zIndex: 2,
        }} />
      </div>
      {/* Zona blanca con arco */}
      <div style={{
        background: 'white',
        borderRadius: '50% 50% 0 0 / 32px 32px 0 0',
        paddingTop: `calc(${AVATAR} / 2 + 16px)`,
        paddingBottom: '28px', paddingLeft: '22px', paddingRight: '22px',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(16px,1.7vw,22px)', color: CYAN, margin: '0 0 4px' }}>{name}</p>
        <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(13px,1.4vw,18px)', color: CYAN, margin: '0 0 12px' }}>{role}</p>
        <p style={{ fontFamily: FONT, fontSize: 'clamp(12px,1.3vw,16px)', color: '#444', lineHeight: 1.5, margin: '0 0 18px' }}>{text}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
          {Array.from({ length: stars }).map((_, i) => <StarIcon key={i} />)}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════ */
const Home: React.FC = () => {
  const [slide, setSlide] = useState(0);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % testimonials.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % services.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-x-hidden" style={{ fontFamily: FONT }}>

      {/* ─────────────────────────────────────────────
          1. HERO — dark space background
      ───────────────────────────────────────────── */}
      <section className="relative h-screen overflow-hidden select-none" style={{ marginTop: 0 }}>

        {/* Galaxy video */}
        <div className="absolute inset-0" style={{ backgroundColor: '#040e1f' }} aria-hidden="true">
          <video
            src="/final.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 20%', transform: 'scale(1.1)', transformOrigin: 'top center' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(4,14,31,0.45)' }} />
        </div>

        {/* Esquina superior izquierda */}
        <img src="/esquina-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 pointer-events-none z-10" style={{ width: '40%' }} />

        {/* Esquina inferior derecha */}
        <img src="/esquina-abajo.svg" aria-hidden="true" className="absolute bottom-0 right-0 pointer-events-none z-10" style={{ width: '40%' }} />

        {/* Sombras */}
        <img src="/sombra-general.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-[9]" />
        <img src="/sombra-arriba.svg"  aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10" />
        <img src="/sombra-arriba.svg"  aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10" style={{ opacity: 0.5 }} />

        {/* ── Layout principal ── */}
        <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-12 lg:px-20 gap-2 md:gap-0 pt-20 md:pt-0">

          {/* TEXTO + BOTONES — aparece primero en móvil (top), segundo en desktop (right) */}
          <div className="order-1 md:order-2 flex flex-col items-center md:items-start text-center md:text-left z-20 w-full md:w-[52%]">
            <h1
              className="font-bold text-white uppercase mb-2 md:mb-4"
              style={{
                fontFamily: FONT,
                fontSize: 'clamp(2.2rem, 4.8vw, 4.875rem)',
                lineHeight: '1.08',
                textShadow: '0px 4px 7.3px rgba(0,0,0,0.51)',
              }}
            >
              Un gran sitio web,<br />hace ideas realidad
            </h1>

            <p
              className="text-white mb-5 md:mb-10"
              style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: 'clamp(0.9rem, 1.8vw, 1.75rem)',
                lineHeight: '1.3',
                textShadow: '0px 4px 8.8px rgba(0,0,0,0.81)',
              }}
            >
              Adquiere tu consulta <span className="font-bold text-[#06CFD6]">GRATIS</span>
            </p>

            {/* BOTONES — apilados en móvil, en fila en desktop */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-5 w-full md:w-auto" style={{ maxWidth: '520px' }}>
              <Link
                to="/contacto"
                className="flex items-center justify-center bg-[#06CFD6] rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0px_0px_25px_rgba(6,207,214,0.5)]"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: 'clamp(48px, 5vw, 68px)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
                  fontFamily: FONT,
                  color: '#fff',
                  minWidth: 'clamp(180px, 20vw, 260px)',
                }}
              >
                Conectar
              </Link>

              <Link
                to="/servicios"
                className="flex items-center justify-center bg-white rounded-full font-bold transition-all hover:scale-105"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: 'clamp(48px, 5vw, 68px)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
                  fontFamily: FONT,
                  color: '#0CA3C6',
                  border: '2px solid #0CA3C6',
                  minWidth: 'clamp(180px, 20vw, 260px)',
                }}
              >
                Servicios
              </Link>
            </div>
          </div>

          {/* ASTRONAUTA — aparece segundo en móvil (abajo), primero en desktop (left) */}
          <div className="order-2 md:order-1 flex items-center justify-center md:justify-start w-full md:w-[48%] flex-shrink-0">
            <motion.img
              src="/astronauta.png"
              alt="Astronauta"
              animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none drop-shadow-2xl"
              style={{ width: 'clamp(160px, 38vw, 560px)', height: 'auto' }}
            />
          </div>

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
          <style>{`
            .svc-card-wrap  { max-width: 85%; }
            .svc-card       { border-radius: 48px; }
            .svc-card-img   { height: clamp(320px, 44vw, 554px); }
            .svc-isotipo    { display: block; }
            .svc-esquina    { display: block; }
            @media (max-width: 767px) {
              .svc-card-wrap { max-width: min(306px, 90vw); margin: 0 auto; }
              .svc-card      { border-radius: 28px; }
              .svc-card-img  { height: 409px; }
              .svc-isotipo   { display: none; }
              .svc-esquina   { display: none; }
              .svc-text-title { font-size: 1.5rem !important; }
              .svc-text-desc  { font-size: 0.95rem !important; }
            }
          `}</style>
          <div className="svc-card-wrap w-full">
            <div className="svc-card" style={{ overflow: 'hidden', position: 'relative', zIndex: 10, boxShadow: '0px 4px 20.4px 9px rgba(0,0,0,0.22)' }}>
                {/* Imagen */}
                <div className="svc-card-img" style={{ position: 'relative' }}>
                  <img
                    src={services[slide].img}
                    alt={services[slide].title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 20%' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />

                  {/* Texto inferior izquierdo */}
                  <div style={{ position: 'absolute', bottom: 'clamp(24px, 4vw, 60px)', left: 'clamp(20px, 4vw, 60px)', right: 'clamp(60px, 12vw, 150px)' }}>
                    <p className="svc-text-title" style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(1.4rem, 3.2vw, 3.8rem)', color: '#fff', lineHeight: 1.25, margin: 0 }}>
                      {services[slide].title}
                    </p>
                    <p className="svc-text-desc" style={{ fontFamily: FONT, fontSize: 'clamp(0.9rem, 2vw, 2.5rem)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.15, marginTop: '8px', whiteSpace: 'pre-line' }}>
                      {services[slide].description}
                    </p>
                  </div>

                  {/* Badge isotipo — solo desktop */}
                  <img className="svc-esquina" src="/esquina-derecha.svg" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none' }} />
                  <img className="svc-isotipo" src="/isotipo.svg" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '3%', width: 'clamp(28px, 4vw, 56px)', height: 'auto', pointerEvents: 'none', zIndex: 2 }} />
                </div>

            </div>

            {/* Dots de paginación */}
            <div className="flex justify-center mt-5 gap-2 items-center" style={{ position: 'relative', zIndex: 20 }}>
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    height: '11px',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                    width: slide === i ? '56px' : '14px',
                    background: slide === i ? '#9ca3af' : '#d1d5db',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'block',
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
      <section className="bg-white pb-12 px-6" style={{ position: 'relative', zIndex: 20, marginTop: 'clamp(-10rem, -18vw, -20rem)', borderRadius: '2rem 2rem 0 0', paddingTop: '0' }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">

          {/* Title with side lines */}
          <div className="flex items-center gap-3 mb-8 md:mb-10 w-full">
            <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
            <h2
              style={{ fontFamily: 'Sansation', fontWeight: 700, fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)', lineHeight: 1.2, textAlign: 'center', color: '#3C3C3B', flexShrink: 0, padding: '0 0.5rem' }}
            >
              Nuestras Herramientas
            </h2>
            <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
          </div>

        </div>

        {/* Brand logos — infinite seamless marquee */}
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
        <div
          style={{
            position: 'relative',
            width: '90vw',
            margin: '0 auto',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            opacity: 0.8,
          }}
        >
          <div className="logos-track">
            {/* 4 copias — animación -25% = 1 set de velocidad, 3 sets de buffer */}
            {[0, 1, 2, 3].map(copy => (
              <React.Fragment key={copy}>
                <img src="/logos/laravel.svg" alt={copy === 0 ? 'Laravel' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(28px, 4.7vw, 54px)', width: 'auto', filter: 'grayscale(100%)' }} />
                <img src="/logos/github.svg"  alt={copy === 0 ? 'GitHub'  : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(30px, 4.9vw, 56px)', width: 'auto', filter: 'grayscale(100%)' }} />
                <img src="/logos/php.svg"     alt={copy === 0 ? 'PHP'     : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(36px, 6.6vw, 76px)', width: 'auto', filter: 'grayscale(100%)' }} />
                <img src="/logos/JAVA.svg"    alt={copy === 0 ? 'Java'    : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(40px, 7.5vw, 86px)', width: 'auto', filter: 'grayscale(100%)' }} />
                <img src="/logos/mongodb.svg" alt={copy === 0 ? 'MongoDB' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(44px, 8vw, 92px)',   width: 'auto', filter: 'grayscale(100%)' }} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FONDO COMPARTIDO — secciones 4, 5 y 6
      ═══════════════════════════════════════════ */}
      <div className="relative">

      {/* ─────────────────────────────────────────────
          4. IA SECTION
      ───────────────────────────────────────────── */}
      <section
        className="relative"
        style={{ minHeight: '700px', paddingBottom: '4rem', overflowX: 'hidden' }}
      >
        {/* Forma celeste izquierda */}
        <img src="/forma1celeste.svg" aria-hidden="true" className="absolute pointer-events-none"
          style={{ left: 0, top: '-5%', width: 'clamp(600px, 80vw, 1200px)', zIndex: 5 }} />

        {/* Forma celeste derecha */}
        <img src="/forma2celeste.svg" aria-hidden="true" className="absolute pointer-events-none"
          style={{ right: 0, top: '3%', width: 'clamp(180px, 24vw, 360px)', zIndex: 3 }} />

        {/* Contenido — en móvil: tarjeta arriba, texto abajo */}
        <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-center px-6 pt-8 md:pt-16 pb-8 w-full max-w-[1200px] mx-auto gap-8 md:gap-6">

          {/* Texto — abajo en móvil, izquierda en desktop */}
          <div className="w-full md:w-4/12 flex flex-col gap-3 text-center md:text-left items-center md:items-start">
            <h2 style={{ fontFamily: 'Sansation', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.15, color: CYAN }}>
              Comenzar nunca ha sido<br />tan fácil gracias a la IA
            </h2>
            <p style={{ fontFamily: 'Sansation', fontWeight: 400, fontSize: 'clamp(1rem, 1.8vw, 1.5rem)', color: '#ffffff' }}>
              No hace falta tener experiencia.
            </p>
            <p style={{ fontFamily: 'Sansation', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(0.8rem, 1.2vw, 1rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
              Kit de diseño con IA, uno de los mejores<br />inventos de TIME de 2025*
            </p>
          </div>

          {/* Tarjetas — arriba en móvil, derecha en desktop */}
          <div className="w-full md:w-8/12 flex gap-4 md:gap-5 items-end justify-center" style={{ overflow: 'visible', paddingLeft: 'clamp(0px, 4vw, 6rem)', paddingRight: 'clamp(0px, 4vw, 6rem)' }}>

            {/* Tarjeta chica — visible siempre */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex-shrink-0"
              style={{ width: 'clamp(140px, 38vw, 346px)', height: 'clamp(240px, 65vw, 613px)', zIndex: 10, overflow: 'visible' }}
            >
              {/* Círculo decorativo (CSS) */}
              <div aria-hidden="true" style={{
                position: 'absolute', left: '-29.2%', top: '13.4%',
                width: '41.3%', paddingBottom: '41.3%',
                borderRadius: '50%',
                background: '#ffffff',
                zIndex: 0, pointerEvents: 'none',
              }} />
              {/* RectangleMedio decorativo (CSS) */}
              <div aria-hidden="true" style={{
                position: 'absolute', left: '36.1%', top: '65.7%',
                width: '95.1%', height: '38.7%',
                borderRadius: '20px',
                background: '#ffffff',
                zIndex: 0, pointerEvents: 'none',
              }} />
              {/* Fondo con clip */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '68px', boxShadow: '0px 4px 27.8px rgba(0,0,0,0.42)', background: '#D9D9D9' }}>
                <img src="/blank.svg" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
              </div>
              <img src="/chica.svg" alt="IA" style={{ position: 'absolute', left: '7%', bottom: 0, width: 'auto', height: '120%', maxWidth: 'none', transform: 'translateX(-50%)', transformOrigin: 'center bottom', zIndex: 120, pointerEvents: 'none' }} />
            </motion.div>

            {/* Tarjeta hombre — oculta en móvil */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative flex-shrink-0 hidden md:block"
              style={{ width: 'clamp(140px, 24vw, 346px)', height: 'clamp(240px, 46vw, 613px)', borderRadius: '68px', boxShadow: '0px 4px 27.8px rgba(0,0,0,0.42)', background: '#D9D9D9', overflow: 'visible', zIndex: 11 }}
            >
              {/* RectangleDerecha decorativo (CSS) */}
              <div aria-hidden="true" style={{
                position: 'absolute', left: '50.1%', top: '40.1%',
                width: '62%', height: '40.1%',
                borderRadius: '20px',
                background: '#ffffff',
                zIndex: 0, pointerEvents: 'none',
              }} />
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '68px' }}>
                <img src="/hombre.svg" alt="Tecnología" className="absolute w-full h-full object-cover object-top" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. CLIENTS — logo grid + 14 Millones
      ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
      >

        {/* Línea superior — oculta en móvil */}
        <div className="hidden md:block" style={{ width: '86.6%', margin: '0 auto', borderTop: '1px solid #FFFFFF', marginBottom: '6rem' }} />

        {/* ── MÓVIL: texto arriba, tarjeta única centrada ── */}
        <div className="flex flex-col items-center px-6 py-10 gap-6 md:hidden">
          <div className="text-center">
            <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(1.4rem, 6vw, 2rem)', lineHeight: 1.15, color: '#FFFFFF', marginBottom: '0.75rem' }}>
              CONSTRUYENDO EL FUTURO,{' '}
              <span style={{ color: CYAN }}>CASO POR CASO</span>
            </h2>
            <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
              Testimonios veraces de nuestros primeros usuarios piloto que ya están transformando sus industrias.
            </p>
          </div>
          {/* Tarjeta única activa */}
          {(() => {
            const t = testimonials[activeCard];
            return (
              <div style={{
                width: 'min(85vw, 340px)',
                borderRadius: '26px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.85)',
                boxShadow: '0 0 18px rgba(255,255,255,0.25), 0 0 36px rgba(12,163,198,0.3), 0 8px 28px rgba(0,0,0,0.5)',
                background: 'rgba(15,28,48,0.92)',
              }}>
                <div style={{ height: '90px', position: 'relative', background: 'linear-gradient(160deg,#0d1e35 0%,#162d4a 100%)' }}>
                  <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #0CA3C6', boxShadow: '0 0 14px rgba(12,163,198,0.8)', background: 'linear-gradient(135deg, #1a3a5c 0%, #0d1f33 100%)', zIndex: 2 }} />
                </div>
                <div style={{ background: 'white', borderRadius: '50% 50% 0 0 / 28px 28px 0 0', paddingTop: '52px', paddingBottom: '24px', paddingLeft: '20px', paddingRight: '20px', textAlign: 'center' }}>
                  <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '18px', color: CYAN, margin: '0 0 2px' }}>{t.name}</p>
                  <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: '14px', color: CYAN, margin: '0 0 10px' }}>{t.role}</p>
                  <p style={{ fontFamily: FONT, fontSize: '13px', color: '#444', lineHeight: 1.5, margin: '0 0 14px' }}>{t.text}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                    {Array.from({ length: t.stars }).map((_, i) => <StarIcon key={i} />)}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── DESKTOP: layout original con carrusel de 3 ── */}
        <div className="relative hidden md:flex items-center justify-between" style={{ zIndex: 1, minHeight: '400px' }}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ paddingLeft: 'clamp(4rem, 8vw, 10rem)' }}>
            <div style={{ position: 'relative', width: 'clamp(500px, 62vw, 860px)', height: 'clamp(440px, 56vw, 720px)' }}>
              {testimonials.map((t, i) => {
                const slot = ((i - activeCard + testimonials.length) % testimonials.length) as 0|1|2;
                return <TestimonialCard key={i} slot={slot} name={t.name} role={t.role} text={t.text} stars={t.stars} />;
              })}
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end" style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start' }}>
            <div className="text-right" style={{ maxWidth: '480px', marginRight: '18%', marginTop: 0, marginBottom: '2rem', marginLeft: 0 }}>
              <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(28px, 3.5vw, 52px)', lineHeight: 1.15, color: '#FFFFFF', textAlign: 'right', marginBottom: '1.2rem' }}>
                CONSTRUYENDO EL FUTURO,{' '}
                <span style={{ color: CYAN }}>CASO POR CASO</span>
              </h2>
              <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(14px, 1.5vw, 20px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', textAlign: 'right' }}>
                Testimonios veraces de nuestros primeros usuarios piloto que ya están transformando sus industrias.
              </p>
            </div>
            <img src="/grafico-derecha.svg" alt="" aria-hidden="true"
              style={{ width: 'clamp(200px, 35vw, 800px)', height: 'auto', opacity: 0.7, marginRight: 0 }} />
          </div>
        </div>

        {/* Línea inferior */}
        <div className="hidden md:block" style={{ width: '86.6%', margin: '6rem auto 0', borderTop: '1px solid #FFFFFF' }} />
      </section>

      {/* ─────────────────────────────────────────────
          6. CTA PRE-FOOTER
      ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">

        {/* Logo absoluto izquierda — sangra fuera del borde */}
        <img src="/logo-footer.svg" alt="Bytecode" aria-hidden="true" className="absolute pointer-events-none"
          style={{ left: '-60px', top: '50%', transform: 'translateY(-50%)', width: '310px', height: 'auto', objectFit: 'contain', opacity: 0.7, zIndex: 1 }} />

        {/* CTA — columna en móvil, fila en desktop */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 px-6 md:px-0" style={{
          zIndex: 2,
          width: 'min(980px, 100%)',
          maxWidth: '100%',
          margin: '0 auto',
          padding: 'clamp(3rem, 8vh, 9rem) clamp(1.5rem, 4vw, 3rem)',
        }}>

          {/* Texto */}
          <h2 style={{
            fontFamily: 'Sansation',
            fontWeight: 700,
            fontSize: 'clamp(1.8rem, 4vw, 3.3rem)',
            lineHeight: 1.15,
            color: '#FFFFFF',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            Un clic para ti,<br />un salto para tu marca.
          </h2>

          {/* Botón Conectar */}
          <Link to="/contacto" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '504px',
            height: 'clamp(56px, 6vw, 79px)',
            background: '#06CFD6',
            borderRadius: '22px',
            flexShrink: 0,
            textDecoration: 'none',
          }}>
            <span style={{
              fontFamily: 'Sansation',
              fontWeight: 400,
              fontSize: 'clamp(1.5rem, 3vw, 2.75rem)',
              color: '#FFFFFF',
            }}>
              Conectar
            </span>
          </Link>

        </div>

        {/* Isotipo esquina inferior derecha */}
        <img src="/isotipo.svg" alt="" aria-hidden="true" className="absolute pointer-events-none"
          style={{ right: '7%', bottom: '8%', width: '46px', height: 'auto', zIndex: 2, opacity: 0.85 }} />

        {/* Línea inferior */}
        <div style={{ width: '86.6%', margin: '0 auto', borderTop: '1px solid #FFFFFF' }} />

      </section>

      </div>{/* fin fondo compartido secciones 4-5-6 */}

    </div>
  );
};

export default Home;
