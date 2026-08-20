import React from 'react';
import { Activity, Clock } from 'lucide-react';

export default function ActivityTimeline({ data }: { data: any }) {
  const { telemetry } = data;

  if (!telemetry || telemetry.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-12 rounded-md text-center text-zinc-400 glass-panel">
        <Activity className="mx-auto w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-lg">No activity telemetry found.</p>
        <p className="text-sm mt-2 text-zinc-500">System audit logs were not captured.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="text-emerald-500" /> System Telemetry
        </h2>
        <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 rounded-sm border border-zinc-800">
          {telemetry.length} Events Logged
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-md overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800">
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Action Type</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Module</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest w-full">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {telemetry.map((log: any) => (
                <tr key={log.id} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <Clock size={12} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold font-mono px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded uppercase">
                      {log.action_type || 'SYSTEM'}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-xs text-zinc-500 font-mono">
                      {log.table_name || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-zinc-300">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
