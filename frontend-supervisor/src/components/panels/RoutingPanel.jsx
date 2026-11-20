import React, { useRef, useMemo } from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import { GitMerge, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

/**
 * RoutingPanel — SUPERVISOR App (Reference B style)
 * Clean tabular live routing feed with sender avatars, lane seal glyphs,
 * quiet threat pips, and deduplicated rows. Supports lane filtering.
 */
const RoutingPanel = ({ filterLane }) => {
  const { events, laneFilter: contextLaneFilter } = useDashboardState();
  const listRef = useRef(null);

  const activeFilter = filterLane || contextLaneFilter || 'all';

  // Helper to extract clean initials from sender
  const getInitials = (sender) => {
    if (!sender) return 'TX';
    const clean = sender.replace(/^@/, '').trim();
    if (clean.length === 0) return 'TX';
    const parts = clean.split(/[._\-\s]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Deduplicate routing events by message_id or event_id and apply laneFilter
  const routingEvents = useMemo(() => {
    const rawEvents = (events || []).filter((e) => e.event_type === 'routing_decision');
    const seen = new Set();
    const unique = [];

    for (const evt of rawEvents) {
      const msgId = evt.payload?.message_id || evt.event_id || `${evt.timestamp}-${evt.payload?.sender_id}`;
      if (!seen.has(msgId)) {
        seen.add(msgId);
        if (activeFilter === 'all' || evt.payload?.lane === activeFilter) {
          unique.push(evt);
        }
      }
    }

    return unique.slice(0, 50);
  }, [events, activeFilter]);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-[var(--edge-rest)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
            <GitMerge size={13} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
              Live Routing Feed
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)] font-sans">
              In-flight packet routing &amp; lane policy decisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-sans">
          {activeFilter !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] capitalize">
              {activeFilter} Lane
            </span>
          )}
          <span className="text-[var(--text-tertiary)]">
            {routingEvents.length} events logged
          </span>
        </div>
      </div>

      {/* Column Table Headers — Sentence Case, muted, normal tracking */}
      <div className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-2 bg-[var(--surface-inner)] border-b border-[var(--edge-rest)] text-xs font-sans font-normal text-[var(--text-secondary)] shrink-0">
        <div className="col-span-3 sm:col-span-2">Time</div>
        <div className="col-span-3 sm:col-span-3">Sender</div>
        <div className="col-span-3 sm:col-span-3">Assigned lane</div>
        <div className="col-span-3 sm:col-span-2 text-right sm:text-left">Threat score</div>
        <div className="hidden sm:block sm:col-span-2 text-right">Status</div>
      </div>

      {/* Event Rows List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1" ref={listRef}>
        {routingEvents.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] font-sans text-xs gap-1.5 select-none">
            <GitMerge size={20} className="opacity-25 text-[var(--text-tertiary)]" />
            <span className="text-[var(--text-secondary)]">
              {activeFilter === 'all' ? 'Awaiting message traffic...' : `No events found for ${activeFilter} lane`}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)]">Routing decisions will stream here live</span>
          </div>
        ) : (
          routingEvents.map((evt, idx) => {
            const p = evt.payload || {};
            const isCritical = p.lane === 'critical';
            const threatScore = p.threat_score != null ? Number(p.threat_score).toFixed(2) : '0.00';
            const isHighThreat = p.threat_score >= 0.70;
            let normalizedTs = evt.timestamp;
            if (typeof normalizedTs === 'string' && !normalizedTs.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(normalizedTs)) {
              normalizedTs = normalizedTs + 'Z';
            }
            const displayTime = new Date(normalizedTs).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });

            const senderName = p.sender_id || 'User';
            const initials = getInitials(senderName);
            const shortId = p.message_id
              ? p.message_id.substring(0, 8)
              : evt._id
              ? `#${evt._id.slice(-6)}`
              : senderName;

            return (
              <div
                key={p.message_id || `${evt.timestamp}-${idx}`}
                className="grid grid-cols-12 gap-2 items-center px-2.5 py-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors border border-transparent hover:border-[var(--edge-rest)] text-xs font-sans"
              >
                {/* Time (Unified 24h format) */}
                <div className="col-span-3 sm:col-span-2 text-[11px] text-[var(--text-secondary)] font-mono tabular-nums">
                  {displayTime}
                </div>

                {/* Sender with Monogram Avatar */}
                <div className="col-span-3 sm:col-span-3 flex items-center gap-2 min-w-0" title={p.message_id || p.sender_id}>
                  <div className="w-5 h-5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[9px] font-sans font-medium text-[var(--text-secondary)] shrink-0">
                    {initials}
                  </div>
                  <span className="text-[var(--text-primary)] truncate font-sans text-xs font-medium">
                    {senderName}
                  </span>
                </div>

                {/* Assigned Lane */}
                <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isCritical ? 'bg-[var(--col-critical)]' : 'bg-[var(--col-standard)]'
                    }`}
                  />
                  <span className="font-sans text-xs text-[var(--text-secondary)]">
                    {isCritical ? 'Critical' : 'Standard'}
                  </span>
                </div>

                {/* Threat Score (Q_TL) */}
                <div className="col-span-3 sm:col-span-2 text-right sm:text-left font-mono tabular-nums text-xs">
                  <span className={isHighThreat ? 'text-[var(--col-critical)] font-medium' : 'text-[var(--text-secondary)]'}>
                    {threatScore}
                  </span>
                </div>

                {/* Verification Status */}
                <div className="hidden sm:flex sm:col-span-2 items-center justify-end gap-1 text-[11px] text-[var(--text-secondary)]">
                  <CheckCircle2 size={12} className="text-[var(--col-verified)]" />
                  <span>Verified</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoutingPanel;
