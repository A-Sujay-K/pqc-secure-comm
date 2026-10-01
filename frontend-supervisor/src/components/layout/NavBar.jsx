import React, { useState, useEffect } from 'react';
import { Shield, Clock } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';
import { useDashboardState } from '../../hooks/useDashboardState';

const formatUptime = (seconds) => {
  if (!seconds) return '00:00:00';
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

const NavBar = () => {
  const { isConnected, isReady, kpi } = useDashboardState();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 glass-panel border-b border-t-0 border-x-0 border-dark-700/50 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="text-pqc-glow">
          <Shield size={28} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wider text-white">PQC SECURE COMM</h1>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Command Center</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 bg-dark-800/50 px-4 py-1.5 rounded-full border border-dark-700">
          <Clock size={16} className="text-slate-400" />
          <span className="font-mono text-sm text-slate-300">
            {time.toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-dark-800/50 px-4 py-1.5 rounded-full border border-dark-700">
          <span className="text-xs text-slate-400 uppercase">Uptime</span>
          <span className="font-mono text-sm text-pqc">
            {isReady ? formatUptime(kpi.uptime) : '00:00:00'}
          </span>
        </div>

        <LiveBadge isLive={isConnected} />
      </div>
    </header>
  );
};

export default NavBar;
