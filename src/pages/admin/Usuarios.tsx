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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Usuarios Admin</h1>
        <div className="flex gap-3">
          <button onClick={loadUsers} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
          <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 rounded-full bg-[#06CFD6] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0CA3C6]">
            <Plus className="h-4 w-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      {error && !isModalOpen && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-5 py-4 font-medium">Nombre</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Rol</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Último Login</th>
                <th className="px-5 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map(user => (
                <tr key={user.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-bold">{user.name}</td>
                  <td className="px-5 py-4">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-[#06CFD6]">
                      {ROLES.find(r => r.value === user.role)?.label || user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${user.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/50">{formatDate(user.last_login_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleOpenEdit(user)} className="text-sm font-bold text-[#06CFD6] hover:underline">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-white/50">No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#040e1f] border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && isModalOpen && <p className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isEditing && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-white/70">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
                  />
                </div>
              )}
              
              <div>
                <label className="mb-1 block text-sm font-bold text-white/70">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-white/70">Contraseña Temporal</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-bold text-white/70">Rol de Acceso</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none [&>option]:bg-[#040e1f]"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {isEditing && (
                <label className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 rounded border-white/20 bg-white/10 text-[#06CFD6] focus:ring-[#06CFD6] focus:ring-offset-gray-900"
                  />
                  <span className="text-sm font-bold text-white/80">Cuenta Activa</span>
                </label>
              )}

              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-3 font-bold hover:bg-white/5">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#06CFD6] py-3 font-bold hover:bg-[#0CA3C6] disabled:opacity-50">
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
