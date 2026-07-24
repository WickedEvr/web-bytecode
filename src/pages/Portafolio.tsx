import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../components/sections/Carousel3D';
import Carousel from '../components/ui/carousel';
import AltFooter from '../components/layout/AltFooter';
import SpotlightText from '../components/typography/SpotlightText';
import SEO from '../components/shared/SEO';
import { apiRequest, fetchPortfolio } from '../lib/api';
import Carousel3D from '../components/sections/Carousel3D';

const AuroraBackground = lazy(() => import('../components/effects/AuroraBackground'));

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
  const [isDesktop, setIsDesktop] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cmsSection, setCmsSection] = useState<PublishedCmsSection | null>(null);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const updateDesktop = () => setIsDesktop(desktopQuery.matches);

    updateDesktop();
    desktopQuery.addEventListener('change', updateDesktop);
    return () => desktopQuery.removeEventListener('change', updateDesktop);
  }, []);

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
    <div className="w-full min-h-screen font-sansation overflow-x-hidden flex flex-col relative bg-[#020611] select-none">
      {cmsSection && (
        <SEO
          title={cmsSection.meta_title || cmsSection.title}
          description={cmsSection.meta_description || 'Explora nuestros proyectos destacados y descubre cómo ayudamos a marcas y empresas a consolidar su presencia tecnológica.'}
        />
      )}

      {/* FONDO 3D FIJO */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-[#020611] flex items-center justify-center">
          </div>
        }>
          <AuroraBackground />
        </Suspense>
      </div>

      {/* CONTENEDOR FRONTAL */}
      <div className="w-full lg:min-h-[100dvh] flex flex-col relative z-10 pointer-events-none pt-[3rem] [@media(max-height:720px)]:pt-[1.5rem]">
        
        {/* HERO SECTION */}
        <section className="px-6 text-center text-white relative z-10 pointer-events-none flex-shrink-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-[85px] font-bold mb-4 md:mb-6 tracking-wide drop-shadow-2xl transition-all"
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
            className="text-white/95 text-base md:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl max-w-[90%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto leading-relaxed font-light drop-shadow-lg transition-all"
          >
            <SpotlightText>
              Ayudamos a marcas y empresas a consolidar su presencia tecnológica mediante
              productos innovadores, escalables y visualmente potentes.
            </SpotlightText>
          </motion.div>
        </section>

        {/* CARRUSEL ANIMADO (Móvil y Tablet) */}
        {cmsSection && projects.length > 0 && (
          <section className="w-full relative z-10 pointer-events-auto mt-6 md:mt-10 lg:hidden">
            <div className="w-full flex justify-center pb-24 md:pb-28">
              <Carousel slides={projects} />
            </div>
          </section>
        )}

        {/* CARRUSEL 3D (Solo Escritorio) */}
        {cmsSection && projects.length > 0 && (
          <section className="w-full relative z-10 pointer-events-auto flex-grow items-center justify-center xl:-mt-[11vh] 2xl:-mt-[10vh] [@media(max-height:720px)]:-mt-[2vh] hidden lg:flex">
            <div className="w-full flex justify-center origin-center scale-[0.70] md:scale-[0.80] lg:scale-[0.85] xl:scale-[0.8] 2xl:scale-[1] [@media(max-height:720px)]:scale-[0.60] transition-transform duration-500">
              {isDesktop && (
                <Suspense fallback={null}>
                  <Carousel3D projects={projects} />
                </Suspense>
              )}
            </div>
          </section>
        )}
      </div>

      {/* EL FOOTER */}
      <div className="relative z-10 pointer-events-auto mt-10 md:mt-8 lg:-mt-[14vh] xl:-mt-[10vh] [@media(max-height:720px)]:lg:-mt-[6vh]">
        <AltFooter />
      </div>
    </div>
  );
};

export default Portafolio;
