import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800/90 border border-dark-700 p-3 rounded shadow-lg backdrop-blur">
        <p className="text-slate-300 text-sm font-mono mb-2">{label}</p>
        <div className="flex items-center gap-2 text-sm font-mono">
          <div className="w-2 h-2 rounded-full bg-queue"></div>
          <span className="text-slate-400">Queue Depth:</span>
          <span className="text-white font-bold">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const QueueDepthChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#10b981" strokeOpacity={0.5} strokeDasharray="3 3" />
        <Line 
          type="stepAfter" 
          dataKey="queueDepth" 
          stroke="#7c3aed" 
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default QueueDepthChart;
