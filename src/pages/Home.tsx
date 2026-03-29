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

          {/* Brand logos */}
          <div className="flex flex-nowrap justify-center items-center gap-6 md:gap-10 w-full" style={{ opacity: 0.8 }}>
            <img src="/logos/laravel.svg"  alt="Laravel" style={{ height: 'clamp(30px, 4.7vw, 54px)',  width: 'auto', opacity: 0.9, filter: 'grayscale(100%)' }} />
            <img src="/logos/github.svg"   alt="GitHub"  style={{ height: 'clamp(32px, 4.9vw, 56px)',  width: 'auto', opacity: 0.9, filter: 'grayscale(100%)' }} />
            <img src="/logos/php.svg"      alt="PHP"     style={{ height: 'clamp(40px, 6.6vw, 76px)',  width: 'auto', opacity: 0.9, filter: 'grayscale(100%)' }} />
            <img src="/logos/JAVA.svg"     alt="Java"    style={{ height: 'clamp(44px, 7.5vw, 86px)',  width: 'auto', opacity: 0.9, filter: 'grayscale(100%)' }} />
            <img src="/logos/mongodb.svg"  alt="MongoDB" style={{ height: 'clamp(48px, 8vw, 92px)',    width: 'auto', opacity: 0.9, filter: 'grayscale(100%)' }} />
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

            {/* Círculo blanco decorativo */}
            <div className="absolute pointer-events-none" style={{ width: '143px', height: '137px', background: '#fff', borderRadius: '85px', left: '30%', top: '8%', zIndex: 0, opacity: 0.9 }} />

            {/* Tarjeta chica (izquierda, más alta) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex-shrink-0"
              style={{ width: 'clamp(200px, 24vw, 346px)', height: 'clamp(340px, 46vw, 613px)', zIndex: 10 }}
            >
              {/* Fondo y overlay con clip */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '68px', boxShadow: '0px 4px 27.8px rgba(0,0,0,0.42)', background: '#D9D9D9' }}>
                <img src="/blank.svg" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
              </div>
              {/* Chica al frente sin clip */}
              <img src="/chica.svg" alt="IA" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right bottom', transform: 'scale(1.045)', transformOrigin: 'right bottom', zIndex: 100 }} />
            </motion.div>

            {/* Tarjeta hombre (derecha) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden flex-shrink-0"
              style={{ width: 'clamp(200px, 24vw, 346px)', height: 'clamp(340px, 46vw, 613px)', borderRadius: '68px', boxShadow: '0px 4px 27.8px rgba(0,0,0,0.42)', background: '#D9D9D9' }}
            >
              <img src="/hombre.svg" alt="Tecnología" className="absolute w-full h-full object-cover object-top" />
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

          {/* Pepsi gráfico — pegado a la izquierda */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <img src="/pepsi.svg" alt="" aria-hidden="true" style={{ height: 'clamp(300px, 40vw, 570px)', width: 'auto' }} />
          </div>

          {/* Columna derecha: texto arriba, gráfico abajo */}
          <div className="ml-auto flex flex-col items-end" style={{ position: 'relative', zIndex: 2 }}>
            {/* Texto */}
            <div className="text-right" style={{ maxWidth: '560px', marginRight: '8rem' , margin: '5rem' }}>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(20px, 2.2vw, 32px)', lineHeight: '36px', color: '#FFFFFF', textAlign: 'right' }}>
                Con la confianza de
              </p>
              <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(60px, 7.3vw, 105px)', lineHeight: '1.12', color: CYAN, textAlign: 'right' }}>
                14 Millones
              </h2>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(18px, 2.2vw, 32px)', lineHeight: '36px', color: '#FFFFFF', textAlign: 'right' }}>
                de emprendedores en todo el Perú
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
            fontSize: '48px',
            lineHeight: '54px',
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
