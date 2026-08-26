import { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Users, Building2, Search, Plus } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';

export default function DirectorioAdmin() {
  const [activeTab, setActiveTab] = useState<'empresas' | 'personas'>('empresas');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgsRes, custRes] = await Promise.all([
        apiRequest<{ items: any[] }>('/admin/organizations'),
        apiRequest<{ items: any[] }>('/admin/customers')
      ]);
      setOrganizations(orgsRes.items || []);
      setCustomers(custRes.items || []);
    } catch (err: any) {
      addToast(err.message || 'Error cargando directorio', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Directorio CRM</h2>
          <p className="text-slate-500 text-sm mt-1">Gestión centralizada de Empresas B2B y Contactos B2C</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-100/50 p-1">
        <button
          onClick={() => setActiveTab('empresas')}
          className={`flex-1 flex items-center justify-center space-x-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === 'empresas' 
              ? 'bg-white text-indigo-700 shadow' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Building2 size={18} />
          <span>Empresas ({organizations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('personas')}
          className={`flex-1 flex items-center justify-center space-x-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === 'personas' 
              ? 'bg-white text-indigo-700 shadow' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Users size={18} />
          <span>Personas ({customers.length})</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'empresas' ? "Buscar empresa por nombre o RUC..." : "Buscar persona por nombre, DNI o email..."}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
            <span>{activeTab === 'empresas' ? 'Nueva Empresa' : 'Nuevo Contacto'}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando directorio...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'empresas' ? (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <tr>
                    <th className="px-6 py-4">Razón Social / Nombre Comercial</th>
                    <th className="px-6 py-4">RUC</th>
                    <th className="px-6 py-4">Industria</th>
                    <th className="px-6 py-4">Contactos Enlazados</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organizations.map(org => (
                    <tr key={org.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{org.legal_name}</div>
                        {org.trade_name && org.trade_name !== org.legal_name && (
                          <div className="text-xs text-slate-500 mt-1">{org.trade_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">{org.ruc}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {org.industry || 'No especificada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Users size={14} className="text-slate-400" />
                          <span>{org.contacts_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Editar</button>
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No hay empresas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                  <tr>
                    <th className="px-6 py-4">Nombre y Correo</th>
                    <th className="px-6 py-4">Perfil</th>
                    <th className="px-6 py-4">Empresa (B2B)</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{cust.display_name}</div>
                        <div className="text-xs text-slate-500 mt-1">{cust.primary_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cust.person_type === 'company_contact' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {cust.person_type === 'company_contact' ? 'Corporativo' : 'Natural'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {cust.organizations?.map((org: any) => (
                          <div key={org.id} className="text-xs">
                            <span className="font-medium text-slate-700">{org.name}</span>
                            <span className="text-slate-400 ml-1">({org.position || 'Sin cargo'})</span>
                          </div>
                        ))}
                        {(!cust.organizations || cust.organizations.length === 0) && (
                          <span className="text-xs text-slate-400 italic">Independiente</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Editar</button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No hay personas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
