import React, { useEffect, useState, useCallback } from 'react';
import { useTerminalState } from '../../hooks/useTerminalState';
import { ArrowLeft, ExternalLink, GitCommitHorizontal, Pencil, Trash2, UserPlus, X, DollarSign, Plus } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import AdminPanel from '../../components/admin/AdminPanel';
import type { AdminUser } from '../../components/admin/AdminLayout';
import RoleGuard from '../../components/admin/RoleGuard';
import ProjectQuoteSelector from '../../components/admin/ProjectQuoteSelector';
import ProjectEnvironmentsHub from '../../components/admin/ProjectEnvironmentsHub';
import StatusHistoryTimeline from '../../components/admin/StatusHistoryTimeline';
import CustomDropdown from '../../components/ui/CustomDropdown';
import Timeline from '../../components/ui/Timeline';
import {
  apiRequest,
  assignProjectUser,
  deleteProject,
  fetchProject,
  fetchProjectAssignmentOptions,
  fetchProjectAssignments,
  fetchProjectCommits,
  fetchProjectMilestones,
  fetchProjectStatusHistory,
  updateProject,
  updateProjectMilestone,
  createProjectMilestone,
  createMilestonePayment,
  type Project,
  type ProjectAssignment,
  type ProjectAssignmentOption,
  type ProjectCommit,
  type ProjectMilestone,
} from '../../lib/api';
import type { StatusCatalogItem, StatusHistoryRecord } from '../../types/status';

type Tab = 'general' | 'milestones' | 'environments' | 'activity' | 'history';
type ProjectEditForm = { name: string; description: string; githubRepo: string; quoteId: string; totalBudget: number };

const ProyectoDetalle: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { admin } = useOutletContext<{ admin: AdminUser }>();
  const canAssign = admin.roles.includes('super_admin') || admin.permissions?.includes('admin.proyectos.assign') === true;
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [commits, setCommits] = useState<ProjectCommit[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [assignmentOptions, setAssignmentOptions] = useState<ProjectAssignmentOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignmentRole, setAssignmentRole] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [statuses, setStatuses] = useState<StatusCatalogItem[]>([]);
  const { isReadOnly } = useTerminalState({ isTerminal: Boolean(project?.isTerminal) });
  const [projectStatuses, setProjectStatuses] = useState<StatusCatalogItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryRecord[]>([]);
  const [updatingProjectStatus, setUpdatingProjectStatus] = useState(false);
  const [tab, setTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState<ProjectEditForm>({ name: '', description: '', githubRepo: '', quoteId: '', totalBudget: 0 });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState('');
  const [paymentForm, setPaymentForm] = useState<{ amount: number; method: string; reference: string; date: string; receipt: File | null }>({ amount: 0, method: 'transfer', reference: '', date: new Date().toISOString().split('T')[0], receipt: null });
  const [savingPayment, setSavingPayment] = useState(false);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [addMilestoneForm, setAddMilestoneForm] = useState({ title: '', due_date: '', payment_percentage: 0, status_id: '' });
  const [savingMilestone, setSavingMilestone] = useState(false);

  const loadMilestones = async () => setMilestones(await fetchProjectMilestones(id));

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [projectResult, milestoneResult, commitResult, assignmentResult, statusResult, projectStatusResult, historyResult] = await Promise.all([
        fetchProject(id),
        fetchProjectMilestones(id),
        fetchProjectCommits(id),
        fetchProjectAssignments(id),
        apiRequest<{ items: StatusCatalogItem[] }>('/catalog/statuses?domain=milestone'),
        apiRequest<{ items: StatusCatalogItem[] }>('/catalog/statuses?domain=project'),
        fetchProjectStatusHistory<StatusHistoryRecord>(id),
      ]);
      setProject(projectResult);
      setMilestones(milestoneResult);
      setCommits(commitResult);
      setAssignments(assignmentResult);
      setStatuses(statusResult.items);
      setProjectStatuses(projectStatusResult.items);
      setStatusHistory(historyResult);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el proyecto.');
    } finally {
      setLoading(false);
    }
    if (canAssign) {
      fetchProjectAssignmentOptions().then(setAssignmentOptions).catch(() => setAssignmentOptions([]));
    }
  }, [id, canAssign]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const changeMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      await updateProjectMilestone(id, milestoneId, status);
      await loadMilestones();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo actualizar el hito.');
    }
  };

  const changeProjectStatus = async (status: string) => {
    if (!project || status === project.status) return;
    setUpdatingProjectStatus(true);
    setError('');
    try {
      const updated = await updateProject(id, { status });
      setProject(updated);
      setStatusHistory(await fetchProjectStatusHistory<StatusHistoryRecord>(id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo actualizar el estado del proyecto.');
    } finally {
      setUpdatingProjectStatus(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setAssigning(true);
    setError('');
    try {
      await assignProjectUser(id, selectedUserId, assignmentRole || undefined);
      setAssignments(await fetchProjectAssignments(id));
      setSelectedUserId('');
      setAssignmentRole('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo asignar el integrante.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas desasignar a este integrante?')) return;
    try {
      await apiRequest(`/admin/projects/${id}/assignments/${userId}`, { method: 'DELETE' });
      setAssignments(await fetchProjectAssignments(id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo desasignar el integrante.');
    }
  };

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeMilestoneId) return;
    setSavingPayment(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('amountPaid', paymentForm.amount.toString());
      formData.append('paymentMethod', paymentForm.method);
      formData.append('paidAt', paymentForm.date);
      if (paymentForm.reference) formData.append('referenceNumber', paymentForm.reference);
      if (paymentForm.receipt) formData.append('receipt', paymentForm.receipt);

      await createMilestonePayment(id, activeMilestoneId, formData);
      await loadMilestones();
      setPaymentModalOpen(false);
      setActiveMilestoneId('');
      setPaymentForm({ amount: 0, method: 'transfer', reference: '', date: new Date().toISOString().split('T')[0], receipt: null });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo registrar el pago.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleAddMilestoneSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingMilestone(true);
    setError('');
    try {
      await createProjectMilestone(id, {
        title: addMilestoneForm.title,
        dueDate: addMilestoneForm.due_date,
        paymentPercentage: addMilestoneForm.payment_percentage,
        statusId: addMilestoneForm.status_id,
      });
      await loadMilestones();
      setAddMilestoneOpen(false);
      setAddMilestoneForm({ title: '', due_date: '', payment_percentage: 0, status_id: statuses[0]?.id || '' });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo crear el hito.');
    } finally {
      setSavingMilestone(false);
    }
  };

  const openEdit = () => {
    if (!project) return;
    setEditForm({
      name: project.name,
      description: project.description ?? '',
      githubRepo: project.github_repo ?? '',
      quoteId: project.quote_id ?? '',
      totalBudget: Number(project.total_budget),
    });
    setEditOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateProject(id, {
        name: editForm.name,
        description: editForm.description || null,
        githubRepo: editForm.githubRepo || null,
        quoteId: editForm.quoteId || null,
        totalBudget: editForm.totalBudget,
      });
      setProject(updated);
      setEditOpen(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo actualizar el proyecto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar el proyecto "${project?.name ?? ''}"? Esta acción lo retirará del panel.`)) return;
    setDeleting(true);
    setError('');
    try {
      await deleteProject(id);
      navigate('/admin/proyectos', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo eliminar el proyecto.');
      setDeleting(false);
    }
  };

  if (loading) return <p className="p-8 text-sm text-white/40">Cargando proyecto...</p>;
  if (!project) return <p className="p-8 text-sm text-red-300">{error || 'Proyecto no encontrado.'}</p>;

  const link = (label: string, url: string | null) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-wider text-white/35">{label}</p>{url ? <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 break-all text-sm text-cyan-300 hover:text-cyan-200">{url}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <p className="mt-2 text-sm text-white/30">No configurado</p>}</div>
  );

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4"><div className="flex items-center gap-4"><button type="button" onClick={() => navigate('/admin/proyectos')} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60"><ArrowLeft className="h-5 w-5" /></button><div><h1 className="text-2xl font-semibold text-white/90">{project.name}</h1><p className="mt-1 text-xs text-white/40">{project.project_code} · {project.customer_name || 'Cliente sin nombre'} · {project.status_name || project.status}</p></div></div><RoleGuard requiredPermission="admin.proyectos.manage" fallback={null}>{(admin.roles.includes('super_admin') || admin.roles.includes('admin')) && !isReadOnly && (<div className="flex gap-2"><button type="button" onClick={openEdit} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:bg-white/10"><Pencil className="h-4 w-4" />Editar</button><button type="button" disabled={deleting} onClick={() => void handleDelete()} className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-40"><Trash2 className="h-4 w-4" />{deleting ? 'Eliminando...' : 'Eliminar'}</button></div>)}</RoleGuard></div>
      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {([['general', 'General'], ['milestones', 'Hitos'], ['environments', 'Entornos'], ['activity', 'Actividad (GitHub)'], ['history', 'Historial de Estados']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-lg px-4 py-2 text-sm transition ${tab === value ? 'bg-white text-black' : 'bg-white/5 text-white/55 hover:text-white'}`}>{label}</button>)}
      </div>

      {tab === 'general' && <div className="grid gap-6"><AdminPanel className="p-6 lg:p-8"><div className="grid gap-5 md:grid-cols-2"><div><p className="text-xs uppercase tracking-wider text-white/35">Cliente</p><p className="mt-2 text-white/80">{project.customer_name}</p></div><div><p className="text-xs uppercase tracking-wider text-white/35">Servicio</p><p className="mt-2 text-white/80">{project.service_name}</p></div><div><p className="mb-1.5 text-xs uppercase tracking-wider text-white/35">Estado del Proyecto</p><RoleGuard requiredPermission="admin.proyectos.manage" fallback={<div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/55">{project.status_name || project.status}</div>}>{(admin.roles.includes('super_admin') || admin.roles.includes('admin')) ? <CustomDropdown value={project.status} onChange={(status) => void changeProjectStatus(status)} placeholder="Seleccionar estado..." disabled={updatingProjectStatus || isReadOnly} options={projectStatuses.map((status) => ({ value: status.code, label: status.name }))} /> : <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/55">{project.status_name || project.status}</div>}</RoleGuard></div><div className="md:col-span-2"><p className="text-xs uppercase tracking-wider text-white/35">Descripción</p><p className="mt-2 text-sm leading-6 text-white/60">{project.description || 'Sin descripción.'}</p></div>{link('Repositorio GitHub', project.github_repo)}</div></AdminPanel><AdminPanel className="p-6 lg:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-sm font-semibold uppercase tracking-wider text-white/75">Equipo asignado</h2><p className="mt-1 text-xs text-white/35">Integrantes con acceso operativo al proyecto.</p></div>{(admin.roles.includes('super_admin') || admin.roles.includes('admin')) && <div className="flex flex-wrap items-end gap-2"><div className="min-w-52"><CustomDropdown disabled={isReadOnly} value={selectedUserId} onChange={setSelectedUserId} placeholder="Seleccionar integrante..." options={assignmentOptions.map((user) => ({ value: user.id, label: `${user.name} · ${user.email}` }))} /></div><input value={assignmentRole} disabled={isReadOnly} onChange={(event) => setAssignmentRole(event.target.value)} placeholder="Rol en el proyecto" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white" />{!isReadOnly && <button type="button" disabled={!selectedUserId || assigning} onClick={() => void handleAssign()} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black disabled:opacity-40"><UserPlus className="h-4 w-4" />{assigning ? 'Asignando...' : 'Asignar'}</button>}</div>}</div><div className="mt-5 grid gap-2">{assignments.length ? assignments.map((assignment) => <div key={assignment.user_id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"><div><p className="text-sm text-white/80">{assignment.name}</p><p className="text-xs text-white/35">{assignment.email}</p></div><div className="flex items-center gap-3"><span className="text-xs text-white/50">{assignment.role || 'Integrante'}</span>{(admin.roles.includes('super_admin') || admin.roles.includes('admin')) && !isReadOnly && (<div className="flex items-center gap-1"><button type="button" onClick={() => { setSelectedUserId(assignment.user_id); setAssignmentRole(assignment.role || ''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-white/40 hover:text-white" title="Editar Rol"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => void handleRemoveAssignment(assignment.user_id)} className="p-1.5 text-white/40 hover:text-red-400" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div></div>) : <p className="py-3 text-sm text-white/30">No hay integrantes asignados.</p>}</div></AdminPanel></div>}

      {tab === 'milestones' && <AdminPanel className="divide-y divide-white/5 overflow-hidden"><div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]"><div><h2 className="text-sm font-semibold uppercase tracking-wider text-white/75">Hitos del Proyecto</h2></div><RoleGuard requiredPermission="admin.proyectos.manage" fallback={null}>{(admin.roles.includes('super_admin') || admin.roles.includes('admin')) && !isReadOnly && <button type="button" onClick={() => { setAddMilestoneForm(prev => ({ ...prev, status_id: statuses[0]?.id || '' })); setAddMilestoneOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"><Plus className="h-4 w-4" />Añadir Hito</button>}</RoleGuard></div>{milestones.length ? milestones.map((milestone) => <div key={milestone.id} className="grid gap-4 p-5 md:grid-cols-[1fr_180px_auto] md:items-center"><div><h3 className="font-medium text-white/85">{milestone.title}</h3><p className="mt-1 text-xs text-white/35">Vence {new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(milestone.due_date))} · {milestone.payment_percentage}%</p>{milestone.payments && milestone.payments.length > 0 && (<div className="mt-2 flex flex-col gap-1">{milestone.payments.map((p) => (<p key={p.id} className="text-xs text-green-400">Pago: {p.currency_code} {Number(p.amount_paid).toFixed(2)} ({p.payment_method}) {p.receipt_url && <a href={p.receipt_url} target="_blank" rel="noreferrer" className="underline hover:text-green-300">Ver recibo</a>}</p>))}</div>)}</div><RoleGuard requiredPermission="admin.proyectos.manage" fallback={<div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/55" aria-label="Estado de solo lectura">{milestone.status_name || milestone.status}</div>}><CustomDropdown value={milestone.status} onChange={(status) => void changeMilestoneStatus(milestone.id, status)} disabled={isReadOnly} placeholder="Estado..." options={statuses.map((status) => ({ value: status.code, label: status.name }))} /></RoleGuard><RoleGuard requiredPermission="admin.proyectos.manage" fallback={null}>{(admin.roles.includes('super_admin') || admin.roles.includes('admin')) && !isReadOnly && <button type="button" onClick={() => { setActiveMilestoneId(milestone.id); setPaymentModalOpen(true); }} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white" title="Registrar Pago"><DollarSign className="h-4 w-4" /></button>}</RoleGuard></div>) : <p className="p-8 text-center text-sm text-white/30">No hay hitos registrados.</p>}</AdminPanel>}

      {tab === 'environments' && <ProjectEnvironmentsHub projectId={id} isAdmin={admin.roles.includes('super_admin') || admin.roles.includes('admin')} />}

      {tab === 'activity' && <AdminPanel className="p-6 lg:p-8"><Timeline heading="Actividad de GitHub" emptyMessage="No hay commits registrados." items={commits.map((commit) => ({ date: commit.committed_at || commit.created_at || new Date(0).toISOString(), icon: <GitCommitHorizontal className="h-4 w-4" />, title: <><span className="font-medium text-white/90">{commit.author_name || commit.author_email || 'GitHub'}</span><span className="block text-white/65">{commit.message}</span><span className="mt-1 block font-mono text-[10px] text-white/35">{commit.branch || 'branch'} · {commit.commit_hash.slice(0, 7)}</span>{commit.github_url && <a href={commit.github_url} target="_blank" rel="noreferrer" className="pointer-events-auto mt-2 block text-cyan-300">Ver commit</a>}</> }))} /></AdminPanel>}

      {tab === 'history' && <AdminPanel className="p-6 lg:p-8"><StatusHistoryTimeline records={statusHistory} /></AdminPanel>}

      <RoleGuard requiredPermission="admin.proyectos.manage" fallback={null}>
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <form onSubmit={handleUpdate} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div><h2 className="text-lg font-semibold text-white/90">Editar proyecto</h2><p className="mt-1 text-xs text-white/35">Información general y cotización asociada.</p></div>
                <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg p-2 text-white/50 hover:bg-white/5"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid gap-5">
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Nombre</span><input required minLength={2} value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <ProjectQuoteSelector email={project.customer_email ?? ''} value={editForm.quoteId} onChange={(quote) => setEditForm({ ...editForm, quoteId: quote?.id ?? '', totalBudget: quote ? Number(quote.total_amount) : editForm.totalBudget })} />
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Presupuesto</span><input type="number" min={0} required value={editForm.totalBudget} onChange={(event) => setEditForm({ ...editForm, totalBudget: Number(event.target.value) })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Descripción</span><textarea rows={4} value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Repositorio GitHub</span><input type="url" value={editForm.githubRepo} onChange={(event) => setEditForm({ ...editForm, githubRepo: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-5"><button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/65">Cancelar</button><button disabled={saving} className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-40">{saving ? 'Guardando...' : 'Guardar cambios'}</button></div>
            </form>
          </div>
        )}
      </RoleGuard>
      <RoleGuard requiredPermission="admin.proyectos.manage" fallback={null}>
        {paymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <form onSubmit={handlePaymentSubmit} className="max-h-[92vh] w-full max-w-md overflow-visible rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div><h2 className="text-lg font-semibold text-white/90">Registrar Pago</h2></div>
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="rounded-lg p-2 text-white/50 hover:bg-white/5"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid gap-5">
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Monto</span><input type="number" min={0.01} step="0.01" required value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: Number(event.target.value) })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Método de pago</span>
                    <div className="min-w-48">
                      <CustomDropdown
                        value={paymentForm.method}
                        onChange={(method) => setPaymentForm({ ...paymentForm, method })}
                        placeholder="Método de pago"
                        options={[
                          { value: 'transfer', label: 'Transferencia' },
                          { value: 'cash', label: 'Efectivo' },
                          { value: 'credit_card', label: 'Tarjeta' },
                          { value: 'paypal', label: 'PayPal' },
                        ]}
                      />
                    </div>
                </label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Referencia (Opcional)</span><input type="text" value={paymentForm.reference} onChange={(event) => setPaymentForm({ ...paymentForm, reference: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Fecha de pago</span><input type="date" required value={paymentForm.date} onChange={(event) => setPaymentForm({ ...paymentForm, date: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Comprobante (Opcional)</span><input type="file" accept="image/*,.pdf" onChange={(event) => setPaymentForm({ ...paymentForm, receipt: event.target.files?.[0] || null })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white text-sm" /></label>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-5"><button type="button" onClick={() => setPaymentModalOpen(false)} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/65">Cancelar</button><button disabled={savingPayment} className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-40">{savingPayment ? 'Registrando...' : 'Registrar'}</button></div>
            </form>
          </div>
        )}
      </RoleGuard>
      <RoleGuard requiredPermission="admin.proyectos.manage" fallback={null}>
        {addMilestoneOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <form onSubmit={handleAddMilestoneSubmit} className="max-h-[92vh] w-full max-w-md overflow-visible rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div><h2 className="text-lg font-semibold text-white/90">Añadir Hito</h2></div>
                <button type="button" onClick={() => setAddMilestoneOpen(false)} className="rounded-lg p-2 text-white/50 hover:bg-white/5"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid gap-5">
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Título</span><input required minLength={2} value={addMilestoneForm.title} onChange={(event) => setAddMilestoneForm({ ...addMilestoneForm, title: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Fecha de vencimiento</span><input type="date" required value={addMilestoneForm.due_date} onChange={(event) => setAddMilestoneForm({ ...addMilestoneForm, due_date: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Porcentaje de pago (%)</span><input type="number" min={0} max={100} step="0.01" required value={addMilestoneForm.payment_percentage} onChange={(event) => setAddMilestoneForm({ ...addMilestoneForm, payment_percentage: Number(event.target.value) })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
                <label className="grid gap-1.5"><span className="text-xs uppercase tracking-wider text-white/45">Estado</span>
                    <div className="min-w-48">
                      <CustomDropdown
                        value={addMilestoneForm.status_id}
                        onChange={(status_id) => setAddMilestoneForm({ ...addMilestoneForm, status_id })}
                        placeholder="Seleccionar estado"
                        options={statuses.map(s => ({ value: s.id, label: s.name }))}
                      />
                    </div>
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-5"><button type="button" onClick={() => setAddMilestoneOpen(false)} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/65">Cancelar</button><button disabled={savingMilestone} className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-40">{savingMilestone ? 'Guardando...' : 'Crear Hito'}</button></div>
            </form>
          </div>
        )}
      </RoleGuard>
    </div>
  );
};

export default ProyectoDetalle;
