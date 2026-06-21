import React, { useEffect, useState } from 'react';
import { FolderKanban, RefreshCw } from 'lucide-react';
import AdminPanel from '../../components/admin/AdminPanel';
import StatusHistoryTimeline from '../../components/admin/StatusHistoryTimeline';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { apiRequest } from '../../lib/api';
import type { StatusCatalogItem, StatusHistoryRecord } from '../../types/status';

export interface Project {
  id: string;
  project_code: string;
  name: string;
  description?: string | null;
  status: string;
  status_name?: string;
  first_name: string;
  last_name?: string | null;
  primary_email: string;
  service_name: string;
  created_at: string;
}

const Proyectos: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<StatusCatalogItem[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [history, setHistory] = useState<StatusHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsResult, statusesResult] = await Promise.all([
        apiRequest<{ items: Project[] }>('/api/admin/projects'),
        apiRequest<{ items: StatusCatalogItem[] }>('/api/catalog/statuses?domain=project'),
      ]);
      setProjects(projectsResult.items);
      setStatuses(statusesResult.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const selectProject = async (project: Project) => {
    setSelected(project);
    setSelectedStatus(project.status);
    try {
      const result = await apiRequest<{ items: StatusHistoryRecord[] }>(`/api/admin/projects/${project.id}/history`);
      setHistory(result.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el historial.');
    }
  };

  const saveStatus = async () => {
    if (!selected) return;
    try {
      await apiRequest(`/api/admin/projects/${selected.id}/status`, {
        method: 'PATCH',
        json: { status: selectedStatus },
      });
      await loadData();
      await selectProject({ ...selected, status: selectedStatus, status_name: statuses.find((item) => item.code === selectedStatus)?.name });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo actualizar el estado.');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3"><FolderKanban className="h-6 w-6 text-white/50" /><h1 className="text-2xl font-semibold text-white/90">Proyectos</h1></div>
        <button type="button" onClick={() => void loadData()} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"><RefreshCw className="h-4 w-4" />Actualizar</button>
      </div>
      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <AdminPanel className="divide-y divide-white/5 overflow-hidden">
          {loading ? <p className="p-6 text-sm text-white/30">Cargando...</p> : projects.map((project) => (
            <button key={project.id} type="button" onClick={() => void selectProject(project)} className="block w-full p-5 text-left transition hover:bg-white/[0.03]">
              <p className="font-medium text-white/85">{project.name}</p>
              <p className="mt-1 text-xs text-white/40">{project.project_code} · {project.status_name || project.status}</p>
            </button>
          ))}
        </AdminPanel>
        <AdminPanel className="p-6 lg:p-8">
          {!selected ? <p className="text-sm text-white/30">Selecciona un proyecto para ver su detalle.</p> : (
            <div className="space-y-8">
              <div><h2 className="text-xl font-semibold text-white/90">{selected.name}</h2><p className="mt-2 text-sm text-white/50">{selected.description || 'Sin descripción'}</p></div>
              <div className="grid gap-4 sm:grid-cols-2"><p className="text-sm text-white/70"><span className="block text-xs text-white/35">Cliente</span>{selected.first_name} {selected.last_name}</p><p className="text-sm text-white/70"><span className="block text-xs text-white/35">Servicio</span>{selected.service_name}</p></div>
              <div className="flex items-end gap-3"><div className="min-w-0 flex-1"><label className="mb-2 block text-xs uppercase tracking-wider text-white/40">Estado</label><CustomDropdown value={selectedStatus} onChange={setSelectedStatus} placeholder="Seleccionar estado..." options={statuses.map((item) => ({ value: item.code, label: item.name }))} /></div><button type="button" onClick={() => void saveStatus()} className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black">Guardar</button></div>
              <StatusHistoryTimeline records={history} />
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
};

export default Proyectos;
