import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

const VerifyAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido o token no proporcionado.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        await apiRequest(`/api/auth/verify-email?token=${token}`);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al verificar la cuenta.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 font-sansation text-white/90">
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-[#0a0a0a] p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <img src="/vectors/designs/logo_en_blanco.svg" alt="Bytecode" className="h-10 opacity-90" />
        </div>
        
        {loading ? (
          <div className="py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-cyan-500"></div>
            <p className="mt-4 text-sm text-white/60">Verificando cuenta...</p>
          </div>
        ) : success ? (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¡Cuenta Verificada Exitosamente!</h2>
            <p className="text-sm text-white/60 mb-8">
              Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión en el panel administrativo.
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Error de Verificación</h2>
            <p className="text-sm text-white/60 mb-8">{error}</p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full rounded-lg bg-white/10 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default VerifyAccount;