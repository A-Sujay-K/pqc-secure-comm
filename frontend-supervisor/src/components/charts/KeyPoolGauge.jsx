import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const KeyPoolGauge = ({ available, max = 20 }) => {
  // Determine color based on availability
  let fillColor = '#10b981'; // health.good
  if (available <= 5 && available > 0) fillColor = '#f97316'; // health.warning
  if (available === 0) fillColor = '#ef4444'; // health.critical

  const data = [
    {
      name: 'Available Keys',
      value: Math.min((available / max) * 100, 100), // Cap at 100%
      fill: fillColor,
    }
  ];

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="90%" 
          barSize={15} 
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            minAngle={15}
            background={{ fill: '#1a1a2e' }}
            clockWise
            dataKey="value"
            cornerRadius={10}
            isAnimationActive={true}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center -mt-6">
        <span className="text-4xl font-mono font-bold text-white shadow-glow">{available}</span>
        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Ready</span>
      </div>
    </div>
  );
};

export default KeyPoolGauge;
