import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import AltFooter from '../components/layout/AltFooter';
import SEO from '../components/shared/SEO';

type Service = {
  title: string;
  eyebrow: string;
  description: string;
  benefits: string[];
  image: string;
  imageAlt: string;
};

const services: Service[] = [
  {
    eyebrow: 'Experiencias web',
    title: 'Páginas web que convierten visitas en oportunidades',
    description:
      'Diseñamos y desarrollamos experiencias digitales rápidas, claras y memorables, pensadas para comunicar el valor de tu marca y acompañar cada decisión del usuario.',
    benefits: [
      'Diseño estratégico alineado a tu marca',
      'Experiencia responsive y accesible',
      'Arquitectura preparada para crecer',
    ],
    image:
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=88',
    imageAlt: 'Equipo analizando una experiencia web en pantallas',
  },
  {
    eyebrow: 'Aplicaciones móviles',
    title: 'Productos móviles que las personas disfrutan usar',
    description:
      'Creamos aplicaciones nativas e híbridas para iOS y Android con flujos intuitivos, una interfaz cuidada y una base técnica sólida para evolucionar junto a tu negocio.',
    benefits: [
      'Experiencias fluidas y centradas en el usuario',
      'Integraciones seguras con tus sistemas',
      'Rendimiento optimizado en cada dispositivo',
    ],
    image:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1600&q=88',
    imageAlt: 'Aplicación móvil presentada en un smartphone',
  },
  {
    eyebrow: 'Software de escritorio',
    title: 'Herramientas robustas para operaciones más eficientes',
    description:
      'Desarrollamos software de escritorio a medida para simplificar procesos complejos, centralizar información y darle a tu equipo el control que necesita para avanzar.',
    benefits: [
      'Flujos adaptados a tu operación real',
      'Interfaces intuitivas y fáciles de adoptar',
      'Seguridad, estabilidad y soporte evolutivo',
    ],
    image: '/images/showcase/DesktopApp.webp',
    imageAlt: 'Panel de una aplicación de escritorio desarrollada a medida',
  },
];

const revealTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

const ServiceBlock: React.FC<{ service: Service; index: number }> = ({ service, index }) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isReversed = index % 2 === 1;
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-14, 14]);

  return (
    <article className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      {/* Luz ambiental sutil y elegante de fondo acorde al tono de la web */}
      <div
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
          isReversed ? 'left-[-8%]' : 'right-[-8%]'
        } h-[420px] w-[420px] rounded-full bg-[#0CA3C6]/[0.04] blur-[140px]`}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 sm:px-10 lg:grid-cols-12 lg:gap-16 xl:px-12">
        
        {/* Contenedor de Texto */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: isReversed ? 28 : -28, y: 14 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={revealTransition}
          className={`lg:col-span-6 xl:col-span-6 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}
        >
          {/* Micro-índice y Eyebrow minimalista */}
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-widest text-[#0CA3C6]/90">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="h-px w-6 bg-[#0CA3C6]/50" aria-hidden="true" />
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#0CA3C6]">
              {service.eyebrow}
            </p>
          </div>

          {/* Título */}
          <h2 className="max-w-xl text-[clamp(2.1rem,4vw,3.6rem)] font-bold leading-[1.08] tracking-tight text-white">
            {service.title}
          </h2>

          {/* Descripción */}
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/70 sm:text-lg sm:leading-8">
            {service.description}
          </p>

          {/* Lista de Beneficios Minimalista */}
          <ul className="mt-8 space-y-4" aria-label={`Beneficios de ${service.eyebrow}`}>
            {service.benefits.map((benefit, benefitIndex) => (
              <motion.li
                key={benefit}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...revealTransition, delay: 0.06 * benefitIndex }}
                className="flex items-start gap-3 text-base text-white/85"
              >
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center text-[#0CA3C6]" aria-hidden="true">
                  <Check size={16} strokeWidth={2.6} />
                </span>
                <span className="leading-snug">{benefit}</span>
              </motion.li>
            ))}
          </ul>

          {/* Botón de acción con estilo idéntico al header y web */}
          <div className="mt-10">
            <Link
              to="/contacto"
              aria-label={`Hablemos de tu proyecto - ${service.eyebrow}`}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0CA3C6] px-8 py-3.5 text-base font-bold text-white shadow-[0_4px_15px_rgba(6,207,214,0.35)] outline-none transition-all duration-300 hover:bg-[#098ea9] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(6,207,214,0.55)] active:translate-y-0"
            >
              Hablemos de tu proyecto
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </motion.div>

        {/* Contenedor de Imagen */}
        <motion.div
          ref={imageRef}
          initial={reduceMotion ? false : { opacity: 0, x: isReversed ? -28 : 28, y: 14 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...revealTransition, delay: 0.08 }}
          className={`lg:col-span-6 xl:col-span-6 relative ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}
        >
          {/* Marco flotante de imagen */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#071426] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/10 lg:aspect-[5/4]">
            <motion.img
              src={service.image}
              alt={service.imageAlt}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              draggable={false}
              style={reduceMotion ? undefined : { y: imageY }}
              className="h-[calc(100%+28px)] w-full -translate-y-[14px] object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
            />
            {/* Viñeta sutil de integración */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020611]/50 via-transparent to-transparent" />
            
            {/* Sello de autenticidad: Isotipo Bytecode */}
            <img
              src="/vectors/logos/isotipo.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-5 right-5 z-10 w-9 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>
        </motion.div>

      </div>

      {/* Línea divisoria muy tenue entre servicios (excepto el último) */}
      {index < services.length - 1 && (
        <div className="mx-auto mt-16 sm:mt-24 lg:mt-28 max-w-6xl border-b border-white/[0.06]" aria-hidden="true" />
      )}
    </article>
  );
};

const Servicios: React.FC = () => {
  return (
    <div className="w-full overflow-x-hidden bg-[#020611] font-sansation text-white select-none">
      <SEO
        title="Servicios"
        description="Diseño y desarrollo de páginas web, aplicaciones móviles y software de escritorio a medida."
      />

      <main className="py-6 sm:py-10">
        <section aria-label="Nuestros servicios">
          {services.map((service, index) => (
            <ServiceBlock key={service.title} service={service} index={index} />
          ))}
        </section>
      </main>

      <div className="relative w-full">
        <AltFooter />
      </div>
    </div>
  );
};

export default Servicios;



