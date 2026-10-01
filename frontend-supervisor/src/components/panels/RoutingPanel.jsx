import React, { useRef, useEffect } from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import { GitMerge, AlertTriangle } from 'lucide-react';

const RoutingPanel = () => {
  const { events } = useDashboardState();
  const listRef = useRef(null);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events]);

  const routingEvents = events.filter(e => e.event_type === 'routing_decision').slice(0, 50);

  return (
    <div className="flex flex-col h-full bg-dark-900/50 relative">
      <div className="p-4 border-b border-dark-700/80 bg-dark-800/80 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <GitMerge size={16} className="text-pqc" /> Live Routing Feed
        </h2>
        <div className="text-xs text-slate-500 font-mono">{routingEvents.length} events logged</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1" ref={listRef}>
        {routingEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            Waiting for telemetry data...
          </div>
        ) : (
          routingEvents.map((evt, idx) => (
            <div key={`${evt.timestamp}-${idx}`} className="flex items-center gap-4 p-2.5 rounded hover:bg-dark-700/50 transition-colors border border-transparent hover:border-dark-700">
              <div className="w-24 shrink-0 text-xs text-slate-500 font-mono">
                {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}
              </div>
              
              <div className="w-48 shrink-0 text-sm font-mono truncate text-slate-300">
                {evt.payload.sender_id || evt.payload.message_id?.substring(0,8)}
              </div>
              
              <div className="w-24 shrink-0">
                {evt.payload.lane === 'critical' ? (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-qkd/10 text-qkd border border-qkd/30 flex items-center gap-1 w-fit">
                    CRITICAL
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-pqc/10 text-pqc border border-pqc/30 flex items-center gap-1 w-fit">
                    STANDARD
                  </span>
                )}
              </div>
              
              <div className="w-24 shrink-0 text-xs font-mono">
                Q_TL: <span className={evt.payload.threat_score > 0.7 ? 'text-health-critical' : 'text-slate-300'}>{evt.payload.threat_score?.toFixed(2)}</span>
              </div>
              
              <div className="flex-1 flex justify-end">
                {evt.payload.queued && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-queue/20 text-queue border border-queue/40">
                    QUEUED
                  </span>
                )}
                {!evt.payload.queued && evt.payload.threat_score > 0.7 && evt.payload.lane === 'standard' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-health-warning/20 text-health-warning flex items-center gap-1">
                    <AlertTriangle size={10} /> FORCE DOWNGK
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoutingPanel;
