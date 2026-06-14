import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
<<<<<<< Updated upstream
import { Plus, RefreshCw, Save, X } from 'lucide-react';
=======
import { Edit2, Plus, RefreshCw, Save, UserCheck, UserX, X } from 'lucide-react';
>>>>>>> Stashed changes
=======
import { Edit2, MoreVertical, Plus, RefreshCw, Save, Trash2, UserCheck, UserX, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
>>>>>>> main
import { apiRequest } from '../../lib/api';
import AdminPanel from '../../components/admin/AdminPanel';
import CustomDropdown from '../../components/ui/CustomDropdown';

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

<<<<<<< Updated upstream
const ROLES = [
  { value: 'super_admin', label: 'Super administrador' },
  { value: 'admin', label: 'Administrador' },
  { value: 'support_agent', label: 'Agente de soporte' },
  { value: 'legal_reviewer', label: 'Revisor legal' },
  { value: 'partner_designer', label: 'Diseñador Socio' },
];

import AdminPanel from '../../components/admin/AdminPanel';
import CustomDropdown from '../../components/ui/CustomDropdown';

<<<<<<< HEAD
// ... (skip to component)
=======
type RoleOption = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

const emptyForm = {
  id: '',
  email: '',
  name: '',
  password: '',
  role: '',
  isActive: true,
};
>>>>>>> Stashed changes
=======
type ActionMenuState = {
  id: string;
  top: number;
  left: number;
  placement: 'bottom' | 'top';
};
>>>>>>> main

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
  const [openMenu, setOpenMenu] = useState<ActionMenuState | null>(null);
>>>>>>> main
  
  // Modal state
=======
>>>>>>> Stashed changes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const roleOptions = roles.map((role) => ({ value: role.code, label: role.name }));

  const loadUsers = async () => {
    const result = await apiRequest<{ items: AdminUserRow[] }>('/api/admin/users');
    setUsers(result.items);
  };

  const loadRoles = async () => {
    const result = await apiRequest<{ items: RoleOption[] }>('/api/admin/roles');
    setRoles(result.items.filter((role) => role.is_active));
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadUsers(), loadRoles()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

<<<<<<< HEAD
<<<<<<< Updated upstream
=======
  const defaultRole = () => roles.find((role) => role.code !== 'super_admin')?.code ?? roles[0]?.code ?? '';

>>>>>>> Stashed changes
=======
  useEffect(() => {
    const handleClickOutside = () => setOpenMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleViewportChange = () => setOpenMenu(null);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, []);

  const handleToggleMenu = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
    event.stopPropagation();

    if (openMenu?.id === userId) {
      setOpenMenu(null);
      return;
    }

    const menuWidth = 144;
    const menuHeight = 88;
    const gap = 8;
    const viewportPadding = 8;
    const rect = event.currentTarget.getBoundingClientRect();
    const hasSpaceBelow = rect.bottom + gap + menuHeight <= window.innerHeight - viewportPadding;

    setOpenMenu({
      id: userId,
      left: Math.max(viewportPadding, rect.right - menuWidth),
      top: hasSpaceBelow ? rect.bottom + gap : rect.top - menuHeight - gap,
      placement: hasSpaceBelow ? 'bottom' : 'top',
    });
  };

>>>>>>> main
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ ...emptyForm, role: defaultRole() });
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
=======
>>>>>>> main
        const updatePayload: Record<string, unknown> = {
          name: formData.name,
          role: formData.role,
          isActive: formData.isActive,
        };

<<<<<<< HEAD
        if (formData.password.trim()) {
          updatePayload.password = formData.password;
        }

>>>>>>> Stashed changes
=======
        if (formData.password && formData.password.trim() !== '') {
          updatePayload.password = formData.password;
        }

>>>>>>> main
        await apiRequest(`/api/admin/users/${formData.id}`, {
          method: 'PATCH',
          json: updatePayload,
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

<<<<<<< Updated upstream
  const formatDate = (val: string | null) => 
    val ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val)) : 'Nunca';
=======
  const handleToggleStatus = async (user: AdminUserRow) => {
    if (!window.confirm(`Confirmas ${user.is_active ? 'desactivar' : 'activar'} a ${user.name}?`)) return;

    setLoading(true);
    setError('');
    try {
      await apiRequest(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        json: { isActive: !user.is_active },
      });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string | null) =>
    value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Nunca';
>>>>>>> Stashed changes

  const handleToggleStatus = async (user: AdminUserRow) => {
    if (!window.confirm(`¿Estás seguro de que deseas ${user.is_active ? 'desactivar' : 'activar'} a ${user.name}?`)) return;

    setLoading(true);
    setError('');
    try {
      await apiRequest(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        json: { isActive: !user.is_active },
      });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setLoading(false);
      setOpenMenu(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
        <h1 className="text-2xl font-semibold tracking-wide text-white/90">Usuarios Administradores</h1>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
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
<<<<<<< HEAD
<<<<<<< Updated upstream
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Último Login</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
=======
                <th className="px-6 py-4 text-center font-medium">Rol</th>
                <th className="px-6 py-4 text-center font-medium">Estado</th>
                <th className="px-6 py-4 text-center font-medium">Ultimo Login</th>
                <th className="px-6 py-4 text-center font-medium">Acciones</th>
>>>>>>> Stashed changes
=======
                <th className="px-6 py-4 text-center font-medium">Rol</th>
                <th className="px-6 py-4 text-center font-medium">Estado</th>
                <th className="px-6 py-4 text-center font-medium">Último Login</th>
                <th className="px-6 py-4 font-medium text-center min-w-[140px]">Acciones</th>
>>>>>>> main
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
<<<<<<< HEAD
<<<<<<< Updated upstream
                  <td className="px-6 py-4 text-white/60">{user.email}</td>
                  <td className="px-6 py-4">
=======
                  <td className="px-6 py-4 text-white/60 max-w-[220px] truncate" title={user.email}>{user.email}</td>
                  <td className="px-6 py-4 text-center">
>>>>>>> Stashed changes
=======
                  <td className="px-6 py-4 text-white/60 max-w-[200px] truncate" title={user.email}>{user.email}</td>
                  <td className="px-6 text-center py-4">
>>>>>>> main
                    <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-white/70">
                      {roles.find((role) => role.code === user.role)?.name ?? user.role}
                    </span>
                  </td>
<<<<<<< HEAD
<<<<<<< Updated upstream
                  <td className="px-6 py-4">
=======
                  <td className="px-6 py-4 text-center">
>>>>>>> Stashed changes
=======
                  <td className="px-6 text-center py-4">
>>>>>>> main
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium border ${user.is_active ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
<<<<<<< HEAD
<<<<<<< Updated upstream
                  <td className="px-6 py-4 text-white/40 text-xs">{formatDate(user.last_login_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenEdit(user)} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                      Editar
                    </button>
=======
                  <td className="px-6 py-4 text-center text-white/40 text-xs">{formatDate(user.last_login_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          user.is_active
                            ? 'text-red-400 hover:bg-red-400/10 hover:text-red-300'
                            : 'text-green-400 hover:bg-green-400/10 hover:text-green-300'
                        }`}
                      >
                        {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        {user.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
>>>>>>> Stashed changes
=======
                  <td className="px-6 text-center py-4 text-white/40 text-xs">{formatDate(user.last_login_at)}</td>
                  <td className="px-6 py-4 text-center relative">
                    <button
                      type="button"
                      onClick={(e) => handleToggleMenu(e, user.id)}
                      className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Abrir acciones"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {openMenu?.id === user.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: openMenu.placement === 'bottom' ? 6 : -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: openMenu.placement === 'bottom' ? 6 : -6 }}
                          transition={{ duration: 0.15 }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ left: openMenu.left, top: openMenu.top }}
                          className={`fixed w-36 bg-[#121212] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden ${
                            openMenu.placement === 'bottom' ? 'origin-top-right' : 'origin-bottom-right'
                          }`}
                        >
                          <div className="py-1 px-1 flex flex-col gap-1">
                            <button
                              onClick={() => { handleOpenEdit(user); setOpenMenu(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" /> Editar
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                user.is_active
                                  ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                                  : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                              }`}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="h-4 w-4" />
                                  <Trash2 className="sr-only h-4 w-4" aria-hidden="true" />
                                  Desactivar
                                </>
                              ) : (
                                <><UserCheck className="h-4 w-4" /> Activar</>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
>>>>>>> main
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
                  <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Correo Electronico</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
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
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                />
              </div>

<<<<<<< HEAD
<<<<<<< Updated upstream
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
=======
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-white/60 uppercase tracking-wider">
                  <span>{isEditing ? 'Nueva Contraseña' : 'Contraseña Temporal'}</span>
                  {isEditing && <span className="text-[10px] text-white/40 normal-case">(Opcional)</span>}
                </label>
                <input
                  type="password"
                  required={!isEditing}
                  minLength={8}
                  placeholder={isEditing ? 'Dejar en blanco para mantener la actual' : ''}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                />
              </div>
>>>>>>> main

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Rol de Acceso</label>
                <CustomDropdown value={formData.role} placeholder="Seleccionar rol..." onChange={val => setFormData({ ...formData, role: val })} options={ROLES} />
              </div>

<<<<<<< HEAD
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
=======
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-white/60 uppercase tracking-wider">
                  <span>{isEditing ? 'Nueva Contrasena' : 'Contrasena Temporal'}</span>
                  {isEditing && <span className="text-[10px] text-white/40 normal-case">(Opcional)</span>}
                </label>
                <input
                  type="password"
                  required={!isEditing}
                  minLength={8}
                  placeholder={isEditing ? 'Dejar en blanco para mantener la actual' : ''}
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider">Rol de Acceso</label>
                <CustomDropdown
                  value={formData.role}
                  placeholder="Seleccionar rol..."
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  options={roleOptions}
                />
              </div>

              {isEditing && (
                <label className="flex items-center gap-3 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20 focus:ring-offset-black"
                  />
                  Usuario activo
                </label>
              )}

              <div className="flex gap-3 mt-1.5 pt-4 border-t border-white/5">
>>>>>>> Stashed changes
=======
              <div className="flex gap-3 mt-1.5 pt-4 border-t border-white/5">
>>>>>>> main
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading || !formData.role} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2.5 text-sm font-medium transition-colors hover:bg-white/90 disabled:opacity-50">
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
