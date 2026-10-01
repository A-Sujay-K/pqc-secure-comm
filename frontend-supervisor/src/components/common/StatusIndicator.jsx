import React from 'react';

const StatusIndicator = ({ status, label }) => {
  // status: 'good', 'warning', 'critical', 'offline'
  
  const colors = {
    good: 'bg-health-good shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    warning: 'bg-health-warning shadow-[0_0_8px_rgba(249,115,22,0.8)]',
    critical: 'bg-health-critical shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    offline: 'bg-slate-600',
  };
  
  const pulseClass = status === 'good' ? 'animate-pulse' : '';

  return (
    <div className="flex items-center gap-2 group relative">
      <div className={`w-2.5 h-2.5 rounded-full ${colors[status]} ${pulseClass}`}></div>
      {label && <span className="text-sm text-slate-300 font-medium">{label}</span>}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-700 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Status: {status.toUpperCase()}
      </div>
    </div>
  );
};

export default StatusIndicator;
