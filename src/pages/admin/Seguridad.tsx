import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';
import { Monitor, Smartphone, Tablet, Trash2, ShieldCheck, Clock } from 'lucide-react';

interface Session {
  id: string;
  browser: string;
  device: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  isCurrentSession: boolean;
}

const AdminSeguridad: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiRequest<{ sessions: Session[] }>('/api/auth/sessions');
        setSessions(data.sessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
      } finally {
        setLoading(false);
      }
    };
    void fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    // Optimistic UI update
    const previousSessions = [...sessions];
    setSessions(sessions.filter((s) => s.id !== sessionId));

    try {
      await apiRequest(`/api/auth/sessions/${sessionId}/revoke`, { method: 'POST' });
    } catch (err) {
      // Revert if failed
      setSessions(previousSessions);
      alert(err instanceof Error ? err.message : 'Error al revocar sesión');
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return <Smartphone className="w-6 h-6 text-white/70" />;
    if (device.toLowerCase().includes('tablet')) return <Tablet className="w-6 h-6 text-white/70" />;
    return <Monitor className="w-6 h-6 text-white/70" />;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (loading) {
    return <div className="p-8 text-white flex items-center gap-3"><Clock className="animate-spin w-5 h-5 text-[#06CFD6]" /> Cargando dispositivos...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-8 text-white max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#06CFD6]" />
          Dispositivos Activos
        </h1>
        <p className="text-white/60 mt-2 text-lg">
          Gestiona las sesiones activas y los dispositivos que tienen acceso a tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ duration: 0.2 }}
              className={`bg-white/5 border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between ${
                session.isCurrentSession ? 'border-[#06CFD6]/50 shadow-[0_0_20px_rgba(6,207,214,0.15)] bg-[#06CFD6]/5' : 'border-white/10'
              }`}
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-white/10 rounded-xl shrink-0">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <h3 className="text-xl font-semibold truncate">{session.device}</h3>
                        <p className="text-white/60 truncate">{session.browser}</p>
                      </div>
                      {session.isCurrentSession && (
                        <span className="bg-[#06CFD6]/20 text-[#06CFD6] text-xs font-bold px-3 py-1.5 rounded-full border border-[#06CFD6]/30 shrink-0">
                          Dispositivo Actual
                        </span>
                      )}
                    </div>

                    <div className="mt-5 space-y-2.5 text-sm text-white/50"> 
                      <div className="flex items-center gap-2">
                        <span className="w-16 font-medium text-white/70">IP:</span>
                        <span className="text-white/90 bg-black/20 px-2 py-0.5 rounded">{session.ip_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#06CFD6]/70 shrink-0" />
                        <span><span className="text-white/70">Iniciado:</span> {formatDate(session.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400/70 shrink-0" />
                        <span><span className="text-white/70">Expira:</span> {formatDate(session.expires_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!session.isCurrentSession && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  className="mt-6 flex items-center justify-center sm:justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm self-start"
                >
                  <Trash2 className="w-4 h-4" />
                  Revocar Acceso
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminSeguridad;
