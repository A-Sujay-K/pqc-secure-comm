import React from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import ThreatHeatmap from '../charts/ThreatHeatmap';
import { ShieldAlert } from 'lucide-react';

const ThreatScorePanel = () => {
  const { snapshot, chartData, alerts } = useDashboardState();
  
  if (!snapshot) return null;
  const { routing } = snapshot;

  return (
    <div className={`glass-panel p-5 flex flex-col h-full relative overflow-hidden ${alerts.highThreat ? 'border-health-warning/50' : ''}`}>
      {alerts.highThreat && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-health-warning/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert size={16} className="text-health-warning" /> Threat Analysis
        </h2>
        
        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase">Avg Q_TL</div>
          <div className={`text-2xl font-mono font-bold ${routing.avg_threat_score > 0.7 ? 'text-health-critical' : 'text-slate-300'}`}>
            {routing.avg_threat_score?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 -ml-2 -mb-2">
         <ThreatHeatmap data={chartData?.threatScatter || []} threshold={0.7} />
      </div>
    </div>
  );
};

export default ThreatScorePanel;
