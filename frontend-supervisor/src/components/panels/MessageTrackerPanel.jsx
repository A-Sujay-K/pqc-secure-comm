import React from 'react';
import { MessageSquare, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function MessageTrackerPanel({ routing }) {
  const total = routing?.total_messages ?? 0;
  const standard = routing?.standard_lane_count ?? 0;
  const critical = routing?.critical_lane_count ?? 0;
  const stdPct = total > 0 ? Math.round((standard / total) * 100) : 0;
  const critPct = total > 0 ? Math.round((critical / total) * 100) : 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-slate-400" />
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Message Tracker</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-sm text-slate-300">Standard Lane</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-100">{standard}</span>
            <span className="text-xs text-slate-500 ml-1">({stdPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-indigo-400" />
            <span className="text-sm text-slate-300">Critical Lane</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-100">{critical}</span>
            <span className="text-xs text-slate-500 ml-1">({critPct}%)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Messages</span>
            <span className="text-sm font-bold text-slate-100">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
