import React, { useState } from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import { ShieldAlert, ShieldCheck, Activity, Sliders, RefreshCw, Radio } from 'lucide-react';
import PolicyOverrideModal from './PolicyOverrideModal';

/**
 * ThreatFeedCard — Left Column of Reference B Layout
 * Displays active threat feed, alerts, recent packet audits, and quick lane controls.
 */
const ThreatFeedCard = () => {
  const { events, kpi, isConnected, refetchSnapshot, policyConfig } = useDashboardState();
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const recentEvents = (events || [])
    .filter(e => e.event_type === 'routing_decision' || e.event_type === 'threat_alert' || (e.payload && e.payload.threat_score != null))
    .slice(0, 8);

  const getMonogram = (senderId = '') => {
    if (!senderId) return 'SYS';
    const s = senderId.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return s.slice(0, 2) || 'PK';
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (refetchSnapshot) {
      await refetchSnapshot();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const isForced = policyConfig?.mode && policyConfig.mode !== 'adaptive';

  return (
    <>
      <div className="glass-l1 p-4 sm:p-5 flex flex-col h-full relative overflow-hidden border border-[var(--edge-rest)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--edge-rest)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--col-standard)]">
              <Radio size={14} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
                Routing Intelligence
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                Real-time threat heuristics &amp; lane policy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isForced && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--col-critical)]">
                Override
              </span>
            )}
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-sans bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[var(--col-verified)]' : 'bg-[var(--text-tertiary)]'}`} />
              <span>{isConnected ? 'Active' : 'Offline'}</span>
            </span>
          </div>
        </div>

        {/* Events / Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {recentEvents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[var(--text-secondary)] font-sans">
              <Activity size={18} className="opacity-40 mb-2 text-[var(--text-tertiary)]" />
              <span>No critical alerts detected</span>
              <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5">All packets routed within nominal bounds</span>
            </div>
          ) : (
            recentEvents.map((evt, idx) => {
              const p = evt.payload || {};
              const isCritical = p.lane === 'critical' || (p.threat_score != null && p.threat_score >= (policyConfig?.threshold ?? 0.70));
              const sender = p.sender_id || p.sender || 'alice';
              let normalizedTs = evt.timestamp;
              if (typeof normalizedTs === 'string' && !normalizedTs.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(normalizedTs)) {
                normalizedTs = normalizedTs + 'Z';
              }
              const displayTime = new Date(normalizedTs).toLocaleTimeString([], {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={evt.event_id || `${evt.timestamp}-${idx}`}
                  className="p-2.5 rounded-2xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] hover:border-[var(--edge-hover)] transition-all flex items-start gap-3 select-none"
                >
                  {/* Monogram Avatar */}
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 border border-[var(--edge-rest)] ${
                      isCritical 
                        ? 'bg-[var(--col-critical)]/10 text-[var(--col-critical)]' 
                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {getMonogram(sender)}
                  </div>

                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                        @{sender}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono shrink-0">
                        {displayTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] leading-tight truncate">
                      {p.message || (isCritical ? 'High threat detected; routed to Critical BB84 QKD' : 'Nominal packet verified under ML-KEM-768')}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className={`inline-flex items-center gap-1 ${isCritical ? 'text-[var(--col-critical)]' : 'text-[var(--text-tertiary)]'}`}>
                        {isCritical ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
                        <span>{isCritical ? 'Critical Lane' : 'Standard Lane'}</span>
                      </span>

                      {p.threat_score != null && (
                        <span className="font-mono text-[var(--text-tertiary)]">
                          Q_TL: {Number(p.threat_score).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Action Pills Below Left Feed (Reference B style) */}
        <div className="pt-3 mt-3 border-t border-[var(--edge-rest)] flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsOverrideOpen(true)}
            className={`flex-1 py-1.5 px-2.5 rounded-full btn-glass text-xs font-sans flex items-center justify-center gap-1.5 transition-all ${
              isForced ? 'border-[var(--edge-selected)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Configure lane policy & threat threshold"
          >
            <Sliders size={12} className="text-[var(--text-secondary)]" />
            <span className="truncate">Policy Override</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className={`p-1.5 rounded-full btn-glass text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shrink-0 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh telemetry snapshot"
            aria-label="Refresh telemetry snapshot"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Policy Override Modal */}
      <PolicyOverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
      />
    </>
  );
};

export default ThreatFeedCard;
