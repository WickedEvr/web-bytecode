import React, { useEffect, useState } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import SEO from '../components/shared/SEO';
import ContactFooter from '../components/layout/ContactFooter';
import ShineBorder from '../components/ui/shine-border';

// --- COMPONENTE DEFINITIVO: Desactiva la animación en móviles ---
const TypewriterText: React.FC<{ text: string; speed?: number; cursor?: string }> = ({ 
  text, 
  speed = 40, 
  cursor = "|" 
}) => {
  // Detectamos inmediatamente si es móvil
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  useEffect(() => {
    // Si es móvil, abortamos cualquier intento de animación
    if (isMobile) return;

    count.set(0); 
    const durationInSeconds = (text.length * speed) / 1000;
    let controls: any; 

    const timeout = setTimeout(() => {
      controls = animate(count, text.length, {
        duration: durationInSeconds,
        ease: "easeInOut", 
      });
    }, 100); 

    return () => {
      clearTimeout(timeout);
      if (controls) controls.stop();
    };
  }, [text, speed, count, isMobile]);

  // RENDERIZADO EN MÓVIL: Texto estático
  if (isMobile) {
    return <>{text}</>;
  }

  // RENDERIZADO EN PC/TABLET: Animación fluida
  return (
    <>
      <motion.span>{displayText}</motion.span>
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

const Condiciones: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sansation select-none">
      <SEO 
        title="Términos y Condiciones" 
        description="Términos y condiciones de los servicios de Bytecode."
      />

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
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold uppercase tracking-wide text-[#0CA3C6] mb-8 text-center drop-shadow-md">
              <TypewriterText text="Términos y Condiciones" speed={40} cursor="|" />
            </h1>
            
            <div className="space-y-6 text-[15px] sm:text-[16px] md:text-[18px] leading-relaxed text-justify font-light">
              <p className="text-white/70">
                <strong>Última actualización:</strong> 5 de mayo de 2026
              </p>

              <p>
                Bienvenido a <strong>Bytecode</strong>. Al contratar nuestros servicios de desarrollo de software, aplicaciones móviles, diseño web y consultoría tecnológica, usted acepta estar sujeto a los siguientes Términos y Condiciones. Por favor, léalos cuidadosamente antes de utilizar nuestros servicios.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">1. Servicios y Alcance</h2>
              <p>
                Bytecode proporciona servicios de desarrollo de software a medida, aplicaciones móviles, diseño web y transformación digital. El alcance específico, los entregables, los plazos y los costos de cada proyecto se detallarán en una propuesta comercial o contrato de servicios independiente ("Contrato de Proyecto") acordado y firmado por ambas partes.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">2. Propiedad Intelectual</h2>
              <p>
                A menos que se acuerde lo contrario por escrito, Bytecode retiene la propiedad de todos los códigos fuente preexistentes, bibliotecas, herramientas y metodologías utilizadas en la creación de su proyecto.
              </p>
              <p>
                Una vez que se haya recibido el pago total del proyecto, los derechos de propiedad intelectual del código fuente, diseños y activos creados específicamente para el cliente durante el proyecto serán transferidos al cliente, otorgándole una licencia de uso exclusiva, según lo estipulado en el Contrato de Proyecto.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">3. Obligaciones del Cliente</h2>
              <p>
                Para garantizar el éxito y la entrega oportuna del proyecto, el cliente se compromete a:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Proporcionar de manera oportuna todos los materiales, información, accesos y aprobaciones necesarios.</li>
                <li>Designar a un responsable o punto de contacto principal para la toma de decisiones.</li>
                <li>Realizar los pagos acordados según el cronograma de facturación.</li>
              </ul>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">4. Pagos y Facturación</h2>
              <p>
                Las condiciones de pago se especificarán en el Contrato de Proyecto. Generalmente, requerimos un pago inicial antes de comenzar a trabajar, seguido de pagos por hitos (milestones) y un pago final al momento de la entrega o lanzamiento.
              </p>
              <p>
                Bytecode se reserva el derecho de suspender los servicios o retener entregables si no se reciben los pagos en las fechas acordadas.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">5. Confidencialidad</h2>
              <p>
                Ambas partes acuerdan mantener en estricta confidencialidad toda la información técnica, comercial o de cualquier otra índole (incluidos códigos, planes de negocio y datos de usuarios) compartida durante el transcurso de la relación comercial, no divulgándola a terceros sin el consentimiento previo por escrito de la otra parte.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">6. Limitación de Responsabilidad</h2>
              <p>
                Bytecode se esfuerza por entregar software de la más alta calidad y libre de errores. Sin embargo, no garantizamos que el software sea 100% infalible o ininterrumpido. En ningún caso Bytecode será responsable por daños indirectos, incidentales, especiales o consecuentes (incluyendo pérdida de beneficios, datos o interrupción del negocio) que surjan del uso o la imposibilidad de usar nuestros desarrollos.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">7. Garantía y Soporte</h2>
              <p>
                Ofrecemos un período de garantía estándar (generalmente 30 a 60 días) posterior a la entrega final del proyecto para corregir errores o fallos en el código (bugs) que no hayan sido identificados durante la fase de pruebas, sin costo adicional.
              </p>
              <p>
                Cualquier modificación, adición de nuevas características o soporte técnico a largo plazo fuera del período de garantía estará sujeto a un acuerdo de mantenimiento o se facturará por horas bajo nuestras tarifas estándar.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">8. Modificaciones a los Términos</h2>
              <p>
                Bytecode se reserva el derecho de actualizar o modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente después de su publicación en nuestro sitio web. Le recomendamos revisar esta página periódicamente.
              </p>

              <h2 className="text-[20px] md:text-[24px] font-bold text-[#06CFD6] mt-10 text-left">9. Legislación Aplicable y Jurisdicción</h2>
              <p>
                Estos Términos y Condiciones se rigen e interpretan de acuerdo con las leyes de la República del Perú.
              </p>
              <p>
                Para cualquier controversia, disputa o reclamo que surja en relación con estos términos, los servicios ofrecidos o los contratos de proyecto, ambas partes acuerdan someterse a la jurisdicción exclusiva de los jueces y tribunales del Distrito Judicial de Lima, Perú, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
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

export default Condiciones;