import React from 'react';
import { motion } from 'framer-motion';
import AltFooter from '../components/AltFooter';

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
  return (
    <div className="flex w-full flex-col overflow-x-clip bg-[#044553] font-sansation">
      <SEO 
        title="Nosotros" 
        description="Conoce a Bytecode, especialistas en ingeniería de software multiplataforma y automatización inteligente para negocios escalables."
      />
      <section className="relative w-full lg:hidden">
        <div className="relative h-[13.75rem] overflow-hidden bg-black sm:h-[17rem]">
          <img
            src="/nosotros/imagenchicalaptoparriba.png"
            alt="Fondo Laptop"
            className="h-full w-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/45 to-[#0CA3C6]" />

          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 text-center sm:px-8 sm:pb-8">
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
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0CA3C6] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#044553]/55" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative mx-auto mb-12 aspect-[0.72] w-full max-w-[18rem] sm:mb-14 sm:max-w-[21rem]"
          >
            <div className="absolute left-[13%] top-[7%] h-[72%] w-[58%] rounded-[1.75rem] bg-gradient-to-b from-[#06CFD6] to-[#036C70]" />
            <div className="absolute right-[10%] top-[9%] h-[27%] w-[27%] rounded-full border border-white/20 bg-[#90F7FF]/25 backdrop-blur-[2px]" />
            <div className="absolute left-[4%] top-[17%] h-[17%] w-[30%] rounded-[1.4rem] bg-[#024F79]/88" />
            <div className="absolute left-[1%] bottom-[16%] h-[18%] w-[31%] rounded-[1.4rem] bg-[#026B9B]/86" />

            <img
              src="/nosotros/hombredepie.png"
              alt="Tecnología y Escalabilidad"
              className="absolute left-1/2 top-[5%] z-10 w-[92%] -translate-x-1/2 drop-shadow-2xl"
            />

            <img
              src="/nosotros/sombrapisohombre.png"
              alt=""
              className="absolute bottom-[9%] left-1/2 z-0 w-[62%] -translate-x-1/2 opacity-85"
            />
          </motion.div>

          <div className="relative z-10 mx-auto flex max-w-[20rem] flex-col items-center gap-11 text-center sm:max-w-[24rem] sm:gap-14">
            {infoBlocks.map((block, index) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-col items-center"
              >
                <h2 className="text-[clamp(2.2rem,9vw,3.3rem)] font-bold leading-none text-white">{block.title}</h2>
                <p className="mt-4 max-w-[18rem] text-[0.95rem] leading-[1.2rem] text-white/85 sm:max-w-[22rem] sm:text-[1rem] sm:leading-[1.35rem]">
                  {block.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative hidden w-full pb-[100px] lg:block lg:pb-[150px]">
        <div className="absolute left-0 top-0 h-[1000px] w-full bg-[#000]">
          <img
            src="/nosotros/imagenchicalaptoparriba.png"
            alt="Fondo Laptop"
            className="h-full w-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 w-full bg-gradient-to-r from-black/90 via-black/50 to-transparent md:w-[80%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0CA3C6]" />
        </div>

        <div className="absolute left-0 top-[750px] bottom-0 w-full overflow-hidden rounded-tr-[143px] bg-[#0CA3C6] shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0CA3C6]/0 via-[#0CA3C6]/10 to-[#044553]/90" />
        </div>

        <div className="relative mx-auto w-full max-w-[1440px] px-12 pt-[250px] lg:min-h-[1600px] lg:px-[100px]">
          <div className="relative z-10 w-full lg:w-1/2">
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
              className="mb-24 max-w-[670px] text-justify text-xl leading-snug text-white md:mb-[150px] md:text-[32px] md:leading-[36px]"
            >
              Nos especializamos en ingeniería de software multiplataforma y automatización inteligente para
              negocios escalables.
            </motion.p>

            <div className="relative mt-[50px] flex flex-col gap-20 pl-0 md:gap-[120px] md:pl-20">
              {infoBlocks.map((block, index) => (
                <motion.div
                  key={block.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h2 className="mb-4 text-4xl font-bold text-white md:mb-8 md:text-[64px]">{block.title}</h2>
                  <p className="max-w-[495px] text-justify text-lg leading-relaxed text-white md:text-[24px] md:leading-[27px]">
                    {block.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute right-[-50px] top-[100px] z-20 h-[1700px] w-[800px]">
            <div className="absolute right-0 top-[50px] h-[258px] w-[402px] rounded-l-[60px] rounded-r-none bg-[#024F79]" />
            <div className="absolute left-[20px] top-[1000px] h-[403px] w-[414px] rounded-[59px] bg-[#026B9B]" />
            <div className="absolute left-[157px] top-[113px] h-[1240px] w-[456px] rounded-[60px] bg-gradient-to-b from-[#06CFD6] to-[#036C70]" />
            <div className="absolute right-[30px] top-[140px] h-[435px] w-[435px] rounded-full bg-[#0CA3C6]" />
            <img
              src="/nosotros/hombredepie.png"
              alt="Tecnología y Escalabilidad"
              className="absolute left-[60px] top-[100px] z-10 w-[750px] drop-shadow-2xl"
            />
            <img
              src="/nosotros/sombrapisohombre.png"
              alt=""
              className="absolute left-[200px] top-[1450px] z-0 w-[400px] opacity-90"
            />
          </div>
        </div>
      </section>
      {/* 4. EL FOOTER: Se ubica al final y absorbe el bg-[#0a4a5a] por sus lados transparentes */}
      <AltFooter />
    </div>
  );
};

export default Nosotros;
