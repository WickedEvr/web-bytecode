import React from 'react';

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  text: string;
  initials: string;
  avatarBgColor: string;
  img?: string;
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 't1',
    name: 'CAMILA REYES',
    role: 'Founder',
    company: 'Núa Skincare',
    text: 'La plataforma que construyeron es la pieza comercial más fuerte que tenemos. Logramos un 2.4× en conversión en el primer trimestre.',
    initials: 'CR',
    avatarBgColor: '#ec4899',
  },
  {
    id: 't2',
    name: 'MATEO LÓPEZ',
    role: 'Director',
    company: 'Verbo Magazine',
    text: 'Lo que Bytecode hace es dirección tecnológica real. Defienden las ideas que importan y optimizan cada línea de código.',
    initials: 'ML',
    avatarBgColor: '#2563eb',
  },
  {
    id: 't3',
    name: 'TOMÁS HERRERA',
    role: 'Founder',
    company: 'Raíz Café',
    text: 'Rápidos, claros y con criterio. En pocas semanas teníamos sistema web y un flujo que vende sin fallar.',
    initials: 'TH',
    avatarBgColor: '#0284c7',
  },
  {
    id: 't4',
    name: 'DIEGO SALAS',
    role: 'CEO',
    company: 'Barrio',
    text: 'Trabajan como equipo interno, no como agencia. Tienen criterio, ritmo y velocidad. Código nativo sin atajos.',
    initials: 'DS',
    avatarBgColor: '#84cc16',
  },
  {
    id: 't5',
    name: 'SOFÍA MARÍN',
    role: 'CMO',
    company: 'Sereno Hotels',
    text: 'El sistema visual y la arquitectura web que construyeron sigue rindiendo perfecto tres años después. Escalable y rápido.',
    initials: 'SM',
    avatarBgColor: '#f97316',
  },
  {
    id: 't6',
    name: 'JAVIERA NÚÑEZ',
    role: 'Directora',
    company: 'Atelier MM',
    text: 'Pasamos de improvisar en redes a tener una infraestructura seria. Cada lead llega ordenado y con seguimiento real.',
    initials: 'JN',
    avatarBgColor: '#d946ef',
  },
  {
    id: 't7',
    name: 'DANTE GALLARDO',
    role: 'CEO',
    company: 'Fintech Latam',
    text: 'Excelente nivel de ingeniería. Lograron integrar nuestras pasarelas en tiempo récord con rendimiento ultra fluido.',
    initials: 'DG',
    avatarBgColor: '#06cfd6',
  },
  {
    id: 't8',
    name: 'MARÍA GARCÍA',
    role: 'Fundadora',
    company: 'BioSalud',
    text: 'Atención personalizada y entregables impecables. La web superó todas las expectativas de nuestros inversionistas.',
    initials: 'MG',
    avatarBgColor: '#a855f7',
  },
  {
    id: 't9',
    name: 'CARLOS RUIZ',
    role: 'Director de Innovación',
    company: 'Nexa Group',
    text: 'Profesionales de primer nivel. Nos dieron una solución robusta con arquitectura escalable a medida.',
    initials: 'CR',
    avatarBgColor: '#10b981',
  },
];

/**
 * Repeats list to create continuous infinite vertical loop
 */
const repeatItems = (items: TestimonialItem[], count = 2): TestimonialItem[] => {
  let res: TestimonialItem[] = [];
  for (let i = 0; i < count; i++) {
    res = [...res, ...items];
  }
  return res;
};

/**
 * 3-Column Infinite Vertical Marquee Testimonials Carousel.
 * Outer columns (Col 1 & Col 3) move faster than the center column (Col 2).
 */
export const VerticalTestimonialsMarquee: React.FC = () => {
  // Distribute 9 testimonials evenly across 3 columns (3 items per column)
  const col1Base = [TESTIMONIALS_DATA[0], TESTIMONIALS_DATA[3], TESTIMONIALS_DATA[6]];
  const col2Base = [TESTIMONIALS_DATA[1], TESTIMONIALS_DATA[4], TESTIMONIALS_DATA[7]];
  const col3Base = [TESTIMONIALS_DATA[2], TESTIMONIALS_DATA[5], TESTIMONIALS_DATA[8]];

  const col1Items = repeatItems(col1Base, 4);
  const col2Items = repeatItems(col2Base, 4);
  const col3Items = repeatItems(col3Base, 4);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] md:h-[600px] lg:h-[640px] overflow-hidden select-none py-1">
      <style>
        {`
          @keyframes marquee-vertical-up {
            0% { transform: translateY(0%); }
            100% { transform: translateY(-50%); }
          }
          @keyframes marquee-vertical-down {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0%); }
          }
          .animate-vertical-fast-up {
            animation: marquee-vertical-up 32s linear infinite;
            will-change: transform;
          }
          .animate-vertical-slow-down {
            animation: marquee-vertical-down 48s linear infinite;
            will-change: transform;
          }
          .animate-vertical-fast-up:hover,
          .animate-vertical-slow-down:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* TOP & BOTTOM GRADIENT FADE MASKS */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b from-[#020611] to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-[#020611] to-transparent z-20 pointer-events-none" />

      {/* 3-COLUMN MARQUEE CONTAINER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-4 h-full w-full">
        
        {/* COLUMNA 1 (IZQUIERDA - MÁS RÁPIDA HACIA ARRIBA) */}
        <div className="overflow-hidden flex flex-col h-full">
          <div className="flex flex-col gap-3.5 sm:gap-4 animate-vertical-fast-up">
            {col1Items.map((item, idx) => (
              <TestimonialCard key={`c1-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {/* COLUMNA 2 (CENTRO - MÁS LENTA HACIA ABAJO) */}
        <div className="overflow-hidden hidden sm:flex flex-col h-full">
          <div className="flex flex-col gap-3.5 sm:gap-4 animate-vertical-slow-down">
            {col2Items.map((item, idx) => (
              <TestimonialCard key={`c2-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {/* COLUMNA 3 (DERECHA - MÁS RÁPIDA HACIA ARRIBA) */}
        <div className="overflow-hidden hidden lg:flex flex-col h-full">
          <div className="flex flex-col gap-3.5 sm:gap-4 animate-vertical-fast-up">
            {col3Items.map((item, idx) => (
              <TestimonialCard key={`c3-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const TestimonialCard: React.FC<{ item: TestimonialItem }> = ({ item }) => {
  return (
    <div className="group relative w-full bg-[#090d18]/90 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md hover:border-[#06cfd6]/40 hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between">
      {/* QUOTE ICON */}
      <div className="text-[#06cfd6] text-2xl sm:text-3xl font-serif font-bold leading-none mb-2.5 opacity-90 group-hover:scale-110 transition-transform duration-300">
        “
      </div>

      {/* CLEAN TESTIMONIAL TEXT */}
      <p className="text-white/85 text-xs sm:text-sm leading-relaxed font-light mb-4">
        {item.text}
      </p>

      {/* DIVIDER & CLIENT PROFILE */}
      <div className="border-t border-white/10 pt-3 mt-auto flex items-center gap-3">
        {/* AVATAR WITH INITIALS */}
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md"
          style={{ backgroundColor: item.avatarBgColor }}
        >
          {item.img ? (
            <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            item.initials
          )}
        </div>

        {/* CLIENT NAME & COMPANY */}
        <div className="flex flex-col min-w-0">
          <h4 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wide truncate">
            {item.name}
          </h4>
          <p className="text-white/50 text-[10px] sm:text-[11px] font-medium truncate">
            {item.role} · {item.company}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerticalTestimonialsMarquee;
