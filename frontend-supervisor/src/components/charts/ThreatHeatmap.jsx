import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-dark-800/90 border border-dark-700 p-3 rounded shadow-lg backdrop-blur">
        <p className="text-slate-300 text-sm font-mono mb-2">{data.displayTime}</p>
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-slate-400">Score:</span>
          <span className={`font-bold ${data.score > 0.7 ? 'text-health-critical' : 'text-slate-300'}`}>
            {data.score.toFixed(3)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono mt-1">
          <span className="text-slate-400">Lane:</span>
          <span className={`font-bold ${data.lane === 'critical' ? 'text-qkd' : 'text-pqc'}`}>
            {data.lane.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const ThreatHeatmap = ({ data, threshold = 0.7 }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3c" />
        <XAxis 
          type="number" 
          dataKey="time" 
          domain={['dataMin', 'dataMax']} 
          name="Time" 
          tick={false}
          axisLine={false}
        />
        <YAxis 
          type="number" 
          dataKey="score" 
          domain={[0, Math.max(1.5, ...data.map(d => d.score))]} 
          name="Q_TL Score" 
          stroke="#64748b"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <ZAxis type="number" range={[20, 20]} />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Threshold', fill: '#ef4444', fontSize: 10 }} />
        <Scatter name="Threat Scores" data={data} isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.lane === 'critical' ? '#f59e0b' : '#0ea5e9'} 
              opacity={entry.score > threshold ? 1 : 0.6}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ThreatHeatmap;
