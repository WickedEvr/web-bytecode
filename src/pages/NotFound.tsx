import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Telescope, ArrowLeft } from 'lucide-react';
import ShineBorder from '../components/ui/shine-border';
import SpotlightText from '../components/typography/SpotlightText';

const NotFound: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sansation select-none">
      
      {/* Fondo Espacial Unificado */}
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(12,163,198,0.25)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,207,214,0.2)_0%,_transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}vectors/designs/stardust.png)` }}
        />
        <div
          className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}vectors/designs/stardust.png)` }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[750px] mx-auto px-6 py-20 pointer-events-auto flex-1 flex flex-col justify-center items-center">
         
        {/* Contenedor Animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)]"
        >
          {/* Tarjeta Shine Border */}
          <ShineBorder
            className="relative flex flex-col items-center text-center w-full bg-transparent p-10 md:p-14"
            color={["#024F79", "#026B9B", "#06CFD6", "#0CA3C6"]}
            borderRadius={40} 
            borderWidth={2}
          >
            {/* Contenedor del Icono (Telescopio buscando la ruta) */}
            <div className="relative flex justify-center items-center mb-6 w-32 h-32 mt-4">
              
              {/* Ondas Expansivas */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.2, 1.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-[#06CFD6]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.2, 1.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                className="absolute inset-0 rounded-full border border-[#06CFD6]"
              />
              
              {/* Base Círculo Neón */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
                className="relative flex justify-center items-center w-24 h-24 bg-gradient-to-tr from-[#06CFD6]/20 to-[#0CA3C6]/5 border border-[#06CFD6]/30 rounded-full shadow-[0_0_30px_rgba(6,207,214,0.4)] backdrop-blur-sm"
              >
                {/* Icono flotando y "buscando" */}
                <motion.div
                  animate={{ 
                    y: [-3, 3, -3], 
                    rotate: [-10, 10, -10] // Rotación más amplia como si estuviera buscando
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Telescope size={44} className="text-[#06CFD6] drop-shadow-[0_0_12px_rgba(6,207,214,0.8)]" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            </div>

            {/* Número 404 Glitch/Flotante */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[clamp(4rem,8vw,6rem)] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#06CFD6]/50 mb-2 tracking-tighter drop-shadow-lg"
            >
              404
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-white mb-5 tracking-tight drop-shadow-md"
            >
              ¡Te perdiste en el <span className="text-[#06CFD6]">hiperespacio!</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-white/80 text-[clamp(1rem,2vw,1.2rem)] md:text-[clamp(1.1rem,2.3vw,1.4rem)] lg:text-[clamp(1rem,2vw,1.2rem)] leading-relaxed font-light mb-10 max-w-[400px]"
            >
              <SpotlightText>
                Nuestros radares no detectan la página que estás buscando. Es posible que haya sido abducida o movida a otra galaxia.
              </SpotlightText>
            </motion.div>

            {/* Botón CTA - Regresar (Con protecciones táctiles) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link
                to="/"
                className="group flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 lg:hover:bg-[#06CFD6] lg:hover:border-[#06CFD6] text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)] lg:hover:shadow-[0_0_25px_rgba(6,207,214,0.5)] active:scale-95 outline-none font-medium text-[1.1rem]"
              >
                <ArrowLeft size={22} className="lg:group-hover:-translate-x-1.5 transition-transform duration-300 text-white/70 lg:group-hover:text-white" strokeWidth={2} />
                Fijar rumbo al inicio
              </Link>
            </motion.div>

          </ShineBorder>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;