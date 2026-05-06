import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#6366f1'];

export default function RoutingPanel({ data }) {
  const chartData = [
    { name: 'Standard Lane', value: data?.standard_lane_count ?? 0 },
    { name: 'Critical Lane', value: data?.critical_lane_count ?? 0 },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-xl">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Lane Routing</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
               paddingAngle={4} dataKey="value">
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 text-center mt-2">
        Total: {data?.total_messages ?? 0} messages processed
      </p>
    </div>
  );
}
