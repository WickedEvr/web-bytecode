import React from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import AltFooter from '../components/layout/AltFooter';
import SEO from '../components/shared/SEO';

type ServiceCardData = {
  num: string;
  title: string;
  tag: string;
  description: string;
  deliverables: string[];
  tags: string[];
  image: string;
  badge?: string;
};

const services: ServiceCardData[] = [
  {
    num: '01 / 06',
    title: 'Desarrollo Web & Plataformas',
    tag: 'Web & E-Commerce',
    description:
      'Construimos sitios web corporativos, landing pages de alta conversión, plataformas administrativas y tiendas virtuales con código 100% nativo, máxima velocidad y optimización SEO.',
    deliverables: [
      'Páginas web corporativas & Landing pages',
      'Tiendas virtuales y e-commerce con pasarelas de pago',
      'Paneles administrativos autoadministrables',
      'Optimización SEO y velocidad de carga extrema (< 0.8s)',
    ],
    tags: ['React 19', 'TypeScript', 'Tailwind CSS', 'Next.js / Vite', 'SEO Semántico'],
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    badge: 'Popular · React 19',
  },
  {
    num: '02 / 06',
    title: 'Aplicaciones Móviles iOS & Android',
    tag: 'Mobile Apps',
    description:
      'Desarrollamos aplicaciones móviles nativas y multiplataforma con interfaces fluidas a 60 FPS, sincronización en tiempo real, modo offline, notificaciones push y pasarelas de pago integradas.',
    deliverables: [
      'Desarrollo para App Store (iOS) y Google Play (Android)',
      'Sincronización en tiempo real con bases de datos',
      'Notificaciones push automáticas y personalizadas',
      'Autenticación biométrica (Face ID / Huella dactilar)',
    ],
    tags: ['React Native', 'Expo', 'iOS & Android', 'Push Notifications', 'Firebase'],
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
    badge: '60 FPS Nativo',
  },
  {
    num: '03 / 06',
    title: 'Software de Escritorio & Corporativo',
    tag: 'Sistemas a Medida',
    description:
      'Creamos herramientas operativas de nivel corporativo para automatizar inventarios, facturación electrónica, dashboards analíticos, control de usuarios y flujos de trabajo de alta exigencia.',
    deliverables: [
      'Software de escritorio nativo para Windows y macOS',
      'Módulos de facturación electrónica y gestión de ventas',
      'Control de inventarios y trazabilidad con reportes',
      'Bases de datos relacionales con copias de seguridad',
    ],
    tags: ['Electron / Tauri', 'PostgreSQL', 'Node.js', 'Docker', 'Windows & Mac'],
    image: '/images/showcase/DesktopApp.webp',
  },
  {
    num: '04 / 06',
    title: 'E-Commerce & Pasarelas de Pago',
    tag: 'Comercio Digital',
    description:
      'Diseñamos tiendas online completas con catálogo interactivo, flujos de compra sin fricción, cálculo automático de envíos e integración directa con pasarelas de pago y billeteras digitales.',
    deliverables: [
      'Integración con Stripe, Culqi, Mercado Pago y Yape / Plin',
      'Gestión automática de stock y variantes de producto',
      'Checkout rápido optimizado para celulares',
      'Notificaciones automáticas de pedidos por WhatsApp y email',
    ],
    tags: ['E-Commerce', 'Pasarelas de Pago', 'Checkout Ágil', 'Gestión de Stock'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
    badge: 'Alta Conversión',
  },
  {
    num: '05 / 06',
    title: 'Automatización & Capa de Inteligencia Artificial',
    tag: 'Inteligencia Artificial',
    description:
      'Potenciamos tu plataforma con asistentes de atención 24/7, bots para calificar y capturar leads, formularios inteligentes y flujos automatizados que conectan directamente con tu CRM.',
    deliverables: [
      'Chatbots con IA entrenados con la información de tu negocio',
      'Calificación y derivación automática de prospectos',
      'Generación de presupuestos y cotizaciones en tiempo real',
      'Integraciones con APIs de OpenAI, Gemini y Webhooks',
    ],
    tags: ['Chatbots IA', 'OpenAI & Gemini', 'Automatización CRM', 'Webhooks'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    badge: 'Nuevo · IA',
  },
  {
    num: '06 / 06',
    title: 'Auditoría, Optimización & Mantenimiento Cloud',
    tag: 'Cloud & Seguridad',
    description:
      'Auditamos la seguridad y velocidad de tu software existente, optimizamos código para alcanzar puntuación máxima en Google Lighthouse y brindamos soporte técnico continuo para que nunca se detenga.',
    deliverables: [
      'Auditoría técnica de seguridad bajo estándares OWASP',
      'Optimización de velocidad y rendimiento de bases de datos',
      'Migración y despliegue en servidores cloud seguros',
      'Mantenimiento correctivo y soporte técnico continuo',
    ],
    tags: ['Seguridad OWASP', 'Lighthouse 98+', 'Docker Cloud', 'Soporte Continuo'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
];

const Servicios: React.FC = () => {
  return (
    <div className="relative isolate overflow-x-hidden font-sansation text-white select-none">
      <SEO
        title="Servicios de Software"
        description="Catálogo de desarrollo web, aplicaciones móviles, software corporativo y automatización con IA por Bytecode."
      />

      {/* ========================================= */}
      {/* FONDO ESPACIAL LIMPIO SIN GALAXIA */}
      {/* ========================================= */}
      <div className="absolute inset-0 bg-[#040e1f] -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('/vectors/designs/stardust.png')] opacity-60 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 rotate-180 bg-[url('/vectors/designs/stardust.png')] opacity-40 mix-blend-screen pointer-events-none" />
      </div>

      {/* Sombras y formas vectoriales del Home */}
      <img src="/vectors/shadows/sombra-general.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-[1]" />
      <img src="/vectors/shadows/sombra-arriba.svg" aria-hidden="true" className="absolute top-0 left-0 w-full pointer-events-none z-[2]" />

      {/* ========================================= */}
      {/* 1. HERO DE SERVICIOS CON ESTILO HOME */}
      {/* ========================================= */}
      <section className="relative z-10 pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Eyebrow tipo badge con estilo Home */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0CA3C6]/40 bg-[#0CA3C6]/10 px-5 py-2 text-xs md:text-sm font-bold text-[#06CFD6] mb-6 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#06CFD6] animate-pulse" />
            <span>SERVICIOS · SOLUCIONES A MEDIDA</span>
          </div>

          {/* Gran Titular con tipografía y glow del Home */}
          <h1 className="text-[clamp(34px,5.5vw,68px)] font-bold uppercase leading-[1.1] text-white [text-shadow:0px_4px_7.3px_rgba(0,0,0,0.51)] mb-6">
            SOLUCIONES DE <span className="text-[#0CA3C6]">SOFTWARE</span> <br />
            DISEÑADAS PARA <span className="text-[#06CFD6]">ESCALAR</span>
          </h1>

          {/* Subtítulo con el text-shadow del Home */}
          <p className="text-[clamp(16px,1.8vw,22px)] font-normal leading-[1.5] text-white/85 [text-shadow:0_0_8px_rgba(6,207,214,0.4)] max-w-2xl mx-auto">
            Desarrollamos tecnología limpia y robusta desde cero. Código nativo sin plantillas para hacer realidad tus proyectos más ambiciosos.
          </p>

        </div>
      </section>

      {/* ========================================= */}
      {/* 2. GRID DE TARJETAS (ESTILO GLASS-PANEL DEL HOME) */}
      {/* ========================================= */}
      <section className="relative z-10 pb-28 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative rounded-[28px] overflow-hidden glass-panel bg-white/[0.04] border border-white/15 transition-all duration-300 hover:border-[#0CA3C6] hover:shadow-[0px_0px_30px_rgba(6,207,214,0.25)] hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                {/* Portada Superior con Badge */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040e1f] via-transparent to-transparent" />
                  
                  {service.badge && (
                    <span className="absolute top-4 right-4 bg-[#06CFD6] text-white text-[11px] font-bold uppercase px-3.5 py-1 rounded-full shadow-[0px_0px_15px_rgba(6,207,214,0.6)]">
                      {service.badge}
                    </span>
                  )}
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-7">
                  <div className="flex items-center justify-between text-xs font-bold text-[#06CFD6] uppercase mb-3">
                    <span>{service.num}</span>
                    <span>{service.tag}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-[#06CFD6] transition-colors">
                    {service.title}
                  </h2>

                  <p className="text-sm text-white/75 leading-relaxed font-normal mb-6">
                    {service.description}
                  </p>

                  {/* Entregables incluidos */}
                  <div className="mb-6 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0CA3C6] block mb-2">
                      Lo que incluye:
                    </span>
                    {service.deliverables.map((item) => (
                      <div key={item} className="flex items-start gap-2.5 text-xs text-white/90">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#06CFD6]/20 text-[#06CFD6] mt-0.5">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags de Tecnología tipo Badge Glass */}
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                    {service.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer de Tarjeta con Enlace y Estilo Botón Home */}
              <Link
                to="/contacto"
                className="px-7 py-4 border-t border-white/10 flex items-center justify-between font-bold text-sm text-[#06CFD6] bg-black/20 group-hover:bg-[#06CFD6] group-hover:text-white transition-all duration-300"
              >
                <span>Cotizar {service.title}</span>
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================= */}
      {/* 3. CTA FINAL INSPIRADO EN EL HOME */}
      {/* ========================================= */}
      <section className="relative z-10 pb-20 px-6 max-w-4xl mx-auto w-full text-center">
        <div className="glass-panel p-10 md:p-14 border border-white/20 hover:border-[#0CA3C6]/60 transition-all duration-300 shadow-[0px_0px_35px_rgba(6,207,214,0.15)]">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase text-white leading-tight mb-4">
            ¿TIENES UN PROYECTO <span className="text-[#0CA3C6]">EN MENTE?</span>
          </h3>
          <p className="text-base sm:text-lg text-white/80 max-w-lg mx-auto mb-8 leading-relaxed">
            Adquiere tu consulta técnica <span className="font-bold text-[#06CFD6]">GRATIS</span> y conversemos sobre la mejor arquitectura para tu negocio.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-2 rounded-full bg-[#06CFD6] px-9 py-3.5 text-base md:text-lg font-bold text-white shadow-[0px_0px_25px_rgba(6,207,214,0.5)] hover:scale-105 hover:bg-[#0CA3C6] transition-all duration-300"
          >
            <span>Iniciar Consulta</span>
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>

      <div className="relative z-10 w-full">
        <AltFooter />
      </div>
    </div>
  );
};

export default Servicios;



