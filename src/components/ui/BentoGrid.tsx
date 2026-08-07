import React from 'react';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────
   Bento Grid Component System (Reusable)
   ───────────────────────────────────────────────────── */

/**
 * Predefined asymmetric column span classes for Desktop (12-column grid).
 * Row 1: Item 0 (8 cols - wide), Item 1 (4 cols - square)
 * Row 2: Item 2 (4 cols - narrow), Item 3 (5 cols - medium), Item 4 (3 cols - narrow)
 * Row 3+: Cycles pattern cleanly for larger lists.
 */
export const BENTO_DESKTOP_SPANS = [
  'lg:col-span-8 lg:row-span-1', // Fila 1 - Tarjeta ancha
  'lg:col-span-4 lg:row-span-1', // Fila 1 - Tarjeta cuadrada
  'lg:col-span-4 lg:row-span-1', // Fila 2 - Tarjeta 1 (33% ancho)
  'lg:col-span-5 lg:row-span-1', // Fila 2 - Tarjeta 2 (41% ancho)
  'lg:col-span-3 lg:row-span-1', // Fila 2 - Tarjeta 3 (25% ancho)
  'lg:col-span-5 lg:row-span-1', // Fila 3 - Tarjeta 1 (medio)
  'lg:col-span-7 lg:row-span-1', // Fila 3 - Tarjeta 2 (ancho)
  'lg:col-span-4 lg:row-span-1',
  'lg:col-span-4 lg:row-span-1',
  'lg:col-span-4 lg:row-span-1',
];

/**
 * Returns asymmetric span class based on item index or custom span provided.
 */
export const getBentoSpanClass = (index: number, customSpan?: string): string => {
  if (customSpan) return customSpan;
  return BENTO_DESKTOP_SPANS[index % BENTO_DESKTOP_SPANS.length];
};

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Bento Grid Container.
 * - Mobile (< 768px): 1 column (grid-cols-1)
 * - Tablet (768px - 1023px): 2 symmetric columns (md:grid-cols-2)
 * - Desktop (>= 1024px): 12 asymmetric columns (lg:grid-cols-12)
 */
export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 md:gap-4 lg:gap-4 xl:gap-5 auto-rows-[220px] md:auto-rows-[260px] lg:auto-rows-fr ${className}`}
    >
      {children}
    </div>
  );
};

export interface BentoCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  url?: string;
  badge?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  spanClass?: string;
  index?: number;
  minimalMode?: boolean;
  onClick?: () => void;
}

/**
 * Reusable Bento Card Component.
 * Implements rounded borders, overflow hidden, object-cover images, and glassmorphism styling.
 * When minimalMode is true, text/buttons/tags are hidden (click opens modal).
 */
export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  description,
  image,
  imageAlt,
  tags = [],
  url,
  badge,
  header,
  footer,
  children,
  className = '',
  spanClass,
  index = 0,
  minimalMode = false,
  onClick,
}) => {
  const computedSpan = spanClass || getBentoSpanClass(index);

  const cardInner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: (index % 5) * 0.05 }}
      onClick={onClick}
      className={`group relative h-full w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-[#090d18]/80 backdrop-blur-md shadow-lg hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 flex flex-col justify-between cursor-pointer ${
        minimalMode ? 'p-0' : 'p-3.5 sm:p-4 lg:p-4 xl:p-5'
      } ${className}`}
    >
      {/* BACKGROUND IMAGE WITH OBJECT-COVER AND HOVER ZOOM */}
      {image && (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <img
            src={image}
            alt={imageAlt || (typeof title === 'string' ? title : 'Bento item')}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          {/* GRADIENT OVERLAY */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#020611] via-[#020611]/30 to-transparent transition-opacity duration-500 ${
              minimalMode ? 'opacity-30 group-hover:opacity-10' : 'opacity-80 group-hover:opacity-90'
            }`}
          />
        </div>
      )}

      {/* HOVER GLOW / LIGHTING EFFECT */}
      <div className="absolute -inset-px rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-md pointer-events-none" />

      {/* RENDER DETAILS ONLY IF NOT IN MINIMAL MODE */}
      {!minimalMode && (
        <>
          {/* TOP HEADER / BADGES / TAGS */}
          <div className="relative z-10 flex items-center justify-between w-full mb-2">
            {badge ? (
              badge
            ) : tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-w-[82%]">
                {tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] lg:text-[11px] font-medium rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 tracking-wide shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div />
            )}

            {header}

            {/* EXTERNAL LINK ARROW ICON */}
            {url && (
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400 group-hover:scale-110 transition-all duration-300 ml-auto flex-shrink-0 shadow-md">
                <svg
                  className="w-3 h-3 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            )}
          </div>

          {/* CENTER CHILDREN */}
          {children && <div className="relative z-10 my-auto w-full">{children}</div>}

          {/* BOTTOM CONTENT */}
          {(title || subtitle || description || footer) && (
            <div className="relative z-10 mt-auto pt-1.5 lg:pt-2">
              {subtitle && (
                <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mb-0.5">
                  {subtitle}
                </p>
              )}

              {title && (
                <h3 className="text-base sm:text-lg lg:text-lg xl:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300 tracking-tight leading-snug">
                  {title}
                </h3>
              )}

              {description && (
                <p className="text-xs text-white/75 mt-0.5 line-clamp-2 leading-relaxed font-light">
                  {description}
                </p>
              )}

              {footer}
            </div>
          )}
        </>
      )}
    </motion.div>
  );

  return <div className={`h-full ${computedSpan}`}>{cardInner}</div>;
};

export default BentoGrid;
