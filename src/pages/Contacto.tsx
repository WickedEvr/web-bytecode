import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import SEO from '../components/shared/SEO';
import LazyGalaxyBackground from '../components/effects/LazyGalaxyBackground';
import ContactFooter from '../components/layout/ContactFooter';
import { createContactSubmission, fetchCountries, fetchServices, fetchDocumentTypes, type CountryData, type DocumentTypeData } from '../lib/api';

const solidInput =
  'w-full bg-white rounded-full px-6 py-[0.6rem] text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[20px] shadow-sm';

const solidTextarea =
  'w-full min-h-[150px] resize-y bg-white rounded-3xl px-6 py-4 text-[#333] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06CFD6] transition-all text-[20px] shadow-sm';

const stripDigits = (value: string) => value.replace(/\d/g, '');
const stripSymbols = (value: string) => value.replace(/[^\p{L}\p{N}\s]/gu, '');

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
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const updateHoverSupport = () => setSupportsHover(hoverQuery.matches);

    updateHoverSupport();
    hoverQuery.addEventListener('change', updateHoverSupport);
    return () => hoverQuery.removeEventListener('change', updateHoverSupport);
  }, []);

  return (
    <motion.button
      whileHover={supportsHover ? { scale: (isLoading || isSuccess) ? 1 : 1.02 } : undefined}
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

// 1. Interfaz preparada para tu futura BD SQL (Importada desde api.ts)

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Opcional: callback para enviar el código de país al formulario padre si lo necesitas
  onCountryChange?: (dialCode: string) => void;
  onCountrySelect?: (country: CountryData) => void;
  countriesRegistry?: CountryData[];
  isLoading?: boolean;
}

const defaultPeru: CountryData = { id: 'default', iso: 'PE', name: 'Perú', dialCode: '+51', maxLength: 9, tax_id_label: 'RUC', tax_id_regex: '^[0-9]{11}$', tax_id_placeholder: '10468060100' };

const PhoneInputGroup: React.FC<PhoneInputProps> = ({ value, onChange, onCountryChange, onCountrySelect, countriesRegistry = [], isLoading }) => {
  const countries = countriesRegistry.length > 0 ? countriesRegistry : [defaultPeru];
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(defaultPeru);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Fetch a BD (Integración SQL)
  useEffect(() => {
    if (countriesRegistry.length > 0) {
      const peru = countriesRegistry.find(c => c.iso === 'PE') || countriesRegistry[0];
      setSelectedCountry(peru); 
      if (onCountryChange) onCountryChange(peru.dialCode);
      if (onCountrySelect) onCountrySelect(peru);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countriesRegistry]);

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
    if (onCountrySelect) onCountrySelect(country);
    setError(''); 
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className={`flex items-center w-full bg-white rounded-full overflow-visible transition-all shadow-sm ${error ? 'ring-2 ring-red-400' : 'focus-within:ring-2 focus-within:ring-[#06CFD6]'}`}>
        
        <div 
          onClick={() => { if (!isLoading) setIsDropdownOpen(!isDropdownOpen); }}
          className={`shrink-0 flex items-center gap-1.5 md:gap-2 pl-4 md:pl-6 pr-2 md:pr-3 py-[0.6rem] border-r border-gray-200 bg-white rounded-l-full select-none ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer lg:hover:bg-gray-50'}`}
        >
          {isLoading ? (
            <span className="text-[18px] md:text-[20px] font-semibold text-gray-400">⏳</span>
          ) : (
            <img
              src={`https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w40/${selectedCountry.iso.toLowerCase()}.png 2x`}
              alt={selectedCountry.name}
              className="w-6 h-auto object-contain rounded-sm"
              title={selectedCountry.name}
            />
          )}
          <span className="text-[18px] md:text-[20px] font-semibold text-gray-600">{isLoading ? '...' : selectedCountry.dialCode}</span>
          <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <input
          type="tel"
          name="celular"
          placeholder={isLoading ? 'Despertando servidor...' : `Ej: ${'9'.repeat(selectedCountry.maxLength)}`}
          className="flex-1 bg-transparent px-4 py-[0.6rem] text-[#333] placeholder-gray-400 focus:outline-none text-[20px] rounded-r-full"
          required
          inputMode="numeric"
          pattern="\d*"
          maxLength={selectedCountry.maxLength}
          value={value}
          onChange={handleInputChange}
          disabled={isLoading}
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
                      ? 'bg-[#06CFD6]/15 text-[#0CA3C6] font-bold' 
                      : 'text-gray-600 lg:hover:bg-gray-200 lg:hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://flagcdn.com/w20/${country.iso.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png 2x`}
                      alt={country.name}
                      className="w-5 h-auto object-contain rounded-sm shadow-sm"
                    />
                    <span className="font-bold text-[0.9rem]">{country.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{country.dialCode}</span>
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
  options: ServiceOption[];
  isLoading?: boolean;
}

const ServiceDropdown: React.FC<ServiceDropdownProps> = ({ value, onChange, options, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || (isLoading ? '⏳ Cargando opciones...' : 'Seleccione su servicio');

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
      {/* Hidden input for native HTML5 validation */}
      <input 
        type="text" 
        value={value} 
        onChange={() => {}} 
        required 
        className="absolute opacity-0 w-full h-full -z-10 pointer-events-none" 
        tabIndex={-1} 
        aria-hidden="true" 
      />
      <div 
        onClick={() => { if (!isLoading) setIsOpen(!isOpen); }}
        className={`flex items-center justify-between w-full bg-white rounded-full px-6 py-[0.6rem] shadow-sm transition-all ${isOpen ? 'ring-2 ring-[#06CFD6]' : ''} ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
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
                      : 'text-gray-600 lg:hover:bg-gray-200 lg:hover:text-gray-900'
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

interface DocumentTypeDropdownProps {
  value: string;
  selectedCountryId: string;
  documentsRegistry: DocumentTypeData[];
  onChange: (docType: DocumentTypeData) => void;
  isLoading?: boolean;
}

const DocumentTypeDropdown: React.FC<DocumentTypeDropdownProps> = ({ value, selectedCountryId, documentsRegistry, onChange, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar dinámicamente con soporte dual camelCase/snake_case:
  const filteredOptions = documentsRegistry.filter((dt: any) => {
    if (dt.isCompanyDocument) return false;

    // 1. Extraer el ID del país soportando ambas nomenclaturas de respuesta
    const dbCountryId = dt.countryId !== undefined ? dt.countryId : dt.country_id;

    // 2. Si es un documento universal (ej. Pasaporte) donde country_id es null, se muestra siempre
    if (dbCountryId === null || dbCountryId === undefined) {
      // Permitimos PASAPORTE u otros documentos marcados como nulos en BD
      return true; 
    }

    // 3. Normalizar strings de comparación para evitar fallos de mayúsculas o espacios
    const normalizedDocCountryId = String(dbCountryId).trim().toLowerCase();
    const normalizedSelectedCountryId = String(selectedCountryId).trim().toLowerCase();

    return normalizedDocCountryId === normalizedSelectedCountryId;
  });

  useEffect(() => {
    // No-op cleanup or side effect if needed
  }, [selectedCountryId, filteredOptions.length, documentsRegistry.length]);

  const selectedDoc = filteredOptions.find((opt: any) => (opt.code || opt.value) === value) as any;
  const selectedLabel = (selectedDoc?.name || selectedDoc?.label) || (isLoading ? '⏳ Cargando documentos...' : 'Seleccione tipo...');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (doc: any) => {
    onChange(doc);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Hidden input for native HTML5 validation */}
      <input 
        type="text" 
        value={value} 
        onChange={() => {}} 
        required 
        className="absolute opacity-0 w-full h-full -z-10 pointer-events-none" 
        tabIndex={-1} 
        aria-hidden="true" 
      />
      <div 
        onClick={() => { if (!isLoading) setIsOpen(!isOpen); }}
        className={`flex items-center justify-between w-full bg-white rounded-full px-6 py-[0.6rem] shadow-sm transition-all ${isOpen ? 'ring-2 ring-[#06CFD6]' : ''} ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
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
              {filteredOptions.length > 0 ? (
                filteredOptions.map((doc: any) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelect(doc)}
                    className={`px-6 py-3 cursor-pointer transition-colors ${
                      value === (doc.code || doc.value) 
                        ? 'bg-[#06CFD6]/15 text-[#06CFD6] font-bold' 
                        : 'text-gray-600 lg:hover:bg-gray-200 lg:hover:text-gray-900'
                    }`}
                  >
                    <span className="text-[20px]">{doc.name || doc.label}</span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-3 text-gray-400 text-[18px] italic">
                  Cargando documentos...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Contacto: React.FC = () => {
  const navigate = useNavigate();
  const [personType, setPersonType] = useState<'individual' | 'company'>('company');
  const [formData, setFormData] = useState({
    countryId: '',
    nombre: '',
    apellido: '',
    cargo: '',
    email: '',
    celular: '',
    empresa: '',
    ruc: '',
    documentType: '',
    documentNumber: '',
    servicio: '',
    mensaje: '',
  });
  
  const [selectedCountryData, setSelectedCountryData] = useState<CountryData>(defaultPeru);
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [allDocumentTypes, setAllDocumentTypes] = useState<DocumentTypeData[]>([]);
  const [allServices, setAllServices] = useState<ServiceOption[]>([]);
  const [selectedDocData, setSelectedDocData] = useState<DocumentTypeData | null>(null);
  const [taxIdError, setTaxIdError] = useState('');

  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  // 1. Fetch de Catálogos al montar el componente
  useEffect(() => {
    const loadCatalogs = async () => {
      setIsLoadingCatalogs(true);
      try {
        const [countriesData, docTypesData, servicesData] = await Promise.all([
          fetchCountries(),
          fetchDocumentTypes(),
          fetchServices(),
        ]);
        setAllCountries(countriesData);
        setAllDocumentTypes(docTypesData);
        
        const filteredServices = servicesData.filter(s => s.code !== 'custom_software');
        setAllServices(filteredServices.map(s => ({ value: s.code, label: s.name })));
      } catch (error) {
        console.error('Error fetching catalogs:', error);
      } finally {
        setIsLoadingCatalogs(false);
      }
    };
    loadCatalogs();
  }, []);

  // Agregamos el estado de éxito a nuestra lógica
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTextOnlyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: stripDigits(e.target.value) });
  };

  const handleAlphanumericChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: stripSymbols(e.target.value) });
  };

  const handleSmartValidation = (value: string, trigger: 'change' | 'blur', targetElement: HTMLInputElement) => {
    if (!value) {
      setTaxIdError('');
      targetElement.setCustomValidity('');
      return;
    }

    const isCompany = personType === 'company';
    const pattern = isCompany 
      ? (selectedCountryData?.tax_id_regex || '^[\\w-]{4,40}$') 
      : (selectedDocData?.validationRegex || '^[\\w-]{4,40}$');
    
    // Detect the hard limit from the HTML element or fallback
    const limit = targetElement.maxLength > 0 ? targetElement.maxLength : 40;
    const regex = new RegExp(pattern, 'i');
    const isValid = regex.test(value);

    if (isValid) {
      setTaxIdError('');
      targetElement.setCustomValidity('');
    } else {
      // Core UX Logic: Only yell if they leave the input OR if they hit the character limit
      if (trigger === 'blur' || value.length >= limit) {
        const errorMsg = isCompany ? 'Formato de identificación corporativa inválido' : `Formato de ${selectedDocData?.name || 'documento'} inválido`;
        setTaxIdError(errorMsg);
        targetElement.setCustomValidity(errorMsg);
      } else {
        // Silent typing phase
        setTaxIdError('');
        targetElement.setCustomValidity('');
      }
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim().toUpperCase();

    // Update state first
    if (personType === 'individual') {
      setFormData({ ...formData, documentNumber: inputValue });
    } else {
      setFormData({ ...formData, ruc: inputValue, documentNumber: inputValue });
    }

    // Call smart validation
    handleSmartValidation(inputValue, 'change', e.target);
  };

  const handleDocumentBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleSmartValidation(e.target.value, 'blur', e.target);
  };

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountryData(country);
    setSelectedDocData(null); // Purge legacy validation state
    setFormData((current) => ({
      ...current,
      countryId: country.id === 'default' ? '' : country.id,
      celular: '',
      ruc: '',
      documentType: '',
      documentNumber: '',
    }));
    setTaxIdError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setSubmitError('');

    try {
      await createContactSubmission({ ...formData, personType });
      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        navigate('/confirmacion?source=contacto');
      }, 1200);
    } catch (error) {
      setIsLoading(false);
      setSubmitError(error instanceof Error ? error.message : 'No se pudo enviar el formulario.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sansation select-none">
      <SEO 
        title="Contacto" 
        description="Ponte en contacto con Bytecode para iniciar tu proyecto de transformación digital hoy mismo."
      />
      
      {/* Fondo espacio */}
      <div className="fixed inset-0" style={{ backgroundColor: '#040e1f' }}>
        <LazyGalaxyBackground /> 
        <div className="absolute inset-0" style={{ background: 'rgba(4,14,31,0.30)' }} />
        <div className="absolute inset-0 bg-[#040e1f]/70" />

        <div
          className="absolute inset-0 opacity-70 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}vectors/designs/stardust.png)` }}
        />
        <div
          className="absolute inset-0 opacity-50 rotate-180 mix-blend-screen"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}vectors/designs/stardust.png)` }}
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
          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setPersonType('company')}
              className={`px-6 py-2 rounded-full font-bold transition-all border ${personType === 'company' ? 'bg-[#06CFD6] text-[#040e1f] border-[#06CFD6]' : 'bg-transparent text-white border-white/30 hover:border-[#06CFD6]'}`}
            >
              Empresa
            </button>
            <button
              type="button"
              onClick={() => setPersonType('individual')}
              className={`px-6 py-2 rounded-full font-bold transition-all border ${personType === 'individual' ? 'bg-[#06CFD6] text-[#040e1f] border-[#06CFD6]' : 'bg-transparent text-white border-white/30 hover:border-[#06CFD6]'}`}
            >
              Independiente
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label text="Nombre" />
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                className={solidInput}
                required
                minLength={2}
                maxLength={120}
                value={formData.nombre}
                onChange={handleTextOnlyChange}
              />
            </div>

            <div>
              <Label text="Apellido" />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                className={solidInput}
                required
                minLength={2}
                maxLength={120}
                value={formData.apellido}
                onChange={handleTextOnlyChange}
              />
            </div>
          </div>

          {personType === 'company' && (
            <div>
              <Label text="Cargo" />
              <input
                type="text"
                name="cargo"
                placeholder="Cargo"
                className={solidInput}
                required={personType === 'company'}
                minLength={2}
                maxLength={160}
                value={formData.cargo}
                onChange={handleTextOnlyChange}
              />
            </div>
          )}

          <div>
            <Label text="Email" />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              className={solidInput}
              required
              minLength={2}
              maxLength={160}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <Label text="Número de celular" />
            <PhoneInputGroup 
              value={formData.celular} 
              onChange={handleChange}
              onCountrySelect={handleCountrySelect}
              countriesRegistry={allCountries}
              isLoading={isLoadingCatalogs}
            />
          </div>

          {personType === 'company' ? (
            <>
              <div>
                <Label text="Empresa" />
                <input
                  type="text"
                  name="empresa"
                  placeholder="Empresa"
                  className={solidInput}
                  required={personType === 'company'}
                  minLength={2}
                  maxLength={160}
                  value={formData.empresa}
                  onChange={handleAlphanumericChange}
                />
              </div>

              <div className="relative mb-2">
                <Label text={selectedCountryData?.tax_id_label || 'Identificación Fiscal'} />
                <input
                  type="text"
                  name="ruc"
                  placeholder={selectedCountryData?.tax_id_placeholder ? `${selectedCountryData.tax_id_placeholder}` : 'Ingrese su documento'}
                  className={`${solidInput} ${taxIdError ? 'ring-2 ring-red-400 focus:ring-red-400' : ''}`}
                  required={personType === 'company'}
                  maxLength={selectedCountryData?.tax_id_max_length || 40}
                  value={formData.ruc}
                  onChange={handleDocumentChange}
                  onBlur={handleDocumentBlur}
                />
                {taxIdError && (
                  <span className="absolute -bottom-5 left-4 text-xs font-bold text-red-400">
                    {taxIdError}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label text="Tipo de Doc." />
                <DocumentTypeDropdown
                  value={formData.documentType}
                  selectedCountryId={selectedCountryData.id}
                  documentsRegistry={allDocumentTypes}
                  onChange={(doc) => {
                    setFormData({ ...formData, documentType: doc.code, documentNumber: '' });
                    setSelectedDocData(doc);
                    setTaxIdError('');
                  }}
                  isLoading={isLoadingCatalogs}
                />
              </div>
              <div className="relative">
                <Label text="Nro de documento" />
                <input
                  type="text"
                  name="documentNumber"
                  placeholder={selectedDocData?.placeholder || 'Ingrese su documento'}
                  className={`${solidInput} ${taxIdError ? 'ring-2 ring-red-400 focus:ring-red-400' : ''}`}
                  required={personType === 'individual'}
                  maxLength={selectedDocData?.maxLength || 40}
                  value={formData.documentNumber}
                  onChange={handleDocumentChange}
                  onBlur={handleDocumentBlur}
                />
                {taxIdError && (
                  <span className="absolute -bottom-5 left-4 text-xs font-bold text-red-400">
                    {taxIdError}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mb-2">
            <Label text="Servicio que requiere" />
            <ServiceDropdown 
              value={formData.servicio}
              onChange={(newValue) => setFormData({ ...formData, servicio: newValue })}
              options={allServices}
              isLoading={isLoadingCatalogs}
            />
          </div>

          <div>
            <Label text="Mensaje" />
            <textarea
              name="mensaje"
              placeholder="Cuéntanos brevemente qué necesitas"
              className={solidTextarea}
              required
              minLength={10}
              maxLength={1200}
              value={formData.mensaje}
              onChange={handleChange}
            />
          </div>

          <div className="pt-6">
            {submitError && (
              <p className="mb-4 rounded-2xl bg-red-500/15 px-5 py-3 text-center text-red-100">
                {submitError}
              </p>
            )}
            <AnimatedSubmitButton
              type="submit"
              isLoading={isLoading}
              isSuccess={isSuccess}
              text={isLoadingCatalogs ? "Conectando..." : "Conectar"}
              loadingText="Enviando..."
              successText="¡Conectado!"
              disabled={isLoadingCatalogs}
              className={`w-full text-white py-2 rounded-3xl text-[30px] font-bold shadow-[0_0_20px_rgba(6,207,214,0.3)] disabled:opacity-90 ${isSuccess ? 'bg-[#0CA3C6] shadow-[0_0_30px_rgba(12,163,198,0.6)]' : 'bg-[#06CFD6] lg:hover:shadow-[0_0_30px_rgba(6,207,214,0.6)] lg:disabled:hover:shadow-[0_0_20px_rgba(6,207,214,0.3)]'}`}
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
