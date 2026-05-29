import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/shared/SEO';
import LazyGalaxyBackground from '../components/effects/LazyGalaxyBackground';
import ContactFooter from '../components/layout/ContactFooter';
import CustomDropdown, { type DropdownOption } from '../components/ui/CustomDropdown';
import AnimatedSubmitButton from '../components/ui/AnimatedSubmitButton';
import PhoneInputGroup from '../components/ui/PhoneInputGroup';
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
  
  const [selectedCountryData, setSelectedCountryData] = useState<CountryData>({ id: 'default', iso: 'PE', name: 'Perú', dialCode: '+51', maxLength: 9 });
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [allDocumentTypes, setAllDocumentTypes] = useState<DocumentTypeData[]>([]);
  const [allServices, setAllServices] = useState<DropdownOption[]>([]);
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

  const activeCompanyDoc = allDocumentTypes.find(
    (dt) => dt.countryId === selectedCountryData?.id && dt.isCompanyDocument === true
  );

  const handleSmartValidation = (value: string, trigger: 'change' | 'blur', targetElement: HTMLInputElement, currentPersonType: 'individual' | 'company' = personType) => {
    if (!value) {
      setTaxIdError('');
      targetElement.setCustomValidity('');
      return;
    }

    const isCompany = currentPersonType === 'company';
    const activeDocDefinition = isCompany ? activeCompanyDoc : selectedDocData;

    const pattern = activeDocDefinition?.validationRegex || '^[\\w-]{4,40}$';
    const limit = activeDocDefinition?.maxLength || 40;

    const regex = new RegExp(pattern, 'i');
    const isValid = regex.test(value);

    if (isValid) {
      setTaxIdError('');
      targetElement.setCustomValidity('');
    } else {
      if (trigger === 'blur' || value.length >= limit) {
        const errorMsg = `Formato de ${activeDocDefinition?.name || 'documento'} inválido`;
        setTaxIdError(errorMsg);
        targetElement.setCustomValidity(errorMsg);
      } else {
        setTaxIdError('');
        targetElement.setCustomValidity('');
      }
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim().toUpperCase();

    if (personType === 'individual') {
      setFormData({ ...formData, documentNumber: inputValue });
    } else {
      setFormData({ ...formData, ruc: inputValue, documentNumber: inputValue });
    }

    handleSmartValidation(inputValue, 'change', e.target, personType);
  };

  const handleDocumentBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleSmartValidation(e.target.value, 'blur', e.target, personType);
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

  const filteredDocs = React.useMemo(() => {
    return allDocumentTypes.filter((dt: any) => {
      if (dt.isCompanyDocument) return false;
      const dbCountryId = dt.countryId !== undefined ? dt.countryId : dt.country_id;
      if (dbCountryId === null || dbCountryId === undefined) return true;
      return String(dbCountryId).trim().toLowerCase() === String(selectedCountryData.id).trim().toLowerCase();
    });
  }, [allDocumentTypes, selectedCountryData]);

  const docDropdownOptions = React.useMemo(() => {
    return filteredDocs.map((doc: any) => ({
      value: doc.code || doc.value,
      label: doc.name || doc.label
    }));
  }, [filteredDocs]);

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
                <Label text={activeCompanyDoc?.name || 'Identificación Corporativa'} />
                <input
                  type="text"
                  name="ruc"
                  placeholder={activeCompanyDoc?.placeholder || 'Ingrese su identificación fiscal'}
                  className={`${solidInput} ${taxIdError ? 'ring-2 ring-red-400 focus:ring-red-400' : ''}`}
                  required={personType === 'company'}
                  maxLength={activeCompanyDoc?.maxLength || 40}
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
                <CustomDropdown variant="public" value={formData.documentType} placeholder={isLoadingCatalogs ? '⏳ Cargando documentos...' : 'Seleccione tipo...'} options={docDropdownOptions} onChange={(val) => { const doc = filteredDocs.find((d: any) => (d.code || d.value) === val); if (doc) { setFormData({ ...formData, documentType: doc.code, documentNumber: '' }); setSelectedDocData(doc); setTaxIdError(''); } }} />
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
            <CustomDropdown variant="public" value={formData.servicio} placeholder={isLoadingCatalogs ? '⏳ Cargando opciones...' : 'Seleccione su servicio'} options={allServices} onChange={(newValue) => setFormData({ ...formData, servicio: newValue })} />
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
