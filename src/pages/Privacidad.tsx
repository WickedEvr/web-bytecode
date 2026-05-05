import React, { useEffect } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import SEO from '../components/SEO';
import ContactFooter from '../components/ContactFooter';
import ShineBorder from '../components/ui/shine-border';

const TypewriterText: React.FC<{ text: string; speed?: number; cursor?: string }> = ({ 
  text, 
  speed = 40, 
  cursor = "|" 
}) => {

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    const durationInSeconds = (text.length * speed) / 1000;
    
    const timeout = setTimeout(() => {
      const controls = animate(count, text.length, {
        duration: durationInSeconds,
        ease: "easeInOut", 
      });
      
      return () => controls.stop();
    }, 100); 

    return () => clearTimeout(timeout);
  }, [text, speed, count]);

  return (
    <>
      <motion.span>{displayText}</motion.span>
      
      {/* El cursor parpadeante */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          repeat: Infinity, 
          repeatType: "reverse",
          ease: "easeInOut" 
        }}
        className="inline-block font-light ml-1 text-[#0CA3C6]/80 -translate-y-[2px]"
      >
        {cursor}
      </motion.span>
    </>
  );
};

const Privacidad: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sansation select-none">
      <SEO 
        title="Política de Privacidad" 
        description="Política de Privacidad y uso de datos personales de Bytecode."
      />
      
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(12,163,198,0.25)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,207,214,0.2)_0%,_transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
        />
        <div
          className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[950px] md:max-w-[780px] lg:max-w-[1100px] mx-auto px-4 sm:px-6 pt-28 pb-13 md:pt-36 md:pb-15 lg:pt-55.5 lg:pb-32 pointer-events-auto flex-1 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] text-white/90"
        >
          <ShineBorder
            className="relative flex flex-col w-full bg-transparent p-8 md:p-14"
            color={["#024F79", "#026B9B", "#06CFD6", "#0CA3C6"]}
            borderRadius={40} 
            borderWidth={2}
          >
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold uppercase tracking-wide text-[#0CA3C6] mb-8 text-center drop-shadow-md min-h-[1.2em]">
              <TypewriterText text="Política de Privacidad" speed={40} cursor="|" />
            </h1>
            
            <div className="space-y-6 text-[15px] sm:text-[16px] md:text-[18px] leading-relaxed text-justify font-light">
              <p className="text-white/70">
                <strong>Última actualización:</strong> 5 de mayo de 2026
              </p>

              <p>
                En <strong>Bytecode</strong>, estamos comprometidos con la protección de su privacidad y el tratamiento adecuado de sus datos personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos la información de nuestros usuarios, en estricto cumplimiento con la <strong>Ley de Protección de Datos Personales de Perú (Ley N° 29733)</strong> y su Reglamento.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">1. Información que recopilamos</h2>
              <p>
                Recopilamos información personal que usted nos proporciona directamente cuando se pone en contacto con nosotros, solicita un presupuesto, o contrata nuestros servicios de desarrollo de software y consultoría tecnológica. Esto puede incluir, pero no se limita a:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Nombres y apellidos.</li>
                <li>Correo electrónico y números de teléfono.</li>
                <li>Nombre de la empresa, cargo y detalles del proyecto.</li>
                <li>Información técnica o comercial necesaria para la ejecución de los servicios.</li>
              </ul>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">2. Finalidad del tratamiento</h2>
              <p>
                Los datos personales recopilados serán utilizados exclusivamente para las siguientes finalidades:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Responder a sus consultas, cotizaciones o solicitudes de información.</li>
                <li>Ejecutar, gestionar y entregar los servicios de desarrollo y diseño contratados.</li>
                <li>Emitir comprobantes de pago y realizar gestiones de facturación.</li>
                <li>Enviar comunicaciones relacionadas con el avance del proyecto, soporte técnico o actualizaciones de nuestros términos.</li>
              </ul>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">3. Consentimiento</h2>
              <p>
                Al utilizar nuestro sitio web, rellenar nuestros formularios de contacto o contratar nuestros servicios, usted otorga su consentimiento libre, previo, expreso, inequívoco e informado para que Bytecode trate sus datos personales de acuerdo con las finalidades descritas en esta política.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">4. Almacenamiento y Seguridad</h2>
              <p>
                Sus datos personales serán almacenados en nuestras bases de datos de forma segura. Bytecode ha adoptado las medidas técnicas, organizativas y legales necesarias para garantizar la seguridad y confidencialidad de su información, evitando su alteración, pérdida, tratamiento o acceso no autorizado.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">5. Transferencia a Terceros</h2>
              <p>
                Bytecode no vende, alquila ni cede sus datos personales a terceros con fines comerciales. Solo podremos compartir información con proveedores de servicios estrictamente necesarios para la operatividad de su proyecto (como servicios de hosting o proveedores de infraestructura en la nube), quienes están obligados a mantener la confidencialidad de la misma.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">6. Derechos ARCO</h2>
              <p>
                De conformidad con la normativa peruana, usted tiene el derecho de ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) sobre sus datos personales en cualquier momento. Para ejercer estos derechos, puede comunicarse con nosotros enviando un correo electrónico a nuestra dirección de contacto oficial, adjuntando una copia de su documento de identidad e indicando el derecho que desea ejercer.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">7. Modificaciones a la Política</h2>
              <p>
                Nos reservamos el derecho de modificar la presente Política de Privacidad en cualquier momento para adaptarla a novedades legislativas o jurisprudenciales, así como a prácticas de la industria. Cualquier cambio será publicado en esta misma página.
              </p>
            </div>
          </ShineBorder>
        </motion.div>
      </div>

      <div className="relative z-10 pointer-events-auto">
        <ContactFooter />
      </div>
    </div>
  );
};

export default Privacidad;