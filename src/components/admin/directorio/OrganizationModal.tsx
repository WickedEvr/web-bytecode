import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import AnimatedSubmitButton from '../../ui/AnimatedSubmitButton';
import { apiRequest } from '../../../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingId?: string | null;
  initialData?: any;
}

export default function OrganizationModal({ isOpen, onClose, onSuccess, editingId, initialData }: Props) {
  const [formData, setFormData] = useState({
    legal_name: '',
    trade_name: '',
    ruc: '',
    industry: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingId && initialData) {
        setFormData({
          legal_name: initialData.legal_name || '',
          trade_name: initialData.trade_name || '',
          ruc: initialData.ruc || '',
          industry: initialData.industry || '',
        });
      } else {
        setFormData({ legal_name: '', trade_name: '', ruc: '', industry: '' });
      }
      setError(null);
    }
  }, [isOpen, editingId, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingId) {
        await apiRequest(`/admin/organizations/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest('/admin/organizations', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl custom-scrollbar md:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-lg font-semibold text-white/90">
            {editingId ? 'Editar Empresa' : 'Nueva Empresa'}
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
            <div className="md:col-span-2">
              <Label text="Razón Social (Legal)" required />
              <Input
                name="legal_name"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                required
                placeholder="Ej. TechCorp S.A.C."
              />
            </div>
            
            <div className="md:col-span-2">
              <Label text="Nombre Comercial (Opcional)" />
              <Input
                name="trade_name"
                value={formData.trade_name}
                onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                placeholder="Ej. TechCorp"
              />
            </div>

            <div>
              <Label text="RUC / Tax ID" />
              <Input
                name="ruc"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                placeholder="Ej. 20123456789"
              />
            </div>

            <div>
              <Label text="Industria / Sector" />
              <Input
                name="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Ej. Desarrollo de Software"
              />
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
              text="Guardar Empresa"
              loadingText="Guardando..."
              className="rounded-lg border border-[#06CFD6]/30 bg-[#06CFD6]/10 px-6 py-2 text-sm font-medium text-[#06CFD6] transition-colors hover:bg-[#06CFD6]/20 disabled:opacity-50"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
