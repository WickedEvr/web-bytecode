import React, { useEffect, useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type SettingItem = {
  setting_key: string;
  setting_value: any;
  description: string;
  is_sensitive: boolean;
};

const defaultSettings = {
  contact_info: { email: '', phone: '', address: '' },
  smtp_config: { host: '', port: '', user: '', pass: '' },
  features: { enable_chat: false, enable_quotes: true },
};

const AdminConfiguracion: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [contactInfo, setContactInfo] = useState(defaultSettings.contact_info);
  const [smtpConfig, setSmtpConfig] = useState(defaultSettings.smtp_config);
  const [features, setFeatures] = useState(defaultSettings.features);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await apiRequest<{ items: SettingItem[] }>('/api/admin/settings');

      // Populate local state
      res.items.forEach(item => {
        if (item.setting_key === 'contact_info') setContactInfo({ ...defaultSettings.contact_info, ...item.setting_value });
        if (item.setting_key === 'smtp_config') setSmtpConfig({ ...defaultSettings.smtp_config, ...item.setting_value });
        if (item.setting_key === 'features') setFeatures({ ...defaultSettings.features, ...item.setting_value });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await apiRequest('/api/admin/settings', {
        method: 'PATCH',
        json: {
          settings: [
            { setting_key: 'contact_info', setting_value: contactInfo, description: 'Información de contacto pública', is_sensitive: false },
            { setting_key: 'smtp_config', setting_value: smtpConfig, description: 'Configuración de servidor SMTP', is_sensitive: true },
            { setting_key: 'features', setting_value: features, description: 'Activación de módulos', is_sensitive: false },
          ]
        }
      });
      setSuccess(true);
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-[#06CFD6]" />
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-white/60 text-sm">Gestión de variables dinámicas del sistema</p>
          </div>
        </div>
        <button onClick={loadSettings} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}
      {success && <p className="rounded-xl bg-green-500/15 px-4 py-3 text-green-200">Configuración guardada correctamente.</p>}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-white/70">Correo Electrónico</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-white/70">Teléfono</label>
              <input
                type="text"
                value={contactInfo.phone}
                onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-white/70">Dirección Física</label>
              <input
                type="text"
                value={contactInfo.address}
                onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
              />
            </div>
          </div>
        </div>

        {/* Features Toggle */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-bold mb-4">Módulos del Sistema</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={features.enable_chat}
                onChange={e => setFeatures({ ...features, enable_chat: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-[#06CFD6] focus:ring-[#06CFD6]"
              />
              <div>
                <span className="block text-sm font-bold text-white">Chat en vivo</span>
                <span className="text-xs text-white/50">Habilitar el widget de atención al cliente</span>
              </div>
            </label>
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={features.enable_quotes}
                onChange={e => setFeatures({ ...features, enable_quotes: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-[#06CFD6] focus:ring-[#06CFD6]"
              />
              <div>
                <span className="block text-sm font-bold text-white">Cotizador Público</span>
                <span className="text-xs text-white/50">Permitir a los usuarios generar cotizaciones automáticas</span>
              </div>
            </label>
          </div>
        </div>

        {/* SMTP Config */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Servidor de Correos (SMTP)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-white/70">Servidor (Host)</label>
              <input
                type="text"
                value={smtpConfig.host}
                onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-white/70">Puerto</label>
              <input
                type="text"
                value={smtpConfig.port}
                onChange={e => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-white/70">Usuario (Correo)</label>
              <input
                type="text"
                value={smtpConfig.user}
                onChange={e => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-white/70">Contraseña</label>
              <input
                type="password"
                placeholder="********"
                value={smtpConfig.pass}
                onChange={e => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
              />
              <p className="mt-1 text-xs text-white/40">Déjalo en blanco (u ocúltalo como ********) si no deseas cambiarlo.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-[#06CFD6] px-8 py-3 font-bold text-white transition hover:bg-[#0CA3C6] disabled:opacity-50">
            <Save className="h-5 w-5" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminConfiguracion;
