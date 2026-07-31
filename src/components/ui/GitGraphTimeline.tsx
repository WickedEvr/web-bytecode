import React, { useMemo } from 'react';
import { computeGitGraph, type GitCommitRaw } from '../../utils/gitGraphEngine';

interface GitGraphTimelineProps {
  commits: GitCommitRaw[];
}

// Paleta de colores para los carriles (lanes). Ciclarán si hay más de 5 ramas activas.
const LANE_COLORS = [
  { fill: 'bg-cyan-500', stroke: '#06b6d4', text: 'text-cyan-400' }, // 0
  { fill: 'bg-purple-500', stroke: '#a855f7', text: 'text-purple-400' }, // 1
  { fill: 'bg-amber-500', stroke: '#f59e0b', text: 'text-amber-400' }, // 2
  { fill: 'bg-rose-500', stroke: '#f43f5e', text: 'text-rose-400' }, // 3
  { fill: 'bg-emerald-500', stroke: '#10b981', text: 'text-emerald-400' }, // 4
];

export const GitGraphTimeline: React.FC<GitGraphTimelineProps> = ({ commits }) => {
  // Memoizamos el cálculo pesado para que no se re-renderice sin necesidad
  const graph = useMemo(() => {
    if (!commits || commits.length === 0) return null;
    return computeGitGraph(commits, 70, 50); // Espaciado un poco más amplio
  }, [commits]);

  if (!graph) {
    return <div className="p-8 text-center text-sm text-white/30">No hay commits para visualizar.</div>;
  }

  // Función para dibujar curvas de Bézier suaves de izquierda a derecha.
  // source: el commit hijo (está a la derecha)
  // target: el commit padre (está a la izquierda)
  const renderPath = (sx: number, sy: number, tx: number, ty: number) => {
    if (sy === ty) {
      // Línea recta si están en el mismo carril
      return `M ${sx} ${sy} L ${tx} ${ty}`;
    }
    // Curva de Bézier cúbica para suavizar cambios de carril (merges/branches)
    // Puntos de control a mitad de camino horizontalmente
    const midX = tx + (sx - tx) / 2;
    return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
  };

  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-white/5 bg-[#0a0a0a] p-4 font-sansation shadow-inner">
      <div 
        className="relative" 
        style={{ width: `${graph.width}px`, height: `${graph.height}px` }}
      >
        {/* Capa Inferior: Conexiones SVG */}
        <svg 
          className="absolute inset-0 z-0 pointer-events-none"
          width={graph.width} 
          height={graph.height}
        >
          {graph.links.map(link => {
            const colorObj = LANE_COLORS[link.colorIndex % LANE_COLORS.length];
            return (
              <path
                key={link.id}
                d={renderPath(link.sourcePos.x, link.sourcePos.y, link.targetPos.x, link.targetPos.y)}
                fill="none"
                stroke={colorObj.stroke}
                strokeWidth={2.5}
                strokeLinecap="round"
                className="opacity-50 transition-opacity hover:opacity-100"
              />
            );
          })}
        </svg>

        {/* Capa Superior: Nodos HTML Interactivos */}
        {graph.nodes.map(node => {
          const colorObj = LANE_COLORS[node.colorIndex % LANE_COLORS.length];
          return (
            <div
              key={node.sha}
              className="absolute z-10 flex items-center justify-center group"
              style={{ 
                left: `${node.x}px`, 
                top: `${node.y}px`, 
                transform: 'translate(-50%, -50%)' // Centrar en las coordenadas del motor
              }}
            >
              {/* Círculo del Commit */}
              <div 
                className={`h-4 w-4 rounded-full border-2 border-[#0a0a0a] shadow-[0_0_0_2px_rgba(255,255,255,0.1)] ${colorObj.fill} transition-transform group-hover:scale-125 cursor-pointer`}
              />

              {/* Etiquetas (Refs/Branches) - Posicionadas arriba del nodo */}
              {node.refs && node.refs.length > 0 && (
                <div className="absolute -top-6 whitespace-nowrap flex gap-1 pointer-events-none">
                  {node.refs.map(ref => (
                    <span 
                      key={ref} 
                      className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/80 border border-white/20 backdrop-blur-sm"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}

              {/* Tooltip Hover Estilizado (Tailwind) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-[-4px] transition-all duration-200 z-50">
                <div className="w-64 rounded-xl border border-white/10 bg-[#121212] p-3 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-[10px] font-medium ${colorObj.text}`}>
                      {node.sha.substring(0, 7)}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {new Date(node.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/90 font-medium leading-tight mb-2 truncate">
                    {node.message}
                  </p>
                  <p className="text-xs text-white/50">
                    Por: <span className="text-white/70">{node.author}</span>
                  </p>
                </div>
                {/* Triángulo/Flecha del tooltip */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r border-white/10 bg-[#121212]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
