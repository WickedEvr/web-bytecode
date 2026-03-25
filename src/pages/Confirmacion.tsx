import React from 'react';
import { motion } from 'framer-motion';

const RocketIcon = () => (
  <svg
    viewBox="0 0 90 100"
    fill="none"
    stroke="#00bcd4"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-24 h-24 drop-shadow-[0_0_18px_rgba(0,188,212,0.75)]"
  >
    {/* Body */}
    <path d="M45 8 C32 8 22 22 20 40 L17 58 L28 54 L33 70 L38 58 L45 62 L52 58 L57 70 L62 54 L73 58 L70 40 C68 22 58 8 45 8Z" />
    {/* Window */}
    <circle cx="45" cy="34" r="7" />
    {/* Left fin */}
    <path d="M20 40 L10 56 L20 50" />
    {/* Right fin */}
    <path d="M70 40 L80 56 L70 50" />
    {/* Flame */}
    <path d="M33 70 C36 82 42 88 45 86 C48 88 54 82 57 70" />
  </svg>
);

const Confirmacion: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center overflow-hidden">
      {/* Fondo espacio */}
      <div className="absolute inset-0">
        <img src="/hero.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-[#040e1f]/72" />
      </div>

      {/* Estrellas decorativas */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[
          [12, 15], [25, 70], [75, 20], [88, 65], [50, 85],
          [35, 40], [65, 10], [10, 50], [90, 40], [60, 75],
        ].map(([x, y], i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
          className="flex justify-center mb-8"
        >
          <RocketIcon />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-5xl font-black text-primary-cyan mb-6"
        >
          Solicitud enviada
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-white/75 text-base md:text-lg leading-relaxed"
        >
          Hemos recibido tus datos correctamente.<br />
          Un asesor se comunicará contigo en breve para<br />
          brindarte más información.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Confirmacion;
