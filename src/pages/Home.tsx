import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Stack from '../components/Stack';
import GalaxyBackground from '../components/GalaxyBackground';
import './Home.css';

/* ==========================================================================
    CONFIGURACIÓN Y DATOS ESTÁTICOS
   ========================================================================== */

const HERO_ACTION_LINK_BASE =
  'flex h-[clamp(48px,5vw,68px)] w-full min-w-[clamp(180px,20vw,260px)] max-w-full items-center justify-center rounded-full text-[clamp(1rem,1.5vw,1.5rem)] font-bold transition-all hover:scale-105 hover:shadow-[0px_0px_25px_rgba(6,207,214,0.5)] md:w-auto';

const HERO_BOTTOM_CORNER_POSITION =
  'right-1.5 md:right-3 lg:right-[6%] xl:right-4 2xl:-right-31';

const HERO_CORNER_SIZE = 'w-[48%] sm:w-[42%] md:w-[40%] xl:w-[36%] 2xl:w-[34%]';

const TESTIMONIAL_CARD_BASE =
  'absolute h-[305.14px] w-[189.51px] origin-top-left font-sansation drop-shadow-[0px_4px_18px_rgba(178,250,255,0.62)] transition-[left,top,transform,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]';

const TESTIMONIAL_CARD_SLOTS = [
  'left-[111.08px] top-0 z-[3] opacity-100 scale-100',
  'left-[223px] top-[42.06px] z-[1] opacity-[0.54] scale-[0.736]',
  'left-[50px] top-[42.06px] z-[1] opacity-[0.54] scale-[0.736]',
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
  return (
    <div className={`${TESTIMONIAL_CARD_BASE} ${TESTIMONIAL_CARD_SLOTS[slot]}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[37px] border-4 border-white bg-white/[0.13] backdrop-blur-[9.85px]">
        <div className="relative h-[122px] bg-[rgba(0,15,35,0.45)]">
          <div className="absolute bottom-[-44.43px] left-1/2 z-[2] h-[88.86px] w-[88.86px] -translate-x-1/2 overflow-hidden rounded-full border-[6px] border-[#06CFD6] bg-[linear-gradient(135deg,#1a3a5c_0%,#0d1f33_100%)] drop-shadow-[0px_0px_16.6px_#FFFFFF]" />
        </div>

        <div className="flex h-[183px] flex-col items-center overflow-hidden [border-radius:177px_177px_37px_37px] bg-white px-[14px] pb-4 pt-[54px] text-center shadow-[0px_-4px_18px_rgba(135,247,255,0.48)]">
          <p className="mb-px text-base font-bold leading-[1.2] text-[#06CFD6]">{name}</p>
          <p className="mb-1 text-[10px] font-normal leading-[1.2] text-[#06CFD6]">{role}</p>
          <p className="mb-2 flex-1 text-[11px] leading-[1.4] text-black">{text}</p>
          <div className="flex gap-[3px]">
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
  
  return (
    <section className="relative min-h-[100dvh] overflow-hidden select-none font-sansation">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[#040e1f]" aria-hidden="true">
        <GalaxyBackground /> 
        <div className="absolute inset-0 bg-[#040e1f]/30" />
        <div className="absolute inset-0 bg-[url('/designs/stardust.png')] opacity-70 mix-blend-screen" />
        <div className="absolute inset-0 rotate-180 bg-[url('/designs/stardust.png')] opacity-50 mix-blend-screen" />
      </div>

      <img src="/esquina-arriba.svg" aria-hidden="true" className={`absolute left-0 top-0 z-10 pointer-events-none ${HERO_CORNER_SIZE}`} />
      <img src="/esquina-abajo.svg" aria-hidden="true" className={`absolute bottom-0 z-0 pointer-events-none ${HERO_CORNER_SIZE} ${HERO_BOTTOM_CORNER_POSITION}`} />
      <img src="/sombra-general.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-[9]" />
      <img src="/sombra-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10" />
      <img src="/sombra-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-10 opacity-50" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col items-center justify-center gap-2 px-6 pt-20 -translate-y-[65px] md:flex-row md:justify-between md:gap-0 md:px-12 md:pt-0 md:-translate-x-[40px] lg:px-20 lg:-translate-x-[80px]">
        
        <div className="order-1 md:order-2 flex flex-col items-center md:items-start text-center md:text-left z-20 w-full md:w-[65%] lg:w-[60%]">
          <h1
            className="mb-2 text-white uppercase leading-[1.08] [text-shadow:0px_4px_7.3px_rgba(0,0,0,0.51)] md:mb-4"
          >
            <span className="font-bold md:whitespace-nowrap text-[clamp(2.2rem,4.8vw,4.875rem)]">UN GRAN SITIO WEB,</span>
            <br />
            <span className="md:whitespace-nowrap text-[clamp(1.8rem,3.8vw,4rem)]">HACE IDEAS REALIDAD</span>
          </h1>

          <p className="mb-5 text-[clamp(0.9rem,1.8vw,1.75rem)] font-normal leading-[1.3] text-white [text-shadow:0px_4px_8.8px_rgba(0,0,0,0.81)] md:mb-10">
            Adquiere tu consulta <span className="font-bold text-[#06CFD6]">GRATIS</span>
          </p>

          <div className="flex w-full max-w-[520px] flex-col gap-3 md:w-auto md:flex-row md:gap-5">
            <HeroActionLink to="/contacto" variant="cyan">Conectar</HeroActionLink>
            <HeroActionLink to="/servicios" variant="white">Servicios</HeroActionLink>
          </div>
        </div>

        <div className="order-2 md:order-1 flex items-center justify-center md:justify-start w-full md:w-[48%] flex-shrink-0">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-[clamp(160px,38vw,560px)]"
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
      <div className="absolute inset-0 bg-[url('/formaazul.svg')] bg-cover bg-center bg-no-repeat md:hidden" />
      <div className="absolute bottom-6 left-5 right-[60px]">
        <p className="m-0 text-2xl font-bold leading-tight text-white">
          {svc.title}
        </p>
        <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-[1.15] text-white/90">
          {svc.description}
        </p>
      </div>
      <img
        src="/isotipo.svg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-6 right-4 z-[2] w-10 pointer-events-none"
      />
    </div>
  )), []);

  return (
    <div className="relative -mt-[11%] font-sansation">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none md:relative md:inset-auto">
        <img src="/sombra-segunda.svg" aria-hidden="true" className="h-full w-full object-cover object-top md:h-auto md:object-contain" />
      </div>

      <div className="relative z-[60] flex flex-col items-center justify-start px-5 select-none pb-16 pt-[clamp(2rem,8vw,5rem)] md:absolute md:inset-0 md:pb-0 md:pt-[3%]">
        <div className="relative z-[15] text-center">
          <p className="mb-[0.6rem] text-[clamp(2.24rem,5.6vw,3.36rem)] font-extrabold leading-[1.2] text-[#0CA3C6]">
            Haz crecer tu negocio
          </p>
          <p className="mb-6 text-[clamp(1.4rem,3.5vw,2.03rem)] font-normal leading-normal text-white">
            Te mereces un sitio web que haga{' '}
            <span className="text-[#0CA3C6]">todo lo que necesitas.</span>
          </p>
        </div>

        <div className="relative z-[60] mt-[23px] w-full max-w-[min(306px,90vw)] md:max-w-[85%]">
          <div className="relative z-[60] h-[409px] md:hidden">
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

          <div className="relative z-[60] hidden overflow-hidden rounded-[28px] shadow-[0px_4px_20.4px_9px_rgba(0,0,0,0.22)] md:block md:rounded-[48px]">
            <div className="relative h-[409px] md:h-[clamp(320px,44vw,554px)]">
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
              <div className="absolute inset-0 bg-black/15 md:bg-black/28" />
              <div className="absolute inset-0 bg-[url('/formaazul.svg')] bg-cover bg-center bg-no-repeat md:hidden" />
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
              <img className="absolute bottom-0 right-0 hidden pointer-events-none md:block" src="/esquina-derecha.svg" alt="" aria-hidden="true" />
              <img className="absolute bottom-6 right-4 z-[2] w-10 pointer-events-none md:bottom-[5%] md:right-[2%] md:w-[clamp(25px,4vw,50px)]" src="/isotipo.svg" alt="" aria-hidden="true" />
            </div>
          </div>
          <div className="relative z-20 mt-8 hidden items-center justify-center gap-4 md:flex">
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`block h-[11px] cursor-pointer rounded-full bg-gray-400 p-0 transition-[width,background-color] duration-300 ${
                  slide === i ? 'w-[72px]' : 'w-6'
                }`}
                aria-label={`Ver servicio ${i + 1}`}
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
  <section className="relative z-[40] -mt-[11rem] h-[33rem] overflow-visible px-6 pb-12 pt-0 font-sansation md:-mt-[12rem] md:h-[35rem] lg:-mt-[15rem] lg:h-[32rem] xl:-mt-[20rem] xl:h-[30rem] 2xl:-mt-36 2xl:h-[30rem]">
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-10rem] hidden h-[28rem] w-screen -translate-x-1/2 bg-white max-md:block" />

    <img
      src="/designs/formablancagrande.svg"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-[5.6rem] w-full max-w-none select-none md:top-[-12rem] md:w-[150%] lg:top-[-18rem] lg:w-[115%] xl:top-[-24rem] xl:w-full 2xl:top-[-34.2rem]"
    />

    <div className="relative z-10 mx-auto flex w-full flex-col items-center pt-[8.5rem] md:w-[85%] md:pt-[10rem] lg:pt-[9rem] xl:pt-[8.5rem] 2xl:pt-[7.6rem]">
      <div className="mb-8 flex w-full max-w-[358px] items-center justify-center gap-0 md:mb-16 md:max-w-none md:gap-3">
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
              <img src="/logos/laravel.svg" alt={copy === 0 ? 'Laravel' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(28px,4.7vw,54px)] w-auto shrink-0 grayscale" />
              <img src="/logos/github.svg" alt={copy === 0 ? 'GitHub' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(30px,4.9vw,56px)] w-auto shrink-0 grayscale" />
              <img src="/logos/php.svg" alt={copy === 0 ? 'PHP' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(36px,6.6vw,76px)] w-auto shrink-0 grayscale" />
              <img src="/logos/JAVA.svg" alt={copy === 0 ? 'Java' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(40px,7.5vw,86px)] w-auto shrink-0 grayscale" />
              <img src="/logos/mongodb.svg" alt={copy === 0 ? 'MongoDB' : ''} aria-hidden={copy !== 0} className="mx-[clamp(1.2rem,3vw,2.5rem)] h-[clamp(44px,8vw,92px)] w-auto shrink-0 grayscale" />
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
  <section className="relative z-[60] -mt-60 min-h-[800px] overflow-x-hidden pb-8 md:mt-0">
    <div className="absolute bottom-[258px] left-0 right-0 top-[258px] z-0 bg-white md:hidden" />
    
    <div className="relative z-10 flex flex-col md:flex-row items-end justify-between px-6 md:px-0 md:pr-[24px] pt-8 md:pt-16 pb-8 w-full md:w-[85%] mx-auto gap-8 md:gap-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[clamp(-20px,1.5vw,24px)] left-[62%] z-[1] hidden h-[clamp(164px,18vw,237px)] w-[clamp(228px,25vw,329px)] -translate-x-1/2 rounded-[59px] bg-white md:block"
      />

      <div className="relative w-full md:w-auto flex justify-center order-1 md:order-2 md:px-4 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-10 z-0 h-[118px] w-[256px] -translate-x-[66%] rounded-[60px] bg-white md:top-[clamp(24px,6.4vw,60px)] md:h-[clamp(69px,18.8vw,177px)] md:w-[clamp(154px,41.9vw,382px)] md:rounded-[90px]"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 h-[408px] w-[232px] flex-shrink-0 rounded-[48px] shadow-[0px_4px_7.8px_rgba(0,0,0,0.42)] md:h-[clamp(240px,65vw,613px)] md:w-[clamp(140px,38vw,346px)]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-[48px]">
            <img src="/fondochica.png" alt="" aria-hidden="true" className="absolute inset-0 rounded-[48px] w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/[0.22]" />
          </div>
          <img
            src="/chica.png"
            alt="Mujer con estética de inteligencia artificial"
            className="absolute bottom-0 right-0 z-10 h-[96%] w-auto max-w-none origin-bottom-right rounded-[48px] pointer-events-none md:h-[90%]"
          />
        </motion.div>
      </div>

      <div className="w-full md:flex-1 flex flex-col gap-3 text-center md:text-left items-center md:items-start order-2 md:order-1 mb-auto md:mt-auto z-20 md:pr-4">
        <h2 className="max-w-[450px] text-[clamp(24px,3vw,2.5rem)] font-bold leading-[27px] text-[#0CA3C6] md:leading-[1]">
          Comenzar nunca ha sido<br />tan fácil gracias a la IA
        </h2>
        <p className="max-w-[450px] text-[clamp(16px,1.8vw,1.5rem)] font-normal leading-[18px] text-black md:leading-relaxed md:text-white">
          No hace falta tener experiencia.
        </p>
        <p className="max-w-[450px] text-[clamp(10px,1.2vw,1rem)] font-light leading-[11px] text-black md:leading-normal md:text-white">
          Kit de diseño con IA, uno de los mejores<br />inventos de TIME de 2025*
        </p>
      </div>

      <div className="relative w-full md:w-auto flex justify-center order-3 md:order-3">
        <div
          aria-hidden="true"
          className="absolute bottom-[-22px] left-1/2 z-0 h-[172px] w-[165px] translate-x-[00%] rounded-[20px] bg-white md:bottom-[clamp(-33px,-3.5vw,-13px)] md:h-[clamp(101px,27.4vw,259px)] md:w-[clamp(100px,27vw,246px)] md:rounded-[30px]"
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative z-[11] block h-[408px] w-[232px] flex-shrink-0 overflow-hidden rounded-[48px] shadow-[0px_4px_27.8px_rgba(0,0,0,0.9)] md:h-[clamp(240px,65vw,613px)] md:w-[clamp(140px,38vw,346px)]"
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
      <div className="mx-auto mb-24 hidden w-[86.6%] border-t border-white md:block" />

      <div className="relative z-[1] flex min-h-[clamp(500px,60vw,400px)] w-full flex-col items-center justify-center gap-10 py-10 md:flex-row md:justify-between md:gap-0 md:py-0 md:pl-0 md:pr-0">

        <div className="w-full md:w-[32%] flex flex-col items-center justify-center md:items-end order-1 md:order-2 text-center md:text-right relative z-20 md:ml-auto px-6 md:px-0 md:pr-[6.7%]">
          <h2 className="mb-[1.2rem] text-[clamp(34px,4.5vw,68px)] font-bold leading-[1.15] text-white">
            CONSTRUYENDO EL FUTURO,{' '}
            <span className="text-[#0CA3C6]">CASO POR CASO</span>
          </h2>
          <p className="text-[clamp(16px,1.9vw,26px)] font-normal leading-[1.6] text-white/75">
            Testimonios veraces de nuestros primeros usuarios piloto que ya están transformando sus industrias.
          </p>

          <img src="/grafico-derecha.svg" alt="" aria-hidden="true"
            className="absolute right-0 top-1/2 -z-[1] hidden w-[clamp(200px,35vw,800px)] -translate-y-1/2 opacity-70 md:block" />
        </div>

        <div className="relative z-[2] order-2 flex w-full justify-center md:order-1 md:w-7/12">
          <div className="relative h-[310px] w-[316px] flex-shrink-0 md:h-[496px] md:w-[608px]">
            <div className="relative ml-[-48px] h-[310px] w-[380px] origin-top-left overflow-visible md:ml-0 md:scale-[1.6]">
              {testimonials.map((t, i) => {
                const slot = ((i - activeCard + testimonials.length) % testimonials.length) as 0 | 1 | 2;
                return <TestimonialCard key={i} slot={slot} name={t.name} role={t.role} text={t.text} stars={t.stars} />;
              })}
            </div>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-24 hidden w-[86.6%] md:block" />
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
        <TestimonialsSection />
      </div>
    </div>
  );
};

export default Home;