import React from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import QueueDepthChart from '../charts/QueueDepthChart';
import { Layers } from 'lucide-react';

const QueuePanel = () => {
  const { snapshot, chartData, alerts } = useDashboardState();
  
  if (!snapshot) return null;
  const { queue } = snapshot;

  return (
    <div className={`glass-panel p-5 flex flex-col h-full relative overflow-hidden ${alerts.queueGrowing ? 'border-queue/50' : ''}`}>
      {alerts.queueGrowing && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-queue/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Layers size={16} className="text-queue" /> Priority Queue
        </h2>
        
        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase">Current Depth</div>
          <div className={`text-2xl font-mono font-bold ${queue.depth > 0 ? 'text-queue' : 'text-slate-300'}`}>
            {queue.depth}
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 -ml-4">
        <QueueDepthChart data={chartData?.timeSeries || []} />
      </div>
      
      <div className="mt-2 pt-3 border-t border-dark-700/50 flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-400 uppercase">Oldest Entry</span>
          <div className="font-mono text-white text-sm">
            {queue.oldest_entry_age_seconds ? `${queue.oldest_entry_age_seconds.toFixed(1)}s` : '0.0s'}
          </div>
        </div>
        <div className="text-right">
          <span className="text-slate-400 uppercase">Deadline</span>
          <div className="font-mono text-pqc text-sm">
            {queue.deadline_seconds ? `${queue.deadline_seconds.toFixed(1)}s` : '5.0s'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueuePanel;
