import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import SEO from '../components/SEO';
import GalaxyBackground from '../components/GalaxyBackground';
import ContactFooter from '../components/ContactFooter';

const solidInput =
  'w-full bg-white rounded-full px-6 py-[0.6rem] text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[20px] shadow-sm';

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-white/70 text-[24px] font-bold mb-1.5 pl-5 tracking-wide">
    {text}
    {required && <span className="text-[#06CFD6] ml-1">*</span>}
  </label>
);

// --- COMPONENTE: BOTÓN ANIMADO (ACETERNITY STYLE CON ESTADO DE ÉXITO) ---
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  isLoading: boolean;
  isSuccess?: boolean; // Nuevo estado de éxito
  text: string;
  loadingText?: string;
  successText?: string;
}

const AnimatedSubmitButton: React.FC<AnimatedButtonProps> = ({ 
  isLoading, 
  isSuccess = false,
  text, 
  loadingText = "Enviando...", 
  successText = "¡Listo!",
  className,
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: (isLoading || isSuccess) ? 1 : 1.02 }}
      whileTap={{ scale: (isLoading || isSuccess) ? 1 : 0.95 }}
      className={`relative flex items-center justify-center overflow-hidden transition-shadow ${className}`}
      disabled={isLoading || isSuccess || props.disabled}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-3 absolute"
          >
            {/* Animación de Check dibujándose */}
            <motion.svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-7 h-7"
            >
              <motion.polyline 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                points="20 6 9 17 4 12" 
              />
            </motion.svg>
            <span>{successText}</span>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-3 absolute"
          >
            {/* Spinner SVG Premium */}
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{loadingText}</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center absolute"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Elemento invisible para mantener la altura y anchura del botón estable */}
      <div className="opacity-0 flex items-center gap-3 pointer-events-none" aria-hidden="true">
        <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="4"></circle></svg>
        <span>{successText.length > loadingText.length ? successText : loadingText}</span>
      </div>
    </motion.button>
  );
};

// 1. Interfaz preparada para tu futura BD SQL
interface CountryData {
  id: string;
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
  maxLength: number;
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
      setSelectedCountry(mockDB[0]); 
      if (onCountryChange) onCountryChange(mockDB[0].dialCode);
    };
    fetchCountries();
  }, []);

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
    const inputValue = e.target.value.replace(/\D/g, ''); 
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
    setError(''); 
  };

  if (!selectedCountry) return null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`flex items-center w-full bg-white rounded-full overflow-visible transition-all shadow-sm ${error ? 'ring-2 ring-red-400' : 'focus-within:ring-2 focus-within:ring-[#06CFD6]'}`}>
        
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="shrink-0 flex items-center gap-1.5 md:gap-2 pl-4 md:pl-6 pr-2 md:pr-3 py-[0.6rem] border-r border-gray-200 bg-white cursor-pointer hover:bg-gray-50 rounded-l-full select-none"
        >
          <img
            src={`https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${selectedCountry.iso.toLowerCase()}.png 2x`}
            alt={selectedCountry.name}
            className="w-6 h-auto object-contain rounded-sm"
            title={selectedCountry.name}
          />
          <span className="text-[18px] md:text-[20px] font-semibold text-gray-600">{selectedCountry.dialCode}</span>
          <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <input
          type="tel"
          name="celular"
          placeholder={`Ej: ${'9'.repeat(selectedCountry.maxLength)}`}
          className="flex-1 bg-transparent px-4 py-[0.6rem] text-[#333] placeholder-gray-400 focus:outline-none text-[20px] rounded-r-full"
          required
          maxLength={selectedCountry.maxLength}
          value={value}
          onChange={handleInputChange}
        />
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ transformOrigin: "top left" }}
            className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100]"
          >
            <div className="max-h-[240px] overflow-y-auto py-2 custom-scrollbar overscroll-contain">
              {countries.map((country) => (
                <div
                  key={country.id}
                  onClick={() => handleSelectCountry(country)}
                  className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-colors ${
                    selectedCountry.id === country.id 
                      ? 'bg-[#06CFD6]/15 text-[#06CFD6] font-bold' 
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
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
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span className="absolute -bottom-5 left-4 text-xs font-bold text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};

interface ServiceOption {
  value: string;
  label: string;
}

interface ServiceDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const ServiceDropdown: React.FC<ServiceDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: ServiceOption[] = [
    { value: 'web', label: 'Página Web' },
    { value: 'app', label: 'App Móvil' },
    { value: 'desktop', label: 'App de Escritorio' },
  ];

  const selectedLabel = options.find((opt) => opt.value === value)?.label || 'Seleccione su servicio';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-white rounded-full px-6 py-[0.6rem] cursor-pointer shadow-sm transition-all ${isOpen ? 'ring-2 ring-[#06CFD6]' : ''}`}
      >
        <span className={`text-[20px] ${value ? 'text-[#333]' : 'text-gray-400'}`}>
          {selectedLabel}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Menú Desplegable con Animación (Igual que el de teléfonos) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ transformOrigin: "top" }}
            className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100]"
          >
            <div className="py-2">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-6 py-3 cursor-pointer transition-colors ${
                    value === option.value 
                      ? 'bg-[#06CFD6]/15 text-[#06CFD6] font-bold' 
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <span className="text-[20px]">{option.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  
  // Agregamos el estado de éxito a nuestra lógica
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    // 1. Simulamos el tiempo de envío a la base de datos (2 segundos de spinner)
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // 2. Le damos tiempo al usuario para ver la animación del check (1.2 segundos)
      setTimeout(() => {
        navigate('/confirmacion', { state: { source: 'contacto' } });
      }, 1200);
      
    }, 2000); 
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sansation select-none">
      <SEO 
        title="Contacto" 
        description="Ponte en contacto con Bytecode para iniciar tu proyecto de transformación digital hoy mismo."
      />
      
      {/* Fondo espacio */}
      <div className="absolute inset-0" style={{ backgroundColor: '#040e1f' }}>
        <GalaxyBackground /> 
        <div className="absolute inset-0" style={{ background: 'rgba(4,14,31,0.30)' }} />
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

      <div className="relative z-10 w-full max-w-[750px] mx-auto px-6 py-10 lg:py-20 pointer-events-auto flex flex-col items-center">
        {/* Título Centrado */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-bold mb-10 text-center tracking-tight"
        >
          <span className="block md:inline text-[#0CA3C6]">Conecta</span>
          <span className="hidden md:inline"> </span>
          <span className="block md:inline text-white font-light -mt-[15px]">con tu marca</span>
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
        >
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

          <div className="mb-2">
            <Label text="Número de celular" />
            <PhoneInputGroup 
              value={formData.celular} 
              onChange={handleChange}
              // Si en el futuro quieres guardar el +51 en la BD por separado:
              // onCountryChange={(code) => setFormData({...formData, prefijo: code})}
            />
          </div>

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

          <div className="mb-2">
            <Label text="Servicio que requiere" />
            <ServiceDropdown 
              value={formData.servicio}
              onChange={(newValue) => handleChange({ target: { name: 'servicio', value: newValue } } as any)}
            />
          </div>

          <div className="pt-6">
            <AnimatedSubmitButton
              type="submit"
              isLoading={isLoading}
              isSuccess={isSuccess}
              text="Conectar"
              loadingText="Enviando..."
              successText="¡Conectado!"
              className={`w-full text-white py-2 rounded-3xl text-[30px] font-bold shadow-[0_0_20px_rgba(6,207,214,0.3)] disabled:opacity-90 ${isSuccess ? 'bg-[#0CA3C6] shadow-[0_0_30px_rgba(12,163,198,0.6)]' : 'bg-[#06CFD6] hover:shadow-[0_0_30px_rgba(6,207,214,0.6)] disabled:hover:shadow-[0_0_20px_rgba(6,207,214,0.3)]'}`}
            />
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