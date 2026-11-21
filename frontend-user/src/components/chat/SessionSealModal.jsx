import React, { useEffect } from 'react';
import { X, Shield, ShieldCheck, ShieldAlert, Key, Cpu, Lock, CheckCircle2, Layers } from 'lucide-react';

/**
 * SessionSealModal — USER App
 * Displays full cryptographic session seal details at the canonical "Harvest Lab" liquid glass level.
 * Features L3 frosted glass, soft scrim backdrop, rest-edge borders, and clean monochrome-first metrics.
 */
export const SessionSealModal = ({ isOpen, onClose, highSecurityMode }) => {
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
      aria-labelledby="session-seal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl glass-l3 border border-[var(--edge-rest)] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[var(--edge-rest)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--col-standard)]">
              <Shield size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="session-seal-title" className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                  Session Seal Details
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-sans bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
                  Cryptographic Posture
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Active post-quantum key encapsulation, digital signature authentication, and channel encryption
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
          {/* Active Lane Banner */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  highSecurityMode ? 'bg-[var(--col-critical)]' : 'bg-[var(--col-standard)]'
                }`}
              />
              <div>
                <span className="font-medium text-[var(--text-primary)]">
                  {highSecurityMode ? 'Critical Lane Active' : 'Standard Lane Active'}
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {highSecurityMode
                    ? 'Hybrid Mode: BB84 Quantum Key Distribution (QKD-256) combined with ML-KEM-768 lattice KEM'
                    : 'NIST Standard Mode: Pure post-quantum ML-KEM-768 lattice key encapsulation'}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-elevated)] border border-[var(--edge-rest)] text-[var(--text-primary)]">
              {highSecurityMode ? 'BB84 + FIPS 203' : 'FIPS Compliant'}
            </span>
          </div>

          {/* Core Cryptographic Suite Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] mb-1">
                <Key size={14} className="text-[var(--text-secondary)]" />
                <span>{highSecurityMode ? 'Hybrid Key Exchange' : 'Primary KEM Protocol'}</span>
              </div>
              <div className="font-mono text-xs text-[var(--col-standard)] mb-1">
                {highSecurityMode ? 'BB84 QKD + ML-KEM-768' : 'ML-KEM-768 (FIPS 203)'}
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                {highSecurityMode
                  ? 'Dual-Layer BB84 Quantum Key Distribution Protocol combined with Module Lattice KEM via HKDF-SHA256 for unconditional information-theoretic confidentiality.'
                  : 'Module Lattice Key Encapsulation Mechanism. Provides 128-bit post-quantum security margin against quantum polynomial search algorithms.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] mb-1">
                <CheckCircle2 size={14} className="text-[var(--col-verified)]" />
                <span>Authentication &amp; Signature</span>
              </div>
              <div className="font-mono text-xs text-[var(--text-primary)] mb-1">
                ML-DSA-65 (FIPS 204)
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                Module Lattice Digital Signature Algorithm (Dilithium). Validates message integrity and sender identity against forgery.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] mb-1">
                <Lock size={14} className="text-[var(--text-secondary)]" />
                <span>Payload Cipher</span>
              </div>
              <div className="font-mono text-xs text-[var(--text-primary)] mb-1">
                AES-256-GCM + Poly1305 Tag
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                Authenticated symmetric payload encryption using 256-bit ephemeral keys derived via HKDF-SHA-256.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] mb-1">
                <Layers size={14} className="text-[var(--text-secondary)]" />
                <span>Forward Secrecy</span>
              </div>
              <div className="font-mono text-xs text-[var(--text-primary)] mb-1">
                Per-Message Lattice Re-Keying
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                Every packet encapsulates a unique ephemeral secret. Compromise of past keys provides zero access to subsequent messages.
              </p>
            </div>
          </div>

          {/* Security Guarantee Note */}
          <div className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[11px] text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Cryptographic Assurance:</strong> All session traffic is immune to retro-active Harvest-Now, Decrypt-Later (HNDL) quantum attacks. Keys are never transmitted in plaintext across the wire.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--edge-rest)] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl btn-primary text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSealModal;
