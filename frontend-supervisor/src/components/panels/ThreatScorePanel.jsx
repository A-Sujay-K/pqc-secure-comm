import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Shield } from 'lucide-react';

function getThreatColor(score) {
  if (score >= 0.7) return '#ef4444';
  if (score >= 0.4) return '#f59e0b';
  return '#10b981';
}

export default function ThreatScorePanel({ avgThreat = 0 }) {
  const pct = Math.round(avgThreat * 100);
  const color = getThreatColor(avgThreat);

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-slate-400" />
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Threat Score</p>
      </div>
      <div className="relative h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="100%" innerRadius="60%" outerRadius="90%"
                          startAngle={180} endAngle={0} data={[{ value: pct, fill: color }]}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#1e293b' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
          <p className="text-3xl font-bold" style={{ color }}>{pct}%</p>
          <p className="text-xs text-slate-400">Q_TL score</p>
        </div>
      </div>
    </div>
  );
}
