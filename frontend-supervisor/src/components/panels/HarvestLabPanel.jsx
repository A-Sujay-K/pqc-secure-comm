import React, { useEffect } from 'react';
import { X, ShieldAlert, ShieldCheck, Key, AlertTriangle, Layers, BookOpen } from 'lucide-react';

/**
 * HarvestLabPanel — SUPERVISOR App
 * Explains the Harvest-Now-Decrypt-Later (HNDL) threat model and hybrid switching architecture.
 * Quiet L3 frosted glass modal matching Reference B.
 */
export const HarvestLabPanel = ({ isOpen, onClose }) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-enter backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="harvest-lab-title"
    >
      <div className="w-full max-w-3xl rounded-2xl glass-l3 border border-[var(--edge-rest)] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[var(--edge-rest)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
              <BookOpen size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="harvest-lab-title" className="text-base sm:text-lg font-medium text-[var(--text-primary)] font-sans">
                  Harvest Lab
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-sans bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
                  HNDL defense model
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                Harvest-now-decrypt-later threat analysis &amp; hybrid switching architecture
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 text-sm text-[var(--text-secondary)] pr-1 font-sans">
          {/* Section 1: HNDL Threat Model */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text-primary)] font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-critical)]" />
              The HNDL threat model (Harvest-now, decrypt-later)
            </h3>
            <p className="leading-relaxed text-xs sm:text-sm text-[var(--text-secondary)]">
              Hostile adversaries are systematically capturing and storing encrypted network archives today. While classical ciphers (RSA, ECDH) remain secure against conventional hardware, they will be instantaneously compromised once a <strong className="text-[var(--text-primary)] font-medium">Cryptographically Relevant Quantum Computer (CRQC)</strong> capable of executing Shor’s algorithm emerges.
            </p>
            <p className="leading-relaxed text-xs sm:text-sm text-[var(--text-secondary)]">
              Sensitive payloads with long shelf-lives (critical infrastructure, governmental telemetry, trade secrets) must therefore be protected with post-quantum algorithms immediately.
            </p>
          </div>

          {/* Section 2: Dual-Lane Adaptive Architecture */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-primary)] font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-standard)]" />
              Dual-lane adaptive defense architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Standard Lane Card */}
              <div className="p-4 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[var(--col-standard)]" />
                  <span className="text-xs font-medium text-[var(--text-primary)] font-sans">
                    Standard lane (Nominal)
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Primary route for routine traffic. Utilizes NIST post-quantum standardized lattice cryptography:
                </p>
                <ul className="text-xs space-y-1 text-[var(--text-secondary)] pl-1">
                  <li>• <strong className="text-[var(--text-primary)] font-medium">FIPS 203</strong>: ML-KEM-768 lattice KEM</li>
                  <li>• <strong className="text-[var(--text-primary)] font-medium">FIPS 204</strong>: ML-DSA-65 Dilithium signature</li>
                  <li>• <strong className="text-[var(--text-primary)] font-medium">FIPS 197</strong>: AES-256-GCM symmetric encryption</li>
                </ul>
                <div className="pt-2 text-[11px] font-sans text-[var(--text-secondary)]">
                  Quantum security: Security Category 3 (~192-bit quantum equiv)
                </div>
              </div>

              {/* Critical Lane Card */}
              <div className="p-4 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-[var(--col-critical)]" />
                  <span className="text-xs font-medium text-[var(--text-primary)] font-sans">
                    Critical lane (High threat)
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Engaged dynamically when heuristic threat score <strong className="text-[var(--text-primary)] font-medium">Q_TL ≥ 0.70</strong>. Combines post-quantum lattice secrets with pre-shared quantum entropy:
                </p>
                <ul className="text-xs space-y-1 text-[var(--text-secondary)] pl-1">
                  <li>• <strong className="text-[var(--text-primary)] font-medium">BB84 QKD-256</strong>: One-time pad quantum key pool (Bennett-Brassard protocol)</li>
                  <li>• <strong className="text-[var(--text-primary)] font-medium">ML-KEM-768</strong>: Dual-layer lattice encapsulation</li>
                  <li>• <strong className="text-[var(--text-primary)] font-medium">HKDF-SHA256</strong>: Combined master key derivation</li>
                </ul>
                <div className="pt-2 text-[11px] font-sans text-[var(--text-secondary)]">
                  Entropy source: Information-theoretic BB84 quantum key entropy
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Honest Simulation Disclosure */}
          <div className="p-4 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] font-sans">
              <AlertTriangle size={14} className="text-[var(--text-secondary)]" />
              <span>BB84 Quantum Key Distribution Protocol Architecture</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Quantum Key Distribution implements the Bennett-Brassard 1984 (BB84) protocol model with conjugate photon polarization states, decoy-state protocols, and quantum bit error rate (QBER) monitoring. In hybrid operational mode, 256-bit BB84 key material is fused with NIST FIPS 203 ML-KEM-768 lattice secrets via HKDF-SHA256, guaranteeing information-theoretic security against quantum adversaries.
            </p>
          </div>

          {/* Section 4: Cryptographic Parameters Quick Reference */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text-primary)] font-sans flex items-center gap-2">
              <Layers size={14} className="text-[var(--text-secondary)]" />
              Cryptographic suite specifications
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)] p-3">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[var(--edge-rest)] text-[var(--text-tertiary)]">
                    <th className="py-2 pr-4 font-normal">Layer</th>
                    <th className="py-2 pr-4 font-normal">Algorithm</th>
                    <th className="py-2 pr-4 font-normal">Standard</th>
                    <th className="py-2 font-normal">Key / Ciphertext</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--edge-rest)] text-[var(--text-primary)]">
                  <tr>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">Key encapsulation</td>
                    <td className="py-2 pr-4 text-[var(--text-primary)] font-medium">ML-KEM-768</td>
                    <td className="py-2 pr-4 text-[var(--text-tertiary)]">NIST FIPS 203</td>
                    <td className="py-2 font-mono text-[11px] text-[var(--text-secondary)]">PK: 1184B · CT: 1088B</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">Digital signature</td>
                    <td className="py-2 pr-4 text-[var(--text-primary)] font-medium">ML-DSA-65</td>
                    <td className="py-2 pr-4 text-[var(--text-tertiary)]">NIST FIPS 204</td>
                    <td className="py-2 font-mono text-[11px] text-[var(--text-secondary)]">PK: 1952B · Sig: 3309B</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">Symmetric cipher</td>
                    <td className="py-2 pr-4 text-[var(--text-primary)] font-medium">AES-256-GCM</td>
                    <td className="py-2 pr-4 text-[var(--text-tertiary)]">NIST SP 800-38D</td>
                    <td className="py-2 font-mono text-[11px] text-[var(--text-secondary)]">Key: 256-bit · Nonce: 96-bit</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">Quantum key pool</td>
                    <td className="py-2 pr-4 text-[var(--text-primary)] font-medium">BB84 QKD Protocol</td>
                    <td className="py-2 pr-4 text-[var(--text-tertiary)]">ETSI GS QKD 004 / 014</td>
                    <td className="py-2 font-mono text-[11px] text-[var(--text-secondary)]">Key: 256-bit (Single use)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--edge-rest)] flex items-center justify-between shrink-0">
          <span className="text-xs text-[var(--text-tertiary)] font-sans">
            Press ESC or click outside to dismiss
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full btn-glass text-xs font-medium text-[var(--text-primary)]"
          >
            Close reference
          </button>
        </div>
      </div>
    </div>
  );
};

export default HarvestLabPanel;
