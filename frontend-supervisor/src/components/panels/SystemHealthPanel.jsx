import React from 'react';
import MetricCard from '../common/MetricCard';
import { Activity } from 'lucide-react';

function formatUptime(seconds) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export default function SystemHealthPanel({ uptime, connections }) {
  return (
    <div className="space-y-4">
      <MetricCard
        title="Active Connections"
        value={connections ?? 0}
        subtitle="WebSocket chat sessions"
        icon={Activity}
        color="sky"
      />
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">System Uptime</p>
        <p className="text-2xl font-bold text-slate-100">{formatUptime(uptime)}</p>
      </div>
    </div>
  );
}
