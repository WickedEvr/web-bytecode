import React from 'react';
import { motion } from 'framer-motion';

const mvv = [
  {
    title: 'Misión',
    content:
      'Transformar retos de negocio en productos digitales funcionales, estéticos y técnicamente excelentes.',
  },
  {
    title: 'Visión',
    content:
      'Ser el aliado tecnológico referente en la región, elevando los estándares de desarrollo y escalabilidad en productos de clase mundial.',
  },
  {
    title: 'Valores',
    content:
      'Precisión técnica, Innovación disruptiva, Escalabilidad multiplataforma, Transparencia operativa y Calidad de código.',
  },
];

const Nosotros: React.FC = () => {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[80vh] flex items-stretch overflow-hidden bg-[#060c1d]">

        {/* Fondo espacio + overlay */}
        <div className="absolute inset-0">
          <img src="/hero.png" alt="" className="w-full h-full object-cover opacity-40" aria-hidden="true" />
          <div className="absolute inset-0 bg-[#040e1f]/60" />
        </div>

        {/* Puntos de constelación (izquierda) */}
        <svg
          className="absolute left-0 top-0 h-full w-1/3 pointer-events-none opacity-60"
          viewBox="0 0 300 600"
          preserveAspectRatio="xMinYMid meet"
          aria-hidden="true"
        >
          <circle cx="30" cy="80" r="2" fill="rgba(0,188,212,0.8)" />
          <circle cx="80" cy="200" r="1.5" fill="rgba(255,255,255,0.6)" />
          <circle cx="20" cy="320" r="2" fill="rgba(0,188,212,0.6)" />
          <circle cx="110" cy="420" r="1.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="60" cy="500" r="2" fill="rgba(0,188,212,0.7)" />
          <line x1="30" y1="80" x2="80" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="80" y1="200" x2="20" y2="320" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="20" y1="320" x2="110" y2="420" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="110" y1="420" x2="60" y2="500" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        </svg>

        {/* Contenido */}
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center">

          {/* Columna izquierda — texto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full md:w-1/2 px-8 md:px-16 py-20 flex flex-col justify-center"
          >
            <h1 className="text-5xl md:text-6xl font-black text-primary-cyan mb-6">
              Nosotros
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-sm">
              Nos especializamos en ingeniería de software multiplataforma y automatización
              inteligente para negocios escalables.
            </p>
          </motion.div>

          {/* Columna derecha — imagen */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="w-full md:w-1/2 h-72 md:h-auto md:min-h-[80vh] relative overflow-hidden"
          >
            {/* Reemplaza con tu imagen real */}
            <img
              src="https://images.unsplash.com/photo-1637143396528-d6106f629e1a?w=700&q=80"
              alt="Tecnología"
              className="w-full h-full object-cover object-top"
            />
            {/* Overlay degradado izquierdo para fusión con el texto */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#040e1f] to-transparent" />
            {/* Overlay degradado inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#040e1f] to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ── MISIÓN / VISIÓN / VALORES ── */}
      <section className="bg-[#0a4a5a] relative overflow-hidden py-20 px-6">

        {/* Triángulo decorativo (izquierda) */}
        <div className="absolute left-0 bottom-0 pointer-events-none opacity-60" aria-hidden="true">
          <svg viewBox="0 0 300 400" className="w-48 md:w-64">
            <polygon points="0,400 150,100 300,400" fill="none" stroke="rgba(0,188,212,0.4)" strokeWidth="1.2" />
            <polygon points="0,400 80,220 160,400" fill="none" stroke="rgba(0,188,212,0.3)" strokeWidth="1" />
            <polygon points="160,400 240,250 300,400" fill="rgba(0,188,212,0.15)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="space-y-12">
            {mvv.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                  {item.title}
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Nosotros;
