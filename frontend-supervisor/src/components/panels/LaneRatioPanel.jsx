import React from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import ArcGauge from '../charts/ArcGauge';
import NumeralDisplay from '../common/NumeralDisplay';
import { GitCommit } from 'lucide-react';

/**
 * LaneRatioPanel — Gauge 2 of Row 1 (Reference B style)
 * 240° arc gauge displaying PQC Lane Routing Ratio (% routed via ML-KEM-768).
 */
const LaneRatioPanel = () => {
  const { isReady, kpi } = useDashboardState();

  if (!isReady || !kpi) return null;

  const stdPct = parseFloat(kpi.standardLanePct) || 75.0;
  const critPct = parseFloat(kpi.criticalLanePct) || 25.0;

  return (
    <div className="glass-l1 p-4 sm:p-5 flex flex-col h-full relative overflow-hidden border border-[var(--edge-rest)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
            <GitCommit size={13} strokeWidth={1.8} />
          </div>
          <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
            Lane Ratio (ML-KEM vs BB84 QKD)
          </h2>
        </div>
      </div>

      {/* Legend Bullets */}
      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-2 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-standard)]" />
          <span>{stdPct.toFixed(1)}% ML-KEM</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-critical)]" />
          <span>{critPct.toFixed(1)}% BB84 QKD</span>
        </span>
      </div>

      {/* Main 240° Arc Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 py-1">
        <ArcGauge
          value={stdPct}
          max={100}
          unit="%"
          status="ML-KEM-768"
          trend={stdPct >= 50 ? 'up' : 'down'}
          decimals={1}
          className="h-full"
        />
      </div>

      {/* Bottom Summary Strip */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--edge-rest)] shrink-0 text-xs font-sans">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[var(--text-secondary)] truncate">Total messages</span>
          <div className="mt-0.5">
            <NumeralDisplay value={kpi.totalMessages} unit="" decimals={0} size="sm" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[var(--text-secondary)] truncate">Standard ML-KEM</span>
          <div className="mt-0.5">
            <NumeralDisplay value={stdPct} unit="%" decimals={1} size="sm" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[var(--text-secondary)] truncate">Critical BB84 QKD</span>
          <div className="mt-0.5">
            <NumeralDisplay value={critPct} unit="%" decimals={1} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaneRatioPanel;