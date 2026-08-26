import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Users, Building2, Search, Plus, MoreVertical, RefreshCw } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';
import AdminPanel from '../../components/admin/AdminPanel';
import PaginationControl from '../../components/ui/PaginationControl';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 9;

export default function DirectorioAdmin() {
  const [activeTab, setActiveTab] = useState<'empresas' | 'personas'>('empresas');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const addToast = useToastStore((state) => state.addToast);
  const [actionsMenu, setActionsMenu] = useState<{ id: string, top: number, left: number, placement: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [page, activeTab]);

  useEffect(() => {
    const handleGlobalClick = () => setActionsMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setActionsMenu(null);
    try {
      if (activeTab === 'empresas') {
        const res = await apiRequest<{ items: any[], total: number }>(`/admin/organizations?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`);
        if (res.items.length === 0 && res.total > 0 && page > 1) { setPage(page - 1); return; }
        setOrganizations(res.items || []);
        setTotal(res.total || 0);
      } else {
        const res = await apiRequest<{ items: any[], total: number }>(`/admin/customers?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`);
        if (res.items.length === 0 && res.total > 0 && page > 1) { setPage(page - 1); return; }
        setCustomers(res.items || []);
        setTotal(res.total || 0);
      }
    } catch (err: any) {
      addToast(err.message || 'Error cargando directorio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'empresas' | 'personas') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleOpenActions = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (actionsMenu?.id === id) {
      setActionsMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement = spaceBelow < 150 ? 'top' : 'bottom';
    setActionsMenu({
      id,
      top: placement === 'bottom' ? rect.bottom + window.scrollY : rect.top + window.scrollY - 100,
      left: rect.left + window.scrollX - 120,
      placement,
    });
  };

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white/90">Directorio CRM</h1>
          <p className="text-white/40 text-sm mt-1">Gestión centralizada de Empresas B2B y Contactos B2C</p>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={fetchData} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-white/5 p-1 w-fit border border-white/10">
        <button
          onClick={() => handleTabChange('empresas')}
          className={`flex items-center justify-center space-x-2 rounded-lg py-2 px-6 text-sm font-medium transition-all ${
            activeTab === 'empresas' 
              ? 'bg-white text-black shadow' 
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <Building2 size={16} />
          <span>Empresas</span>
        </button>
        <button
          onClick={() => handleTabChange('personas')}
          className={`flex items-center justify-center space-x-2 rounded-lg py-2 px-6 text-sm font-medium transition-all ${
            activeTab === 'personas' 
              ? 'bg-white text-black shadow' 
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users size={16} />
          <span>Personas</span>
        </button>
      </div>

      <AdminPanel className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder={activeTab === 'empresas' ? "Buscar empresa..." : "Buscar persona..."}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
            <Plus size={16} />
            <span>{activeTab === 'empresas' ? 'Nueva Empresa' : 'Nuevo Contacto'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'empresas' ? (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Razón Social / Comercial</th>
                  <th className="px-6 py-4 font-medium">RUC</th>
                  <th className="px-6 py-4 font-medium">Industria</th>
                  <th className="px-6 py-4 text-center font-medium">Contactos</th>
                  <th className="px-6 py-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-white/30 text-sm">Cargando empresas...</td></tr>
                ) : organizations.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-white/30 text-sm">No hay empresas registradas.</td></tr>
                ) : (
                  organizations.map(org => (
                    <tr key={org.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{org.legal_name}</div>
                        {org.trade_name && org.trade_name !== org.legal_name && (
                          <div className="text-xs text-white/40 mt-1">{org.trade_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-white/50 text-xs">{org.ruc}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-white/5 border-white/10 text-white/70">
                          {org.industry || 'No especificada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-1 text-white/50">
                          <Users size={12} />
                          <span className="text-xs">{org.contacts_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={(e) => handleOpenActions(e, org.id)} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Nombre y Correo</th>
                  <th className="px-6 py-4 font-medium">Documento</th>
                  <th className="px-6 py-4 font-medium">País</th>
                  <th className="px-6 py-4 font-medium">Teléfono</th>
                  <th className="px-6 py-4 font-medium">Empresa (B2B)</th>
                  <th className="px-6 py-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">Cargando personas...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">No hay personas registradas.</td></tr>
                ) : (
                  customers.map(cust => (
                    <tr key={cust.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{cust.display_name}</div>
                        <div className="text-xs text-white/50 mt-1">{cust.primary_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {cust.document_number ? (
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-mono">{cust.document_number}</span>
                            <span className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{cust.document_type_name || 'DOC'}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30 italic">Sin documento</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {cust.country_iso ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/w20/${cust.country_iso.toLowerCase()}.png`}
                              srcSet={`https://flagcdn.com/w40/${cust.country_iso.toLowerCase()}.png 2x`}
                              alt={cust.country_name || cust.country_iso}
                              className="w-5 h-auto object-contain rounded-sm shadow-sm"
                              title={cust.country_name}
                            />
                            <span className="text-white/80 text-xs font-medium">{cust.country_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-xs font-mono">{cust.primary_phone || '-'}</td>
                      <td className="px-6 py-4">
                        {cust.organizations && cust.organizations.length > 0 ? (
                          <div className="flex items-center space-x-1.5 text-white/70">
                            <Building2 size={12} className="text-white/40" />
                            <span className="text-xs truncate max-w-[200px]" title={cust.organizations[0].name}>{cust.organizations[0].name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-white/30 italic">No asociado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={(e) => handleOpenActions(e, cust.id)} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <PaginationControl currentPage={page} totalItems={total} itemsPerPage={PAGE_SIZE} onPageChange={setPage} disabled={loading} />
      </AdminPanel>

      <AnimatePresence>
        {actionsMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: actionsMenu.placement === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: actionsMenu.placement === 'top' ? 10 : -10 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: actionsMenu.top, left: actionsMenu.left }}
            onClick={(e) => e.stopPropagation()}
            className="w-36 bg-[#121212] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="py-1 px-1 flex flex-col gap-1">
              <button
                onClick={() => {
                  addToast('Función editar en construcción', 'info');
                  setActionsMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  addToast('Función eliminar en construcción', 'info');
                  setActionsMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
