// ✅ Privacidad.tsx — Fix 2: Página nueva para la ruta /privacidad (placeholder)
import React from 'react';
import SEO from '../components/SEO';

const Privacidad: React.FC = () => {
  return (
    <div className="bg-space min-h-screen font-sansation">
      <SEO 
        title="Política de Privacidad" 
        description="Política de Privacidad y uso de datos personales de Bytecode."
      />
      <div className="network-overlay py-32 px-6 text-white/90">
        <section className="max-w-4xl mx-auto glass-panel p-8 md:p-16 space-y-6">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold uppercase tracking-wide text-[#0CA3C6] mb-8">
            Política de Privacidad
          </h1>
          
          <div className="space-y-6 text-sm md:text-base leading-relaxed">
            <p>
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p>
              En <strong>Bytecode</strong>, estamos comprometidos con la protección de su privacidad y el tratamiento adecuado de sus datos personales. Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos la información de nuestros usuarios, en estricto cumplimiento con la <strong>Ley de Protección de Datos Personales de Perú (Ley N° 29733)</strong> y su Reglamento.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">1. Información que recopilamos</h2>
            <p>
              Recopilamos información personal que usted nos proporciona directamente cuando se pone en contacto con nosotros, solicita un presupuesto, o contrata nuestros servicios de desarrollo de software y consultoría tecnológica. Esto puede incluir, pero no se limita a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombres y apellidos.</li>
              <li>Correo electrónico y números de teléfono.</li>
              <li>Nombre de la empresa, cargo y detalles del proyecto.</li>
              <li>Información técnica o comercial necesaria para la ejecución de los servicios.</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">2. Finalidad del tratamiento</h2>
            <p>
              Los datos personales recopilados serán utilizados exclusivamente para las siguientes finalidades:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responder a sus consultas, cotizaciones o solicitudes de información.</li>
              <li>Ejecutar, gestionar y entregar los servicios de desarrollo y diseño contratados.</li>
              <li>Emitir comprobantes de pago y realizar gestiones de facturación.</li>
              <li>Enviar comunicaciones relacionadas con el avance del proyecto, soporte técnico o actualizaciones de nuestros términos.</li>
            </ul>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">3. Consentimiento</h2>
            <p>
              Al utilizar nuestro sitio web, rellenar nuestros formularios de contacto o contratar nuestros servicios, usted otorga su consentimiento libre, previo, expreso, inequívoco e informado para que Bytecode trate sus datos personales de acuerdo con las finalidades descritas en esta política.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">4. Almacenamiento y Seguridad</h2>
            <p>
              Sus datos personales serán almacenados en nuestras bases de datos de forma segura. Bytecode ha adoptado las medidas técnicas, organizativas y legales necesarias para garantizar la seguridad y confidencialidad de su información, evitando su alteración, pérdida, tratamiento o acceso no autorizado.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">5. Transferencia a Terceros</h2>
            <p>
              Bytecode no vende, alquila ni cede sus datos personales a terceros con fines comerciales. Solo podremos compartir información con proveedores de servicios estrictamente necesarios para la operatividad de su proyecto (como servicios de hosting o proveedores de infraestructura en la nube), quienes están obligados a mantener la confidencialidad de la misma.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">6. Derechos ARCO</h2>
            <p>
              De conformidad con la normativa peruana, usted tiene el derecho de ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) sobre sus datos personales en cualquier momento. Para ejercer estos derechos, puede comunicarse con nosotros enviando un correo electrónico a nuestra dirección de contacto oficial, adjuntando una copia de su documento de identidad e indicando el derecho que desea ejercer.
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-[#06CFD6] mt-8">7. Modificaciones a la Política</h2>
            <p>
              Nos reservamos el derecho de modificar la presente Política de Privacidad en cualquier momento para adaptarla a novedades legislativas o jurisprudenciales, así como a prácticas de la industria. Cualquier cambio será publicado en esta misma página.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacidad;
