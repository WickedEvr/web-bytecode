import React, { useRef, useState } from 'react';

interface SpotlightTextProps {
  children: React.ReactNode;
  className?: string;
}

const SpotlightText: React.FC<SpotlightTextProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block cursor-default pointer-events-auto ${className}`}
    >
      {/* 1. ANIMACIÓN CSS INYECTADA: Hace que la niebla viaje de izquierda a derecha */}
      <style>
        {`
          @keyframes fog-flow {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          .animate-fog {
            animation: fog-flow 12s linear infinite;
          }
        `}
      </style>

      {/* 2. TEXTO BASE: Se atenúa cuando el ratón entra */}
      <div
        className="relative z-10 transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 1 }}
      >
        {children}
      </div>

      {/* 3. CAPA DE LA LINTERNA (MÁSCARA) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          // La MÁSCARA recorta todo el div y solo deja ver un círculo difuminado alrededor del ratón
          WebkitMaskImage: `radial-gradient(130px circle at ${position.x}px ${position.y}px, black 20%, transparent 90%)`,
          maskImage: `radial-gradient(130px circle at ${position.x}px ${position.y}px, black 20%, transparent 90%)`,
        }}
      >
        {/* 4. EL TEXTO CON LA NIEBLA MOVIÉNDOSE (Visible solo bajo la linterna) */}
        <div
          className="animate-fog w-full h-full"
          style={{
            // Combinamos una textura de niebla SVG nativa con un gradiente de tus colores
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.015' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E"),
              linear-gradient(90deg, #06CFD6, #024F79, #026B9B, #0CA3C6)
            `,
            backgroundSize: '200% auto', // Doble de ancho para que pueda fluir
            backgroundBlendMode: 'overlay', // Fusiona la textura de humo con los colores
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SpotlightText;