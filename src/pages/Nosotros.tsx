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
      // Convierte la posición a un rango de -20 a +20 píxeles
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
      setGlowPos({ x, y });
  };

  return (
    // CAMBIO 1: Se añade 'relative' al contenedor principal para que el elemento absoluto lateral se ancle a toda la página
    <div className="relative flex w-full flex-col overflow-x-clip bg-[#044553] font-sansation">
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
          <div className="relative w-full z-10 mx-auto mb-24 aspect-[0.72] w-full max-w-[18rem] sm:mb-14 sm:max-w-[21rem]">    
            {/* 1. Rectángulo azul oscuro (Entra deslizándose desde la derecha) */}
            <motion.div 
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute -right-[51px] -top-[20px] h-[104px] w-[191px] rounded-l-[20px] rounded-r-none bg-[#024F79]" 
            />
            
            {/* 2. Cuadrado inferior izquierdo (Entra desde la diagonal inferior-izquierda) */}
            <motion.div 
              initial={{ opacity: 0, x: -80, y: 80 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute -left-[51px] top-[336px] h-[149px] w-[215.2px] rounded-r-[34px] rounded-l-none bg-[#026B9B]" 
            />

            {/* 3. Rectángulo vertical cian principal (Entra deslizándose suavemente desde arriba) */}
            <motion.div 
              initial={{ opacity: 0, y: -80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="absolute left-[66px] top-[7px] h-[441.3px] w-[161px] rounded-[25px] bg-gradient-to-b from-[#06CFD6] to-[#036C70]" 
            />

            {/* 4. Círculo cian (Entra desde la diagonal superior-derecha) */}
            <motion.div 
              initial={{ opacity: 0, x: 60, y: -60 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="absolute right-[29px] top-[20px] h-[153px] w-[153px] rounded-full bg-[#0CA3C6] shadow-[0_0_80px_-20px_rgba(0,0,0,1)]" 
            />

            {/* 5. El Hombre (Emerge hacia arriba al final de la coreografía) */}
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
            
            {/* 6. Sombra del piso (Aparece desvaneciéndose suavemente desde abajo) */}
            <motion.img
              src="/nosotros/sombrapisohombre.png"
              alt=""
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              className="absolute top-[430px] left-[140px] z-0 w-[85%] -translate-x-1/2 opacity-85"
            />
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

      <section id='Escritorio' className="relative hidden w-full pb-[100px] lg:block lg:pb-[150px]">
        {/* Fondos */}
        <div className="absolute left-0 top-0 h-[1000px] w-full bg-[#000] overflow-hidden">
          <img
            src="/nosotros/imagenchicalaptoparriba.png"
            alt="Fondo Laptop"
            className="h-full w-full object-cover object-top opacity-100 -translate-y-[18%]"
          />
          <div className="absolute inset-0 w-full bg-gradient-to-r from-black/50 via-black/30 to-transparent md:w-[80%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0CA3C6]" />
        </div>
        
        {/* Contenedor de Textos */}
        <div className="relative mx-auto w-full max-w-[1600px] px-12 pt-[250px] lg:min-h-[1600px] lg:px-[100px]">
          <div className="relative z-10 w-full lg:w-1/2 pl-[30px]">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 text-6xl font-bold leading-tight text-[#0CA3C6] md:text-[85px] md:leading-[95px]"
            >
              Nosotros
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-24 max-w-[1600px] text-justify text-xl leading-snug text-white md:mb-[150px] md:text-[32px] md:leading-[36px]"
            >
              Nos especializamos en ingeniería de software multiplataforma y automatización inteligente para
              negocios escalables.
            </motion.p>

            <div className="relative mt-[417px] flex flex-col gap-20 pl-0 md:gap-[120px] md:pl-20">
              {infoBlocks.map((block, index) => (
                <motion.div
                  key={block.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h2 className="mb-4 text-4xl font-bold md:mb-8 md:text-[64px] text-white [text-shadow:0px_4px_10.7px_rgba(255,255,255,0.49)]">{block.title}</h2>
                  <p className="max-w-[550px] text-justify text-lg leading-relaxed text-white md:text-[24px] md:leading-[27px]">
                    {block.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contenedor de Decorativos */}
        <div className="pointer-events-none absolute right-0 top-[10px] z-20 h-[1700px] w-[800px] scale-[1.15] origin-top-right">
          
          {/* 1. Rectángulo azul oscuro (Entra deslizándose desde la derecha) */}
          <motion.div 
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-[50px] h-[258px] w-[402px] rounded-l-[60px] rounded-r-none bg-[#024F79]" 
          />

          {/* 2. Cuadrado inferior izquierdo (Entra desde la diagonal inferior-izquierda) */}
          <motion.div 
            initial={{ opacity: 0, x: -60, y: 60 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="absolute left-[80px] top-[1029px] h-[403px] w-[414px] rounded-[59px] bg-[#026B9B]" 
          />

          {/* 3. Rectángulo vertical cian principal (Entra deslizándose suavemente desde arriba) */}
          <motion.div 
            initial={{ opacity: 0, y: -80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="absolute left-[210px] top-[99px] h-[1240px] w-[456px] rounded-[60px] bg-gradient-to-b from-[#06CFD6] to-[#036C70]" 
          />

          {/* 4. Círculo cian (Entra desde la diagonal superior-derecha) */}
          <motion.div 
            initial={{ opacity: 0, x: 60, y: -60 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="absolute right-[51px] top-[145px] h-[435px] w-[435px] rounded-full bg-[#0CA3C6] shadow-[0_60px_60px_-20px_rgba(0,0,0,0.35)]" 
          />

          {/* 5. Sombra del piso (Aparece desvaneciéndose suavemente desde abajo) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="absolute left-[60px] top-[1275px] z-0 w-[730px]"
          >
            <motion.img
              src="/nosotros/sombrapisohombre.png"
              alt=""
              className="w-full opacity-90"
              animate={{
                scale: isHovered ? 0.95 : 1,
                opacity: isHovered ? 0.4 : 0.9,
                filter: isHovered ? "blur(6px)" : "blur(0px)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </motion.div>

          {/* 6. El Hombre (Emerge hacia arriba al final de la coreografía) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="absolute left-[60px] top-[125px] z-10 w-[750px] pointer-events-none"
          >
            <motion.img
              src="/nosotros/hombredepie.png"
              alt="Tecnología y Escalabilidad"
              className="w-full"
              animate={{
                y: isHovered ? -15 : 0,
                scale: isHovered ? 1.02 : 1,
                filter: isHovered
                  ? `drop-shadow(${-glowPos.x}px ${-glowPos.y}px 30px rgba(6,207,214,0.85)) brightness(1.1)`
                  : `drop-shadow(0px 20px 25px rgba(0,0,0,0.3)) brightness(1)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </motion.div>

          {/* Hitbox interactivo (Permanece intacto e invisible) */}
          <div 
            className="absolute left-[210px] top-[200px] z-20 h-[1050px] w-[450px] cursor-crosshair pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setGlowPos({ x: 0, y: 0 });
            }}
            onMouseMove={handleMouseMove}
          />
        </div>

        <div className="absolute left-0 top-[750px] -bottom-[471px] w-full overflow-hidden rounded-tr-[90px] bg-[#0CA3C6] shadow-[15px_-15px_40px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0CA3C6]/0 via-[#0CA3C6]/10 to-[#044553]" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-[#044553]" />
        </div>
      </section>

      <div className="pointer-events-none absolute bottom-0 left-0 top-[750px] z-0 hidden w-[20vw] max-w-[250px] lg:block opacity-100">
        <img
          src="/designs/elemento_lateral_fondo_nosotros.svg"
          alt="Patrón de Red Lateral"
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