import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../../pages/Portafolio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * Full-image modal without border radius or gradients.
 * Close button is positioned outside the main box in the top-right corner.
 */
export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* BACKDROP OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020611]/35 backdrop-blur-md"
          />

          {/* ENVOLTORIO PRINCIPAL DEL MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-4xl flex flex-col items-end"
          >
            {/* BOTÓN DE CIERRE (FUERA DEL CUADRO, ALINEADO A LA DERECHA EN LA PARTE SUPERIOR) */}
            <button
              onClick={onClose}
              className="mb-2 w-10 h-10 rounded-none bg-black text-white hover:bg-[#06cfd6] hover:text-black flex items-center justify-center transition-colors duration-200 outline-none border border-white/20 shadow-lg cursor-pointer flex-shrink-0"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* CUADRO PRINCIPAL DEL MODAL (SIN BORDER RADIUS, IMAGEN DE FONDO COMPLETA) */}
            <div className="relative w-full h-[78vh] max-h-[600px] overflow-hidden rounded-none border border-white/20 shadow-2xl flex flex-col justify-between select-none">
              {/* FULL IMAGE BACKGROUND */}
              <img
                src={project.img}
                alt={project.name}
                className="absolute inset-0 w-full h-full object-cover object-center z-0 rounded-none"
              />

              {/* CONTENIDO EN 1 SOLA FILA INFERIOR COMPACTA (COLOR NEGRO ENTERO) */}
              <div className="relative z-20 mt-auto p-4 sm:p-5 bg-[#020611] border-t border-white/15 flex flex-row items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                {/* LADO IZQUIERDO: TÍTULO + TECNOLOGÍAS EN LA MISMA FILA */}
                <div className="flex flex-row items-center gap-3 sm:gap-4 min-w-0 flex-wrap sm:flex-nowrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight whitespace-nowrap">
                    {project.name}
                  </h2>

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:border-l sm:border-white/20 sm:pl-4">
                      {project.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold rounded-none bg-[#0a1526] border border-[#06cfd6] text-[#06cfd6] tracking-wide whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* LADO DERECHO: BOTÓN "VISITAR EL SITIO" */}
                {project.url && (
                  <div className="flex-shrink-0 ml-auto">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#06cfd6] text-black font-bold text-xs sm:text-sm hover:bg-white hover:text-black transition-colors duration-200 shadow-md whitespace-nowrap"
                    >
                      <span>Visitar el sitio</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
