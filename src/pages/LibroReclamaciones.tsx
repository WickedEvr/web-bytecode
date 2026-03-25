// ✅ LibroReclamaciones.tsx — Fix 1 & 8: Estado controlado, handleSubmit, isLoading, radios vinculados
import React, { useState } from 'react';

const LibroReclamaciones: React.FC = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    domicilio: '',
    tipoDoc: 'DNI',
    numeroDoc: '',
    telefono: '',
    email: '',
    personType: '',
    goodType: '',
    descripcionBien: '',
    claimType: '',
    detalleReclamo: '',
    pedidoConsumidor: '',
    aceptaTerminos: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Reclamo enviado correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

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

          <form className="space-y-12" onSubmit={handleSubmit}>
            {/* Seccion 1 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary-cyan pl-4">1. Identificación del consumidor reclamante</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="nombres"
                  placeholder="Nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
                />
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
                />
                <input
                  type="text"
                  name="domicilio"
                  placeholder="Domicilio"
                  value={formData.domicilio}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/20 p-4 rounded-xl w-full md:col-span-2"
                />
                <select
                  name="tipoDoc"
                  value={formData.tipoDoc}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="RUC">RUC</option>
                </select>
                <input
                  type="text"
                  name="numeroDoc"
                  placeholder="Número de documento"
                  value={formData.numeroDoc}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
                />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
                />
              </div>
              <div className="flex items-center space-x-8">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="personType"
                    value="natural"
                    checked={formData.personType === 'natural'}
                    onChange={handleChange}
                    className="accent-primary-cyan"
                  />
                  <span>Persona Natural</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="personType"
                    value="empresa"
                    checked={formData.personType === 'empresa'}
                    onChange={handleChange}
                    className="accent-primary-cyan"
                  />
                  <span>Empresa</span>
                </label>
              </div>
            </div>

            {/* Seccion 2 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary-cyan pl-4">2. Identificación del bien contratado</h2>
              <div className="flex items-center space-x-8 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="goodType"
                    value="producto"
                    checked={formData.goodType === 'producto'}
                    onChange={handleChange}
                    className="accent-primary-cyan"
                  />
                  <span>Producto</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="goodType"
                    value="servicio"
                    checked={formData.goodType === 'servicio'}
                    onChange={handleChange}
                    className="accent-primary-cyan"
                  />
                  <span>Servicio</span>
                </label>
              </div>
              <textarea
                name="descripcionBien"
                placeholder="Descripción del bien contratado"
                rows={4}
                value={formData.descripcionBien}
                onChange={handleChange}
                className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
              />
            </div>

            {/* Seccion 3 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary-cyan pl-4">3. Detalle de la reclamación</h2>
              <div className="flex items-center space-x-8 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="claimType"
                    value="queja"
                    checked={formData.claimType === 'queja'}
                    onChange={handleChange}
                    className="accent-primary-cyan"
                  />
                  <span>Queja</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="claimType"
                    value="reclamo"
                    checked={formData.claimType === 'reclamo'}
                    onChange={handleChange}
                    className="accent-primary-cyan"
                  />
                  <span>Reclamo</span>
                </label>
              </div>
              <textarea
                name="detalleReclamo"
                placeholder="Detalle del reclamo o queja"
                rows={4}
                value={formData.detalleReclamo}
                onChange={handleChange}
                className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
              />
              <textarea
                name="pedidoConsumidor"
                placeholder="Pedido del consumidor"
                rows={3}
                value={formData.pedidoConsumidor}
                onChange={handleChange}
                className="bg-white/5 border border-white/20 p-4 rounded-xl w-full"
              />
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
              <input
                type="checkbox"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                className="mt-1 accent-primary-cyan"
                required
              />
              <p className="text-sm text-gray-400">Al enviar este formulario acepta estar de acuerdo con el contenido de su reclamo o queja.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-cyan w-full py-4 text-xl uppercase tracking-widest font-bold disabled:opacity-60"
            >
              {isLoading ? 'Enviando...' : 'Enviar Reclamo'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LibroReclamaciones;
