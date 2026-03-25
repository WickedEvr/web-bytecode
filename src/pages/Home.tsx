import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Laptop, Smartphone, Cpu, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Página Web',
    description: 'Desarrollo a medida con las mejores tecnologías. Creamos experiencias digitales únicas que impulsan tu negocio al siguiente nivel.',
    icon: <Laptop size={48} />,
    image: 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20'
  },
  {
    title: 'App Móvil',
    description: 'Aplicaciones nativas e híbridas diseñadas para ofrecer el mejor rendimiento y experiencia de usuario en cualquier dispositivo.',
    icon: <Smartphone size={48} />,
    image: 'bg-gradient-to-br from-blue-500/20 to-indigo-600/20'
  },
  {
    title: 'Soluciones IA',
    description: 'Implementamos inteligencia artificial para automatizar procesos complejos y brindar insights inteligentes a tu empresa.',
    icon: <Cpu size={48} />,
    image: 'bg-gradient-to-br from-purple-500/20 to-cyan-600/20'
  }
];

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % services.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);

  return (
    <div className="bg-space">
      <div className="network-overlay min-h-screen">
        
        {/* Hero Section */}
        <section className="section-container min-h-[85vh] flex flex-col items-center justify-center text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-cyan/10 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black mb-10 leading-[1.1] max-w-5xl tracking-tight"
          >
            Un sitio web<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-cyan to-white">
              Hace tus ideas realidad
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/contacto" className="btn-cyan text-xl px-12 py-4 shadow-[0_0_20px_rgba(0,188,212,0.4)] hover:shadow-[0_0_30px_rgba(0,188,212,0.6)]">
              Conectar
            </Link>
          </motion.div>
        </section>

        {/* Services Slider Section */}
        <section className="section-container relative py-32">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-primary-cyan border-l-8 border-primary-cyan pl-6">
              Servicios
            </h2>
          </div>
          
          <div className="relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="relative overflow-hidden glass-panel p-6 md:p-16 flex flex-col lg:flex-row items-stretch gap-12 min-h-[500px]"
              >
                <div className={`w-full lg:w-1/2 rounded-3xl relative overflow-hidden flex items-center justify-center ${services[currentSlide].image} border border-white/10`}>
                   <div className="absolute inset-0 bg-space opacity-40"></div>
                   <div className="relative z-10 text-primary-cyan drop-shadow-[0_0_15px_rgba(0,188,212,0.5)]">
                     {services[currentSlide].icon}
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                     <p className="text-3xl font-bold">{services[currentSlide].title}</p>
                   </div>
                </div>
                
                <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8">
                  <h3 className="text-4xl md:text-5xl font-bold leading-tight">Obtén mucha más información</h3>
                  <p className="text-gray-300 text-xl leading-relaxed">
                    {services[currentSlide].description}
                  </p>
                  <div>
                    <Link to="/contacto" className="btn-cyan inline-block text-lg">
                      Conectar
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <button 
              onClick={prevSlide}
              className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-primary-cyan p-4 rounded-full backdrop-blur-xl border border-white/10 transition-all z-30 group"
            >
              <ChevronLeft size={32} className="group-hover:scale-110" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-primary-cyan p-4 rounded-full backdrop-blur-xl border border-white/10 transition-all z-30 group"
            >
              <ChevronRight size={32} className="group-hover:scale-110" />
            </button>
          </div>
          
          <div className="flex justify-center mt-12 space-x-4">
            {services.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`transition-all duration-300 rounded-full h-2 ${currentSlide === i ? 'w-12 bg-primary-cyan' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </section>

        {/* Tools Section */}
        <section className="bg-white py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-text-dark text-center text-2xl font-black mb-16 uppercase tracking-[0.3em]">Nuestras Herramientas</h2>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
               <span className="text-text-dark text-3xl font-black italic">LARAVEL</span>
               <span className="text-text-dark text-3xl font-black italic">GITHUB</span>
               <span className="text-text-dark text-3xl font-black italic">PHP</span>
               <span className="text-text-dark text-3xl font-black italic">JAVA</span>
               <span className="text-text-dark text-3xl font-black italic">MONGODB</span>
            </div>
          </div>
        </section>

        {/* AI & Innovation Section */}
        <section className="section-container py-40">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="w-full lg:w-1/2">
              <h2 className="text-5xl md:text-6xl font-black mb-10 leading-tight">Comenzar nunca ha sido tan fácil gracias a la IA</h2>
              <p className="text-gray-400 text-xl leading-relaxed mb-12">
                Nuestra arquitectura basada en inteligencia artificial permite prototipar, desarrollar y desplegar 
                soluciones robustas en tiempos récord, garantizando siempre la máxima eficiencia operativa.
              </p>
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-primary-cyan/10 rounded-2xl border border-primary-cyan/20">
                  <ShieldCheck className="text-primary-cyan" size={32} />
                </div>
                <p className="font-bold text-lg">Seguridad & Rendimiento Garantizado</p>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 relative h-[500px]">
              <motion.div 
                initial={{ rotate: -5, x: 20 }}
                whileInView={{ rotate: 0, x: 0 }}
                className="absolute top-0 right-0 w-3/4 h-3/4 glass-panel p-1 z-10 shadow-2xl"
              >
                <div className="w-full h-full bg-gradient-to-br from-cyan-900/60 to-black rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center">
                  <Cpu size={80} className="text-primary-cyan mb-6 animate-pulse" />
                  <p className="text-2xl font-black tracking-widest uppercase">Neural Core</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ rotate: 5, x: -20 }}
                whileInView={{ rotate: 0, x: 0 }}
                className="absolute bottom-0 left-0 w-3/4 h-3/4 glass-panel p-1 z-20 shadow-2xl"
              >
                <div className="w-full h-full bg-gradient-to-tr from-blue-900/60 to-black rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center border border-white/10">
                  <Laptop size={80} className="text-white mb-6" />
                  <p className="text-2xl font-black tracking-widest uppercase">Dev Studio</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust & Client Section */}
        <section className="section-container py-32 flex flex-col lg:flex-row items-center justify-between gap-20">
          <div className="w-full lg:w-1/2 relative h-[450px] flex items-center justify-center">
             {/* Faceted Glass Panels */}
             <div className="absolute top-0 left-0 w-64 h-64 glass-panel border-r-4 border-b-4 border-white/20 rotate-12 flex items-center justify-center p-12">
               <span className="text-white text-3xl font-black opacity-30">APPLE</span>
             </div>
             <div className="absolute bottom-0 right-0 w-56 h-56 glass-panel border-l-4 border-t-4 border-white/20 -rotate-12 flex items-center justify-center p-10">
               <span className="text-white text-2xl font-black opacity-30">GOOGLE</span>
             </div>
             <div className="w-48 h-48 glass-panel border-2 border-primary-cyan/30 z-10 flex items-center justify-center shadow-[0_0_50px_rgba(0,188,212,0.2)]">
                <div className="text-center">
                  <p className="text-primary-cyan font-black text-4xl">100%</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Confianza</p>
                </div>
             </div>
          </div>
          
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <p className="text-2xl text-gray-400 mb-4 uppercase tracking-[0.4em] font-bold">Con la confianza de</p>
            <h2 className="text-7xl md:text-9xl font-black text-primary-cyan mb-6 drop-shadow-[0_0_30px_rgba(0,188,212,0.3)]">14M+</h2>
            <p className="text-3xl md:text-4xl font-light text-white leading-tight">
              de emprendedores que<br />
              <span className="font-black text-white">transforman el mundo.</span>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;

