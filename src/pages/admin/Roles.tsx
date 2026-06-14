import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, RefreshCw, Save, ShieldCheck, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import AdminPanel from '../../components/admin/AdminPanel';

type Permission = {
  id: string;
  module_code: string;
  action_code: string;
  code: string;
  name: string;
  description: string | null;
};

type Role = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  permission_ids: string[];
  permission_codes: string[];
};

const emptyForm = {
  id: '',
  code: '',
  name: '',
  description: '',
  isActive: true,
  permissionIds: [] as string[],
};

const normalizeRoleCode = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const permissionsByModule = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
      acc[permission.module_code] = acc[permission.module_code] ?? [];
      acc[permission.module_code].push(permission);
      return acc;
    }, {});
  }, [permissions]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        apiRequest<{ items: Role[] }>('/api/admin/roles'),
        apiRequest<{ items: Permission[] }>('/api/admin/permissions'),
      ]);
      setRoles(rolesResult.items);
      setPermissions(permissionsResult.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setIsEditing(true);
    setFormData({
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description ?? '',
      isActive: role.is_active,
      permissionIds: role.permission_ids ?? [],
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((id) => id !== permissionId)
        : [...current.permissionIds, permissionId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        await apiRequest(`/api/admin/roles/${formData.id}`, {
          method: 'PUT',
          json: {
            name: formData.name,
            description: formData.description || null,
            isActive: formData.isActive,
            permissionIds: formData.permissionIds,
          },
        });
      } else {
        await apiRequest('/api/admin/roles', {
          method: 'POST',
          json: {
            code: normalizeRoleCode(formData.code || formData.name),
            name: formData.name,
            description: formData.description || null,
            permissionIds: formData.permissionIds,
          },
        });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-white/50" />
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white/90">Roles</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Permisos por rol</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90">
            <Plus className="h-4 w-4" /> <span>Nuevo Rol</span>
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <AdminPanel className="flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Codigo</th>
                <th className="px-6 py-4 text-center font-medium">Permisos</th>
                <th className="px-6 py-4 text-center font-medium">Estado</th>
                <th className="px-6 py-4 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {roles.map((role) => (
                <tr key={role.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white/90">{role.name}</p>
                    {role.description && <p className="mt-1 text-xs text-white/40 max-w-[320px] truncate">{role.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-white/50">{role.code}</td>
                  <td className="px-6 py-4 text-center text-white/60">{role.permission_codes?.length ?? 0}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium border ${role.is_active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {role.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      disabled={role.code === 'super_admin'}
                      onClick={() => handleOpenEdit(role)}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30 text-sm">No hay roles registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white/90">{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex max-h-[calc(90vh-73px)] flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {error && (
                  <p className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(event) => setFormData({ ...formData, name: event.target.value, code: isEditing ? formData.code : normalizeRoleCode(event.target.value) })}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Codigo</label>
                    <input
                      type="text"
                      required
                      disabled={isEditing}
                      value={formData.code}
                      onChange={(event) => setFormData({ ...formData, code: normalizeRoleCode(event.target.value) })}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Descripcion</label>
                    <textarea
                      value={formData.description}
                      onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                      className="min-h-20 w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {isEditing && (
                    <label className="md:col-span-2 flex items-center gap-3 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20 focus:ring-offset-black"
                      />
                      Rol activo
                    </label>
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-medium uppercase tracking-widest text-white/50">Permisos</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {Object.entries(permissionsByModule).map(([moduleCode, modulePermissions]) => (
                      <div key={moduleCode} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">{moduleCode}</p>
                        <div className="space-y-2">
                          {modulePermissions.map((permission) => (
                            <label key={permission.id} className="flex items-start gap-3 rounded-lg px-2 py-2 text-sm text-white/70 hover:bg-white/5">
                              <input
                                type="checkbox"
                                checked={formData.permissionIds.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20 focus:ring-offset-black"
                              />
                              <span>
                                <span className="block text-white/80">{permission.name}</span>
                                <span className="block text-[11px] font-mono text-white/35">{permission.code}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-white/5 p-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2.5 text-sm font-medium transition-colors hover:bg-white/90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
