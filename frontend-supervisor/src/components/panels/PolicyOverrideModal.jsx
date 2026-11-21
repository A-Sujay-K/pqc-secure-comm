import React, { useState } from 'react';
import { Sliders, X, Shield, ShieldAlert, Cpu, Check, AlertCircle } from 'lucide-react';
import { useDashboardState } from '../../hooks/useDashboardState';

const PolicyOverrideModal = ({ isOpen, onClose }) => {
  const { policyConfig, setPolicyConfig, kpi } = useDashboardState();
  const [selectedMode, setSelectedMode] = useState(policyConfig?.mode || 'adaptive');
  const [threshold, setThreshold] = useState(policyConfig?.threshold || 0.70);
  const [appliedNotice, setAppliedNotice] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    if (setPolicyConfig) {
      setPolicyConfig({
        mode: selectedMode,
        threshold: Number(threshold),
      });
    }
    setAppliedNotice(true);
    setTimeout(() => {
      setAppliedNotice(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setSelectedMode('adaptive');
    setThreshold(0.70);
    if (setPolicyConfig) {
      setPolicyConfig({
        mode: 'adaptive',
        threshold: 0.70,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg glass-l3 rounded-2xl border border-[var(--edge-rest)] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--edge-rest)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-primary)]">
              <Sliders size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)] tracking-tight">
                Lane Policy Override
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-normal">
                Configure automated packet routing heuristics &amp; quantum threshold gating
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--edge-rest)]"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Policy Mode Selector Cards */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Select Routing Mode
          </label>

          {/* Mode 1: Adaptive Heuristic */}
          <div
            onClick={() => setSelectedMode('adaptive')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              selectedMode === 'adaptive'
                ? 'bg-[var(--surface-elevated)] border-[var(--edge-selected)] shadow-sm'
                : 'bg-[var(--surface-inner)] border-[var(--edge-rest)] hover:border-[var(--edge-hover)]'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--col-standard)] shrink-0 mt-0.5">
              <Cpu size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  Adaptive Heuristic (Default)
                </span>
                {selectedMode === 'adaptive' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)]">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Evaluates in-flight threat score Q_TL. Automatically dispatches packets to Critical Lane when Q_TL ≥ {threshold.toFixed(2)}.
              </p>
            </div>
          </div>

          {/* Mode 2: Force Standard */}
          <div
            onClick={() => setSelectedMode('force_standard')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              selectedMode === 'force_standard'
                ? 'bg-[var(--surface-elevated)] border-[var(--edge-selected)] shadow-sm'
                : 'bg-[var(--surface-inner)] border-[var(--edge-rest)] hover:border-[var(--edge-hover)]'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 mt-0.5">
              <Shield size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  Force All Standard (ML-KEM-768)
                </span>
                {selectedMode === 'force_standard' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)]">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Bypasses BB84 QKD key pool. All traffic routed through NIST FIPS 203 ML-KEM-768 with zero QKD key consumption.
              </p>
            </div>
          </div>

          {/* Mode 3: Force Critical */}
          <div
            onClick={() => setSelectedMode('force_critical')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              selectedMode === 'force_critical'
                ? 'bg-[var(--surface-elevated)] border-[var(--edge-selected)] shadow-sm'
                : 'bg-[var(--surface-inner)] border-[var(--edge-rest)] hover:border-[var(--edge-hover)]'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--col-critical)] shrink-0 mt-0.5">
              <ShieldAlert size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  Force All Critical (BB84 QKD-256 + ML-KEM-768)
                </span>
                {selectedMode === 'force_critical' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--col-critical)] font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Maximum security mode. Every message consumes an OTP key from the 25-key BB84 QKD reservoir combined with ML-KEM-768.
              </p>
            </div>
          </div>
        </div>

        {/* Threat Threshold Slider */}
        <div className={`p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] mb-5 transition-opacity ${selectedMode !== 'adaptive' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--text-primary)]">
              Threat Score Threshold (Q_TL)
            </span>
            <span className="font-mono text-xs font-medium text-[var(--text-primary)] px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)] tabular-nums">
              {Number(threshold).toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.40"
            max="0.90"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-[var(--text-primary)] h-1.5 bg-[var(--surface-elevated)] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1.5 font-mono">
            <span>0.40 (Aggressive)</span>
            <span>0.70 (Balanced)</span>
            <span>0.90 (Conservative)</span>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-xs text-[var(--text-secondary)] mb-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--col-verified)]" />
            <span>QKD Reservoir:</span>
          </div>
          <span className="font-mono text-xs text-[var(--text-primary)] tabular-nums">
            {kpi?.keyPoolAvailable ?? 21} / 25 keys available
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--edge-rest)] hover:border-[var(--edge-hover)] bg-[var(--surface-inner)]"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 px-4 rounded-xl btn-primary font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {appliedNotice ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span>Policy Applied!</span>
              </>
            ) : (
              <span>Apply Policy Override</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyOverrideModal;
