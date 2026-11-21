import React, { useEffect } from 'react';
import { X, ShieldAlert, ShieldCheck, AlertCircle, BookOpen, Clock, Key, Lock, Cpu } from 'lucide-react';

/**
 * HarvestLabTooltip (HNDL Threat Defense) — USER App
 * Displays the Harvest-Now-Decrypt-Later threat model and PQC/QKD switching architecture
 * at the canonical "Harvest Lab" liquid glass modal level.
 */
export const HarvestLabTooltip = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-enter backdrop-blur-sm select-none font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hndl-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl glass-l3 border border-[var(--edge-rest)] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[var(--edge-rest)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--col-standard)]">
              <BookOpen size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="hndl-modal-title" className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                  HNDL Threat Defense
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-sans bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
                  Harvest Lab Model
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Harvest-Now, Decrypt-Later adversarial attack model &amp; quantum-resistant mitigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inner)] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-5 space-y-4 pr-1 text-xs">
          {/* Threat Overview Banner */}
          <div className="p-4 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
              <Clock size={15} className="text-[var(--col-critical)]" />
              <span>What is Harvest-Now, Decrypt-Later (HNDL)?</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Adversaries passively intercept and store encrypted internet traffic today. When cryptanalytically relevant quantum computers (CRQCs) arrive on Q-Day, classical RSA and ECC algorithms will be broken in polynomial time by Shor's algorithm, revealing all historic communications.
            </p>
          </div>

          {/* Defense Architecture Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Standard Lane Card */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--col-standard)] mb-1.5">
                <ShieldCheck size={15} />
                <span>Standard Lane (ML-KEM-768)</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">
                Active by default from byte 0. Based on hard Learning-With-Errors (LWE) lattice problems that quantum computers cannot solve.
              </p>
              <div className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--surface-elevated)] p-1.5 rounded border border-[var(--edge-rest)]">
                FIPS 203 · 128-bit quantum security margin
              </div>
            </div>

            {/* Critical Lane Card */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--col-critical)] mb-1.5">
                <ShieldAlert size={15} />
                <span>Critical Lane (BB84 QKD-256 + ML-KEM Hybrid)</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">
                Reserved for sensitive payloads (Q_TL ≥ 0.70). Combines unconditional physical One-Time Pad entropy from BB84 quantum channels with ML-KEM-768 lattice secrets.
              </p>
              <div className="font-mono text-[10px] text-[var(--text-tertiary)] bg-[var(--surface-elevated)] p-1.5 rounded border border-[var(--edge-rest)]">
                BB84 QKD + ML-KEM-768 · Information-theoretic security
              </div>
            </div>
          </div>

          {/* Mathematical Threshold Rule */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] space-y-2">
            <span className="text-xs font-medium text-[var(--text-primary)] block">
              Automated Quantum Threat Level (Q_TL) Dispatch
            </span>
            <div className="font-mono text-[11px] text-[var(--text-secondary)] bg-[var(--surface-elevated)] p-2 rounded-lg border border-[var(--edge-rest)]">
              Q_TL = 0.60 · S(content) + 0.40 · I(priority)
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              When Q_TL exceeds the dynamic threshold τ_eff or content sensitivity S ≥ 0.85, the engine automatically dispatches through the Critical BB84 QKD Lane, consuming physical entropy from the 25-key reservoir.
            </p>
          </div>

          {/* Demonstration Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[11px] text-[var(--text-tertiary)]">
            <AlertCircle size={13} className="shrink-0 mt-0.5 text-[var(--col-critical)]" />
            <span>
              Quantum Key Distribution executes the Bennett-Brassard (BB84) protocol across conjugate photon polarization bases, delivering true quantum key distribution (ETSI GS QKD 004/014) combined with NIST FIPS 203 ML-KEM-768.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--edge-rest)] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl btn-primary text-xs font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default HarvestLabTooltip;
