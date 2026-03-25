import React from 'react';
import { motion } from 'framer-motion';

const LibroReclamaciones: React.FC = () => {
  return (
    <div className="bg-space min-h-screen">
      <div className="network-overlay py-20 px-6">
        <section className="max-w-4xl mx-auto glass-panel p-8 md:p-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-8">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-widest text-primary-cyan mb-2">Libro de Reclamaciones</h1>
              <p className="text-gray-400">Conforme a lo establecido en el Código de Protección y Defensa del Consumidor.</p>
            </div>
            <div className="mt-6 md:mt-0 text-right space-y-2">
              <p className="font-bold">Bytecode</p>
              <p className="text-sm">RUC. 20601850225</p>
              <p className="text-sm">Fecha: 24/03/2026</p>
            </div>
          </div>

          <form className="space-y-12">
            {/* Seccion 1 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary-cyan pl-4">1. Identificación del consumidor reclamante</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Nombres" className="bg-white/5 border border-white/20 p-4 rounded-xl w-full" />
                <input type="text" placeholder="Apellidos" className="bg-white/5 border border-white/20 p-4 rounded-xl w-full" />
                <input type="text" placeholder="Domicilio" className="bg-white/5 border border-white/20 p-4 rounded-xl w-full md:col-span-2" />
                <select className="bg-white/5 border border-white/20 p-4 rounded-xl w-full">
                  <option>DNI</option>
                  <option>CE</option>
                  <option>RUC</option>
                </select>
                <input type="text" placeholder="Número de documento" className="bg-white/5 border border-white/20 p-4 rounded-xl w-full" />
                <input type="tel" placeholder="Teléfono" className="bg-white/5 border border-white/20 p-4 rounded-xl w-full" />
                <input type="email" placeholder="Correo electrónico" className="bg-white/5 border border-white/20 p-4 rounded-xl w-full" />
              </div>
              <div className="flex items-center space-x-8">
                 <label className="flex items-center space-x-2">
                   <input type="radio" name="personType" className="accent-primary-cyan" />
                   <span>Persona Natural</span>
                 </label>
                 <label className="flex items-center space-x-2">
                   <input type="radio" name="personType" className="accent-primary-cyan" />
                   <span>Empresa</span>
                 </label>
              </div>
            </div>

            {/* Seccion 2 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary-cyan pl-4">2. Identificación del bien contratado</h2>
              <div className="flex items-center space-x-8 mb-4">
                 <label className="flex items-center space-x-2">
                   <input type="radio" name="goodType" className="accent-primary-cyan" />
                   <span>Producto</span>
                 </label>
                 <label className="flex items-center space-x-2">
                   <input type="radio" name="goodType" className="accent-primary-cyan" />
                   <span>Servicio</span>
                 </label>
              </div>
              <textarea placeholder="Descripción del bien contratado" rows={4} className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"></textarea>
            </div>

            {/* Seccion 3 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary-cyan pl-4">3. Detalle de la reclamación</h2>
              <div className="flex items-center space-x-8 mb-4">
                 <label className="flex items-center space-x-2">
                   <input type="radio" name="claimType" className="accent-primary-cyan" />
                   <span>Queja</span>
                 </label>
                 <label className="flex items-center space-x-2">
                   <input type="radio" name="claimType" className="accent-primary-cyan" />
                   <span>Reclamo</span>
                 </label>
              </div>
              <textarea placeholder="Detalle del reclamo o queja" rows={4} className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"></textarea>
              <textarea placeholder="Pedido del consumidor" rows={3} className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"></textarea>
            </div>

            {/* Adjuntar */}
            <div className="bg-white/5 border-2 border-dashed border-white/20 p-8 rounded-xl text-center">
              <p className="text-gray-400">Adjuntar documento (Opcional)</p>
              <input type="file" className="mt-4" />
            </div>

            {/* Warning */}
            <div className="bg-primary-cyan/10 border border-primary-cyan/30 p-6 rounded-xl">
              <p className="text-sm text-gray-300">
                <strong>Advertencia:</strong> La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <input type="checkbox" className="mt-1 accent-primary-cyan" required />
              <p className="text-sm text-gray-400">Al enviar este formulario acepta estar de acuerdo con el contenido de su reclamo o queja.</p>
            </div>

            <button type="submit" className="btn-cyan w-full py-4 text-xl uppercase tracking-widest font-bold">
              Enviar Reclamo
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LibroReclamaciones;
