import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Stack from '../components/Stack';
import GalaxyBackground from '../components/GalaxyBackground';

/* ==========================================================================
    CONFIGURACIÓN Y DATOS ESTÁTICOS
   ========================================================================== */

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

const testimonials = [
  { name: 'María García', role: 'Emprendedora', text: 'Excelente servicio, mi negocio creció enormemente. Totalmente conforme.', stars: 4 },
  { name: 'Dante Gallardo', role: 'CEO', text: 'Muy bueno con el trabajo! Totalmente conforme.', stars: 5 },
  { name: 'Carlos Ruiz', role: 'Director', text: 'Profesionales de primer nivel, los recomiendo.', stars: 5 },
];

/* ==========================================================================
    COMPONENTES DE APOYO (HELPERS)
   ========================================================================== */

const TestimonialCard: React.FC<{ name: string; role: string; text: string; stars: number; slot: 0 | 1 | 2 }> = ({
  name, role, text, stars, slot,
}) => {
  const slotProps = [
    { left: 111.08, top: 0,     opacity: 1,    zIndex: 3, scale: 1     },
    { left: 223,    top: 42.06, opacity: 0.54, zIndex: 1, scale: 0.736 },
    { left: 50,     top: 42.06, opacity: 0.54, zIndex: 1, scale: 0.736 },
  ] as const;
  const { left, top, opacity, zIndex, scale } = slotProps[slot];

  return (
    <div className="font-sansation" 
      style={{
        position: 'absolute',
        left, top,
        width: 189.51, height: 305.14,
        opacity, zIndex,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        transition: 'left 0.7s cubic-bezier(0.4,0,0.2,1), top 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease',
        filter: 'drop-shadow(0px 4px 18px rgba(178,250,255,0.62))',
      }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 37,
        border: '4px solid #FFFFFF',
        background: 'rgba(255,255,255,0.13)',
        backdropFilter: 'blur(9.85px)',
        WebkitBackdropFilter: 'blur(9.85px)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ height: 122, position: 'relative', background: 'rgba(0,15,35,0.45)' }}>
          <div style={{
            position: 'absolute',
            bottom: -44.43,
            left: '50%', transform: 'translateX(-50%)',
            width: 88.86, height: 88.86,
            borderRadius: '50%',
            border: '6px solid #06CFD6',
            filter: 'drop-shadow(0px 0px 16.6px #FFFFFF)',
            background: 'linear-gradient(135deg,#1a3a5c 0%,#0d1f33 100%)',
            zIndex: 2,
            overflow: 'hidden',
          }} />
        </div>

        <div style={{
          height: 183,
          background: '#FFFFFF',
          boxShadow: '0px -4px 18px rgba(135,247,255,0.48)',
          borderRadius: '177px 177px 37px 37px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 54,
          paddingBottom: 16,
          paddingLeft: 14,
          paddingRight: 14,
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#06CFD6', margin: '0 0 1px', lineHeight: 1.2 }}>{name}</p>
          <p style={{ fontWeight: 400, fontSize: 10, color: '#06CFD6', margin: '0 0 4px', lineHeight: 1.2 }}>{role}</p>
          <p style={{ fontSize: 11, color: '#000000', lineHeight: 1.4, margin: '0 0 8px', flex: 1 }}>{text}</p>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: stars }).map((_, i) => (
              <svg key={i} width={29.23} height={29.23} viewBox="0 0 24 24" fill="#FF9D00">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
    SECTION: HERO
   ========================================================================== */

const HeroSection: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <section className="relative h-screen overflow-hidden select-none font-sansation" style={{ marginTop: 0 }}>
      {/* Background elements */}
      <div className="absolute inset-0" style={{ backgroundColor: '#040e1f' }} aria-hidden="true">
        <GalaxyBackground /> 
        <div className="absolute inset-0" style={{ background: 'rgba(4,14,31,0.30)' }} />
        <div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
        />
        <div
          className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
        />
      </div>

      <img src="/esquina-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 pointer-events-none z-10" style={{ width: '40%' }} />
      <img src="/esquina-abajo.svg" aria-hidden="true" className="absolute bottom-0 right-0 pointer-events-none z-0" style={{ width: '40%' }} />
      <img src="/sombra-general.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-[9]" />
      <img src="/sombra-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10" />
      <img src="/sombra-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10" style={{ opacity: 0.5 }} />

      <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-12 lg:px-20 gap-2 md:gap-0 pt-20 md:pt-0 -translate-y-[65px] md:-translate-x-[40px] lg:-translate-x-[80px]">
        
        <div className="order-1 md:order-2 flex flex-col items-center md:items-start text-center md:text-left z-20 w-full md:w-[65%] lg:w-[60%]">
          <h1
            className="text-white uppercase mb-2 md:mb-4"
            style={{
              lineHeight: '1.08',
              textShadow: '0px 4px 7.3px rgba(0,0,0,0.51)',
            }}
          >
            <span className="font-bold md:whitespace-nowrap text-[clamp(2.2rem,4.8vw,4.875rem)]">UN GRAN SITIO WEB,</span>
            <br />
            <span className="md:whitespace-nowrap text-[clamp(1.8rem,3.8vw,4rem)]">HACE IDEAS REALIDAD</span>
          </h1>

          <p
            className="text-white mb-5 md:mb-10"
            style={{
              fontWeight: 400,
              fontSize: 'clamp(0.9rem, 1.8vw, 1.75rem)',
              lineHeight: '1.3',
              textShadow: '0px 4px 8.8px rgba(0,0,0,0.81)',
            }}
          >
            Adquiere tu consulta <span className="font-bold text-[#06CFD6]">GRATIS</span>
          </p>

          <div className="flex flex-col md:flex-row gap-3 md:gap-5 w-full md:w-auto" style={{ maxWidth: '520px' }}>
            <Link
              to="/contacto"
              className="flex items-center justify-center bg-[#06CFD6] rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0px_0px_25px_rgba(6,207,214,0.5)]"
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'clamp(48px, 5vw, 68px)',
                fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
                color: '#fff',
                minWidth: 'clamp(180px, 20vw, 260px)',
              }}
            >
              Conectar
            </Link>
            <Link
              to="/servicios"
              className="flex items-center justify-center bg-white rounded-full font-bold transition-all hover:scale-105 hover:shadow-[0px_0px_25px_rgba(6,207,214,0.5)]"
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'clamp(48px, 5vw, 68px)',
                fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
                color: '#0CA3C6',
                border: '2px solid #0CA3C6',
                minWidth: 'clamp(180px, 20vw, 260px)',
              }}
            >
              Servicios
            </Link>
          </div>
        </div>

        <div className="order-2 md:order-1 flex items-center justify-center md:justify-start w-full md:w-[48%] flex-shrink-0">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
            style={{ width: 'clamp(160px, 38vw, 560px)', height: 'auto' }}
          >
            <motion.img
              src="/astronauta.png"
              alt="Astronauta"
              className="pointer-events-none w-full h-auto"
              animate={{
                scale: isHovered ? 1.05 : 1,
                filter: isHovered
                  ? `drop-shadow(0px 0px 40px rgba(6,207,214,0.30)) brightness(1.1)`
                  : `drop-shadow(0px 25px 50px rgba(0,0,0,0.25)) brightness(1)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />

            <div 
              className="absolute left-[10%] top-[10%] h-[80%] w-[80%] z-20 cursor-crosshair pointer-events-auto"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
};

/* ==========================================================================
    SECTION: SERVICIOS (Desktop & Mobile)
   ========================================================================== */

const ServiciosSection: React.FC = () => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % services.length), 4500);
    return () => clearInterval(t);
  }, []);

  const stackCards = useMemo(() => services.map((svc, i) => (
    <div className="font-sansation" key={i} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        src={svc.img}
        alt={svc.title}
        className="object-cover"
        style={{ objectPosition: 'center 20%', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div className="svc-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />
      <div className="svc-teal-shape" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', bottom: 24, left: 20, right: 60 }}>
        <p style={{ fontWeight: 700, fontSize: '1.5rem', color: '#fff', lineHeight: 1.25, margin: 0 }}>
          {svc.title}
        </p>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.15, marginTop: '8px', whiteSpace: 'pre-line' }}>
          {svc.description}
        </p>
      </div>
      <img src="/isotipo.svg" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: 24, right: 16, width: 25, height: 'auto', pointerEvents: 'none', zIndex: 2 }} />
    </div>
  )), []);

  return (
    <div className="relative font-sansation" style={{ marginTop: '-11%' }}>
      <style>{`
        .svc-card-wrap  { max-width: 85%; }
        .svc-card       { border-radius: 48px; }
        .svc-card-img   { height: clamp(320px, 44vw, 554px); }
        .svc-isotipo    { display: block; }
        .svc-esquina    { display: block; }
        .svc-teal-shape { display: none; }
        @media (max-width: 767px) {
          .svc-card-wrap  { max-width: min(306px, 90vw); margin: 0 auto; }
          .svc-card       { border-radius: 28px; }
          .svc-card-img   { height: 409px; }
          .svc-card-img img.object-cover {
            width: 100% !important;
            height: 100% !important;
            inset: 0 !important;
          }
          .svc-overlay    { background: rgba(0,0,0,0.15) !important; }
          .svc-esquina    { display: none; }
          .svc-text-title { font-size: 1.5rem !important; }
          .svc-text-desc  { font-size: 0.95rem !important; }
          .svc-teal-shape {
            display: block;
            background-image: url('/formaazul.svg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .svc-isotipo {
            display: block !important;
            width: 40px !important;
            height: auto !important;
            bottom: 24px !important;
            right: 16px !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Background shadows */}
      <img src="/sombra-segunda.svg" aria-hidden="true" className="hidden md:block w-full pointer-events-none select-none" />
      <div className="md:hidden absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        <img src="/sombra-segunda.svg" aria-hidden="true" className="w-full h-full object-cover object-top" />
      </div>

      <div className="relative md:absolute md:inset-0 z-10 flex flex-col items-center justify-start px-5 select-none pb-16 md:pb-0 pt-[clamp(2rem,8vw,5rem)] md:pt-[3%]">
        <div style={{ position: 'relative', zIndex: 15, textAlign: 'center' }}>
          <p style={{ color: CYAN, fontSize: 'clamp(2.24rem, 5.6vw, 3.36rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.6rem' }}>
            Haz crecer tu negocio
          </p>
          <p style={{ color: '#ffffff', fontSize: 'clamp(1.4rem, 3.5vw, 2.03rem)', fontWeight: 400, lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Te mereces un sitio web que haga{' '}
            <span style={{ color: CYAN }}>todo lo que necesitas.</span>
          </p>
        </div>

        {/* --- MOBILE: Stack animation --- */}
        <div className="md:hidden" style={{ width: 'min(306px, 90vw)', height: '409px', margin: '0 auto' }}>
          <Stack
            randomRotation={false}
            sensitivity={80}
            sendToBackOnClick={false}
            mobileClickOnly={true}
            autoplay={true}
            autoplayDelay={3000}
            pauseOnHover={false}
            animationConfig={{ stiffness: 260, damping: 22 }}
            cards={stackCards}
          />
        </div>

        {/* --- DESKTOP: Slide carousel --- */}
        <div className="svc-card-wrap w-full hidden md:block mt-[23px]">
          <div className="svc-card" style={{ overflow: 'hidden', position: 'relative', zIndex: 10, boxShadow: '0px 4px 20.4px 9px rgba(0,0,0,0.22)' }}>
            <div className="svc-card-img" style={{ position: 'relative' }}>
              <AnimatePresence>
                <motion.img
                  key={slide}
                  src={services[slide].img}
                  alt={services[slide].title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%', position: 'absolute', inset: 0 }}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              <div className="svc-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={`text-${slide}`}
                  style={{ position: 'absolute', bottom: 'clamp(24px, 4vw, 60px)', left: 'clamp(20px, 4vw, 60px)', right: 'clamp(60px, 12vw, 150px)' }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                >
                  <p className="svc-text-title" style={{ fontWeight: 700, fontSize: 'clamp(1.4rem, 3.2vw, 3.8rem)', color: '#fff', lineHeight: 1.25, margin: 0 }}>
                    {services[slide].title}
                  </p>
                  <p className="svc-text-desc" style={{ fontSize: 'clamp(0.9rem, 2vw, 2.5rem)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.15, marginTop: '8px', whiteSpace: 'pre-line' }}>
                    {services[slide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
              <img className="svc-esquina" src="/esquina-derecha.svg" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none' }} />
              <img className="svc-isotipo" src="/isotipo.svg" alt="" aria-hidden="true" style={{ position: 'absolute', bottom: '5%', right: '2%', width: 'clamp(25px, 4vw, 50px)', height: 'auto', pointerEvents: 'none', zIndex: 2 }} />
            </div>
          </div>
          <div className="flex justify-center mt-8 gap-4 items-center" style={{ position: 'relative', zIndex: 20 }}>
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  height: '11px',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                  width: slide === i ? '72px' : '24px',
                  background: '#9ca3af',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'block',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
    SECTION: WHITE ORGANIC BACKGROUND (Ondas)
   ========================================================================== */

const WhiteOrganicBackground: React.FC = () => (
  <>
    <style>{`
      .organic-bg-wrapper {
        position: relative;
        margin-top: clamp(-30rem, -50vw, -70rem);
        height: 0;
        overflow: visible;
        z-index: 8;
        pointer-events: none;
      }
      @media (max-width: 767px) {
        .organic-bg-wrapper {
          margin-top: 6rem;
        }
      }
    `}</style>
    
    {/* MOBILE: FULL SVG (Original behavior) */}
    <div aria-hidden="true" className="organic-bg-wrapper md:hidden">
      <svg
        viewBox="0 0 1440 700.2353"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', overflow: 'visible' }}
      >
        <defs>
          <clipPath id="segblanca-clip-mobile">
            <rect width="1440" height="700.2353" />
          </clipPath>
          <linearGradient id="blob-f1-grad-mobile" x1="-40" y1="634" x2="744" y2="634" gradientUnits="userSpaceOnUse">
            <stop offset="0.3125" stopColor="#0CA3C6" />
            <stop offset="1" stopColor="#026B9B" />
          </linearGradient>
        </defs>
        
        <rect className="md:hidden" x="-1000" y="-1430" width="3440" height="1800" fill="#ffffff" />

        <g clipPath="url(#segblanca-clip-mobile)">
          <path fill="url(#blob-f1-grad-mobile)" d="M -40.31 574.16 C 52.86 492.49 340.09 378.16 743.69 574.16 C 340.09 438.16 52.86 612.49 -40.31 694.16 Z" />
        </g>
        <g>
          <path fill="#026B9B" d="
            M 743.6898 574.1586
            C 1147.2898 770.1586 1396.1896 655.8253 1470.1896 574.1586
            L 1470.1896 760.1586
            C 1200 740 950 700 743.6898 560
            Z
          "/>
        </g>
        <g clipPath="url(#segblanca-clip-mobile)">
          <path fill="#fff" d="m743.6898,574.1586c-403.6-196-690.8334-81.6665-784.0001,0v-205.0007S-192.8104,10.1581,654.1897,10.1581c627.5.0002,815.9999,220.0007,815.9999,220.0007v343.9998c-74,81.6667-322.8998,196-726.4998,0Z" />
        </g>
      </svg>
    </div>

    {/* DESKTOP: REDUCED SVG (-10% from 820px) */}
    <div aria-hidden="true" className="organic-bg-wrapper hidden md:block">
      <svg
        viewBox="0 0 1440 738.2353"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', overflow: 'visible' }}
      >
        <defs>
          <clipPath id="segblanca-clip-desktop">
            <rect width="1440" height="738.2353" />
          </clipPath>
          <linearGradient id="blob-f1-grad-desktop" x1="-40" y1="672" x2="744" y2="672" gradientUnits="userSpaceOnUse">
            <stop offset="0.3125" stopColor="#0CA3C6" />
            <stop offset="1" stopColor="#026B9B" />
          </linearGradient>
        </defs>

        <g clipPath="url(#segblanca-clip-desktop)">
          {/* Desplazado -82px en Y */}
          <path fill="url(#blob-f1-grad-desktop)" d="M -40.31 612.16 C 52.86 530.49 340.09 416.16 743.69 612.16 C 340.09 476.16 52.86 650.49 -40.31 732.16 Z" />
        </g>
        <g>
          {/* Desplazado -82px en Y */}
          <path fill="#026B9B" d="
            M 743.6898 612.1586
            C 1147.2898 808.1586 1396.1896 693.8253 1470.1896 612.1586
            L 1470.1896 798.1586
            C 1200 778 950 738 743.6898 598
            Z
          "/>
        </g>
        <g clipPath="url(#segblanca-clip-desktop)">
          {/* Top intacto, base desplazada -82px */}
          <path fill="#fff" d="m743.6898,612.1586c-403.6-196-690.8334-81.6665-784.0001,0v-243.0007S-192.8104,10.1581,654.1897,10.1581c627.5.0002,815.9999,220.0007,815.9999,220.0007v381.9998c-74,81.6667-322.8998,196-726.4998,0Z" />
        </g>
      </svg>
    </div>
  </>
);

/* ==========================================================================
    SECTION: HERramientas (Logos Marquee)
   ========================================================================== */

const HerramientasSection: React.FC = () => (
  <section className="px-6 herramientas-sec pb-12 md:pb-12 font-sansation" style={{ position: 'relative', zIndex: 22 }}>
    <style>{`
      .herramientas-sec { margin-top: -3rem; padding-top: 0; }
      @media (min-width: 768px) { 
        .herramientas-sec { 
          margin-top: clamp(5rem, 11vw, 15rem);
          padding-top: clamp(2rem, 6vw, 6rem);
        } 
      }
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
    
    <div className="w-full md:w-[85%] mx-auto flex flex-col items-center">
      {/* Mobile exact group */}
      <div className="md:hidden relative w-[358px] flex items-center justify-center mb-8">
        <div className="absolute left-0 w-[93px]" style={{ height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
        <h2
          className="w-[178px]"
          style={{ fontStyle: 'normal', fontWeight: 700, fontSize: '24px', lineHeight: '27px', textAlign: 'center', color: '#3C3C3B', flexShrink: 0, zIndex: 1 }}
        >
          Nuestras Herramientas
        </h2>
        <div className="absolute right-0 w-[93px]" style={{ height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
      </div>

      {/* Desktop fluid group */}
      <div className="hidden md:flex items-center gap-3 mb-16 w-full">
        <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
        <h2
          style={{ fontWeight: 700, fontSize: 'clamp(1.2rem, 3.5vw, 2.5rem)', lineHeight: 1.2, textAlign: 'center', color: '#3C3C3B', flexShrink: 0, padding: '0 0.5rem' }}
        >
          Nuestras Herramientas
        </h2>
        <div style={{ flex: 1, height: 0, border: '2px solid rgba(60, 60, 59, 0.69)' }} />
      </div>
    </div>

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
        {[0, 1, 2, 3].map(copy => (
          <React.Fragment key={copy}>
            <img src="/logos/laravel.svg" alt={copy === 0 ? 'Laravel' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(28px, 4.7vw, 54px)', width: 'auto', filter: 'grayscale(100%)' }} />
            <img src="/logos/github.svg" alt={copy === 0 ? 'GitHub' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(30px, 4.9vw, 56px)', width: 'auto', filter: 'grayscale(100%)' }} />
            <img src="/logos/php.svg" alt={copy === 0 ? 'PHP' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(36px, 6.6vw, 76px)', width: 'auto', filter: 'grayscale(100%)' }} />
            <img src="/logos/JAVA.svg" alt={copy === 0 ? 'Java' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(40px, 7.5vw, 86px)', width: 'auto', filter: 'grayscale(100%)' }} />
            <img src="/logos/mongodb.svg" alt={copy === 0 ? 'MongoDB' : ''} aria-hidden={copy !== 0} style={{ height: 'clamp(44px, 8vw, 92px)', width: 'auto', filter: 'grayscale(100%)' }} />
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

/* ==========================================================================
    SECTION: IA (Inteligencia Artificial)
   ========================================================================== */

const IASection: React.FC = () => (
  <section
    className="relative"
    style={{ minHeight: '800px', paddingBottom: '2rem', overflowX: 'hidden' }}
  >
    <style>{`
      .chica-wrap { width: 258px; height: 453px; }
      .chica-circle { left: -20.65% !important; }
      @media (min-width: 768px) {
        .chica-circle { left: -29.2% !important; }
        .chica-wrap { width: clamp(140px, 38vw, 346px); height: clamp(240px, 65vw, 613px); }
      }
    `}</style>

    <div className="md:hidden absolute left-0 right-0" style={{ top: 258, bottom: 258, background: '#ffffff', zIndex: 0 }} />
    
    <div className="relative z-10 flex flex-col md:flex-row items-end justify-between px-6 md:px-0 md:pr-[24px] pt-8 md:pt-16 pb-8 w-full md:w-[85%] mx-auto gap-8 md:gap-0">
      <div className="w-full md:w-auto flex justify-center order-1 md:order-2 md:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="chica-wrap relative flex-shrink-0"
          style={{ zIndex: 10, overflow: 'hidden', borderRadius: '48px', boxShadow: '0px 4px 7.8px rgba(0,0,0,0.42)' }}
        >
          <div className="absolute inset-0">
            <img src="/fondochica.png" alt="" aria-hidden="true" className="absolute inset-0 rounded-[48px] w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
          </div>
        </motion.div>
        <img src="/chica.png" alt="Mujer con estética de inteligencia artificial" style={{ position: 'absolute',
                bottom: 0, width: 'auto', height: '78%', maxWidth: 'none', transform: 'translate(-7.5%, -5.8%)', 
                transformOrigin: 'center bottom', zIndex: 10, pointerEvents: 'none', borderRadius: '48px' }} />  
      </div>

      <div className="w-full md:flex-1 flex flex-col gap-3 text-center md:text-left items-center md:items-start order-2 md:order-1 mb-auto md:mt-auto z-20 md:pr-4">
        <h2 className="leading-[27px] md:leading-[1]" style={{ fontWeight: 700, fontSize: 'clamp(24px, 3vw, 2.5rem)', color: CYAN, maxWidth: 450 }}>
          Comenzar nunca ha sido<br />tan fácil gracias a la IA
        </h2>
        <p className="text-black md:text-white leading-[18px] md:leading-relaxed" style={{ fontWeight: 400, fontSize: 'clamp(16px, 1.8vw, 1.5rem)', maxWidth: 450 }}>
          No hace falta tener experiencia.
        </p>
        <p className="text-black md:text-white leading-[11px] md:leading-normal" style={{ fontWeight: 300, fontSize: 'clamp(10px, 1.2vw, 1rem)', maxWidth: 450 }}>
          Kit de diseño con IA, uno de los mejores<br />inventos de TIME de 2025*
        </p>
      </div>

      <div className="w-full md:w-auto flex justify-center order-3 md:order-3">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative flex-shrink-0 block"
          style={{ width: 'clamp(266px, 64vw, 346px)', height: 'clamp(461px, 112vw, 613px)', borderRadius: '48px', boxShadow: '0px 4px 27.8px rgba(0,0,0,0.9)', overflow: 'hidden', zIndex: 11 }}
        >
          <img src="/hombre.png" alt="Tecnología" className="absolute w-full h-full object-cover object-top" />
        </motion.div>
      </div>
    </div>
  </section>
);

/* ==========================================================================
    SECTION: TESTIMONIALS (3D Carousel)
   ========================================================================== */

const TestimonialsSection: React.FC = () => {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % testimonials.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden font-sansation">
      <style>{`
        .testim-outer { width: 316px; height: 310px; }
        .testim-group { margin-left: -48px; transform-origin: top left; }
        @media (min-width: 768px) {
          .testim-outer { width: 608px; height: 496px; }
          .testim-group { margin-left: 0; transform: scale(1.6); }
        }
      `}</style>

      <div className="hidden md:block" style={{ width: '86.6%', margin: '0 auto', borderTop: '1px solid #FFFFFF', marginBottom: '6rem' }} />

      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between md:pl-0 md:pr-0 py-10 md:py-0 w-full relative gap-10 md:gap-0" style={{ zIndex: 1, minHeight: 'clamp(500px, 60vw, 400px)' }}>

        <div className="w-full md:w-[32%] flex flex-col items-center justify-center md:items-end order-1 md:order-2 text-center md:text-right relative z-20 md:ml-auto px-6 md:px-0 md:pr-[6.7%]">
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(34px, 4.5vw, 68px)', lineHeight: 1.15, color: '#FFFFFF', marginBottom: '1.2rem' }}>
            CONSTRUYENDO EL FUTURO,{' '}
            <span style={{ color: CYAN }}>CASO POR CASO</span>
          </h2>
          <p style={{ fontWeight: 400, fontSize: 'clamp(16px, 1.9vw, 26px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
            Testimonios veraces de nuestros primeros usuarios piloto que ya están transformando sus industrias.
          </p>

          <img src="/grafico-derecha.svg" alt="" aria-hidden="true"
            className="hidden md:block absolute" style={{ width: 'clamp(200px, 35vw, 800px)', height: 'auto', opacity: 0.7, top: '50%', right: 0, transform: 'translateY(-50%)', zIndex: -1 }} />
        </div>

        <div className="w-full md:w-7/12 order-2 md:order-1 flex justify-center" style={{ position: 'relative', zIndex: 2 }}>
          <div className="testim-outer" style={{ position: 'relative', flexShrink: 0 }}>
            <div className="testim-group" style={{ position: 'relative', width: 380, height: 310, overflow: 'visible' }}>
              {testimonials.map((t, i) => {
                const slot = ((i - activeCard + testimonials.length) % testimonials.length) as 0 | 1 | 2;
                return <TestimonialCard key={i} slot={slot} name={t.name} role={t.role} text={t.text} stars={t.stars} />;
              })}
            </div>
          </div>
        </div>

      </div>

      <div className="hidden md:block" style={{ width: '86.6%', margin: '6rem auto 0'}} />
    </section>
  );
};

/* ==========================================================================
    PAGE: HOME (Main Orchestrator)
   ========================================================================== */

const Home: React.FC = () => {
  return (
    <div className="overflow-x-hidden font-sansation">
      <SEO 
        title="Inicio" 
        description="Bytecode es tu socio tecnológico experto en desarrollo de software, aplicaciones móviles y transformación digital."
      />

      {/* Structured Data (JSON-LD) for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Bytecode",
          "url": "https://tu-dominio.com",
          "logo": "https://tu-dominio.com/designs/mini_logo.svg",
          "description": "Expertos en desarrollo de software y transformación digital.",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "PE"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "areaServed": "Global",
            "availableLanguage": ["Spanish", "English"]
          }
        })}
      </script>

      <HeroSection />
      <ServiciosSection />
      <WhiteOrganicBackground />
      <HerramientasSection />

      {/* SECCIONES CON FONDO COMPARTIDO (IA, Testimonials, CTA) */}
      <div className="relative" style={{ zIndex: 22, marginTop: 'clamp(3rem, 8vw, 8rem)' }}>
        <IASection />
        <TestimonialsSection />
      </div>
    </div>
  );
};

export default Home;