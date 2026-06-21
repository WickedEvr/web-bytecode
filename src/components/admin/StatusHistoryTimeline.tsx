import React from 'react';
import type { StatusHistoryRecord } from '../../types/status';

type Props = {
  records: StatusHistoryRecord[];
  loading?: boolean;
};

const formatTimestamp = (value: string) => new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const StatusHistoryTimeline: React.FC<Props> = ({ records, loading = false }) => (
  <section className="border-t border-white/5 pt-6">
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Historial de Estados</h3>
    {loading ? (
      <p className="text-sm text-white/30">Cargando historial...</p>
    ) : records.length === 0 ? (
      <p className="text-sm text-white/30">No hay cambios de estado registrados.</p>
    ) : (
      <ol className="space-y-4 border-l border-white/10 pl-4">
        {records.map((record, index) => (
          <li key={`${record.timestamp}-${index}`} className="relative text-sm text-white/70">
            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
            <p>
              <span className="font-medium text-white/90">{record.user_name || record.user_email || 'Sistema'}</span>
              {' cambió el estado de '}
              <span className="text-white/90">{record.old_status_name || record.old_status || 'Sin estado'}</span>
              {' a '}
              <span className="text-white/90">{record.new_status_name || record.new_status}</span>.
            </p>
            <time className="mt-1 block text-xs text-white/35">{formatTimestamp(record.timestamp)}</time>
          </li>
        ))}
      </ol>
    )}
  </section>
);

export default StatusHistoryTimeline;
