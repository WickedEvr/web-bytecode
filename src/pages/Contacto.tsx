import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Contacto: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    email: '',
    celular: '',
    empresa: '',
    ruc: '',
    servicio: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      navigate('/confirmacion');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-space">
      <div className="network-overlay min-h-screen">
        <section className="section-container max-w-3xl mx-auto py-32">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-12 text-center"
          >
            Conecta con tu marca
          </motion.h1>
          
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre Completo"
                className="w-full bg-white text-gray-800 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-cyan transition-all"
                required
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="text"
                name="cargo"
                placeholder="Cargo"
                className="w-full bg-white text-gray-800 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-cyan transition-all"
                required
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full bg-white text-gray-800 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-cyan transition-all"
                required
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-24 bg-white text-gray-800 p-4 rounded-xl flex items-center justify-center space-x-2">
                 <span>🇵🇪</span>
                 <span>+51</span>
              </div>
              <input
                type="tel"
                name="celular"
                placeholder="Número de celular"
                className="flex-grow bg-white text-gray-800 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-cyan transition-all"
                required
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="text"
                name="empresa"
                placeholder="Empresa"
                className="w-full bg-white text-gray-800 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-cyan transition-all"
                required
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="text"
                name="ruc"
                placeholder="RUC"
                className="w-full bg-white text-gray-800 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-cyan transition-all"
                required
                onChange={handleChange}
              />
            </div>
            <div>
              <select
                name="servicio"
                className="w-full bg-white text-gray-800 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-cyan transition-all appearance-none"
                required
                onChange={handleChange}
              >
                <option value="" disabled selected>Servicio que requiere</option>
                <option value="web">Página Web</option>
                <option value="app">App Móvil</option>
                <option value="ai">Inteligencia Artificial</option>
                <option value="marketing">Marketing Digital</option>
              </select>
            </div>
            
            <div className="pt-8 text-center">
              <button 
                type="submit"
                className="btn-cyan w-full text-xl py-4 uppercase tracking-widest font-bold"
              >
                Conectar
              </button>
            </div>
          </motion.form>
        </section>
      </div>
    </div>
  );
};

export default Contacto;
