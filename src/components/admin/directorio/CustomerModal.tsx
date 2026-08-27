import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CustomDropdown from '../../ui/CustomDropdown';
import AnimatedSubmitButton from '../../ui/AnimatedSubmitButton';
import { apiRequest } from '../../../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingId?: string | null;
  initialData?: any;
  countries: any[];
  documentTypes: any[];
  organizations: any[];
}

export default function CustomerModal({ isOpen, onClose, onSuccess, editingId, initialData, countries, documentTypes, organizations }: Props) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    primary_email: '',
    primary_phone: '',
    person_type: 'natural',
    country_id: '',
    document_type_id: '',
    document_number: '',
    organization_id: '',
    position_title: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingId && initialData) {
        const firstOrg = initialData.organizations?.[0];
        setFormData({
          first_name: initialData.first_name || '',
          last_name: initialData.last_name || '',
          primary_email: initialData.primary_email || '',
          primary_phone: initialData.primary_phone || '',
          person_type: initialData.person_type || 'natural',
          country_id: initialData.country_id || '', 
          document_type_id: initialData.document_type_id || '', 
          document_number: initialData.document_number || '',
          organization_id: firstOrg ? firstOrg.id : '',
          position_title: firstOrg ? firstOrg.position : '',
        });
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          primary_email: '',
          primary_phone: '',
          person_type: 'natural',
          country_id: '',
          document_type_id: '',
          document_number: '',
          organization_id: '',
          position_title: '',
        });
      }
      setError(null);
    }
  }, [isOpen, editingId, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        country_id: formData.country_id || null,
        document_type_id: formData.document_type_id || null,
        organization_id: formData.organization_id || null,
      };

      if (editingId) {
        await apiRequest(`/admin/customers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/admin/customers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar contacto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl custom-scrollbar md:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-lg font-semibold text-white/90">
            {editingId ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-white/40">Nombres *</span>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30"
              />
            </label>
            
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-white/40">Apellidos *</span>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30"
              />
            </label>

            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-xs uppercase tracking-wider text-white/40">Correo Electrónico *</span>
              <input
                type="email"
                name="primary_email"
                value={formData.primary_email}
                onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                required
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30"
              />
            </label>

            <div className="grid gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/40">País</span>
              <CustomDropdown
                value={formData.country_id}
                onChange={(val) => setFormData({ ...formData, country_id: val || '' })}
                placeholder="Seleccionar..."
                options={[
                  { value: '', label: 'Seleccionar...' },
                  ...countries.map(c => ({ 
                    value: c.id, 
                    label: c.name, 
                    icon: c.iso2 ? <img src={`https://flagcdn.com/w20/${c.iso2.toLowerCase()}.png`} alt="" className="w-5 h-auto object-contain rounded-sm" /> : undefined 
                  }))
                ]}
              />
            </div>
            
            <label className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-white/40">Teléfono Primario</span>
              <input
                name="primary_phone"
                value={formData.primary_phone}
                onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
                placeholder="+51 987654321"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30"
              />
            </label>

            <div className="grid gap-1.5">
              <span className="text-xs uppercase tracking-wider text-white/40">Tipo de Contacto</span>
              <CustomDropdown
                value={formData.person_type}
                onChange={(val) => setFormData({ ...formData, person_type: val || 'natural' })}
                placeholder="Seleccionar tipo"
                options={[
                  { value: 'natural', label: 'Persona Natural (B2C)' },
                  { value: 'company_contact', label: 'Contacto Corporativo (B2B)' }
                ]}
              />
            </div>

            {formData.person_type === 'company_contact' && (
              <>
                <div className="grid gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-white/40">Empresa (B2B)</span>
                  <CustomDropdown
                    value={formData.organization_id}
                    onChange={(val) => setFormData({ ...formData, organization_id: val || '' })}
                    placeholder="Seleccionar Empresa"
                    options={[
                      { value: '', label: 'Sin Empresa' },
                      ...organizations.map(o => ({ value: o.id, label: o.legal_name }))
                    ]}
                  />
                </div>
                <label className="grid gap-1.5 md:col-span-2">
                  <span className="text-xs uppercase tracking-wider text-white/40">Cargo</span>
                  <input
                    name="position_title"
                    value={formData.position_title}
                    onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                    placeholder="Ej. Gerente Comercial"
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30"
                  />
                </label>
              </>
            )}

            <div className="md:col-span-2 grid gap-5 md:grid-cols-2 p-4 border border-white/5 rounded-xl bg-white/[0.01]">
              <div className="grid gap-1.5">
                <span className="text-xs uppercase tracking-wider text-white/40">Tipo de Documento</span>
                <CustomDropdown
                  value={formData.document_type_id}
                  onChange={(val) => setFormData({ ...formData, document_type_id: val || '' })}
                  placeholder="Ej. DNI"
                  options={[
                    { value: '', label: 'Seleccionar...' },
                    ...documentTypes.map(d => ({ value: d.id, label: d.name }))
                  ]}
                />
              </div>
              <label className="grid gap-1.5">
                <span className="text-xs uppercase tracking-wider text-white/40">Número de Documento</span>
                <input
                  name="document_number"
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </button>
            <AnimatedSubmitButton
              type="submit"
              isLoading={isLoading}
              text="Guardar Contacto"
              loadingText="Guardando..."
              className="rounded-lg border border-[#06CFD6]/30 bg-[#06CFD6]/10 px-6 py-2 text-sm font-medium text-[#06CFD6] transition-colors hover:bg-[#06CFD6]/20 disabled:opacity-50"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
