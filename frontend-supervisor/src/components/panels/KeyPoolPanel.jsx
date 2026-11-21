import React from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import KeyPoolGauge from '../charts/KeyPoolGauge';
import NumeralDisplay from '../common/NumeralDisplay';
import { Key } from 'lucide-react';

/**
 * KeyPoolPanel — SUPERVISOR App (Reference B style)
 * Gauge 1 of Row 1: QKD Entropy Pool with 240° arc gauge and quiet legend.
 */
const KeyPoolPanel = () => {
  const { isReady, kpi, alerts } = useDashboardState();

  if (!isReady || !kpi) return null;

  return (
    <div
      className={`glass-l1 p-4 sm:p-5 flex flex-col h-full relative overflow-hidden transition-colors border ${
        alerts.keyPoolEmpty
          ? 'border-[var(--col-danger)]/50'
          : alerts.keyPoolLow
          ? 'border-[var(--col-critical)]/50'
          : 'border-[var(--edge-rest)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
            <Key size={13} strokeWidth={1.8} />
          </div>
          <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
            BB84 QKD Entropy Pool
          </h2>
        </div>
      </div>

      {/* Legend Bullets (Reference B style) */}
      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-2 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-standard)]" />
          <span>{kpi.keyPoolAvailable?.toLocaleString() ?? 0} Available</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
          <span>{kpi.genRate ?? 0}/min</span>
        </span>
      </div>

      {/* Main 240° Arc Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 py-1">
        <KeyPoolGauge
          available={kpi.keyPoolAvailable}
          capacity={kpi.keyPoolCapacity}
          isSimulated={true}
        />
      </div>

      {/* Bottom Summary Strip */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--edge-rest)] shrink-0 text-xs font-sans">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[var(--text-secondary)] truncate">Avail. ratio</span>
          <div className="mt-0.5">
            <NumeralDisplay value={kpi.availabilityPercent} unit="%" decimals={0} size="sm" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[var(--text-secondary)] truncate">Gen rate</span>
          <div className="mt-0.5">
            <NumeralDisplay value={kpi.genRate} unit="/min" decimals={1} size="sm" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[var(--text-secondary)] truncate">Consumed</span>
          <div className="mt-0.5">
            <NumeralDisplay value={kpi.keyPoolConsumed} unit="keys" decimals={0} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyPoolPanel;