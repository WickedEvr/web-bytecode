import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ghostInput =
  'w-full bg-white/5 border border-white/25 rounded-full px-5 py-3 text-white placeholder-white/35 focus:outline-none focus:border-primary-cyan transition-colors text-sm';

const ghostSelect =
  'w-full bg-white/5 border border-white/25 rounded-full px-5 py-3 text-white/60 focus:outline-none focus:border-primary-cyan transition-colors text-sm appearance-none cursor-pointer';

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-white/80 text-xs font-semibold mb-1.5 pl-1">
    {text}
    {required && <span className="text-primary-cyan ml-1">*</span>}
  </label>
);

const Contacto: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    email: '',
    celular: '',
    empresa: '',
    ruc: '',
    servicio: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/confirmacion');
    }, 500);
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sansation">
      {/* Fondo espacio */}
      <div className="absolute inset-0">
        <img src="/hero.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-[#040e1f]/75" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-24">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black mb-10"
        >
          <span className="text-primary-cyan">Conecta</span>
          <span className="text-white"> con tu marca</span>
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Nombre */}
          <div>
            <Label text="Nombre Completo" required />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre Completo"
              className={ghostInput}
              required
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Cargo */}
          <div>
            <Label text="Cargo" required />
            <input
              type="text"
              name="cargo"
              placeholder="Cargo"
              className={ghostInput}
              required
              value={formData.cargo}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <Label text="Email" required />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              className={ghostInput}
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Celular */}
          <div>
            <Label text="Número de celular" required />
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/25 rounded-full px-4 py-3 text-white text-sm shrink-0">
                <span>🇵🇪</span>
                <span className="text-white/70">+51</span>
              </div>
              <input
                type="tel"
                name="celular"
                placeholder="Número de celular"
                className={`${ghostInput} flex-1`}
                required
                value={formData.celular}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Empresa */}
          <div>
            <Label text="Empresa" required />
            <input
              type="text"
              name="empresa"
              placeholder="Empresa"
              className={ghostInput}
              required
              value={formData.empresa}
              onChange={handleChange}
            />
          </div>

          {/* RUC */}
          <div>
            <Label text="RUC" required />
            <input
              type="text"
              name="ruc"
              placeholder="RUC"
              className={ghostInput}
              required
              value={formData.ruc}
              onChange={handleChange}
            />
          </div>

          {/* Servicio */}
          <div>
            <Label text="Servicio que requiere" required />
            <div className="relative">
              <select
                name="servicio"
                defaultValue=""
                className={ghostSelect}
                required
                onChange={handleChange}
              >
                <option value="" disabled>Servicio</option>
                <option value="web">Página Web</option>
                <option value="app">App Móvil</option>
                <option value="ai">Inteligencia Artificial</option>
                <option value="marketing">Marketing Digital</option>
              </select>
              {/* Chevron */}
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-cyan text-white font-black py-4 rounded-full text-lg tracking-widest uppercase hover:bg-cyan-500 transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Enviando...' : 'Conectar'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Contacto;
