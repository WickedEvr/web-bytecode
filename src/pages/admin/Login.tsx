import React, { useState } from 'react';
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
    <main className="flex min-h-screen items-center justify-center bg-black px-6 font-sansation text-white/90">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-white/5 bg-[#0a0a0a] p-8 shadow-2xl">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-6">
             <img src="/vectors/designs/logo_en_blanco.svg" alt="Bytecode" className="h-10 opacity-90" />
          </div>
          <h1 className="text-xl font-semibold tracking-wide">Panel Administrativo</h1>
          <p className="text-xs text-white/40 mt-2 uppercase tracking-widest">Acceso Restringido</p>
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Correo Electrónico</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>
          <div className="mb-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Contraseña</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
              required
            />
          </div>
        </div>
        {error && <p className="mb-4 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">{error}</p>}
        <button disabled={loginLoading} className="mt-8 w-full rounded-lg bg-white py-3 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50">
          {loginLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
};

export default Login;
