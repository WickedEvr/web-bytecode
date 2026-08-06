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
  const imageY = useTransform(scrollYProgress, [0, 1], [-18, 18]);

  return (
    <article className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-[-10rem] h-80 w-80 rounded-full bg-[#06CFD6]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 sm:py-24 md:gap-14 md:px-10 lg:min-h-[720px] lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-28 xl:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: isReversed ? 36 : -36, y: 12 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={revealTransition}
          className={isReversed ? 'lg:order-2' : 'lg:order-1'}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-9 bg-[#0CA3C6]" aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0CA3C6] sm:text-base">
              {service.eyebrow}
            </p>
          </div>

          <h2 className="max-w-xl text-[clamp(2.15rem,5vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.035em] text-white">
            {service.title}
          </h2>

          <p className="mt-6 max-w-xl text-base font-light leading-8 text-white/70 sm:text-lg sm:leading-8">
            {service.description}
          </p>

          <ul className="mt-8 grid gap-4" aria-label={`Beneficios de ${service.eyebrow}`}>
            {service.benefits.map((benefit, benefitIndex) => (
              <motion.li
                key={benefit}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...revealTransition, delay: 0.08 * benefitIndex }}
                className="flex items-start gap-3 text-base text-white/85 sm:text-lg"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#06CFD6]/15 text-[#06CFD6] ring-1 ring-[#06CFD6]/20">
                  <Check size={15} strokeWidth={3} aria-hidden="true" />
                </span>
                <span>{benefit}</span>
              </motion.li>
            ))}
          </ul>

          <Link
            to="/contacto"
            aria-label={`Conversemos sobre ${service.eyebrow}`}
            className="group mt-10 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[22px] bg-[#06CFD6] px-7 py-3.5 text-base font-bold text-white shadow-[0_10px_30px_rgba(6,207,214,0.24)] outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#0CA3C6] hover:shadow-[0_16px_36px_rgba(12,163,198,0.3)] focus-visible:ring-4 focus-visible:ring-[#06CFD6]/30 active:translate-y-0 sm:w-auto sm:text-lg"
          >
            Hablemos de tu proyecto
            <ArrowUpRight
              size={20}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </motion.div>

        <motion.div
          ref={imageRef}
          initial={reduceMotion ? false : { opacity: 0, x: isReversed ? -36 : 36, y: 18 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...revealTransition, delay: 0.08 }}
          className={`relative order-first ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}
        >
          <div className="absolute -inset-4 rounded-[2.4rem] bg-[linear-gradient(145deg,rgba(6,207,214,0.24),rgba(12,163,198,0.03))] blur-xl" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#071426] shadow-[0_28px_70px_rgba(0,0,0,0.38)] sm:rounded-[2.5rem] lg:aspect-[5/4]">
            <motion.img
              src={service.image}
              alt={service.imageAlt}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              draggable={false}
              style={reduceMotion ? undefined : { y: imageY }}
              className="h-[calc(100%+36px)] w-full -translate-y-[18px] object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#020611]/30 via-transparent to-[#06CFD6]/10" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
          </div>
          <div className={`absolute -bottom-5 ${isReversed ? '-left-3' : '-right-3'} h-20 w-20 rounded-[1.5rem] bg-[#0CA3C6] shadow-[0_14px_30px_rgba(12,163,198,0.28)] sm:h-24 sm:w-24`} aria-hidden="true">
            <div className="absolute inset-4 rounded-full border border-white/45" />
            <div className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 bg-white/70" />
          </div>
        </motion.div>
      </div>
    </article>
  );
};

const Servicios: React.FC = () => {
  return (
    <div className="w-full overflow-x-hidden bg-[#020611] font-sansation">
      <SEO
        title="Servicios"
        description="Diseño y desarrollo de páginas web, aplicaciones móviles y software de escritorio a medida."
      />

      <main>
        <section className="bg-[#020611]" aria-label="Nuestros servicios">
          {services.map((service, index) => (
            <ServiceBlock key={service.title} service={service} index={index} />
          ))}
        </section>
      </main>

      <div className="relative w-full">
        <div className="absolute inset-0 z-0 bg-[#020611]" aria-hidden="true" />
        <div className="relative z-10">
          <AltFooter />
        </div>
      </div>
    </div>
  );
};

export default Servicios;
