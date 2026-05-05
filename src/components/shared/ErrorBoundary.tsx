import React, { type ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { ServerCrash, RefreshCcw, Home } from 'lucide-react';
import ShineBorder from '../ui/shine-border';
import SpotlightText from '../typography/SpotlightText';

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// --- INTERFAZ VISUAL DEL ERROR (Componente Funcional) ---
const ErrorFallback: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sansation select-none">
      
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
          className="relative z-10 w-full max-w-2xl bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.4)]"
        >
          {/* Tarjeta Shine Border (Mezcla colores corporativos con toques de alerta) */}
          <ShineBorder
            className="relative flex flex-col items-center text-center w-full bg-transparent p-10 md:p-14"
            color={["#ff4d4d", "#06CFD6", "#ff1a1a", "#0CA3C6"]} 
            borderRadius={40} 
            borderWidth={2}
          >
            {/* Contenedor del Icono de Error */}
            <div className="relative flex justify-center items-center mb-10 w-32 h-32 mt-4">
              
              {/* Ondas Expansivas (Rojas/Cyan) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.3, 0], scale: [0.9, 1.2, 1.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-red-500/50"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.3, 0], scale: [0.9, 1.2, 1.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                className="absolute inset-0 rounded-full border border-[#06CFD6]/50"
              />
              
              {/* Base Círculo Neón de Alerta */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
                className="relative flex justify-center items-center w-24 h-24 bg-gradient-to-tr from-red-500/20 to-[#0CA3C6]/10 border border-red-500/30 rounded-full shadow-[0_0_30px_rgba(255,77,77,0.3)] backdrop-blur-sm"
              >
                {/* Icono de Servidor Caído flotando */}
                <motion.div
                  animate={{ y: [-3, 3, -3], rotate: [-1.5, 1.5, -1.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ServerCrash size={44} className="text-red-400 drop-shadow-[0_0_12px_rgba(255,77,77,0.8)]" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            </div>

            {/* Textos */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white mb-5 tracking-tight drop-shadow-md"
            >
              ¡Houston, tenemos un <span className="text-red-400">problema!</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-white/80 text-[clamp(1rem,2vw,1.2rem)] md:text-[clamp(1.1rem,2.3vw,1.4rem)] lg:text-[clamp(1rem,2vw,1.2rem)] leading-relaxed font-light mb-10 max-w-[420px]"
            >
              <SpotlightText>
                Un error inesperado ha alterado nuestra ruta. Nuestro equipo de ingenieros estelares ya ha sido notificado para resolverlo.
              </SpotlightText>
            </motion.div>

            {/* Botones de Acción */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
            >
              <button
                onClick={() => window.location.reload()}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border border-transparent bg-[#06CFD6] text-white hover:shadow-[0_0_25px_rgba(6,207,214,0.6)] transition-all duration-300 active:scale-95 outline-none font-bold text-[1.1rem]"
              >
                <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" strokeWidth={2.5} />
                Reintentar
              </button>

              <a
                href="/"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-300 hover:border-white/40 active:scale-95 outline-none font-medium text-[1.1rem]"
              >
                <Home size={20} className="text-white/70 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                Volver al inicio
              </a>
            </motion.div>

          </ShineBorder>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorBoundary;