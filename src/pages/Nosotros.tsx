import React from 'react';
import { motion } from 'framer-motion';
import AltFooter from '../components/AltFooter';

const Nosotros: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#044553] font-sansation overflow-x-hidden flex flex-col">

      <div className="flex-grow relative w-full pb-[150px] lg:pb-[250px]">
        
        {/* FONDO OSCURO DE LA IMAGEN TOP */}
        <div className="absolute top-0 left-0 w-full h-[1000px] bg-[#000]">
          <img 
            src="/nosotros/imagenchicalaptoparriba.png" 
            alt="Fondo Laptop" 
            className="w-full h-full object-cover object-center opacity-70" 
          />
          {/* Degradado oscuro a la izquierda para el texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent w-full md:w-[80%]"></div>
          {/* Fusión con el turquesa inferior */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0CA3C6]"></div>
        </div>

        {/* FORMA TURQUESA (Rectangle 45) */}
        <div className="absolute top-[750px] left-0 w-full h-[2000px] bg-[#0CA3C6] rounded-tr-[100px] md:rounded-tr-[143px] overflow-hidden shadow-2xl">
           {/* Degradado superpuesto (Rectangle 15) */}
           <div className="absolute inset-0 bg-gradient-to-b from-[#0CA3C6]/0 via-[#0CA3C6]/10 to-[#044553]/90"></div>
        </div>

        {/* CONTENEDOR CENTRAL (1440px max) */}
        <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-[100px] pt-[250px] lg:min-h-[1900px]">
          
          {/* ===== IZQUIERDA: TEXTOS ===== */}
          <div className="w-full lg:w-1/2 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl md:text-[85px] font-bold text-[#0CA3C6] leading-tight md:leading-[95px] mb-6"
            >
              Nosotros
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-[32px] text-white leading-snug md:leading-[36px] max-w-[670px] mb-24 md:mb-[150px] text-justify"
            >
              Nos especializamos en ingeniería de software multiplataforma y automatización inteligente para negocios escalables.
            </motion.p>

            {/* Misión, Visión, Valores */}
            <div className="relative flex flex-col gap-20 md:gap-[150px] pl-0 md:pl-20 mt-[50px]">

               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                 <h2 className="text-4xl md:text-[64px] font-bold text-white mb-4 md:mb-8">Misión</h2>
                 <p className="text-lg md:text-[24px] text-white leading-relaxed md:leading-[27px] max-w-[454px] text-justify">
                   Transformar retos de negocio en productos digitales funcionales, estéticos y técnicamente excelentes.
                 </p>
               </motion.div>
               
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                 <h2 className="text-4xl md:text-[64px] font-bold text-white mb-4 md:mb-8">Visión</h2>
                 <p className="text-lg md:text-[24px] text-white leading-relaxed md:leading-[27px] max-w-[460px] text-justify">
                   Ser el aliado tecnológico referente en la región, elevando los estándares de desarrollo y escalabilidad en productos de clase mundial.
                 </p>
               </motion.div>

               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                 <h2 className="text-4xl md:text-[64px] font-bold text-white mb-4 md:mb-8">Valores</h2>
                 <p className="text-lg md:text-[24px] text-white leading-relaxed md:leading-[27px] max-w-[495px] text-justify">
                   Precisión técnica, Innovación disruptiva, Escalabilidad multiplataforma, Transparencia operativa y Calidad de código.
                 </p>
               </motion.div>
            </div>
          </div>

          {/* ===== DERECHA: COMPOSICIÓN DEL HOMBRE ===== */}
          {/* Oculto en móvil, visible desde pantallas lg */}
          <div className="hidden lg:block absolute top-[100px] right-[-50px] w-[800px] h-[1700px] pointer-events-none z-20">
             
             {/* Rectángulo Azul Oscuro Superior Derecho */}
             <div className="absolute right-0 top-[50px] w-[402px] h-[258px] bg-[#024F79] rounded-[59px]"></div>
             
             {/* Rectángulo Azul Oscuro Inferior Izquierdo */}
             <div className="absolute left-[20px] top-[1000px] w-[414px] h-[403px] bg-[#026B9B] rounded-[59px]"></div>
             
             {/* Fondo Turquesa Vertical */}
             <div className="absolute left-[120px] top-[80px] w-[553px] h-[1344px] bg-gradient-to-b from-[#06CFD6] to-[#036C70]"></div>
             
             {/* Círculo Turquesa Detrás */}
             <div className="absolute right-[30px] top-[140px] w-[435px] h-[435px] bg-[#0CA3C6] rounded-full"></div>
             
             {/* Hombre Principal */}
             <img src="/nosotros/hombredepie.png" alt="Tecnología y Escalabilidad" className="absolute left-[60px] top-[100px] w-[750px] z-10 drop-shadow-2xl" />
             
             {/* Sombra Piso */}
             <img src="/nosotros/sombrapisohombre.png" alt="" className="absolute left-[200px] top-[1450px] w-[400px] z-0 opacity-90" />

          </div>

        </div>
      </div>
      {/* FOOTER */}
      <div className="relative z-30">
        <AltFooter />
      </div>
    </div>
  );
};

export default Nosotros;
