import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import ContactFooter from '../components/ContactFooter';
import GalaxyBackground from '../components/GalaxyBackground';
import { createComplaint } from '../lib/api';

// --- ESTILOS UNIFICADOS (Basados en Contacto) ---
const solidInput =
  'w-full bg-white rounded-full px-5 py-[0.6rem] text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[18px] md:text-[20px] shadow-sm';

const solidArea =
  'w-full bg-white rounded-2xl px-5 py-4 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[18px] md:text-[20px] shadow-sm resize-none';

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-white text-[18px] md:text-[20px] font-bold mb-1.5 pl-4 tracking-wide">
    {text}
    {required && <span className="text-[#06CFD6] ml-1">*</span>}
  </label>
);

const Radio: React.FC<{
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}> = ({ name, value, label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group relative">
    <span className={`relative w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center shrink-0 transition-colors duration-300 ${checked ? 'border-[#06CFD6]' : 'border-white/40 group-hover:border-white/70'}`}>
      <AnimatePresence>
        {checked && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute w-2.5 h-2.5 rounded-full bg-[#06CFD6]"
          />
        )}
      </AnimatePresence>
    </span>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
    <span className={`text-[16px] md:text-[18px] select-none transition-colors duration-300 ${checked ? 'text-white font-medium' : 'text-white/80 group-hover:text-white'}`}>
      {label}
    </span>
  </label>
);

// --- COMPONENTE: BOTÓN ANIMADO (ACETERNITY STYLE CON ESTADO DE ÉXITO) ---
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  isLoading: boolean;
  isSuccess?: boolean;
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
      whileHover={{ scale: (isLoading || isSuccess || props.disabled) ? 1 : 1.02 }}
      whileTap={{ scale: (isLoading || isSuccess || props.disabled) ? 1 : 0.95 }}
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

// --- COMPONENTES DINÁMICOS PREPARADOS PARA BD ---

// 1. Dropdown Genérico (Basado en ServiceDropdown)
interface DropdownOption { value: string; label: string; }
interface CustomDropdownProps { value: string; options: DropdownOption[]; onChange: (val: string) => void; placeholder: string; }

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-white rounded-full px-5 py-[0.6rem] cursor-pointer shadow-sm transition-all ${isOpen ? 'ring-2 ring-[#06CFD6]' : 'hover:bg-gray-50'}`}
      >
        <span className={`text-[18px] md:text-[20px] ${value ? 'text-[#333]' : 'text-gray-400'}`}>
          {selectedLabel}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100]"
          >
            <div className="py-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => { onChange(option.value); setIsOpen(false); }}
                  className={`px-5 py-2.5 cursor-pointer transition-colors ${value === option.value ? 'bg-[#06CFD6]/15 text-[#06CFD6] font-bold' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                >
                  <span className="text-[18px]">{option.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 2. Phone Input (Idéntico al de Contacto)
interface CountryData { id: string; iso: string; name: string; dialCode: string; flag: string; maxLength: number; }
interface PhoneInputProps { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onCountryChange?: (dialCode: string) => void; }

const PhoneInputGroup: React.FC<PhoneInputProps> = ({ value, onChange, onCountryChange }) => {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockDB: CountryData[] = [
      { id: '1', iso: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', maxLength: 9 },
      { id: '2', iso: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', maxLength: 10 },
      { id: '3', iso: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', maxLength: 10 },
      { id: '4', iso: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', maxLength: 9 },
    ];
    setCountries(mockDB);
    setSelectedCountry(mockDB[0]);
    if (onCountryChange) onCountryChange(mockDB[0].dialCode);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val;
    onChange(e);
    if (selectedCountry && val.length > 0 && val.length !== selectedCountry.maxLength) setError(`Debe tener ${selectedCountry.maxLength} dígitos`);
    else setError('');
  };

  if (!selectedCountry) return null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`flex items-center w-full bg-white rounded-full transition-all shadow-sm ${error ? 'ring-2 ring-red-400' : 'focus-within:ring-2 focus-within:ring-[#06CFD6]'}`}>
        <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="shrink-0 flex items-center gap-1.5 pl-4 pr-2 py-[0.6rem] border-r border-gray-200 cursor-pointer hover:bg-gray-50 rounded-l-full">
          <img src={`https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`} alt={selectedCountry.name} className="w-6 h-auto rounded-sm" />
          <span className="text-[18px] md:text-[20px] font-semibold text-gray-600">{selectedCountry.dialCode}</span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <input type="tel" name="telefono" placeholder={`Ej: ${'9'.repeat(selectedCountry.maxLength)}`} required maxLength={selectedCountry.maxLength} value={value} onChange={handleInputChange} className="flex-1 bg-transparent px-4 py-[0.6rem] text-[#333] placeholder-gray-400 focus:outline-none text-[18px] md:text-[20px] rounded-r-full" />
      </div>
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100 shadow-xl rounded-xl z-[100] py-2">
            {countries.map((c) => (
              <div key={c.id} onClick={() => { setSelectedCountry(c); setIsDropdownOpen(false); if(onCountryChange) onCountryChange(c.dialCode); setError(''); }} className={`flex items-center justify-between px-5 py-3 cursor-pointer ${selectedCountry.id === c.id ? 'bg-[#06CFD6]/15 text-[#0CA3C6] font-bold' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
                <div className="flex items-center gap-3"><img src={`https://flagcdn.com/w20/${c.iso.toLowerCase()}.png`} className="w-5" /><span className="font-bold text-[0.9rem]">{c.name}</span></div>
                <span className="text-sm font-semibold opacity-100">{c.dialCode}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <span className="absolute -bottom-5 left-4 text-xs font-bold text-red-400">{error}</span>}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const LibroReclamaciones: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    domicilio: '',
    tipoDoc: '',
    numeroDoc: '',
    prefijoTelefono: '+51',
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
  
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);
  
  // Estados para la animación del botón
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleCustomDropdown = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoAdjunto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setSubmitError('');

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, String(value));
    });
    if (archivoAdjunto) {
      payload.append('archivoAdjunto', archivoAdjunto);
    }

    try {
      await createComplaint(payload);
      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigate('/confirmacion', { state: { source: 'reclamo' } });
      }, 900);
    } catch (error) {
      setIsLoading(false);
      setSubmitError(error instanceof Error ? error.message : 'No se pudo enviar el reclamo.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sansation">
      {/* Fondo espacio */}
      <div className="absolute inset-0" style={{ backgroundColor: '#040e1f' }}>
        <GalaxyBackground /> 
        <div className="absolute inset-0 bg-[#040e1f]/40" />
        <div className="absolute inset-0 bg-[#040e1f]/70" />
        <div className="absolute inset-0 opacity-70 mix-blend-screen" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }} />
        <div className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}designs/stardust.png)` }} />
        <div className="absolute inset-0 bg-[#040e1f]/50" />
      </div>

      <div className="relative z-10 max-w-[1100px] md:max-w-[800px] lg:max-w-[1100px] mx-auto px-6 py-10 md:py-16 lg:py-24 pointer-events-auto">  
        {/* Título */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-black text-[#0CA3C6] tracking-tight mb-2">
            Libro de reclamaciones
          </h1>
          <p className="text-center text-white/75 text-[16px] md:text-[18px] lg:text-[20px] leading-relaxed max-w-4xl mx-auto">
            Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, esta institución cuenta con un <span className="text-[#06CFD6] font-semibold">Libro de Reclamaciones a tu disposición.</span>
          </p>
        </motion.div>

        {/* Info 3 columnas */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1 }}
          className="flex flex-row items-center justify-between mb-7 max-w-4xl mx-auto w-full px-2"
        >
          {/* Columna 1 */}
          <div className="flex-1 text-center">
            <p className="text-white font-bold text-[15px] sm:text-[20px] md:text-[24px] tracking-wide">
              Bytecode
            </p>
          </div>
          
          {/* Columna 2 */}
          <div className="flex-[1.2] md:flex-[1.5] text-center py-3 sm:py-5 md:py-8 border-x border-white px-2 sm:px-6">
            <p className="text-white font-semibold text-[15px] sm:text-[18px] md:text-[20px] tracking-wide drop-shadow-md leading-tight">
              R.U.C. <br className="block md:hidden" /> 20601850225
            </p>
          </div>
          
          {/* Columna 3  */}
          <div className="flex-1 text-center">
            <p className="text-white font-medium text-[15px] sm:text-[20px] md:text-[24px] tracking-wide">
              {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </p>
          </div>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className="space-y-10">
          {/* ── Sección 1 ── */}
          <div className="space-y-5">
            <h2 className="text-white font-bold text-[24px] md:text-[30px] tracking-wide mb-4">
              Identificación del consumidor reclamante
            </h2>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-6 mb-4 px-2">
              <Radio name="personType" value="natural" label="Persona Natural" checked={formData.personType === 'natural'} onChange={handleChange} />
              <Radio name="personType" value="empresa" label="Empresa" checked={formData.personType === 'empresa'} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><Label text="Nombres" required /><input name="nombres" type="text" placeholder="Nombres Completos" value={formData.nombres} onChange={handleChange} className={solidInput} required /></div>
              <div><Label text="Apellidos" required /><input name="apellidos" type="text" placeholder="Apellidos Completos" value={formData.apellidos} onChange={handleChange} className={solidInput} required /></div>
            </div>

            <div><Label text="Domicilio" required /><input name="domicilio" type="text" placeholder="Dirección completa" value={formData.domicilio} onChange={handleChange} className={solidInput} required /></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label text="Tipo de Documento" required />
                <CustomDropdown value={formData.tipoDoc} placeholder="Seleccione un tipo" onChange={(val) => handleCustomDropdown('tipoDoc', val)} options={[{ value: 'DNI', label: 'DNI' }, { value: 'CE', label: 'CE' }, { value: 'RUC', label: 'RUC' }]} />
              </div>
              <div><Label text="Número de Documento" required /><input name="numeroDoc" type="text" placeholder="Número" value={formData.numeroDoc} onChange={handleChange} className={solidInput} required /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="mb-2 md:mb-0">
                <Label text="Número de celular" required />
                <PhoneInputGroup value={formData.telefono} onChange={handleChange} onCountryChange={(code) => setFormData({...formData, prefijoTelefono: code})} />
              </div>
              <div><Label text="Correo Electrónico" required /><input name="email" type="email" placeholder="ejemplo@correo.com" value={formData.email} onChange={handleChange} className={solidInput} required /></div>
            </div>
          </div>

          {/* ── Sección 2 ── */}
          <div className="space-y-5">
            <h2 className="text-white font-bold text-[24px] md:text-[30px] tracking-wide mb-4">
              Identificación del bien contratado
            </h2>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-6 mb-4 px-2">
              <Radio name="goodType" value="producto" label="Producto" checked={formData.goodType === 'producto'} onChange={handleChange} />
              <Radio name="goodType" value="servicio" label="Servicio" checked={formData.goodType === 'servicio'} onChange={handleChange} />
            </div>

            <div><Label text="Monto Reclamado (Opcional)" /><input name="montoCuantificable" type="text" placeholder="Ej: S/ 1500.00" value={formData.montoCuantificable} onChange={handleChange} className={solidInput} /></div>
            <div><Label text="Descripción" required /><input name="descripcion" type="text" placeholder="Descripción del producto o servicio" value={formData.descripcion} onChange={handleChange} className={solidInput} required /></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><Label text="Nombre del proyecto/unidad" /><input name="nombreUnidad" type="text" placeholder="Ej: Landing Page Corporativa" value={formData.nombreUnidad} onChange={handleChange} className={solidInput} /></div>
              <div>
                <Label text="Categoría" />
                <CustomDropdown value={formData.opcionBien} placeholder="Seleccione una opción" onChange={(val) => handleCustomDropdown('opcionBien', val)} options={[{ value: 'opt1', label: 'Desarrollo Web' }, { value: 'opt2', label: 'Aplicación Móvil' }, { value: 'opt3', label: 'Software a Medida' }]} />
              </div>
            </div>
          </div>

          {/* ── Sección 3 ── */}
          <div className="space-y-5">
            <h2 className="text-white font-bold text-[24px] md:text-[30px] tracking-wide mb-4">
              Sobre el problema
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 mb-4 px-2">
              <Radio name="claimType" value="queja" label="Queja (Malestar o descontento)" checked={formData.claimType === 'queja'} onChange={handleChange} />
              <Radio name="claimType" value="reclamo" label="Reclamo (Disconformidad con el servicio)" checked={formData.claimType === 'reclamo'} onChange={handleChange} />
            </div>

            <div><Label text="Motivo" required /><input name="tipoReclamo" type="text" placeholder="Ej: Incumplimiento de plazos" value={formData.tipoReclamo} onChange={handleChange} className={solidInput} required /></div>
            <div><Label text="Detalle de la queja/reclamo" required /><textarea name="detalle" placeholder="Explique detalladamente lo sucedido..." rows={4} value={formData.detalle} onChange={handleChange} className={solidArea} required /></div>
            <div><Label text="Pedido (Solución esperada)" required /><textarea name="pedido" placeholder="¿Qué solución espera de nuestra parte?" rows={3} value={formData.pedido} onChange={handleChange} className={solidArea} required /></div>

            {/* ── Adjuntar Archivo ── */}
            <div className="pt-4">
              <Label text="Adjuntar documento o evidencia (Opcional)" />
              <div className="relative flex items-center justify-center w-full mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#06CFD6]/30 border-dashed rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-[#06CFD6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="mb-1 text-base text-white/80"><span className="font-semibold text-[#06CFD6]">Haga clic para subir</span> o arrastre el archivo</p>
                    <p className="text-sm text-white/50">{archivoAdjunto ? archivoAdjunto.name : 'PDF, JPG o PNG (Máx. 10MB)'}</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />
                </label>
              </div>
            </div>
          </div>

          {/* ── Advertencia Legal (Esta SÍ mantiene su caja contenedora) ── */}
          <div className="border border-[#06CFD6]/20 rounded-2xl p-5 md:p-6 bg-[#06CFD6]/5 mt-4">
            <p className="text-white/70 text-[14px] md:text-[15px] lg:text-[16px] leading-relaxed text-justify">
              <strong className="text-[#06CFD6]">Nota legal:</strong> La presentación de un reclamo no le impide recurrir a otros medios de solución de controversias, ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá responder al reclamo en un plazo no mayor a quince (15) días hábiles, pudiendo ampliar el plazo hasta treinta (30) días más, previa comunicación al consumidor.
            </p>
          </div>

          {/* ── Checkbox Términos ── */}
          <label className="flex items-start gap-4 cursor-pointer group px-2">
            <span className={`relative w-6 h-6 rounded-md border-[2.5px] mt-0.5 shrink-0 flex items-center justify-center transition-colors duration-300 ${formData.aceptaTerminos ? 'border-[#06CFD6] bg-[#06CFD6]' : 'border-white/40 group-hover:border-white/70'}`}>
              <AnimatePresence>
                {formData.aceptaTerminos && (
                  <motion.svg 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    viewBox="0 0 12 10" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3"
                  >
                    {/* motion.polyline permite animar el "trazado" del check */}
                    <motion.polyline 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      points="1,5 4,8 11,1" 
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </span>
            <input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} required className="sr-only" />

            <span className={`text-[16px] md:text-[18px] leading-snug select-none transition-colors duration-300 ${formData.aceptaTerminos ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
              Declaro que los datos consignados son correctos y <span className="font-bold">acepto estar de acuerdo con el contenido</span> de mi reclamo o queja.
            </span>
          </label>

          {/* ── Submit ── */}
          <div className="pt-4">
            {submitError && (
              <p className="mb-4 rounded-2xl bg-red-500/15 px-5 py-3 text-center text-red-100">
                {submitError}
              </p>
            )}
            <AnimatedSubmitButton
              type="submit"
              isLoading={isLoading}
              isSuccess={isSuccess}
              text="Enviar Reclamo"
              loadingText="Enviando reclamo..."
              successText="¡Reclamo Enviado!"
              disabled={!formData.aceptaTerminos}
              className={`w-full text-white py-4 rounded-full text-[24px] md:text-[30px] font-bold shadow-[0_0_20px_rgba(6,207,214,0.3)] disabled:opacity-50 transition-all duration-300 ${isSuccess ? 'bg-[#0CA3C6] shadow-[0_0_30px_rgba(12,163,198,0.6)]' : 'bg-[#06CFD6] hover:shadow-[0_0_30px_rgba(6,207,214,0.6)] disabled:hover:shadow-none disabled:hover:scale-100'}`}
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

export default LibroReclamaciones;
