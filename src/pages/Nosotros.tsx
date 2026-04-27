import React from 'react';
import { motion } from 'framer-motion';
import AltFooter from '../components/AltFooter';
import SEO from '../components/SEO';

const infoBlocks = [
  {
    title: 'Misión',
    text: 'Transformar retos de negocio en productos digitales funcionales, estéticos y técnicamente excelentes.',
  },
  {
    title: 'Visión',
    text: 'Ser el aliado tecnológico referente en la región, elevando los estándares de desarrollo y escalabilidad en productos de clase mundial.',
  },
  {
    title: 'Valores',
    text: 'Precisión técnica, Innovación disruptiva, Escalabilidad multiplataforma, Transparencia operativa y Calidad de código.',
  },
];

const Nosotros: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [glowPos, setGlowPos] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
      setGlowPos({ x, y });
  };

  return (
    <div className="relative flex w-full flex-col overflow-x-clip bg-[#044553] font-sansation select-none">
      <SEO 
        title="Nosotros" 
        description="Conoce a Bytecode, especialistas en ingeniería de software multiplataforma y automatización inteligente para negocios escalables."
      />

      <section id='Movil' className="relative w-full lg:hidden">
        {/* Fondos */}
        <div className="relative h-[18rem] overflow-hidden bg-black sm:h-[17rem]">
          <img
            src="/nosotros/imagenchicalaptoparriba.png"
            alt="Fondo Laptop"
            className="h-full w-full object-cover object-center opacity-70"
          />
          
          <div className="absolute inset-x-0 bottom-0 h-32 md:h-48 bg-gradient-to-t from-[#0CA3C6] via-black/15 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-25 z-10 px-5 pb-6 text-center sm:px-8 sm:pb-8">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[clamp(2rem,8.5vw,3.2rem)] font-bold leading-none text-[#0CA3C6]"
            >
              Nosotros
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-3 max-w-[19rem] text-[0.9rem] leading-[1.05rem] text-white/90 sm:mt-4 sm:max-w-[24rem] sm:text-[1rem] sm:leading-[1.2rem]"
            >
              Nos especializamos en ingeniería de software multiplataforma y automatización inteligente para
              negocios escalables.
            </motion.p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#0CA3C6] px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8">
          {/* Contenedores de Transicion principal */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0CA3C6] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#044553]" />
          
          {/* Elemento intermedio */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-80 top-[225px]">
            <img
              src="/designs/elemento_intermedio_nosotros_vista_movil.svg"
              alt="Patrón de Red Decorativo"
              className="h-[434px] w-[648px] object-cover object-left-top"
            />
          </div>

          {/* Contenedor de Decorativos */}
          <div className="relative w-full z-10 mx-auto mb-24 aspect-[0.72] max-w-[18rem] sm:mb-14 sm:max-w-[21rem]">    
            
            {/* 1. Rectángulo azul oscuro (Entra deslizándose desde la derecha) */}
            <motion.div 
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute -top-[20px] left-[calc(100%-140px)] h-[104px] w-[100vw] rounded-l-[20px] rounded-r-none bg-[#024F79]" 
            />
            
            {/* 2. Cuadrado inferior izquierdo (Entra desde la diagonal inferior-izquierda) */}
            <motion.div 
              initial={{ opacity: 0, x: -80, y: 80 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute top-[336px] right-[calc(100%-164.2px)] h-[149px] w-[100vw] rounded-r-[34px] rounded-l-none bg-[#026B9B]" 
            />

            {/* 3. Rectángulo vertical cian principal (Sin cambios) */}
            <motion.div 
              initial={{ opacity: 0, y: -80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="absolute left-[66px] top-[7px] h-[441.3px] w-[161px] rounded-[25px] bg-gradient-to-b from-[#06CFD6] to-[#036C70]" 
            />

            {/* 4. Círculo cian (Sin cambios) */}
            <motion.div 
              initial={{ opacity: 0, x: 60, y: -60 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="absolute right-[29px] top-[20px] h-[153px] w-[153px] rounded-full bg-[#0CA3C6] shadow-[0_0_80px_-20px_rgba(0,0,0,1)]" 
            />

            {/* 5. El Hombre (Sin cambios) */}
            <motion.img
              src="/nosotros/hombredepie.png"
              alt="Tecnología y Escalabilidad"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
              className="absolute left-1/2 top-[3.8%] z-10 w-[93%] -translate-x-1/2 drop-shadow-2xl"
            />
            
            {/* 6. Sombra del piso (Sin cambios) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="absolute top-[430px] left-[142px] z-0 w-[90%] -translate-x-1/2 opacity-85"
            >
              <motion.img
                src="/nosotros/sombrapisohombre.png"
                alt=""
                className="w-full opacity-90"
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
          </div>

          {/* Contenedor de Textos */}
          <div className="relative z-10 mt-[300px] mb-[250px] sm:mt-0 mx-auto flex max-w-[20rem] flex-col items-center gap-11 text-center sm:max-w-[24rem] sm:gap-14">
            {infoBlocks.map((block, index) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-col items-center"
              >
                <h2 className="text-[clamp(2.2rem,9vw,3.3rem)] font-bold leading-none text-white [text-shadow:0px_4px_10.7px_rgba(255,255,255,0.49)]">{block.title}</h2>
                <p className="mt-4 max-w-[18rem] text-[0.95rem] leading-[1.2rem] text-white/85 sm:max-w-[22rem] sm:text-[1rem] sm:leading-[1.35rem]">
                  {block.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN ESCRITORIO (Alturas y márgenes dinámicos) ── */}
      <section id='Escritorio' className="relative hidden w-full lg:pb-[100px] 2xl:pb-[150px] lg:block">
        {/* Fondos: La altura del fondo negro ahora se comprime en laptops (700px) y crece en monitores (1000px) */}
        <div className="absolute left-0 top-0 w-full bg-[#000] overflow-hidden lg:h-[700px] xl:h-[850px] 2xl:h-[1000px] transition-all duration-500">
          <img
            src="/nosotros/imagenchicalaptoparriba.png"
            alt="Fondo Laptop"
            draggable={false}
            className="h-full w-full object-cover object-top opacity-100 -translate-y-[18%]"
          />
          <div className="absolute inset-0 w-full bg-gradient-to-r from-black/50 via-black/30 to-transparent lg:w-[90%] 2xl:w-[80%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0CA3C6]" />
        </div>
        
        {/* Contenedor Principal: Se reduce el min-h y el padding superior dramáticamente en laptops */}
        <div className="relative mx-auto w-full max-w-[1600px] px-12 lg:pt-[140px] xl:pt-[200px] 2xl:pt-[250px] lg:min-h-[1050px] xl:min-h-[1350px] 2xl:min-h-[1600px] lg:px-[80px] 2xl:px-[100px] transition-all duration-500">
          <div className="relative z-30 w-full lg:w-1/2 pl-[30px]">
            
            {/* Título y Párrafo principal adaptados a pantallas de laptop */}
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 font-bold text-[#0CA3C6] lg:text-[65px] xl:text-[75px] 2xl:text-[85px] leading-tight transition-all"
            >
              Nosotros
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              // El margen inferior (mb) pasa de 150px a solo 70px en laptops para matar el espacio vacío
              className="max-w-[1600px] text-justify text-white lg:mb-[70px] xl:mb-[100px] 2xl:mb-[150px] lg:text-[22px] xl:text-[26px] 2xl:text-[32px] lg:leading-snug 2xl:leading-[36px] transition-all"
            >
              Nos especializamos en ingeniería de software multiplataforma y automatización inteligente para
              negocios escalables.
            </motion.p>

            {/* Misión, Visión, Valores: Gap y Margen superior super reducidos */}
            <div className="relative flex flex-col pl-0 md:pl-20 lg:mt-[100px] xl:mt-[220px] 2xl:mt-[417px] lg:gap-[50px] xl:gap-[80px] 2xl:gap-[120px] transition-all duration-500">
              {infoBlocks.map((block, index) => (
                <motion.div
                  key={block.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h2 className="font-bold text-white [text-shadow:0px_4px_10.7px_rgba(255,255,255,0.49)] lg:mb-4 2xl:mb-8 lg:text-[42px] xl:text-[54px] 2xl:text-[64px] transition-all">
                    {block.title}
                  </h2>
                  <p className="max-w-[550px] text-justify text-white lg:text-[18px] xl:text-[20px] 2xl:text-[24px] leading-relaxed transition-all">
                    {block.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contenedor de Decorativos (El Hombre) - Escala ligeramente aumentada en lg y xl */}
        <div className="pointer-events-none absolute right-0 top-[55px] z-20 h-[1700px] w-[800px] origin-[100%_15%] lg:scale-[0.62] xl:scale-[0.82] 2xl:scale-[1.21] transition-transform duration-500">
          
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-[50px] h-[258px] w-[402px] rounded-l-[60px] rounded-r-none bg-[#024F79]"
          />

          <motion.div
            initial={{ opacity: 0, x: -60, y: 60 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="absolute left-[80px] top-[1029px] h-[403px] w-[414px] rounded-[59px] bg-[#026B9B]"
          />

          <motion.div
            initial={{ opacity: 0, y: -80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="absolute left-[210px] top-[99px] h-[1240px] w-[456px] rounded-[60px] bg-gradient-to-b from-[#06CFD6] to-[#036C70]"
          />

          <motion.div
            initial={{ opacity: 0, x: 60, y: -60 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="absolute right-[51px] top-[145px] h-[435px] w-[435px] rounded-full bg-[#0CA3C6] shadow-[0_60px_60px_-20px_rgba(0,0,0,0.35)]"
          />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="absolute left-[60px] top-[1275px] z-0 w-[730px]">
            
            <motion.img
              src="/nosotros/sombrapisohombre.png"
              alt="" draggable={false}
              className="w-full opacity-90"
              animate={{
                scale: isHovered ? 0.95 : 1,
                opacity: isHovered ? 0.4 : 0.9,
                filter: isHovered ? "blur(6px)" : "blur(0px)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="absolute left-[60px] top-[125px] z-10 w-[750px] pointer-events-none"
          >
            <motion.img
              src="/nosotros/hombredepie.png"
              alt="Tecnología" draggable={false}
              className="w-full"
              animate={{
                y: isHovered ? -15 : 0,
                scale: isHovered ? 1.02 : 1,
                filter: isHovered ? `drop-shadow(${-glowPos.x}px ${-glowPos.y}px 30px rgba(6,207,214,0.85)) brightness(1.1)` : `drop-shadow(0px 20px 25px rgba(0,0,0,0.3)) brightness(1)`
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </motion.div>

          <div className="absolute left-[210px] top-[200px] z-20 h-[1050px] w-[450px] cursor-crosshair pointer-events-auto" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); setGlowPos({ x: 0, y: 0 }); }} onMouseMove={handleMouseMove} />
        </div>

        {/* Fondo ondulado azul base: Se adapta a la nueva altura comprimida */}
        <div className="absolute left-0 w-full overflow-hidden rounded-tr-[90px] bg-[#0CA3C6] shadow-[15px_-15px_40px_rgba(0,0,0,0.25)] lg:top-[500px] xl:top-[600px] 2xl:top-[750px] lg:-bottom-[150px] xl:-bottom-[300px] 2xl:-bottom-[471px] transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0CA3C6]/0 via-[#0CA3C6]/10 to-[#044553]" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-[#044553]" />
        </div>
      </section>

      {/* SVG LATERAL */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden max-w-[250px] lg:block lg:top-[500px] xl:top-[600px] 2xl:top-[750px] lg:w-[10vw] xl:w-[15vw] 2xl:w-[20vw] lg:opacity-40 xl:opacity-70 2xl:opacity-100 transition-all duration-500">
        <img
          src="/designs/elemento_lateral_fondo_nosotros.svg"
          alt="Patrón de Red Lateral"
          draggable={false}
          className="h-full w-full object-contain object-left-top"
        />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-[950px] w-full lg:hidden">
        <img
          src="/designs/elemento_final_nosotros_vista_movil.svg"
          alt="Fondo Red Inferior Móvil"
          className="h-full w-full object-cover object-bottom"
        />
      </div>

      {/* 4. EL FOOTER: Se añade un wrapper relative z-10 para asegurar que el contenido clickeable del footer siga siempre por encima de la decoración SVG */}
      <div className="relative z-10">
        <AltFooter />
      </div>
    </div>
  );
};

export default Nosotros;