import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { StatusHistoryRecord } from '../../types/status';
import Timeline from '../ui/Timeline';

type Props = {
  records: StatusHistoryRecord[];
  loading?: boolean;
};

const StatusHistoryTimeline: React.FC<Props> = ({ records, loading = false }) => (
  <Timeline
    heading="Historial de Estados"
    loading={loading}
    emptyMessage="No hay cambios de estado registrados."
    items={records.map((record) => ({
      date: record.timestamp,
      icon: <RefreshCw className="h-4 w-4" />,
      title: (
        <>
          <span className="font-medium text-white/90">{record.user_name || record.user_email || 'Sistema'}</span>
          {' cambió el estado de '}
          <span className="text-white/90">{record.old_status_name || record.old_status || 'Sin estado'}</span>
          {' a '}
          <span className="text-white/90">{record.new_status_name || record.new_status}</span>.
        </>
      ),
    }))}
  />
);

export default StatusHistoryTimeline;
