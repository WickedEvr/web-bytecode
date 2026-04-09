import React, { useState, useEffect } from 'react';
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

  return (
    <div className="overflow-x-hidden" style={{ fontFamily: FONT }}>

      {/* ─────────────────────────────────────────────
          1. HERO — dark space background
      ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden select-none" style={{ marginTop: 0 }}>

        {/* Galaxy video */}
        <div className="absolute inset-0" style={{ top: 0, backgroundColor: '#040e1f' }} aria-hidden="true">
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
            style={{ fontFamily: FONT, fontSize: 'clamp(1.8rem, 6vw, 4.2rem)' }}
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
            <Link to="/contacto" className="btn-cyan not-italic" style={{ width: '220px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sansation'", fontStyle: 'normal', fontWeight: 400, fontSize: '28px', lineHeight: '34px', textAlign: 'center', color: '#FFFFFF' }}>
              <span style={{ fontFamily: 'Sansation', fontWeight: 400, fontStyle: 'normal', fontSize: '32px', lineHeight: '100%', letterSpacing: '0', textAlign: 'center' }}>Conectar</span>
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
                style={{ borderRadius: '28px', overflow: 'hidden', position: 'relative', zIndex: 10, boxShadow: '0px 4px 20.4px 9px rgba(0,0,0,0.22)' }}
              >
                {/* Imagen */}
                <div style={{ position: 'relative', height: 'clamp(320px, 44vw, 554px)' }}>
                  <img
                    src={services[slide].img}
                    alt={services[slide].title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 20%' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />

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
                  <img src="/esquina-derecha.svg" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none' }} />
                  <img src="/isotipo.svg" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '3%', width: 'clamp(28px, 4vw, 56px)', height: 'auto', pointerEvents: 'none', zIndex: 2 }} />
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
      <section className="bg-white pb-12 px-6" style={{ position: 'relative', zIndex: 20, marginTop: '-13rem', borderRadius: '2rem 2rem 0 0', paddingTop: '0' }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">

          {/* Title with side lines */}
          <div className="flex items-center gap-4 mb-10 w-full">
            <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
            <h2
              style={{ fontFamily: 'Sansation', fontStyle: 'normal', fontWeight: 700, fontSize: '40px', lineHeight: '45px', textAlign: 'center', color: '#3C3C3B', width: '420px', flexShrink: 0 }}
            >
              Nuestras Herramientas
            </h2>
            <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
          </div>

        </div>

        {/* Brand logos — infinite carousel — 80vw */}
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
          <div
            style={{
              position: 'relative',
              width: '80vw',
              margin: '0 auto',
              overflow: 'hidden',
              maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              opacity: 0.8,
            }}
          >
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

        {/* Contenido */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center px-6 pt-16 pb-8 max-w-[85vw] gap-8" style={{ marginLeft: 'auto', marginRight: '2%' }}>

          {/* Texto izquierda */}
          <div className="w-full md:w-4/12 flex flex-col gap-3" style={{ marginLeft: '-3rem' }}>
            <h2 style={{ fontFamily: 'Sansation', fontWeight: 700, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', lineHeight: 1.15, color: CYAN }}>
              Comenzar nunca ha sido<br />tan fácil gracias a la IA
            </h2>
            <p style={{ fontFamily: 'Sansation', fontWeight: 400, fontSize: '1.5rem', color: '#ffffff' }}>
              No hace falta tener experiencia.
            </p>
            <p style={{ fontFamily: 'Sansation', fontStyle: 'italic', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
              Kit de diseño con IA, uno de los mejores<br />inventos de TIME de 2025*
            </p>
          </div>

          {/* Tarjetas */}
          <div className="w-full md:w-8/12 flex gap-5 items-end justify-center" style={{ paddingLeft: '8rem', paddingRight: '8rem', overflow: 'visible' }}>

            {/* Tarjeta chica (izquierda, más alta) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex-shrink-0"
              style={{ width: 'clamp(200px, 24vw, 346px)', height: 'clamp(340px, 46vw, 613px)', zIndex: 10, overflow: 'visible' }}
            >
              {/* Círculo — posición relativa a esta tarjeta (Figma: left -101px, top 82px sobre tarjeta 346×613) */}
              <img src="/circulo.svg" aria-hidden="true" className="absolute pointer-events-none"
                style={{ left: '-29.2%', top: '13.4%', width: '143px', height: '137px', zIndex: 0 }} />
              {/* RectangleMedio — posición relativa a esta tarjeta (Figma: left 125px, top 403px) */}
              <img src="/RectangleMedio.svg" aria-hidden="true" className="absolute pointer-events-none"
                style={{ left: '36.1%', top: '65.7%', width: '329px', height: '237px', zIndex: 0 }} />
              {/* Fondo y overlay con clip */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '68px', boxShadow: '0px 4px 27.8px rgba(0,0,0,0.42)', background: '#D9D9D9' }}>
                <img src="/blank.svg" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
              </div>
              <img src="/chica.svg" alt="IA" style={{ position: 'absolute', left: '7%', bottom: 0, width: 'auto', height: '120%', maxWidth: 'none', transform: 'translateX(-50%)', transformOrigin: 'center bottom', zIndex: 120, pointerEvents: 'none' }} />
            </motion.div>

            {/* Tarjeta hombre (derecha) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative flex-shrink-0"
              style={{ width: 'clamp(200px, 24vw, 346px)', height: 'clamp(340px, 46vw, 613px)', borderRadius: '68px', boxShadow: '0px 4px 27.8px rgba(0,0,0,0.42)', background: '#D9D9D9', overflow: 'visible', zIndex: 11 }}
            >
              {/* RectangleDerecha — posición relativa a esta tarjeta (Figma: left 173px, top 246px sobre tarjeta 345×613) */}
              <img src="/RectangleDerecha.svg" aria-hidden="true" className="absolute pointer-events-none"
                style={{ left: '50.1%', top: '40.1%', width: '214px', height: '246px', zIndex: 0 }} />
              {/* Imagen clipeada con border-radius */}
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

        {/* Línea superior */}
        <div style={{ width: '86.6%', margin: '0 auto', borderTop: '1px solid #FFFFFF', marginBottom: '6rem' }} />

        {/* Contenido */}
        <div className="relative flex items-center justify-between" style={{ zIndex: 1, minHeight: '400px' }}>

          {/* Tarjetas testimonios — carrusel */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ paddingLeft: 'clamp(4rem, 8vw, 10rem)' }}>
            <div style={{ position: 'relative', width: 'clamp(500px, 62vw, 860px)', height: 'clamp(440px, 56vw, 720px)' }}>
              {testimonials.map((t, i) => {
                const slot = ((i - activeCard + testimonials.length) % testimonials.length) as 0|1|2;
                return <TestimonialCard key={i} slot={slot} name={t.name} role={t.role} text={t.text} stars={t.stars} />;
              })}
            </div>
          </div>

          {/* Columna derecha: texto arriba, gráfico abajo */}
          <div className="ml-auto flex flex-col items-end" style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start' }}>
            {/* Texto */}
            <div className="text-right" style={{ maxWidth: '480px', marginRight: '18%', marginTop: 0, marginBottom: '2rem', marginLeft: 0 }}>
              <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(28px, 3.5vw, 52px)', lineHeight: 1.15, color: '#FFFFFF', textAlign: 'right', marginBottom: '1.2rem' }}>
                CONSTRUYENDO EL FUTURO,{' '}
                <span style={{ color: CYAN }}>CASO POR CASO</span>
              </h2>
              <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 'clamp(14px, 1.5vw, 20px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', textAlign: 'right' }}>
                Testimonios veraces de nuestros primeros usuarios piloto que ya están transformando sus industrias.
              </p>
            </div>
            {/* Gráfico debajo del texto, pegado al borde derecho */}
            <img src="/grafico-derecha.svg" alt="" aria-hidden="true"
              style={{ width: 'clamp(200px, 35vw, 800px)', height: 'auto', opacity: 0.7, marginRight: 0 }} />
          </div>

        </div>

        {/* Línea inferior — también sirve de línea superior de la siguiente sección */}
        <div style={{ width: '86.6%', margin: '6rem auto 0', borderTop: '1px solid #FFFFFF' }} />
      </section>

      {/* ─────────────────────────────────────────────
          6. CTA PRE-FOOTER
      ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">

        {/* Logo absoluto izquierda — sangra fuera del borde */}
        <img src="/logo-footer.svg" alt="Bytecode" aria-hidden="true" className="absolute pointer-events-none"
          style={{ left: '-60px', top: '50%', transform: 'translateY(-50%)', width: '310px', height: 'auto', objectFit: 'contain', opacity: 0.7, zIndex: 1 }} />

        {/* Group 94 — 913px centrado, texto izquierda + botón derecha */}
        <div className="relative" style={{
          zIndex: 2,
          width: '980px',
          maxWidth: '100%',
          margin: '0 auto',
          padding: '150px 0',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* "Un clic para ti, un salto para tu marca." — 354px izquierda */}
          <h2 style={{
            fontFamily: 'Sansation',
            fontStyle: 'normal',
            fontWeight: 700,
            fontSize: '53px',
            lineHeight: '60px',
            color: '#FFFFFF',
            width: '354px',
            flexShrink: 0,
          }}>
            Un clic para ti,<br />un salto para tu marca.
          </h2>

          {/* Rectangle 14 — botón Conectar — 504×79px derecha */}
          <Link to="/contacto" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '504px',
            height: '79px',
            background: '#06CFD6',
            borderRadius: '22px',
            flexShrink: 0,
            textDecoration: 'none',
          }}>
            <span style={{
              fontFamily: 'Sansation',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '44px',
              lineHeight: '49px',
              textAlign: 'center',
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
