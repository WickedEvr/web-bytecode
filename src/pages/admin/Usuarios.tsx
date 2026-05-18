import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Save, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

const ROLES = [
  { value: 'super_admin', label: 'Super administrador' },
  { value: 'admin', label: 'Administrador' },
  { value: 'support_agent', label: 'Agente de soporte' },
  { value: 'legal_reviewer', label: 'Revisor legal' },
  { value: 'partner_designer', label: 'Diseñador Socio' },
];

import AdminPanel from '../../components/admin/AdminPanel';

// ... (skip to component)

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    name: '',
    password: '',
    role: 'support_agent',
    isActive: true,
  });

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ items: AdminUserRow[] }>('/api/admin/users');
      setUsers(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ id: '', email: '', name: '', password: '', role: 'support_agent', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUserRow) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
      isActive: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await apiRequest(`/api/admin/users/${formData.id}`, {
          method: 'PATCH',
          json: {
            name: formData.name,
            role: formData.role,
            isActive: formData.isActive,
          },
        });
      } else {
        await apiRequest('/api/admin/users', {
          method: 'POST',
          json: {
            email: formData.email,
            name: formData.name,
            password: formData.password,
            role: formData.role,
          },
        });
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val: string | null) => 
    val ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val)) : 'Nunca';

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h1 className="text-2xl font-semibold tracking-wide text-white/90">Usuarios Administradores</h1>
        <div className="flex gap-3">
          <button onClick={loadUsers} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90">
            <Plus className="h-4 w-4" /> <span>Nuevo Usuario</span>
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
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Último Login</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {users.map(user => (
                <tr key={user.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-white/60">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-white/70">
                      {ROLES.find(r => r.value === user.role)?.label || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium border ${user.is_active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-xs">{formatDate(user.last_login_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenEdit(user)} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-white/30 text-sm">No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white/90">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && isModalOpen && (
              <p className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {!isEditing && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              )}
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Contraseña Temporal</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Rol de Acceso</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors appearance-none"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value} className="bg-[#121212]">{role.label}</option>
                  ))}
                </select>
              </div>

              {isEditing && (
                <label className="flex items-center gap-3 py-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20 focus:ring-offset-black"
                  />
                  <span className="text-sm font-medium text-white/80">Cuenta Activa</span>
                </label>
              )}

              <div className="mt-4 flex gap-3 pt-4 border-t border-white/5">
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

export default Usuarios;
