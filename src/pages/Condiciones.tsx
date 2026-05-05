import React from 'react';
import SEO from '../components/SEO';

const Condiciones: React.FC = () => {
  return (
    <div className="bg-space min-h-screen font-sansation">
      <SEO 
        title="Términos y Condiciones" 
        description="Términos y condiciones de los servicios de Bytecode."
      />
      <div className="network-overlay py-32 px-6 text-white/90">
        <section className="max-w-4xl mx-auto glass-panel p-8 md:p-16 space-y-6">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold uppercase tracking-wide text-[#0CA3C6] mb-8">
            Términos y Condiciones
          </h1>
          
          <div className="space-y-6 text-sm md:text-base leading-relaxed">
            <p>
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p>
              Bienvenido a <strong>Bytecode</strong>. Al contratar nuestros servicios de desarrollo de software, aplicaciones móviles, diseño web y consultoría tecnológica, usted acepta estar sujeto a los siguientes Términos y Condiciones. Por favor, léalos cuidadosamente antes de utilizar nuestros servicios.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">1. Servicios y Alcance</h2>
            <p>
              Bytecode proporciona servicios de desarrollo de software a medida, aplicaciones móviles, diseño web y transformación digital. El alcance específico, los entregables, los plazos y los costos de cada proyecto se detallarán en una propuesta comercial o contrato de servicios independiente ("Contrato de Proyecto") acordado y firmado por ambas partes.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">2. Propiedad Intelectual</h2>
            <p>
              A menos que se acuerde lo contrario por escrito, Bytecode retiene la propiedad de todos los códigos fuente preexistentes, bibliotecas, herramientas y metodologías utilizadas en la creación de su proyecto.
            </p>
            <p>
              Una vez que se haya recibido el pago total del proyecto, los derechos de propiedad intelectual del código fuente, diseños y activos creados específicamente para el cliente durante el proyecto serán transferidos al cliente, otorgándole una licencia de uso exclusiva, según lo estipulado en el Contrato de Proyecto.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">3. Obligaciones del Cliente</h2>
            <p>
              Para garantizar el éxito y la entrega oportuna del proyecto, el cliente se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar de manera oportuna todos los materiales, información, accesos y aprobaciones necesarios.</li>
              <li>Designar a un responsable o punto de contacto principal para la toma de decisiones.</li>
              <li>Realizar los pagos acordados según el cronograma de facturación.</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">4. Pagos y Facturación</h2>
            <p>
              Las condiciones de pago se especificarán en el Contrato de Proyecto. Generalmente, requerimos un pago inicial antes de comenzar a trabajar, seguido de pagos por hitos (milestones) y un pago final al momento de la entrega o lanzamiento.
            </p>
            <p>
              Bytecode se reserva el derecho de suspender los servicios o retener entregables si no se reciben los pagos en las fechas acordadas.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">5. Confidencialidad</h2>
            <p>
              Ambas partes acuerdan mantener en estricta confidencialidad toda la información técnica, comercial o de cualquier otra índole (incluidos códigos, planes de negocio y datos de usuarios) compartida durante el transcurso de la relación comercial, no divulgándola a terceros sin el consentimiento previo por escrito de la otra parte.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">6. Limitación de Responsabilidad</h2>
            <p>
              Bytecode se esfuerza por entregar software de la más alta calidad y libre de errores. Sin embargo, no garantizamos que el software sea 100% infalible o ininterrumpido. En ningún caso Bytecode será responsable por daños indirectos, incidentales, especiales o consecuentes (incluyendo pérdida de beneficios, datos o interrupción del negocio) que surjan del uso o la imposibilidad de usar nuestros desarrollos.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">7. Garantía y Soporte</h2>
            <p>
              Ofrecemos un período de garantía estándar (generalmente 30 a 60 días) posterior a la entrega final del proyecto para corregir errores o fallos en el código (bugs) que no hayan sido identificados durante la fase de pruebas, sin costo adicional.
            </p>
            <p>
              Cualquier modificación, adición de nuevas características o soporte técnico a largo plazo fuera del período de garantía estará sujeto a un acuerdo de mantenimiento o se facturará por horas bajo nuestras tarifas estándar.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">8. Modificaciones a los Términos</h2>
            <p>
              Bytecode se reserva el derecho de actualizar o modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente después de su publicación en nuestro sitio web. Le recomendamos revisar esta página periódicamente.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">9. Legislación Aplicable y Jurisdicción</h2>
            <p>
              Estos Términos y Condiciones se rigen e interpretan de acuerdo con las leyes de la República del Perú.
            </p>
            <p>
              Para cualquier controversia, disputa o reclamo que surja en relación con estos términos, los servicios ofrecidos o los contratos de proyecto, ambas partes acuerdan someterse a la jurisdicción exclusiva de los jueces y tribunales del Distrito Judicial de Lima, Perú, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Condiciones;
