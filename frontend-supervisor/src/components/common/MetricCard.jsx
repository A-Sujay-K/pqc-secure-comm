import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const COLOR_MAP = {
    indigo: 'text-indigo-400 bg-indigo-400/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    red: 'text-red-400 bg-red-400/10',
    sky: 'text-sky-400 bg-sky-400/10',
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-100 mt-1">{value ?? '—'}</p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${COLOR_MAP[color] || COLOR_MAP.indigo}`}>
            <Icon size={20} className={COLOR_MAP[color]?.split(' ')[0]} />
          </div>
        )}
      </div>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      {trend !== undefined && (
        <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}% from last snapshot
        </p>
      )}
    </div>
  );
}
