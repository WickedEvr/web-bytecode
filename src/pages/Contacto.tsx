import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import GalaxyBackground from '../components/GalaxyBackground';
import ContactFooter from '../components/ContactFooter';

const solidInput =
  'w-full bg-white rounded-full px-6 py-[0.85rem] text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[20px] shadow-sm';

const solidSelect =
  'w-full bg-white rounded-full px-6 py-[0.85rem] text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[20px] appearance-none cursor-pointer shadow-sm';

// Label ajustado: Texto más gris/blanco sutil, sin asterisco obligatorio visual y con un ligero padding izquierdo para alinear con la curvatura del input.
const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-white/70 text-[24px] font-bold mb-1.5 pl-5 tracking-wide">
    {text}
    {required && <span className="text-primary-cyan ml-1">*</span>}
  </label>
);

// 1. Interfaz preparada para tu futura BD SQL
interface CountryData {
  id: string;
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
  maxLength: number; // Para la validación dinámica
}

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Opcional: callback para enviar el código de país al formulario padre si lo necesitas
  onCountryChange?: (dialCode: string) => void; 
}

const PhoneInputGroup: React.FC<PhoneInputProps> = ({ value, onChange, onCountryChange }) => {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Simulación de Fetch a BD (Futura integración SQL)
  useEffect(() => {
    const fetchCountries = async () => {
      // A futuro, esto será: const response = await fetch('/api/countries');
      const mockDB: CountryData[] = [
        { id: '1', iso: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', maxLength: 9 },
        { id: '2', iso: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', maxLength: 10 },
        { id: '3', iso: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', maxLength: 10 },
        { id: '4', iso: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', maxLength: 9 },
        { id: '5', iso: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸', maxLength: 10 },
        { id: '6', iso: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸', maxLength: 9 },
      ];
      setCountries(mockDB);
      setSelectedCountry(mockDB[0]); // Por defecto Perú
      if (onCountryChange) onCountryChange(mockDB[0].dialCode);
    };
    fetchCountries();
  }, []);

  // 3. Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Validación en tiempo real basada en el país
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Solo permite números
    
    // Inyectamos el valor limpio al evento original para el padre
    e.target.value = inputValue; 
    onChange(e);

    if (selectedCountry && inputValue.length > 0 && inputValue.length !== selectedCountry.maxLength) {
      setError(`El número debe tener ${selectedCountry.maxLength} dígitos`);
    } else {
      setError('');
    }
  };

  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    if (onCountryChange) onCountryChange(country.dialCode);
    // Limpiamos el error si cambian de país
    setError(''); 
  };

  if (!selectedCountry) return null; // Loading state

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`flex items-center w-full bg-white rounded-full overflow-visible transition-all shadow-sm ${error ? 'ring-2 ring-red-400' : 'focus-within:ring-2 focus-within:ring-[#06CFD6]'}`}>
        
        {/* Trigger del Dropdown */}
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 pl-6 pr-3 py-[0.85rem] border-r border-gray-200 bg-white cursor-pointer hover:bg-gray-50 rounded-l-full select-none"
        >
          <img
            src={`https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${selectedCountry.iso.toLowerCase()}.png 2x`}
            alt={selectedCountry.name}
            className="w-6 h-auto object-contain rounded-sm"
            title={selectedCountry.name}
          />
          <span className="text-[20px] font-semibold text-gray-600">{selectedCountry.dialCode}</span>
          <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Input Text */}
        <input
          type="tel"
          name="celular"
          placeholder={`Ej: ${'9'.repeat(selectedCountry.maxLength)}`}
          className="flex-1 bg-transparent px-4 py-[0.85rem] text-[#333] placeholder-gray-400 focus:outline-none text-[20px] rounded-r-full"
          required
          maxLength={selectedCountry.maxLength}
          value={value}
          onChange={handleInputChange}
        />
      </div>

      {/* Menú Desplegable (Dropdown) */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[240px] overflow-y-auto py-2 custom-scrollbar">
            {countries.map((country) => (
              <div
                key={country.id}
                onClick={() => handleSelectCountry(country)}
                className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedCountry.id === country.id ? 'bg-[#06CFD6]/10 text-[#06CFD6]' : 'text-gray-600'}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://flagcdn.com/w20/${country.iso.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png 2x`}
                    alt={country.name}
                    className="w-5 h-auto object-contain rounded-sm shadow-sm"
                  />
                  <span className="font-medium text-[0.9rem]">{country.name}</span>
                </div>
                <span className="text-sm font-semibold opacity-70">{country.dialCode}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de Error */}
      {error && (
        <span className="absolute -bottom-5 left-4 text-xs font-bold text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};

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
      <SEO 
        title="Contacto" 
        description="Ponte en contacto con Bytecode para iniciar tu proyecto de transformación digital hoy mismo."
      />
      
      {/* Fondo espacio + Image + Red Cibernética */}
      <div className="absolute inset-0" style={{ backgroundColor: '#040e1f' }}>
        <GalaxyBackground /> 
        <div className="absolute inset-0" style={{ background: 'rgba(4,14,31,0.30)' }} />
        {/* 2. Capa oscura para asegurar legibilidad del formulario */}
        <div className="absolute inset-0 bg-[#040e1f]/70" />

        <div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
        />
        <div
          className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[750px] mx-auto px-6 py-20 pointer-events-auto flex flex-col items-center">
        {/* Título Centrado */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(3rem,6vw,4.5rem)] font-bold mb-10 text-center tracking-tight"
        >
          {/* En móvil es bloque (salto de línea), en PC es texto en línea */}
          <span className="block md:inline text-[#0CA3C6]">Conecta</span>
          
          {/* Insertamos el espacio de separación que solo existirá en PC */}
          <span className="hidden md:inline"> </span>
          
          {/* Quitamos el espacio inicial del string para que el centrado en móvil sea milimétricamente perfecto */}
          <span className="block md:inline text-white font-light -mt-[15px]">con tu marca</span>
        </motion.h1>

        {/* Formulario con Gaps ajustados */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
        >
          {/* Nombre */}
          <div>
            <Label text="Nombre Completo" />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre Completo"
              className={solidInput}
              required
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Cargo */}
          <div>
            <Label text="Cargo" />
            <input
              type="text"
              name="cargo"
              placeholder="Cargo"
              className={solidInput}
              required
              value={formData.cargo}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <Label text="Email" />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              className={solidInput}
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Celular - Componente Dinámico */}
          <div className="mb-2"> {/* Margen extra por si sale el mensaje de error */}
            <Label text="Número de celular" />
            <PhoneInputGroup 
              value={formData.celular} 
              onChange={handleChange}
              // Si en el futuro quieres guardar el +51 en la BD por separado:
              // onCountryChange={(code) => setFormData({...formData, prefijo: code})}
            />
          </div>

          {/* Empresa */}
          <div>
            <Label text="Empresa" />
            <input
              type="text"
              name="empresa"
              placeholder="Empresa"
              className={solidInput}
              required
              value={formData.empresa}
              onChange={handleChange}
            />
          </div>

          {/* RUC */}
          <div>
            <Label text="RUC" />
            <input
              type="text"
              name="ruc"
              placeholder="RUC"
              className={solidInput}
              required
              value={formData.ruc}
              onChange={handleChange}
            />
          </div>

          {/* Servicio */}
          <div>
            <Label text="Servicio que requiere" />
            <div className="relative">
              <select
                name="servicio"
                defaultValue=""
                className={solidSelect}
                required
                onChange={handleChange}
              >
                <option value="" disabled>Seleccione su servicio</option>
                <option value="web">Página Web</option>
                <option value="app">App Móvil</option>
                <option value="desktop">App de Escritorio</option>
              </select>
              {/* Chevron oscuro para fondo blanco */}
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Submit - Ajustado a la imagen objetivo */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#06CFD6] text-white font-bold py-3.5 rounded-3xl text-[30px] tracking-[0.18em] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,207,214,0.5)] active:scale-95 disabled:opacity-60"
            >
              {isLoading ? 'Enviando...' : 'Conectar'}
            </button>
          </div>
        </motion.form>
      </div>

      <div className="relative z-10 pointer-events-auto">
        <ContactFooter />
      </div>
    </div>
  );
};

export default Contacto;