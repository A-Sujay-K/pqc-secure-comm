import React from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import ThreatHeatmap from '../charts/ThreatHeatmap';
import NumeralDisplay from '../common/NumeralDisplay';
import { ShieldAlert } from 'lucide-react';

/**
 * ThreatScorePanel — SUPERVISOR App (Reference B style)
 * Line Chart 1 of Row 2: Threat Score Timeline smooth spline.
 */
const ThreatScorePanel = () => {
  const { isReady, kpi, chartData, alerts, policyConfig } = useDashboardState();

  if (!isReady || !kpi) return null;

  const currentThreshold = Number(policyConfig?.threshold) || 0.70;
  const avgScore = parseFloat(kpi.avgThreatScore) || 0.0;
  const isHighThreat = avgScore >= currentThreshold;

  return (
    <div
      className={`glass-l1 p-4 sm:p-5 flex flex-col h-full relative overflow-hidden transition-colors border ${
        alerts.highThreat ? 'border-[var(--col-danger)]/50' : 'border-[var(--edge-rest)]'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
            <ShieldAlert size={13} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
              Threat Score Timeline
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)] font-sans">
              Real-time heuristic risk scoring (Q_TL)
            </p>
          </div>
        </div>
      </div>

      {/* Numeral Display (Reference B: centered/top hero figure with trend) */}
      <div className="flex items-baseline justify-between mb-1 shrink-0">
        <div className="flex items-baseline gap-2">
          <NumeralDisplay 
            value={avgScore} 
            unit="" 
            trend={isHighThreat ? 'up' : null} 
            decimals={2} 
            size="lg" 
          />
          <span className="text-xs text-[var(--text-secondary)] font-sans">Avg Threat Score</span>
        </div>
      </div>

      {/* Smooth Spline Timeline Chart */}
      <div className="flex-1 min-h-[160px] -ml-2 -mb-1">
        <ThreatHeatmap data={chartData?.threatScatter || []} threshold={currentThreshold} />
      </div>

      {/* Footer Policy Strip */}
      <div className="mt-2 pt-2.5 border-t border-[var(--edge-rest)] flex items-center justify-between text-xs text-[var(--text-tertiary)] shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-standard)]" />
            <span>&lt; {currentThreshold.toFixed(2)} Standard</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-critical)]" />
            <span>≥ {currentThreshold.toFixed(2)} Critical</span>
          </span>
        </div>
        <span className="hidden sm:inline text-[var(--text-tertiary)] text-[11px]">Threshold {currentThreshold.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ThreatScorePanel;