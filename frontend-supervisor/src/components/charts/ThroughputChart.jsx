import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800/90 border border-dark-700 p-3 rounded shadow-lg backdrop-blur">
        <p className="text-slate-300 text-sm font-mono mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm font-mono">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ThroughputChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3c" vertical={false} />
        <XAxis 
          dataKey="time" 
          stroke="#64748b" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          minTickGap={30}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1a1a2e' }} />
        <Bar 
          dataKey="standard" 
          name="Standard" 
          stackId="a" 
          fill="#0ea5e9" 
          radius={[0, 0, 4, 4]}
          isAnimationActive={false}
        />
        <Bar 
          dataKey="critical" 
          name="Critical" 
          stackId="a" 
          fill="#f59e0b" 
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ThroughputChart;
