import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        json: credentials,
      });
      navigate(searchParams.get('redirect') || '/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#040e1f] px-6 font-sansation text-white">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_0_40px_rgba(6,207,214,0.12)]">
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-[#06CFD6]" />
          <div>
            <h1 className="text-2xl font-bold">Panel Bytecode</h1>
            <p className="text-sm text-white/60">Acceso solo para administradores.</p>
          </div>
        </div>
        <label className="mb-2 block text-sm font-bold text-white/70">Correo</label>
        <input
          type="email"
          value={credentials.email}
          onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
          className="mb-4 w-full rounded-full bg-white px-5 py-3 text-black outline-none focus:ring-2 focus:ring-[#06CFD6]"
          required
        />
        <label className="mb-2 block text-sm font-bold text-white/70">Contraseña</label>
        <input
          type="password"
          value={credentials.password}
          onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
          className="mb-6 w-full rounded-full bg-white px-5 py-3 text-black outline-none focus:ring-2 focus:ring-[#06CFD6]"
          required
        />
        {error && <p className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p>}
        <button disabled={loginLoading} className="w-full rounded-full bg-[#06CFD6] py-3 text-lg font-bold text-white transition hover:bg-[#0CA3C6] disabled:opacity-60">
          {loginLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
};

export default Login;
