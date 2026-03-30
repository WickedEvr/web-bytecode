import React, { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';

/* ─────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────── */
export interface Project {
  id: number;
  name: string;
  description: string;
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

  /* ── Layout (reactive to viewport) ─────────────── */
  const RADIUS      = isMobile ? 240  : 460;
  const CARD_W      = isMobile ? 248  : 352;
  const CARD_H      = Math.round(CARD_W * 10 / 16);   // 16 : 10 ratio
  const PERSPECTIVE = isMobile ? 820  : 1300;
  const WRAPPER_H   = CARD_H + 108;

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  /* ──────────────────────────────────────────────────
     Core: apply a rotation value to the whole track
     and update per-card opacity / brightness.
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

      // Angular distance from the front face (0 = front, 180 = back)
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
     Entry animation – runs once on mount.
     Fades each card in from opacity 0 to its correct
     opacity, staggered. No scale (avoids transform
     conflicts between React inline style and GSAP).
  ────────────────────────────────────────────────── */
  useEffect(() => {
    // 1. Hide all cards immediately
    cardRefs.current.forEach(card => {
      if (card) gsap.set(card, { opacity: 0 });
    });

    // 2. Staggered fade-in to the correct opacity per angle
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => applyRotation(0),  // ensure state is consistent afterward
      });

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
     Snap: after drag ends, animate rotation to the
     nearest card position using expo.out easing.
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
     Pointer handlers (mouse + touch via pointer events)
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
      style={{
        position:          'relative',
        width:             '100%',
        height:            `${WRAPPER_H}px`,
        perspective:       `${PERSPECTIVE}px`,
        perspectiveOrigin: '50% 50%',
        cursor:            isDragging ? 'grabbing' : 'grab',
        touchAction:       'none',
        userSelect:        'none',
      }}
    >

      {/* ── Cylinder track: rotates as a single unit ── */}
      <div
        ref={trackRef}
        style={{
          position:       'absolute',
          left:           '50%',
          top:            '50%',
          width:          0,
          height:         0,
          transformStyle: 'preserve-3d',
          willChange:     'transform',
        }}
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
              style={{
                position:     'absolute',
                width:        `${CARD_W}px`,
                height:       `${CARD_H}px`,
                top:          `${-CARD_H / 2}px`,
                left:         `${-CARD_W / 2}px`,
                // React owns the 3D positioning transform; GSAP owns opacity/filter only
                transform:    `rotateY(${baseAngle}deg) translateZ(${RADIUS}px)`,
                borderRadius: '18px',
                overflow:     'hidden',
                willChange:   'opacity, filter',
                boxShadow:    isActive
                  ? '0 0 42px 12px rgba(6,207,214,0.32), 0 22px 52px rgba(0,0,0,0.7)'
                  : '0 12px 34px rgba(0,0,0,0.55)',
                transition:   'box-shadow 0.42s ease',
              }}
            >
              {/* ── Project image / GIF ──────────────── */}
              <img
                src={project.img}
                alt={project.name}
                loading="lazy"
                draggable={false}
                style={{
                  width:         '100%',
                  height:        '100%',
                  objectFit:     'cover',
                  display:       'block',
                  pointerEvents: 'none',
                }}
              />

              {/* ── Bottom gradient + info ───────────── */}
              <div
                style={{
                  position:       'absolute',
                  inset:          0,
                  background:     'linear-gradient(to top, rgba(2,10,44,0.97) 0%, rgba(2,10,44,0.48) 52%, transparent 100%)',
                  display:        'flex',
                  flexDirection:  'column',
                  justifyContent: 'flex-end',
                  padding:        isMobile ? '13px 13px' : '19px 16px',
                  pointerEvents:  'none',
                }}
              >
                <h3
                  style={{
                    fontFamily:   'Sansation, sans-serif',
                    fontWeight:   700,
                    fontSize:     isMobile ? '0.9rem' : '1.05rem',
                    color:        isActive ? '#06CFD6' : '#ffffff',
                    margin:       '0 0 3px',
                    transition:   'color 0.38s ease',
                    lineHeight:   1.2,
                  }}
                >
                  {project.name}
                </h3>

                <p
                  className="carousel-desc"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize:   isMobile ? '0.68rem' : '0.76rem',
                    color:      'rgba(255,255,255,0.68)',
                    lineHeight: 1.45,
                    margin:     0,
                  }}
                >
                  {project.description}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', marginTop: '7px', flexWrap: 'wrap' }}>
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontFamily:   'Inter, sans-serif',
                          fontSize:     '0.6rem',
                          color:        '#06CFD6',
                          border:       '1px solid rgba(6,207,214,0.38)',
                          borderRadius: '5px',
                          padding:      '1px 5px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Cyan border glow on active card ─── */}
              {isActive && (
                <div
                  aria-hidden="true"
                  style={{
                    position:      'absolute',
                    inset:         0,
                    borderRadius:  '18px',
                    border:        '1.5px solid rgba(6,207,214,0.55)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Progress dots ──────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          bottom:     '8px',
          left:       '50%',
          transform:  'translateX(-50%)',
          display:    'flex',
          gap:        '8px',
          alignItems: 'center',
        }}
      >
        {projects.map((_, i) => (
          <div
            key={i}
            style={{
              width:        i === activeIdx ? '22px' : '8px',
              height:       '7px',
              borderRadius: '4px',
              background:   i === activeIdx ? '#06CFD6' : 'rgba(255,255,255,0.25)',
              transition:   'all 0.38s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel3D;
