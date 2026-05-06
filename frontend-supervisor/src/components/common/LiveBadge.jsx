import React from 'react';

export default function LiveBadge({ isLive }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                     ${isLive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
      <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
      {isLive ? 'LIVE' : 'DISCONNECTED'}
    </div>
  );
}
