import React from 'react';
import ShineBorder from '../ui/shine-border';
import SpotlightText from '../typography/SpotlightText';

const ServerCrashIcon = () => (
  <svg
    width="44"
    height="44"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-400 drop-shadow-[0_0_12px_rgba(255,77,77,0.8)]"
    aria-hidden="true"
  >
    <rect width="16" height="8" x="4" y="3" rx="2" />
    <rect width="16" height="8" x="4" y="13" rx="2" />
    <path d="M7 7h.01" />
    <path d="M7 17h.01" />
    <path d="m11 8 2-2" />
    <path d="m13 8-2-2" />
    <path d="m11 18 2-2" />
    <path d="m13 18-2-2" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform duration-500 lg:group-hover:rotate-180"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 0 1 15.2-6.47" />
    <path d="M18 2v4h-4" />
    <path d="M21 12a9 9 0 0 1-15.2 6.47" />
    <path d="M6 22v-4h4" />
  </svg>
);

const HomeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white/70 transition-colors duration-300 lg:group-hover:text-white"
    aria-hidden="true"
  >
    <path d="m3 10 9-7 9 7" />
    <path d="M5 10v10h14V10" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

const ErrorFallback: React.FC = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden font-sansation select-none">
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(12,163,198,0.25)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,207,214,0.2)_0%,_transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}vectors/designs/stardust.png)` }}
        />
        <div
          className="absolute inset-0 rotate-180 opacity-50 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}vectors/designs/stardust.png)` }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[750px] flex-1 flex-col items-center justify-center px-6 py-20 pointer-events-auto">
        <div className="relative z-10 w-full max-w-2xl rounded-[2.5rem] bg-white/[0.03] shadow-[0_0_50px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <ShineBorder
            className="relative flex w-full flex-col items-center bg-transparent p-10 text-center md:p-14"
            color={['#ff4d4d', '#06CFD6', '#ff1a1a', '#0CA3C6']}
            borderRadius={40}
            borderWidth={2}
          >
            <div className="relative mt-4 mb-10 flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full border border-red-500/50" />
              <div className="absolute inset-0 rounded-full border border-[#06CFD6]/50 [animation:ping_3s_cubic-bezier(0,0,0.2,1)_1s_infinite]" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-red-500/30 bg-gradient-to-tr from-red-500/20 to-[#0CA3C6]/10 shadow-[0_0_30px_rgba(255,77,77,0.3)] backdrop-blur-sm">
                <div className="animate-pulse">
                  <ServerCrashIcon />
                </div>
              </div>
            </div>

            <h1 className="mb-5 text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white drop-shadow-md">
              Houston, tenemos un <span className="text-red-400">problema</span>
            </h1>

            <div className="mb-10 max-w-[420px] text-[clamp(1rem,2vw,1.2rem)] font-light leading-relaxed text-white/80 md:text-[clamp(1.1rem,2.3vw,1.4rem)] lg:text-[clamp(1rem,2vw,1.2rem)]">
              <SpotlightText>
                Un error inesperado ha alterado nuestra ruta. Nuestro equipo ya fue notificado para resolverlo.
              </SpotlightText>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => window.location.reload()}
                className="group flex w-full items-center justify-center gap-3 rounded-full border border-transparent bg-[#06CFD6] px-8 py-3.5 text-[1.1rem] font-bold text-white outline-none transition-all duration-300 active:scale-95 sm:w-auto lg:hover:shadow-[0_0_25px_rgba(6,207,214,0.6)]"
              >
                <RefreshIcon />
                Reintentar
              </button>

              <a
                href="/"
                className="group flex w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-[1.1rem] font-medium text-white outline-none transition-all duration-300 active:scale-95 sm:w-auto lg:hover:border-white/40 lg:hover:bg-white/10"
              >
                <HomeIcon />
                Volver al inicio
              </a>
            </div>
          </ShineBorder>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
