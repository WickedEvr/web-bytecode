import React, { useState } from 'react';

/* ── estilos compartidos ── */
const ghost =
  'w-full bg-transparent border border-white/25 rounded-full px-4 py-2.5 text-white placeholder-white/35 text-sm focus:outline-none focus:border-primary-cyan transition-colors';

const ghostArea =
  'w-full bg-transparent border border-white/25 rounded-2xl px-4 py-3 text-white placeholder-white/35 text-sm focus:outline-none focus:border-primary-cyan transition-colors resize-none';

const ghostSelect =
  'w-full bg-[#060c1d] border border-white/25 rounded-full px-4 py-2.5 text-white/50 text-sm focus:outline-none focus:border-primary-cyan transition-colors appearance-none cursor-pointer';

const Radio: React.FC<{
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({ name, value, label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? 'border-primary-cyan' : 'border-white/40'}`}>
      {checked && <span className="w-2 h-2 rounded-full bg-primary-cyan block" />}
    </span>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
    <span className="text-white text-sm">{label}</span>
  </label>
);

const LibroReclamaciones: React.FC = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    domicilio: '',
    tipoDoc: '',
    numeroDoc: '',
    telefono: '',
    email: '',
    personType: 'natural',
    goodType: 'producto',
    montoCuantificable: '',
    descripcion: '',
    nombreUnidad: '',
    opcionBien: '',
    claimType: 'queja',
    tipoReclamo: '',
    detalle: '',
    pedido: '',
    aceptaTerminos: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      alert('Reclamo enviado correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sansation">
      {/* Fondo */}
      <div className="absolute inset-0">
        <img src="/hero.png" alt="" className="w-full h-full object-cover opacity-30" aria-hidden="true" />
        <div className="absolute inset-0 bg-[#040e1f]/80" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-16">

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-black text-primary-cyan text-center mb-3">
          Libro de reclamaciones
        </h1>
        <p className="text-white/60 text-xs text-center mb-1 leading-relaxed">
          Conforme a lo establecido en el Código de Protección y Defensa del Consumidor esta institución
          <br />cuenta con un{' '}
          <span className="text-primary-cyan">Libro de Reclamaciones a tu disposición.</span>
        </p>

        {/* Info 3 columnas */}
        <div className="flex items-center justify-center divide-x divide-white/20 border border-white/20 rounded-xl mt-6 mb-8 overflow-hidden">
          <div className="flex-1 py-3 text-center">
            <p className="text-white font-bold text-sm">Bytecode</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <p className="text-white text-xs font-semibold">R.U.C. 20601850225</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <p className="text-white/70 text-xs">22/03/26</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Sección 1 ── */}
          <div className="space-y-3">
            <h2 className="text-white font-bold text-base">
              Identificación del consumidor reclamante
            </h2>

            {/* Radios */}
            <div className="flex gap-6 mb-2">
              <Radio name="personType" value="natural" label="Persona Natural"
                checked={formData.personType === 'natural'} onChange={handleChange} />
              <Radio name="personType" value="empresa" label="Empresa"
                checked={formData.personType === 'empresa'} onChange={handleChange} />
            </div>

            {/* Nombres / Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <input name="nombres" type="text" placeholder="Nombres Completos"
                value={formData.nombres} onChange={handleChange} className={ghost} />
              <input name="apellidos" type="text" placeholder="Apellidos Completos"
                value={formData.apellidos} onChange={handleChange} className={ghost} />
            </div>
            <input name="domicilio" type="text" placeholder="Domicilio"
              value={formData.domicilio} onChange={handleChange} className={ghost} />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select name="tipoDoc" value={formData.tipoDoc} onChange={handleChange} className={ghostSelect}>
                  <option value="">Tipo de documento</option>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="RUC">RUC</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input name="numeroDoc" type="text" placeholder="Número de documento"
                value={formData.numeroDoc} onChange={handleChange} className={ghost} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="telefono" type="tel" placeholder="Teléfono"
                value={formData.telefono} onChange={handleChange} className={ghost} />
              <input name="email" type="email" placeholder="Correo"
                value={formData.email} onChange={handleChange} className={ghost} />
            </div>
          </div>

          {/* ── Sección 2 ── */}
          <div className="space-y-3">
            <h2 className="text-white font-bold text-base">
              Identificación del bien contratado
            </h2>

            <div className="flex gap-6 mb-2">
              <Radio name="goodType" value="producto" label="Producto"
                checked={formData.goodType === 'producto'} onChange={handleChange} />
              <Radio name="goodType" value="servicio" label="Servicio"
                checked={formData.goodType === 'servicio'} onChange={handleChange} />
            </div>

            <input name="montoCuantificable" type="text"
              placeholder="Si el reclamo lleva un monto cuantificable: Ej: monto de pensiones."
              value={formData.montoCuantificable} onChange={handleChange} className={ghost} />
            <input name="descripcion" type="text" placeholder="Descripción"
              value={formData.descripcion} onChange={handleChange} className={ghost} />
            <div className="grid grid-cols-2 gap-3">
              <input name="nombreUnidad" type="text" placeholder="Nombre de la unidad, programada o curso"
                value={formData.nombreUnidad} onChange={handleChange} className={ghost} />
              <div className="relative">
                <select name="opcionBien" value={formData.opcionBien} onChange={handleChange} className={ghostSelect}>
                  <option value="">Seleccione una opción</option>
                  <option value="opt1">Opción 1</option>
                  <option value="opt2">Opción 2</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Sección 3 ── */}
          <div className="space-y-3">
            <h2 className="text-white font-bold text-base">Sobre el problema</h2>

            <div className="flex gap-6 mb-2">
              <Radio name="claimType" value="queja" label="Queja"
                checked={formData.claimType === 'queja'} onChange={handleChange} />
              <Radio name="claimType" value="reclamo" label="Reclamo"
                checked={formData.claimType === 'reclamo'} onChange={handleChange} />
            </div>

            <input name="tipoReclamo" type="text" placeholder="Tipo de reclamo / queja"
              value={formData.tipoReclamo} onChange={handleChange} className={ghost} />
            <textarea name="detalle" placeholder="Detalle" rows={3}
              value={formData.detalle} onChange={handleChange} className={ghostArea} />
            <textarea name="pedido" placeholder="Pedido" rows={2}
              value={formData.pedido} onChange={handleChange} className={ghostArea} />
          </div>

          {/* ── Adjuntar ── */}
          <div>
            <p className="text-primary-cyan text-sm font-semibold mb-1">Adjuntar documento</p>
            <p className="text-white/40 text-xs mb-2">*Peso máximo 10mb</p>
            <input type="file" className="text-white/60 text-xs" />
          </div>

          {/* ── Advertencia ── */}
          <div className="border border-white/20 rounded-xl p-4 bg-white/3">
            <ul className="list-disc list-inside space-y-1">
              <li className="text-white/60 text-xs leading-relaxed">
                La presentación de un reclamo no le impide recurrir a otros medios de solución de controversias,
                ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá
                responder al reclamo en un plazo no mayor a quince (15) días hábiles, pudiendo ampliar el
                plazo hasta treinta (30) días más, previa comunicación al consumidor.
              </li>
            </ul>
          </div>

          {/* ── Checkbox ── */}
          <label className="flex items-start gap-3 cursor-pointer">
            <span className={`w-4 h-4 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center ${formData.aceptaTerminos ? 'border-primary-cyan bg-primary-cyan' : 'border-white/40'}`}>
              {formData.aceptaTerminos && (
                <svg viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2" className="w-3 h-2.5">
                  <polyline points="1,5 4,8 11,1" />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              name="aceptaTerminos"
              checked={formData.aceptaTerminos}
              onChange={handleChange}
              required
              className="sr-only"
            />
            <span className="text-white/60 text-xs leading-relaxed">
              Al enviar este formulario acepta estar de acuerdo con el contenido de su reclamo o queja.
            </span>
          </label>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-cyan text-white font-black py-4 rounded-full text-lg tracking-widest uppercase hover:bg-cyan-500 transition-colors disabled:opacity-60"
          >
            {isLoading ? 'Enviando...' : 'Conectar'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LibroReclamaciones;
