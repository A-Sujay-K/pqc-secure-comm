import React from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import KeyPoolGauge from '../charts/KeyPoolGauge';
import { Key } from 'lucide-react';

const KeyPoolPanel = () => {
  const { snapshot, alerts } = useDashboardState();
  
  if (!snapshot) return null;
  const { key_pool } = snapshot;

  return (
    <div className={`glass-panel p-5 flex flex-col h-full relative overflow-hidden ${alerts.keyPoolLow ? 'border-health-warning/50' : ''}`}>
      {alerts.keyPoolLow && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-health-warning/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      )}
      
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
        <Key size={16} className="text-qkd" /> QKD Key Pool
      </h2>
      
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
        <div className="w-full h-full max-h-[220px]">
          <KeyPoolGauge 
            available={key_pool.available} 
            max={key_pool.capacity || 20} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-dark-700/50">
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Availability a(t)</div>
          <div className="text-base font-mono text-qkd mt-1">
            {key_pool.availability_ratio != null ? `${(key_pool.availability_ratio * 100).toFixed(0)}%` : '100%'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Gen Rate</div>
          <div className="text-base font-mono text-white mt-1">{key_pool.generation_rate.toFixed(1)} <span className="text-[10px] text-slate-500">/m</span></div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Consumed</div>
          <div className="text-base font-mono text-white mt-1">{key_pool.consumed}</div>
        </div>
      </div>
    </div>
  );
};

export default KeyPoolPanel;
