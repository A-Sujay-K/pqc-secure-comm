import React, { useState } from 'react';
import { useDashboardState } from '../hooks/useDashboardState';
import KeyPoolPanel from '../components/panels/KeyPoolPanel';
import LaneRatioPanel from '../components/panels/LaneRatioPanel';
import DeliveryIntegrityPanel from '../components/panels/DeliveryIntegrityPanel';
import ThreatScorePanel from '../components/panels/ThreatScorePanel';
import QueuePanel from '../components/panels/QueuePanel';
import RoutingPanel from '../components/panels/RoutingPanel';
import ThreatFeedCard from '../components/panels/ThreatFeedCard';
import SystemHealthPanel from '../components/panels/SystemHealthPanel';
import CryptographicProcessPanel from '../components/panels/CryptographicProcessPanel';
import { Lock, ChevronDown, ChevronUp, Filter, RefreshCw, Pause, Play, Radio } from 'lucide-react';

/**
 * DashboardPage — SUPERVISOR App (Reference B style)
 * Quiet, premium frosted glass command center with:
 * 1. Hero Title: clamp(48px, 6vw, 88px) weight 300 "Command Center"
 * 2. Two-Column Layout:
 *    - Left Column (~33%): Active Threat & In-Flight Alerts feed + System Health
 *    - Right Column (~67%):
 *      - Row 1: Three 240° Arc Gauges (Entropy Pool, Lane Ratio, Delivery Integrity)
 *      - Row 2: Two Line Charts (Threat Score Timeline, Buffer & Latency)
 *      - Row 3: Live Routing Feed
 * 3. Lower Deck: Collapsible Cryptographic Process Inspector
 */
const DashboardPage = () => {
  const {
    isReady,
    isConnected,
    isPaused,
    togglePause,
    refetchSnapshot,
    laneFilter,
    setLaneFilter,
  } = useDashboardState();
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cycleLaneFilter = () => {
    if (laneFilter === 'all') setLaneFilter('standard');
    else if (laneFilter === 'standard') setLaneFilter('critical');
    else setLaneFilter('all');
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (refetchSnapshot) {
      await refetchSnapshot();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 p-8 rounded-2xl glass-l2 border border-[var(--edge-rest)] text-center select-none">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--col-standard)] border-t-transparent animate-spin" />
          <p className="text-sm font-sans tracking-wide text-[var(--text-primary)] font-medium">
            Establishing telemetry link...
          </p>
          <span className="text-xs font-sans text-[var(--text-tertiary)]">
            Connecting to WSS /ws/telemetry &amp; snapshot API
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16 pt-2 select-none">
      {/* 1. HERO HEADER (Reference B style: huge title, weight 300, quiet subtitle, action pills) */}
      <section aria-label="Hero Title & Navigation" className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-sans text-[var(--text-tertiary)] tracking-normal">
            Aggregated Client Metrics
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-light text-[var(--text-primary)] tracking-tight leading-tight mt-0.5">
            PQCHS Dashboard
          </h1>
          <p className="text-xs sm:text-[13px] font-normal text-[var(--text-secondary)] font-sans mt-1">
            Aggregated PQC routing &amp; entropy metrics across all cryptographic endpoints
          </p>
        </div>

        {/* Action Pills below Hero (Reference B search/filter pills) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Lane Filter Pill (Cycles: All Lanes -> Standard -> Critical) */}
          <button
            type="button"
            onClick={cycleLaneFilter}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full btn-glass text-xs font-sans transition-all ${
              laneFilter !== 'all' ? 'border-[var(--edge-selected)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Click to cycle lane filter: All -> Standard -> Critical"
          >
            <Filter size={12} className="text-[var(--text-secondary)]" />
            <span className="flex items-center gap-1.5">
              {laneFilter === 'all' && <span>All Lanes</span>}
              {laneFilter === 'standard' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-standard)]" />
                  <span>Standard Lane</span>
                </>
              )}
              {laneFilter === 'critical' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-critical)]" />
                  <span>Critical Lane</span>
                </>
              )}
            </span>
          </button>

          {/* Live vs Paused Real-time Toggle */}
          <button
            type="button"
            onClick={togglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full btn-glass text-xs font-sans transition-all ${
              isPaused ? 'border-[var(--edge-selected)] text-[var(--col-critical)] font-medium' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={isPaused ? 'Telemetry paused. Click to resume live stream' : 'Streaming live. Click to pause telemetry stream'}
          >
            {isPaused ? (
              <>
                <Pause size={11} className="text-[var(--col-critical)]" />
                <span>Paused (Stream Frozen)</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--col-verified)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--col-verified)]" />
                </span>
                <span>Live (Real-time)</span>
              </>
            )}
          </button>

          {/* Snapshot Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className={`p-2 rounded-full btn-glass text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh snapshot telemetry"
            aria-label="Refresh snapshot telemetry"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </section>

      {/* 2. TWO-COLUMN LAYOUT (Reference B style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column (~33% on desktop: AI / Threat intelligence card + System Health) */}
        <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
          <div className="min-h-[420px]">
            <ThreatFeedCard />
          </div>

          <div className="glass-l1 p-4 sm:p-5 flex flex-col overflow-hidden border border-[var(--edge-rest)]">
            <SystemHealthPanel />
          </div>
        </div>

        {/* Right Column (~67% on desktop: Core Visual Center) */}
        <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6 min-w-0">
          {/* ROW 1: THREE 240° ARC GAUGES (Reference B style) */}
          <section aria-label="Core Performance Gauges">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 min-h-[280px]">
              <KeyPoolPanel />
              <LaneRatioPanel />
              <DeliveryIntegrityPanel />
            </div>
          </section>

          {/* ROW 2: TWO LINE CHARTS (Reference B style: Threat Timeline & Buffer Latency) */}
          <section aria-label="Trend Line Charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 min-h-[290px]">
              <ThreatScorePanel />
              <QueuePanel />
            </div>
          </section>

          {/* ROW 3: LIVE ROUTING FEED (Reference B style table rows) */}
          <section aria-label="Live Routing Feed">
            <div className="glass-l1 overflow-hidden min-h-[320px] max-h-[380px] border border-[var(--edge-rest)]">
              <RoutingPanel />
            </div>
          </section>
        </div>
      </div>

      {/* 3. LOWER DECK: Collapsible Cryptographic Process Inspector (Reference B style) */}
      <section aria-label="Cryptographic Process Inspector" className="mt-2">
        <div className="glass-l1 overflow-hidden border border-[var(--edge-rest)]">
          {/* Collapsible Bar Header */}
          <button
            type="button"
            onClick={() => setInspectorOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[var(--surface-elevated)] transition-colors select-none text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                <Lock size={14} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                  Cryptographic Process Inspector &amp; Key Vault
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] font-sans hidden sm:block truncate">
                  Real-time lattice encapsulation · decapsulation · signature verification · timing breakdown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 text-[10px] font-sans text-[var(--text-tertiary)]">
                <span className="px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
                  ML-KEM-768
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
                  BB84 QKD
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
                  ML-DSA-65
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
                  AES-256-GCM
                </span>
              </div>
              <div className="p-1 rounded-full text-[var(--text-secondary)]">
                {inspectorOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          {/* Expanded Deck View */}
          {inspectorOpen && (
            <div className="border-t border-[var(--edge-rest)] h-[560px] overflow-hidden animate-enter">
              <CryptographicProcessPanel />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
