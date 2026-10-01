import React from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import StatusIndicator from '../common/StatusIndicator';

const SystemHealthPanel = () => {
  const { isConnected, snapshot } = useDashboardState();

  const getStatus = (condition) => condition ? 'good' : 'critical';

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-dark-800 rounded border border-dark-700">
          <span className="text-sm text-slate-300 font-mono">Telemetry WSS</span>
          <StatusIndicator status={getStatus(isConnected)} />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-dark-800 rounded border border-dark-700">
          <span className="text-sm text-slate-300 font-mono">Active Conn.</span>
          <span className="font-mono text-white font-bold">{snapshot?.active_connections || 0}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-dark-800 rounded border border-dark-700">
          <span className="text-sm text-slate-300 font-mono">Backend API</span>
          <StatusIndicator status={getStatus(snapshot !== null)} />
        </div>
      </div>
      
      <div className="mt-4 p-4 rounded bg-dark-900 border border-dark-700 text-center">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Supervisor Status</div>
        <div className="text-health-good font-mono text-sm animate-pulse">NOMINAL</div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;
