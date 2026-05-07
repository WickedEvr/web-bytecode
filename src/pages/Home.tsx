import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/shared/SEO';
import Stack from '../components/sections/Stack';
import GalaxyBackground from '../components/effects/GalaxyBackground';
import './Home.css';

/* ==========================================================================
    CONFIGURACIÓN Y DATOS ESTÁTICOS
   ========================================================================== */

const HERO_ACTION_LINK_BASE =
  'flex h-[clamp(42px,4.5vw,60px)] w-full min-w-[clamp(180px,20vw,260px)] max-w-full items-center justify-center rounded-full text-[clamp(1.15rem,5vw,1.45rem)] font-bold transition-all md:w-auto md:text-[clamp(1.3rem,2vw,1.7rem)] lg:h-[clamp(48px,5vw,68px)] lg:hover:scale-105 lg:hover:shadow-[0px_0px_25px_rgba(6,207,214,0.5)]'

const HERO_BOTTOM_CORNER_POSITION =
  'right-1.5 md:right-3 lg:right-[6%] xl:right-4 2xl:-right-31';

const HERO_CORNER_SIZE = 'w-[48%] sm:w-[42%] md:w-[40%] xl:w-[36%] 2xl:w-[34%]';

const TESTIMONIAL_CARD_BASE =
  'absolute left-0 top-0 h-[305.14px] w-[189.51px] origin-top-left font-sansation drop-shadow-[0px_3px_8px_rgba(178,250,255,0.75)]';

const TESTIMONIAL_CARD_SLOTS = [
  { x: 111.08, y: 0, scale: 1, opacity: 1, zIndex: 3 },
  { x: 223, y: 42.06, scale: 0.736, opacity: 0.54, zIndex: 1 },
  { x: 50, y: 42.06, scale: 0.736, opacity: 0.54, zIndex: 1 },
] as const;

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
    img: '/images/showcase/DesktopApp.webp',
  },
];

const testimonials = [
  { name: 'María García', role: 'Emprendedora', text: 'Excelente servicio, mi negocio creció enormemente. Totalmente conforme.', stars: 5, img: '/images/avatars/cliente2senito.webp' },
  { name: 'Dante Gallardo', role: 'CEO', text: 'Muy bueno con el trabajo! Totalmente conforme.', stars: 5, img: '/images/avatars/cliente3.webp' },
  { name: 'Carlos Ruiz', role: 'Director', text: 'Profesionales de primer nivel, los recomiendo.', stars: 5, img: '/images/avatars/cliente1.webp' },
];

/* ==========================================================================
    COMPONENTES DE APOYO (HELPERS)
   ========================================================================== */

const TestimonialCard: React.FC<{ name: string; role: string; text: string; stars: number; slot: 0 | 1 | 2; img?: string }> = ({
  name, role, text, stars, slot, img
}) => {
  return (
    <motion.div
      className={TESTIMONIAL_CARD_BASE}
      initial={false}
      animate={TESTIMONIAL_CARD_SLOTS[slot]}
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[37px] border-4 border-white bg-white/[0.13] backdrop-blur-[9.85px]">
        <div className="relative h-[76px] bg-[rgba(0,15,35,0.45)]">
          <div className="absolute bottom-[-44.43px] left-1/2 z-[2] h-[88.86px] w-[88.86px] -translate-x-1/2 overflow-hidden rounded-full border-[6px] border-[#06CFD6] bg-[linear-gradient(135deg,#1a3a5c_0%,#0d1f33_100%)] drop-shadow-[0px_0px_7px_rgba(255,255,255,0.95)]">
            {img && <img src={img} alt={name} className="h-full w-full object-cover" />}
          </div>
        </div>

        <div aria-hidden="true" className="absolute left-0 top-[76px] h-[72px] w-full bg-[rgba(0,15,35,0.45)]" />
        <div className="relative flex h-[229px] flex-col items-center overflow-hidden [border-radius:177px_177px_37px_37px] bg-white px-[14px] pb-4 pt-[54px] text-center shadow-[0px_-3px_8px_rgba(135,247,255,0.62)]">
          <p className="mb-px text-base font-bold leading-[1.2] text-[#06CFD6]">{name}</p>
          <p className="mb-1 text-[10px] font-normal leading-[1.2] text-[#06CFD6]">{role}</p>
          <p className="mb-2 flex-1 text-[11px] leading-[1.4] text-black">{text}</p>
          <div className="mb-3 flex gap-[3px]">
            {Array.from({ length: stars }).map((_, i) => (
              <svg key={i} width={25.5} height={25.5} viewBox="0 0 24 24" fill="#FF9D00">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ==========================================================================
    SECTION: HERO
   ========================================================================== */

const HeroActionLink: React.FC<{
  to: string;
  variant: 'cyan' | 'white';
  children: React.ReactNode;
}> = ({ to, variant, children }) => (
  <Link
    to={to}
      className={`${HERO_ACTION_LINK_BASE} ${
      variant === 'cyan'
        ? 'bg-[#06CFD6] text-white'
        : 'border-2 border-[#0CA3C6] bg-white text-[#0CA3C6]'
    }`}
  >
    {children}
  </Link>
);

const HeroSection: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [supportsHover, setSupportsHover] = React.useState(false);

  React.useEffect(() => {
    const hoverQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const updateHoverSupport = () => {
      setSupportsHover(hoverQuery.matches);
      if (!hoverQuery.matches) setIsHovered(false);
    };

    updateHoverSupport();
    hoverQuery.addEventListener('change', updateHoverSupport);
    return () => hoverQuery.removeEventListener('change', updateHoverSupport);
  }, []);
  
  return (
    <section className="relative min-h-[88svh] overflow-hidden select-none font-sansation lg:min-h-screen">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#040e1f]" aria-hidden="true">
        <GalaxyBackground />
        <div className="absolute inset-0 bg-[#040e1f]/30" />
        <div className="absolute inset-0 bg-[url('/vectors/designs/stardust.png')] opacity-70 mix-blend-screen" />
        <div className="absolute inset-0 rotate-180 bg-[url('/vectors/designs/stardust.png')] opacity-50 mix-blend-screen" />
      </div>

      <img src="/vectors/shapes/esquina-arriba.svg" aria-hidden="true" className={`absolute left-0 top-0 z-10 pointer-events-none hidden lg:block ${HERO_CORNER_SIZE}`} />
      <img src="/vectors/shapes/esquina-abajo.svg" aria-hidden="true" className={`absolute bottom-0 z-0 pointer-events-none hidden lg:block ${HERO_CORNER_SIZE} ${HERO_BOTTOM_CORNER_POSITION}`} />
      <img src="/vectors/shadows/sombra-general.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-[9]" />
      <img src="/vectors/shadows/sombra-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10" />
      <img src="/vectors/shadows/sombra-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10 opacity-50" />

      <div className="relative z-10 mx-auto flex min-h-[88svh] w-full max-w-[1440px] flex-col items-center justify-center gap-6 px-6 pb-10 pt-20 md:gap-4 md:px-10 md:pt-24 lg:min-h-screen lg:flex-row lg:justify-between lg:gap-0 lg:px-14 lg:pb-0 lg:pt-[144px] lg:-translate-x-[40px] lg:-translate-y-[92px] xl:px-20 xl:-translate-x-[80px] xl:-translate-y-[112px]">
        
        <div className="order-1 flex w-full max-w-[720px] flex-col items-center text-center z-20 lg:order-2 lg:w-[60%] lg:max-w-none lg:items-start lg:text-left">
          <h1
            className="mb-2 text-white uppercase leading-[1.08] [text-shadow:0px_4px_7.3px_rgba(0,0,0,0.51)] md:mb-4 whitespace-nowrap"
          >
            <span className="font-bold lg:whitespace-nowrap text-[clamp(3rem,13.5vw,5rem)] lg:text-[clamp(2.2rem,4.8vw,4.875rem)] block lg:inline">UN GRAN</span>
            <span className="font-bold lg:hidden text-[clamp(2.75rem,12.8vw,4.6rem)] block">SITIO WEB</span>
            <span className="hidden lg:inline font-bold lg:whitespace-nowrap text-[clamp(2.2rem,4.8vw,4.875rem)]"> SITIO WEB,</span>
            <br className="hidden lg:block" />
            <span className="lg:whitespace-nowrap text-[clamp(1rem,5.5vw,1.8rem)] lg:text-[clamp(1.8rem,3.8vw,4rem)]">HACE IDEAS REALIDAD</span>
          </h1>

          <p className="mb-5 text-[clamp(0.9rem,1.8vw,1.75rem)] font-normal leading-[1.3] text-white [text-shadow:0_0_8px_rgba(6,207,214,0.8)] md:mb-10 md:text-[1.5rem]">
            Adquiere tu consulta <span className="font-bold text-[#06CFD6]">GRATIS</span>
          </p>

          <div className="flex w-full max-w-[520px] flex-col gap-3 md:w-auto md:flex-row md:gap-5">
            <HeroActionLink to="/contacto" variant="cyan" >Conectar</HeroActionLink>
            <HeroActionLink to="/servicios" variant="white">Servicios</HeroActionLink>
          </div>
        </div>

        <div className="order-2 flex w-full flex-shrink-0 items-center justify-center lg:order-1 lg:w-[48%] lg:justify-start">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-[clamp(160px,38vw,360px)] -translate-y-3 md:-translate-y-5 lg:translate-y-0 lg:w-[clamp(260px,34vw,500px)] xl:w-[clamp(360px,38vw,560px)]"
          >
            <motion.img
              src="/images/characters/astronauta.png"
              alt="Astronauta"
              className="pointer-events-none w-full h-auto"
              initial={{ filter: "drop-shadow(0px 25px 50px #00000040) brightness(1)" }}
              animate={{
                scale: isHovered ? 1.05 : 1,
                filter: isHovered
                  ? `drop-shadow(0px 0px 40px #06CFD64D) brightness(1.1)`
                  : `drop-shadow(0px 25px 50px #00000040) brightness(1)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />

            {supportsHover && (
              <div
                className="absolute left-[10%] top-[10%] h-[80%] w-[80%] z-20 cursor-crosshair pointer-events-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
};

/* ==========================================================================
    SECTION: SERVICIOS
   ========================================================================== */

const ServiciosSection: React.FC = () => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % services.length), 4500);
    return () => clearInterval(t);
  }, []);

  const stackCards = useMemo(() => services.map(svc => (
    <div className="relative h-full w-full font-sansation">
      <img
        src={svc.img}
        alt={svc.title}
        className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
      />
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-0 bg-[url('/vectors/shapes/formaazul.svg')] bg-cover bg-center bg-no-repeat lg:hidden" />
      <div className="absolute bottom-6 left-5 right-[60px]">
        <p className="m-0 text-2xl font-bold leading-tight text-white">
          {svc.title}
        </p>
        <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-[1.15] text-white/90">
          {svc.description}
        </p>
      </div>
      <img
        src="/vectors/logos/isotipo.svg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-6 right-4 z-[2] w-10 pointer-events-none"
      />
    </div>
  )), []);

  return (
    <div className="relative -mt-[18%] font-sansation md:-mt-[15%] lg:-mt-[11%] lg:max-xl:-mt-[16%] xl:max-2xl:-mt-[13%]">
      <div className="absolute inset-0 z-0 overflow-hidden rounded-t-[10%] pointer-events-none select-none md:relative md:inset-auto lg:rounded-none">
        <img src="/vectors/shadows/sombra-segunda.svg" aria-hidden="true" className="h-full w-full object-cover object-top md:h-auto md:object-contain" />
      </div>

      <div className="relative z-[60] flex flex-col items-center justify-start px-5 select-none pb-16 pt-[clamp(1rem,5vw,3rem)] md:absolute md:inset-0 md:pb-0 md:pt-[3%]">
        <div className="relative z-[15] text-center">
          <p className="mb-1 text-[clamp(1.65rem,4.4vw,2.25rem)] font-extrabold leading-[1.2] text-[#0CA3C6] md:mb-[0.6rem] md:text-[clamp(2.24rem,5.6vw,3.36rem)]">
            Haz crecer tu negocio
          </p>
          <p className="mb-6 text-[clamp(1.15rem,3.1vw,1.55rem)] font-normal leading-normal text-white md:text-[clamp(1.4rem,3.5vw,2.03rem)]">
            Te mereces un sitio web que haga{' '}
            <span className="text-[#0CA3C6]">todo lo que necesitas.</span>
          </p>
        </div>

        <div className="relative z-[60] mt-0 w-full max-w-[min(306px,90vw)] md:-mt-2 md:max-w-[420px] lg:mt-[23px] lg:max-w-[85%]">
          <div className="relative z-[60] h-[409px] md:h-[475px] lg:hidden">
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

          <div className="relative z-[60] hidden overflow-hidden rounded-[28px] shadow-[0px_4px_20.4px_9px_rgba(0,0,0,0.22)] lg:block lg:rounded-[48px]">
            <div className="relative h-[409px] lg:h-[clamp(320px,44vw,554px)]">
              <AnimatePresence>
                <motion.img
                  key={slide}
                  src={services[slide].img}
                  alt={services[slide].title}
                  className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/15 lg:bg-black/28" />
              <div className="absolute inset-0 bg-[url('/vectors/shapes/formaazul.svg')] bg-cover bg-center bg-no-repeat lg:hidden" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={`text-${slide}`}
                  className="absolute bottom-6 left-5 right-[60px] md:bottom-[clamp(24px,4vw,60px)] md:left-[clamp(20px,4vw,60px)] md:right-[clamp(60px,12vw,150px)]"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                >
                  <p className="m-0 text-2xl font-bold leading-tight text-white md:text-[clamp(1.4rem,3.2vw,3.8rem)]">
                    {services[slide].title}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-[1.15] text-white/90 md:text-[clamp(0.9rem,2vw,2.5rem)]">
                    {services[slide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
              <img className="absolute bottom-0 right-0 hidden pointer-events-none lg:block" src="/vectors/shapes/esquina-derecha.svg" alt="" aria-hidden="true" />
              <img className="absolute bottom-6 right-4 z-[2] w-10 pointer-events-none md:bottom-[5%] md:right-[2%] md:w-[clamp(25px,4vw,50px)]" src="/vectors/logos/isotipo.svg" alt="" aria-hidden="true" />
            </div>
          </div>
          <div className="relative z-20 mt-8 hidden items-center justify-center gap-4 lg:flex">
            {services.map((_, i) => (
              <div
                key={i}
                className={`block h-[11px] rounded-full bg-gray-400 transition-[width,background-color] duration-300 ${
                  slide === i ? 'w-[72px]' : 'w-6'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
    SECTION: HERramientas (Logos Marquee)
   ========================================================================== */

const HerramientasSection: React.FC = () => (
  <section className="relative z-[40] -mt-[11rem] h-[30rem] overflow-visible px-6 pb-12 pt-0 font-sansation md:-mt-[10rem] md:h-[25rem] md:max-lg:!mt-[14rem] lg:-mt-[13rem] lg:h-[25rem] lg:max-[1339px]:!mt-[16rem] xl:-mt-[20rem] xl:h-[25rem] 2xl:-mt-36 2xl:h-[25rem]">
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-10rem] hidden h-[28rem] w-screen -translate-x-1/2 bg-white max-md:block" />

    <img
      src="/vectors/designs/formablancagrande.svg"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-[5.6rem] w-full max-w-none origin-top select-none md:top-[-13rem] md:w-[110%] md:scale-y-[0.9] lg:top-[-12rem] lg:w-[120%] lg:scale-y-[0.78] min-[1200px]:max-[1339px]:top-[-10rem] min-[1200px]:max-[1339px]:!scale-y-[0.82] xl:top-[-21rem] xl:w-full xl:scale-y-[0.72] 2xl:top-[-31.2rem]"
    />

    <div className="relative z-10 mx-auto flex w-full flex-col items-center pt-[8.5rem] md:w-[85%] md:pt-0 md:-mt-[3.5rem] md:max-lg:mt-[1rem] lg:-mt-[6rem] min-[1200px]:max-[1339px]:mt-[30rem] xl:-mt-[7rem] 2xl:-mt-[10rem]">
      <div className="mb-8 flex w-full max-w-[358px] items-center justify-center gap-0 md:mb-12 md:max-w-none md:gap-3 lg:mb-10">
        <div className="h-0 flex-1 border-t-2 border-[rgba(60,60,59,0.69)]" />
        <h2
          className="w-[178px] shrink-0 px-2 text-center text-2xl font-bold leading-[27px] text-[#3C3C3B] md:w-auto md:text-[clamp(1.2rem,3.5vw,2.5rem)] md:leading-[1.2]"
        >
          Nuestras Herramientas
        </h2>
        <div className="h-0 flex-1 border-t-2 border-[rgba(60,60,59,0.69)]" />
      </div>

      <div className="relative mx-auto w-[90vw] overflow-hidden opacity-80 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
        <div className="flex w-max flex-nowrap items-center animate-[marquee-scroll_18s_linear_infinite]">
          {[0, 1, 2, 3].map(copy => (
            <React.Fragment key={copy}>
              <img src="/vectors/logos/brands/laravel.svg" alt={copy === 0 ? 'Laravel' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(28px,4.7vw,54px)] w-auto shrink-0 grayscale" />
              <img src="/vectors/logos/brands/github.svg" alt={copy === 0 ? 'GitHub' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(30px,4.9vw,56px)] w-auto shrink-0 grayscale" />
              <img src="/vectors/logos/brands/php.svg" alt={copy === 0 ? 'PHP' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(36px,6.6vw,76px)] w-auto shrink-0 grayscale" />
              <img src="/vectors/logos/brands/JAVA.svg" alt={copy === 0 ? 'Java' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(40px,7.5vw,86px)] w-auto shrink-0 grayscale" />
              <img src="/vectors/logos/brands/mongodb.svg" alt={copy === 0 ? 'MongoDB' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(44px,8vw,92px)] w-auto shrink-0 grayscale" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ==========================================================================
    SECTION: IA (Inteligencia Artificial)
   ========================================================================== */

const IASection: React.FC = () => (
  <section className="relative z-[60] -mt-60 min-h-[800px] overflow-x-hidden pb-8 md:mt-0 md:min-h-[1240px] md:overflow-visible lg:min-h-[680px] xl:min-h-[660px] 2xl:min-h-[800px]">
    <div className="absolute bottom-[258px] left-0 right-0 top-[258px] z-0 bg-white md:hidden" />
    
    <div className="relative z-10 flex flex-col items-center justify-between px-6 pt-8 pb-8 w-full md:w-[85%] md:px-0 md:pt-10 md:gap-10 lg:-mt-12 lg:flex-row lg:items-end lg:gap-0 lg:pt-0 lg:pr-[17px] xl:-mt-35 2xl:-mt-24 mx-auto gap-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[clamp(-20px,1.5vw,0px)] left-[72%] z-[1] hidden h-[clamp(164px,18vw,237px)] w-[clamp(228px,25vw,329px)] -translate-x-1/2 rounded-[59px] bg-white lg:block xl:h-[176px] xl:w-[244px] 2xl:h-[clamp(164px,18vw,237px)] 2xl:w-[clamp(228px,25vw,329px)]"
      />

      <div className="relative order-1 mt-15 flex w-full justify-center md:mt-0 lg:order-2 lg:w-auto lg:px-8 2xl:-mr-62 2xl:px-2">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-10 z-0 h-[118px] w-[256px] -translate-x-[66%] rounded-[60px] bg-white md:h-[156px] md:w-[338px] md:rounded-[78px] lg:top-[clamp(84px,6.4vw,60px)] lg:h-[clamp(69px,18.8vw,177px)] lg:w-[clamp(154px,41.9vw,382px)] lg:-translate-x-[65%] lg:rounded-[90px] xl:h-[122px] xl:w-[264px] 2xl:h-[clamp(69px,18.8vw,177px)] 2xl:w-[clamp(154px,41.9vw,382px)]"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 h-[408px] w-[232px] flex-shrink-0 rounded-[48px] shadow-[0px_4px_7.8px_rgba(0,0,0,0.42)] md:h-[500px] md:w-[284px] lg:h-[clamp(240px,45vw,520px)] lg:w-[clamp(140px,26vw,294px)] xl:h-[460px] xl:w-[260px] 2xl:h-[clamp(240px,65vw,613px)] 2xl:w-[clamp(140px,38vw,346px)]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-[48px]">
            <img src="/images/characters/fondochica.webp" alt="" aria-hidden="true" className="absolute inset-0 rounded-[48px] w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/[0.22]" />
          </div>
          <img
            src="/images/characters/chica.png"
            alt="Mujer con estética de inteligencia artificial"
            className="absolute bottom-0 right-0 z-10 h-[96%] w-auto max-w-none origin-bottom-right rounded-[48px] pointer-events-none md:h-[90%]"
          />
        </motion.div>
      </div>

      <div className="order-2 z-20 mb-auto flex w-full max-w-[520px] flex-col items-center gap-3 text-center lg:order-1 lg:my-auto lg:flex-1 lg:items-start lg:pr-4 lg:text-left xl:translate-y-25 2xl:translate-x-[160px]" >
        <h2 className="max-w-[450px] text-[clamp(24px,3vw,2.5rem)] font-bold leading-[27px] text-[#0CA3C6] md:leading-[1] md:text-[2rem] 2xl:text-[3.3rem]">
          Lanzar tu proyecto nunca fue tan fácil
        </h2>
        <p className="max-w-[450px] text-[clamp(16px,1.8vw,1.5rem)] font-normal leading-[18px] text-black md:leading-relaxed md:text-white md:text-[1.5rem] 2xl:text-[1.7rem]">
          Nosotros nos encargamos de todo.
        </p>
        <p className="max-w-[450px] text-[clamp(10px,1.2vw,1rem)] font-light leading-[11px] text-black md:leading-normal md:text-white md:text-[1.2rem] 2xl:text-[1.2rem]">
          Sistemas desarrollados desde cero<br />Código nativo, sin plantillas ni atajos
        </p>
      </div>

      <div className="relative order-3 flex w-full justify-center lg:w-auto">
        <div
          aria-hidden="true"
          className="absolute bottom-[-22px] left-1/2 z-0 h-[172px] w-[165px] translate-x-[-10%] rounded-[20px] bg-white md:h-[212px] md:w-[204px] md:rounded-[28px] lg:bottom-[clamp(50px,-3.5vw,-13px)] lg:h-[clamp(101px,27.4vw,259px)] lg:w-[clamp(100px,27vw,246px)] lg:rounded-[30px] xl:h-[182px] xl:w-[172px] 2xl:h-[clamp(101px,27.4vw,259px)] 2xl:w-[clamp(100px,27vw,246px)]"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative z-[11] block h-[408px] w-[232px] flex-shrink-0 overflow-hidden rounded-[48px] shadow-[0px_4px_27.8px_rgba(0,0,0,0.9)] md:h-[500px] md:w-[284px] lg:h-[clamp(240px,45vw,520px)] lg:w-[clamp(140px,26vw,294px)] xl:h-[460px] xl:w-[260px] 2xl:h-[clamp(240px,65vw,613px)] 2xl:w-[clamp(140px,38vw,346px)]"
        >
          <img src="/images/characters/hombre.webp" alt="Tecnología" className="absolute w-full h-full object-cover object-top" />
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
      <div className="mx-auto mb-7 hidden w-[86.6%] border-t border-white md:block lg:mb-10" />

      <div className="relative z-[1] flex min-h-[clamp(500px,60vw,760px)] w-full flex-col items-center justify-center gap-10 py-10 lg:flex-row lg:justify-between lg:gap-0 lg:py-0 lg:pl-0 lg:pr-0">

        <div className="relative z-20 order-1 flex w-full flex-col items-center justify-center px-6 text-center md:items-center md:px-0 md:text-center lg:order-2 lg:ml-auto lg:w-[40%] lg:max-w-none lg:items-end lg:text-right">
          <div className="md:pr-0 lg:pr-[calc(7.5vw+17px)]">
            <h2 className="mb-[1.2rem] text-[clamp(34px,4.5vw,68px)] font-bold leading-[1.15] text-white">
              CONSTRUYENDO EL FUTURO,<br></br>{' '}
              <span className="text-[#0CA3C6]">CASO POR CASO</span>
            </h2>
            <p className="text-[clamp(16px,1.9vw,26px)] font-normal leading-[1.6] text-white/75 md:text-[1.2rem] md:px-17 lg:px-0">
              Testimonios veraces de nuestros primeros usuarios piloto que ya están transformando sus industrias.
            </p>
          </div>

          <img src="/vectors/shapes/grafico-derecha.svg" alt="" aria-hidden="true"
            className="hidden lg:block w-[clamp(200px,35vw,800px)] opacity-70 mt-8 lg:self-end" />
        </div>

        <div className="relative z-[2] order-2 flex w-full justify-center lg:order-1 lg:w-7/12">
          <div className="relative h-[310px] w-[316px] flex-shrink-0 md:h-[420px] md:w-[500px] lg:h-[456px] lg:w-[560px] xl:h-[496px] xl:w-[608px]">
            <div className="relative ml-[-48px] h-[310px] w-[380px] origin-top-left overflow-visible md:ml-0 md:scale-[1.25] lg:scale-[1.45] xl:scale-[1.6]">
              {testimonials.map((t, i) => {
                const slot = ((i - activeCard + testimonials.length) % testimonials.length) as 0 | 1 | 2;
                return <TestimonialCard key={i} slot={slot} name={t.name} role={t.role} text={t.text} stars={t.stars} img={t.img} />;
              })}
            </div>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-7 hidden w-[86.6%] md:block" />
    </section>
  );
};

/* ==========================================================================
    PAGE: HOME (Main Orchestrator)
   ========================================================================== */

const Home: React.FC = () => {
  return (
    <div className="relative isolate overflow-x-hidden font-sansation">
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
      <HerramientasSection />

      {/* SECCIONES CON FONDO COMPARTIDO (IA, Testimonials, CTA) */}
      <div className="relative mt-[clamp(2rem,5vw,5rem)] xl:mt-12 2xl:mt-16">
        <IASection />
        <div className="mx-auto my-1 w-[86.6%] border-t border-white md:hidden" />
        <TestimonialsSection />
      </div>
    </div>
  );
};

export default Home;
