import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AltFooter from '../components/layout/AltFooter';
import SpotlightText from '../components/typography/SpotlightText';
import SEO from '../components/shared/SEO';
import { apiRequest, fetchPortfolio } from '../lib/api';
import BentoMarquee from '../components/ui/BentoMarquee';
import ProjectModal from '../components/ui/ProjectModal';

const AuroraBackground = lazy(() => import('../components/effects/AuroraBackground'));

export interface Project {
  id: string | number;
  name: string;
  img: string;
  url?: string;
  tags?: string[];
}

type PublishedCmsSection = {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  status_name?: string;
};

const Portafolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [cmsSection, setCmsSection] = useState<PublishedCmsSection | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiRequest<{ item: PublishedCmsSection }>('/public/cms/portafolio')
      .then((response) => {
        if (!isMounted) return [];
        setCmsSection(response.item);
        return fetchPortfolio();
      })
      .then((items) => {
        if (!isMounted) return;
        const publishedProjects = items
          .filter((item) => item.img)
          .map((item) => ({
            id: item.id,
            name: item.clientName || item.name,
            img: String(item.img),
            url: item.url ?? undefined,
            tags: item.tags,
          }));

        setProjects(publishedProjects);
      })
      .catch(() => {
        if (!isMounted) return;
        setCmsSection(null);
        setProjects([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full min-h-screen font-sansation flex flex-col relative bg-[#020611] select-none overflow-x-hidden">
      {cmsSection && (
        <SEO
          title={cmsSection.meta_title || cmsSection.title}
          description={cmsSection.meta_description || 'Explora nuestros proyectos destacados y descubre cómo ayudamos a marcas y empresas a consolidar su presencia tecnológica.'}
        />
      )}

      {/* FONDO 3D FIJO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={
          <div className="w-full h-full bg-[#020611] flex items-center justify-center" />
        }>
          <AuroraBackground />
        </Suspense>
      </div>

      {/* CONTENEDOR FRONTAL */}
      <div className="w-full flex flex-col justify-start lg:justify-center lg:min-h-[calc(100dvh-88px)] lg:h-[calc(100dvh-88px)] flex-grow relative z-10 pt-3 sm:pt-4 lg:pt-1 lg:pb-0">
        
        {/* HERO SECTION */}
        <section className="px-4 text-center text-white relative z-10 pointer-events-none flex-shrink-0 mb-3 sm:mb-4 lg:mb-1 pt-0">
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-1 tracking-wide drop-shadow-2xl"
          >
            {/* Texto normal para móvil y tablet */}
            <span className="lg:hidden">Portafolio</span>

            {/* SpotlightText para escritorio */}
            <span className="hidden lg:inline-block">
              <SpotlightText>Portafolio</SpotlightText>
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/90 text-xs sm:text-sm md:text-lg lg:text-sm xl:text-base 2xl:text-lg max-w-[92%] sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto leading-relaxed font-light drop-shadow-lg"
          >
            <SpotlightText>
              Ayudamos a marcas y empresas a consolidar su presencia tecnológica mediante
              productos innovadores, escalables y visualmente potentes.
            </SpotlightText>
          </motion.div>
        </section>

        {/* SECCIÓN BENTO MARQUEE INFINITO */}
        {cmsSection && projects.length > 0 && (
          <section className="w-full relative z-10 pointer-events-auto flex flex-col justify-start lg:justify-center my-0 lg:my-1 overflow-hidden px-0 py-0">
            <BentoMarquee
              projects={projects}
              onProjectClick={(project) => setSelectedProject(project)}
            />
          </section>
        )}
      </div>

      {/* MODAL DE DETALLES DEL PROYECTO */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* EL FOOTER */}
      <div className="relative z-10 pointer-events-auto mt-4 sm:mt-6 lg:mt-2">
        <AltFooter />
      </div>
    </div>
  );
};

export default Portafolio;
