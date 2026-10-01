import React from 'react';

const MetricCard = ({ title, value, icon: Icon, trend, trendUp, colorClass = "text-white" }) => {
  return (
    <div className="glass-panel-glow p-5 flex flex-col justify-between h-full group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon size={18} className="text-slate-400" />}
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
      </div>
      
      <div className="flex items-end justify-between mt-auto">
        <div className={`text-4xl font-mono font-bold ${colorClass}`}>
          {value}
        </div>
        
        {trend && (
          <div className={`text-xs flex items-center font-mono ${trendUp ? 'text-health-good' : 'text-health-critical'}`}>
            {trendUp ? '▲' : '▼'} {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
