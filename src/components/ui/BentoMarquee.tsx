import React from 'react';
import { BentoCard } from './BentoGrid';
import type { Project } from '../../pages/Portafolio';

interface BentoMarqueeProps {
  projects: Project[];
  speedSeconds?: number;
  onProjectClick: (project: Project) => void;
}

/**
 * Ensures items repeat enough times to fill ultra-wide screens without gaps
 */
const repeatItemsToFillWidth = (items: Project[], minCount = 16): Project[] => {
  if (!items || items.length === 0) return [];
  let repeated = [...items];
  while (repeated.length < minCount) {
    repeated = [...repeated, ...items];
  }
  return [...repeated, ...repeated]; // Double for seamless -50% translate loop
};

/**
 * Infinite 3-Row Bento Marquee Carousel.
 * - Row 1 (Top / Outer): Moves smoothly to the LEFT
 * - Row 2 (Center): Moves smoothly to the RIGHT
 * - Row 3 (Bottom / Outer): Moves smoothly to the LEFT
 * All cards have a uniform width across all rows.
 */
export const BentoMarquee: React.FC<BentoMarqueeProps> = ({
  projects,
  speedSeconds = 130,
  onProjectClick,
}) => {
  if (!projects || projects.length === 0) return null;

  // Distribute / offset projects across 3 rows for visual diversity
  const row1Base = projects;
  const row2Base = [...projects].reverse();
  const row3Base = [...projects.slice(Math.floor(projects.length / 2)), ...projects.slice(0, Math.floor(projects.length / 2))];

  const row1Items = repeatItemsToFillWidth(row1Base);
  const row2Items = repeatItemsToFillWidth(row2Base);
  const row3Items = repeatItemsToFillWidth(row3Base);

  // Uniform card width for all carousel cards
  const CARD_WIDTH_CLASS = 'w-[250px] sm:w-[310px] lg:w-[360px]';

  return (
    <div className="w-full flex flex-col gap-2.5 sm:gap-3 lg:gap-4 overflow-hidden py-0 my-0 select-none relative">
      <style>
        {`
          @keyframes bento-marquee-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes bento-marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-bento-left {
            animation: bento-marquee-left ${speedSeconds}s linear infinite;
            will-change: transform;
          }
          .animate-bento-right {
            animation: bento-marquee-right ${speedSeconds}s linear infinite;
            will-change: transform;
          }
          .animate-bento-left:hover,
          .animate-bento-right:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* GRADIENT MASK AT EDGES FOR ELEGANT FADING */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 lg:w-32 bg-gradient-to-r from-[#020611] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 lg:w-32 bg-gradient-to-l from-[#020611] to-transparent z-20 pointer-events-none" />

      {/* FILA 1 (SUPERIOR EXTREMA) - MOVIMIENTO A LA IZQUIERDA */}
      <div className="w-full overflow-hidden flex">
        <div className="flex flex-nowrap gap-2.5 sm:gap-3 lg:gap-4 animate-bento-left w-max">
          {row1Items.map((project, idx) => (
            <div
              key={`row1-${project.id}-${idx}`}
              className={`flex-shrink-0 h-[155px] sm:h-[185px] lg:h-[200px] xl:h-[215px] ${CARD_WIDTH_CLASS}`}
            >
              <BentoCard
                index={idx}
                image={project.img}
                imageAlt={project.name}
                minimalMode={true}
                onClick={() => onProjectClick(project)}
                spanClass="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* FILA 2 (CENTRO) - MOVIMIENTO A LA DERECHA */}
      <div className="w-full overflow-hidden flex">
        <div className="flex flex-nowrap gap-2.5 sm:gap-3 lg:gap-4 animate-bento-right w-max">
          {row2Items.map((project, idx) => (
            <div
              key={`row2-${project.id}-${idx}`}
              className={`flex-shrink-0 h-[155px] sm:h-[185px] lg:h-[200px] xl:h-[215px] ${CARD_WIDTH_CLASS}`}
            >
              <BentoCard
                index={idx + 1}
                image={project.img}
                imageAlt={project.name}
                minimalMode={true}
                onClick={() => onProjectClick(project)}
                spanClass="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* FILA 3 (INFERIOR EXTREMA) - MOVIMIENTO A LA IZQUIERDA */}
      <div className="w-full overflow-hidden flex">
        <div className="flex flex-nowrap gap-2.5 sm:gap-3 lg:gap-4 animate-bento-left w-max">
          {row3Items.map((project, idx) => (
            <div
              key={`row3-${project.id}-${idx}`}
              className={`flex-shrink-0 h-[155px] sm:h-[185px] lg:h-[200px] xl:h-[215px] ${CARD_WIDTH_CLASS}`}
            >
              <BentoCard
                index={idx + 2}
                image={project.img}
                imageAlt={project.name}
                minimalMode={true}
                onClick={() => onProjectClick(project)}
                spanClass="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BentoMarquee;
