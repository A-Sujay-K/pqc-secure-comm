import React from 'react';
import MetricCard from '../common/MetricCard';
import { Key } from 'lucide-react';

export default function KeyPoolPanel({ data }) {
  const utilization = data
    ? Math.round((data.consumed / Math.max(data.total_generated, 1)) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <MetricCard
        title="QKD Key Pool"
        value={data?.available ?? 0}
        subtitle={`${data?.consumed ?? 0} consumed of ${data?.total_generated ?? 0} generated`}
        icon={Key}
        color="indigo"
      />
      {/* Pool utilization bar */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Pool Utilization</span>
          <span>{utilization}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${utilization}%`,
              backgroundColor: utilization > 80 ? '#ef4444' : utilization > 60 ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Generation rate: {data?.generation_rate ?? 6} keys/min
        </p>
      </div>
    </div>
  );
}
