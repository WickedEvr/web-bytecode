import React, { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';

/* ─────────────────────────────────────────────────────
  Types
───────────────────────────────────────────────────── */
export interface Project {
  id: number;
  name: string;
  img: string;
  url?: string;
  tags?: string[];
}

interface Props {
  projects: Project[];
}

/* ─────────────────────────────────────────────────────
  Constants
───────────────────────────────────────────────────── */
const DRAG_SENSITIVITY = 0.28;   // degrees per pixel of horizontal drag
const MOMENTUM_MS      = 200;    // window (ms) used to project snap target
const AUTO_PLAY_SPEED  = -0.08;  // Velocidad de auto-rotación (negativo = derecha a izquierda)

/* ─────────────────────────────────────────────────────
  Component
───────────────────────────────────────────────────── */
const Carousel3D: React.FC<Props> = ({ projects }) => {
  const N         = projects.length;
  const stepAngle = 360 / N;               // angular gap between cards

  /* ── Refs ──────────────────────────────────────── */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);

  // Plain object that GSAP tweens – avoids React re-renders during animation
  const rotObj = useRef({ value: 0 });

  const drag = useRef({
    active:   false,
    startX:   0,
    startRot: 0,
    lastX:    0,
    lastTime: 0,
    velocity: 0,   // px / ms
  });

  /* ── State ─────────────────────────────────────── */
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile,   setIsMobile]   = useState(
    () => typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  /* ── Layout (Escala Intermedia) ─────────────────── */
  const RADIUS      = isMobile ? 270  : 490;   // Distancia al centro (Punto medio)
  const CARD_W      = isMobile ? 260  : 460;   // Ancho de la tarjeta (Punto medio)
  const CARD_H      = Math.round(CARD_W * 10 / 16); 
  const PERSPECTIVE = isMobile ? 850  : 1400;  // Profundidad de cámara equilibrada
  const WRAPPER_H   = CARD_H + 108;

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  /* ───────────────────────────────────or───────────────
    Core: apply a rotation value to the whole track
  ────────────────────────────────────────────────── */
  const applyRotation = useCallback((rot: number) => {
    rotObj.current.value = rot;

    if (trackRef.current) {
      gsap.set(trackRef.current, { rotateY: rot });
    }

    let nearestIdx = 0;
    let minDist    = Infinity;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      let dist = ((stepAngle * i + rot) % 360 + 360) % 360;
      if (dist > 180) dist = 360 - dist;

      const opacity    = Math.max(0.18, 1 - (dist / 180) * 0.82);
      const brightness = Math.max(0.38, 1 - (dist / 180) * 0.62);
      gsap.set(card, { opacity, filter: `brightness(${brightness})` });

      if (dist < minDist) { minDist = dist; nearestIdx = i; }
    });

    setActiveIdx(prev => (prev !== nearestIdx ? nearestIdx : prev));
  }, [stepAngle]);

  /* ──────────────────────────────────────────────────
    Auto-rotación
  ────────────────────────────────────────────────── */
  useEffect(() => {
    if (isDragging) return;

    const tick = () => {
      if (!gsap.isTweening(rotObj.current)) {
        applyRotation(rotObj.current.value + AUTO_PLAY_SPEED);
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [isDragging, applyRotation]);

  /* ──────────────────────────────────────────────────
    Entry animation
  ────────────────────────────────────────────────── */
  useEffect(() => {
    cardRefs.current.forEach(card => {
      if (card) gsap.set(card, { opacity: 0 });
    });

    const ctx = gsap.context(() => {
      // Quitamos el onComplete para que no reinicie la rotación al terminar el fade-in
      const tl = gsap.timeline(); 

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        let dist = ((stepAngle * i) % 360 + 360) % 360;
        if (dist > 180) dist = 360 - dist;
        const finalOpacity = Math.max(0.18, 1 - (dist / 180) * 0.82);

        tl.to(
          card,
          { opacity: finalOpacity, duration: 0.85, ease: 'power2.out' },
          i * 0.11 + 0.15,
        );
      });
    }, wrapperRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ──────────────────────────────────────────────────
    Snap
  ────────────────────────────────────────────────── */
  const snapToNearest = useCallback((currentRot: number, velContrib: number) => {
    const projected   = currentRot + velContrib;
    const nearestStep = Math.round(projected / stepAngle);
    const snapRot     = nearestStep * stepAngle;

    gsap.to(rotObj.current, {
      value:    snapRot,
      duration: 0.92,
      ease:     'expo.out',
      onUpdate: () => applyRotation(rotObj.current.value),
    });
  }, [applyRotation, stepAngle]);

  /* ──────────────────────────────────────────────────
    Pointer handlers
  ────────────────────────────────────────────────── */
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    gsap.killTweensOf(rotObj.current);
    drag.current = {
      active:   true,
      startX:   e.clientX,
      startRot: rotObj.current.value,
      lastX:    e.clientX,
      lastTime: Date.now(),
      velocity: 0,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const now = Date.now();
    const dt  = now - drag.current.lastTime;
    const dx  = e.clientX - drag.current.lastX;
    if (dt > 0) drag.current.velocity = dx / dt;
    drag.current.lastX    = e.clientX;
    drag.current.lastTime = now;
    applyRotation(drag.current.startRot + (e.clientX - drag.current.startX) * DRAG_SENSITIVITY);
  }, [applyRotation]);

  const onPointerUp = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setIsDragging(false);
    const velContrib = drag.current.velocity * MOMENTUM_MS * DRAG_SENSITIVITY;
    snapToNearest(rotObj.current.value, velContrib);
  }, [snapToNearest]);

  /* ──────────────────────────────────────────────────
    Render
  ────────────────────────────────────────────────── */
  return (
    <div
      ref={wrapperRef}
      role="region"
      aria-label="Carrusel de proyectos"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`relative w-full select-none touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        height: `${WRAPPER_H}px`,
        perspective: `${PERSPECTIVE}px`,
        perspectiveOrigin: '50% 50%',
      }}
    >
      <div
        ref={trackRef}
        className="absolute left-1/2 top-1/2 w-0 h-0 [transform-style:preserve-3d] will-change-transform"
      >
        {projects.map((project, i) => {
          const baseAngle = stepAngle * i;
          const isActive  = i === activeIdx;

          return (
            <div
              key={project.id}
              ref={(el: HTMLDivElement | null) => { cardRefs.current[i] = el; }}
              role="listitem"
              aria-label={`Proyecto: ${project.name}`}
              className={`absolute overflow-hidden will-change-[opacity,filter] border-2 border-[#06CFD6]/40 rounded-[18px] transition-[box-shadow] duration-[420ms] ease-out ${
                isActive 
                  ? 'shadow-[0_0_42px_12px_rgba(6,207,214,0.4),inset_0_0_20px_rgba(6,207,214,0.2)]'
                  : 'shadow-[0_12px_34px_rgba(0,0,0,0.55)]'
              }`}
              style={{
                width: `${CARD_W}px`,
                height: `${CARD_H}px`,
                top: `${-CARD_H / 2}px`,
                left: `${-CARD_W / 2}px`,
                transform: `rotateY(${baseAngle}deg) translateZ(${RADIUS}px)`,
              }}
            >
              {/* ── Project image / GIF ──────────────── */}
              <img
                src={project.img}
                alt={project.name}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover block pointer-events-none"
              />

              {/* ── Bottom gradient + info ───────────── */}
              <div className={`absolute inset-0 bg-[linear-gradient(to_top,rgba(2,10,44,0.97)_0%,rgba(2,10,44,0.48)_52%,transparent_100%)] flex flex-col justify-end pointer-events-none ${isMobile ? 'p-[13px]' : 'p-6'}`}>
                <h3 className={`font-sansation font-bold m-0 mb-2 transition-colors duration-[380ms] ease-out leading-[1.2] ${isMobile ? 'text-[1.1rem]' : 'text-[1.4rem]'} ${isActive ? 'text-[#06CFD6]' : 'text-white'}`}>
                  {project.name}
                </h3>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex gap-2 mt-[7px] flex-wrap">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="font-inter text-[0.75rem] text-[#06CFD6] border border-[#06CFD6]/40 rounded-[6px] px-2 py-[3px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Elementos Decorativos Esquina Inferior Derecha ── */}
              {/* Borde Decorativo */}
              <img
                src="/vectors/designs/elemento_esquina_inferior_izquierda_de_portafolio.svg"
                alt=""
                className={`absolute bottom-0 right-0 h-auto pointer-events-none ${isMobile ? 'w-[90px]' : 'w-[145px]'}`}
              />
              
              {/* Isotipo */}
              <img
                src="/vectors/designs/elemento_logo.svg"
                alt=""
                className={`absolute pointer-events-none h-auto ${isMobile ? 'bottom-[10px] right-[10px] w-[20px]' : 'bottom-[15px] right-[15px] w-[32px]'}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel3D;