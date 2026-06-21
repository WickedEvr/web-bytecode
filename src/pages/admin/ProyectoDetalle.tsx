import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, GitCommitHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminPanel from '../../components/admin/AdminPanel';
import CustomDropdown from '../../components/ui/CustomDropdown';
import Timeline from '../../components/ui/Timeline';
import {
  apiRequest,
  fetchProject,
  fetchProjectCommits,
  fetchProjectMilestones,
  updateProjectMilestone,
  type Project,
  type ProjectCommit,
  type ProjectMilestone,
} from '../../lib/api';
import type { StatusCatalogItem } from '../../types/status';

type Tab = 'general' | 'milestones' | 'activity';

const ProyectoDetalle: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [commits, setCommits] = useState<ProjectCommit[]>([]);
  const [statuses, setStatuses] = useState<StatusCatalogItem[]>([]);
  const [tab, setTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMilestones = async () => setMilestones(await fetchProjectMilestones(id));

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchProject(id),
      fetchProjectMilestones(id),
      fetchProjectCommits(id),
      apiRequest<{ items: StatusCatalogItem[] }>('/api/catalog/statuses?domain=milestone'),
    ]).then(([projectResult, milestoneResult, commitResult, statusResult]) => {
      setProject(projectResult);
      setMilestones(milestoneResult);
      setCommits(commitResult);
      setStatuses(statusResult.items);
    }).catch((requestError: unknown) => {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el proyecto.');
    }).finally(() => setLoading(false));
  }, [id]);

  const changeMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      await updateProjectMilestone(id, milestoneId, status);
      await loadMilestones();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo actualizar el hito.');
    }
  };

  if (loading) return <p className="p-8 text-sm text-white/40">Cargando proyecto...</p>;
  if (!project) return <p className="p-8 text-sm text-red-300">{error || 'Proyecto no encontrado.'}</p>;

  const link = (label: string, url: string | null) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-wider text-white/35">{label}</p>{url ? <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 break-all text-sm text-cyan-300 hover:text-cyan-200">{url}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <p className="mt-2 text-sm text-white/30">No configurado</p>}</div>
  );

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center gap-4 border-b border-white/5 pb-4"><button type="button" onClick={() => navigate('/admin/proyectos')} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60"><ArrowLeft className="h-5 w-5" /></button><div><h1 className="text-2xl font-semibold text-white/90">{project.name}</h1><p className="mt-1 text-xs text-white/40">{project.project_code} · {project.customer_name} · {project.status_name || project.status}</p></div></div>
      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {([['general', 'General'], ['milestones', 'Hitos'], ['activity', 'Actividad (GitHub)']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-lg px-4 py-2 text-sm transition ${tab === value ? 'bg-white text-black' : 'bg-white/5 text-white/55 hover:text-white'}`}>{label}</button>)}
      </div>

      {tab === 'general' && <AdminPanel className="p-6 lg:p-8"><div className="grid gap-5 md:grid-cols-2"><div><p className="text-xs uppercase tracking-wider text-white/35">Cliente</p><p className="mt-2 text-white/80">{project.customer_name}</p></div><div><p className="text-xs uppercase tracking-wider text-white/35">Servicio</p><p className="mt-2 text-white/80">{project.service_name}</p></div><div className="md:col-span-2"><p className="text-xs uppercase tracking-wider text-white/35">Descripción</p><p className="mt-2 text-sm leading-6 text-white/60">{project.description || 'Sin descripción.'}</p></div>{link('Repositorio GitHub', project.github_repo)}{link('Staging', project.staging_url)}{link('Producción', project.production_url)}</div></AdminPanel>}

      {tab === 'milestones' && <AdminPanel className="divide-y divide-white/5 overflow-hidden">{milestones.length ? milestones.map((milestone) => <div key={milestone.id} className="grid gap-4 p-5 md:grid-cols-[1fr_180px] md:items-center"><div><h3 className="font-medium text-white/85">{milestone.title}</h3><p className="mt-1 text-xs text-white/35">Vence {new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(milestone.due_date))} · {milestone.payment_percentage}%</p></div><CustomDropdown value={milestone.status} onChange={(status) => void changeMilestoneStatus(milestone.id, status)} placeholder="Estado..." options={statuses.map((status) => ({ value: status.code, label: status.name }))} /></div>) : <p className="p-8 text-center text-sm text-white/30">No hay hitos registrados.</p>}</AdminPanel>}

      {tab === 'activity' && <AdminPanel className="p-6 lg:p-8"><Timeline heading="Actividad de GitHub" emptyMessage="No hay commits registrados." items={commits.map((commit) => ({ date: commit.committed_at || commit.created_at || new Date(0).toISOString(), icon: <GitCommitHorizontal className="h-4 w-4" />, title: <><span className="font-medium text-white/90">{commit.author_name || commit.author_email || 'GitHub'}</span><span className="block text-white/65">{commit.message}</span><span className="mt-1 block font-mono text-[10px] text-white/35">{commit.branch || 'branch'} · {commit.commit_hash.slice(0, 7)}</span>{commit.github_url && <a href={commit.github_url} target="_blank" rel="noreferrer" className="pointer-events-auto mt-2 block text-cyan-300">Ver commit</a>}</> }))} /></AdminPanel>}
    </div>
  );
};

export default ProyectoDetalle;
