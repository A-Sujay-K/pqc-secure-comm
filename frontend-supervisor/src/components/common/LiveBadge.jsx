import React from 'react';

const LiveBadge = ({ isLive }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded border ${isLive ? 'bg-health-good/10 border-health-good/30' : 'bg-health-critical/10 border-health-critical/30'}`}>
      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-health-good shadow-[0_0_8px_rgba(0,255,136,0.8)] animate-pulse' : 'bg-health-critical'}`}></div>
      <span className={`text-xs font-bold tracking-widest ${isLive ? 'text-health-goodGlow' : 'text-health-critical'}`}>
        {isLive ? 'LIVE' : 'OFFLINE'}
      </span>
    </div>
  );
};

export default LiveBadge;
