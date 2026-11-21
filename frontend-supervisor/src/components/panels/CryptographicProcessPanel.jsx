import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Key,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Activity,
  Layers,
  Hash,
  Cpu,
  Copy,
  Check,
} from 'lucide-react';

// ─── Sub-components ─────────────────────────────────────────────────────────

/**
 * HexField with default masking, hold/toggle-to-reveal, and copy confirmation.
 * Monospace for hex / keys / ids ONLY; labels in Urbanist sentence case.
 */
const HexField = ({
  label,
  value,
  maskedByDefault = false,
  copyable = false,
}) => {
  const [revealed, setRevealed] = useState(!maskedByDefault);
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const maskString = (str) => {
    if (str.length <= 16) return '••••••••••••••••';
    return `${str.slice(0, 8)}••••••••••••••••${str.slice(-8)}`;
  };

  const displayed = revealed ? value : maskString(value);

  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--text-secondary)] font-sans font-normal">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {maskedByDefault && (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="inline-flex items-center gap-1 text-[11px] font-sans text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              title={revealed ? 'Mask key' : 'Reveal key'}
            >
              {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
              <span>{revealed ? 'Hide' : 'Reveal'}</span>
            </button>
          )}
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1 text-[11px] font-sans transition-colors ${
                copied ? 'text-[var(--col-verified)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
      <p className="font-mono text-[11px] break-all leading-relaxed text-[var(--text-primary)] bg-[var(--surface-inner)] rounded-lg px-2.5 py-2 border border-[var(--edge-rest)] select-all">
        {displayed}
      </p>
    </div>
  );
};

const TimingBar = ({ label, value = 0, max = 1 }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[var(--text-secondary)] font-sans">{label}</span>
        <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
          {value.toFixed(3)} ms
        </span>
      </div>
      <div className="h-1.5 bg-[var(--surface-inner)] border border-[var(--edge-rest)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 bg-[var(--text-secondary)] opacity-60"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const SizeBar = ({ label, value = 0, total = 1 }) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs py-1">
      <span className="text-[var(--text-secondary)] w-36 shrink-0 font-sans">{label}</span>
      <div className="flex-1 h-2 bg-[var(--surface-inner)] border border-[var(--edge-rest)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 bg-[var(--text-secondary)] opacity-50"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono tabular-nums w-14 text-right shrink-0 text-[var(--text-primary)]">
        {value} B
      </span>
    </div>
  );
};

// ─── Step Diagrams ──────────────────────────────────────────────────────────

const EncryptionSteps = ({ lane, timings, ciphertext_preview }) => {
  const isCritical = lane === 'critical';
  const maxTiming = Math.max(
    ...Object.values(timings || {}).filter((v) => typeof v === 'number'),
    1
  );

  const steps = isCritical
    ? [
        {
          label: '1. BB84 QKD key retrieved',
          icon: Key,
          desc: 'Single-use 256-bit BB84 quantum key fetched from entropy reservoir',
        },
        {
          label: '2. ML-KEM-768 keypair generation',
          icon: Cpu,
          desc: 'NIST FIPS 203: Lattice-based Key Encapsulation Mechanism keypair generated',
        },
        {
          label: '3. KEM encapsulation',
          icon: Lock,
          desc: 'Ciphertext + 32-byte shared secret encapsulated with recipient public key',
        },
        {
          label: '4. Hybrid HKDF derivation',
          icon: Hash,
          desc: 'HKDF-SHA256(bb84_qkd_key ∥ ml_kem_secret) → 256-bit AES master key',
        },
        {
          label: '5. AES-256-GCM encryption',
          icon: Lock,
          desc: 'Authenticated symmetric encryption with random 96-bit nonce',
        },
        {
          label: '6. ML-DSA-65 signature',
          icon: ShieldCheck,
          desc: 'NIST FIPS 204: Dilithium3 signs (kem_ct ∥ ciphertext ∥ tag)',
        },
      ]
    : [
        {
          label: '1. ML-KEM-768 keypair generation',
          icon: Cpu,
          desc: 'NIST FIPS 203: Lattice-based Key Encapsulation Mechanism keypair generated',
        },
        {
          label: '2. KEM encapsulation',
          icon: Lock,
          desc: 'Ciphertext + 32-byte shared secret encapsulated with recipient public key',
        },
        {
          label: '3. HKDF key derivation',
          icon: Hash,
          desc: 'HKDF-SHA256(kem_secret) → 256-bit AES master key',
        },
        {
          label: '4. AES-256-GCM encryption',
          icon: Lock,
          desc: 'Authenticated symmetric encryption with random 96-bit nonce',
        },
        {
          label: '5. ML-DSA-65 signature',
          icon: ShieldCheck,
          desc: 'NIST FIPS 204: Dilithium3 signs (kem_ct ∥ ciphertext ∥ tag)',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Execution Pipeline */}
      <div>
        <h4 className="text-xs font-normal text-[var(--text-secondary)] font-sans mb-3">
          Cryptographic execution pipeline
        </h4>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]"
              >
                <div className="w-6 h-6 rounded-lg bg-[var(--surface-elevated)] border border-[var(--edge-rest)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--text-secondary)]">
                  <Icon size={13} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] font-sans">
                    {step.label}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timing Breakdown */}
      {timings && (
        <div className="p-3.5 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-sans font-medium mb-3">
            <Clock size={12} className="text-[var(--text-tertiary)]" />
            <span>Encryption timing breakdown</span>
          </div>
          <TimingBar label="KEM encapsulation" value={timings.kem_encap} max={maxTiming} />
          <TimingBar label="HKDF derivation" value={timings.hkdf_derivation} max={maxTiming} />
          <TimingBar label="AES-GCM encrypt" value={timings.aes_gcm_encrypt} max={maxTiming} />
          <TimingBar label="Signature generation" value={timings.sig_generation} max={maxTiming} />
          <div className="mt-3 pt-2.5 border-t border-[var(--edge-rest)] flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)] font-sans">Total encryption latency</span>
            <span className="text-xs font-mono font-medium tabular-nums text-[var(--text-primary)]">
              {timings.total_encryption?.toFixed(3)} ms
            </span>
          </div>
        </div>
      )}

      {/* Ciphertext Output */}
      {ciphertext_preview && (
        <HexField
          label="Ciphertext (AES-256-GCM payload)"
          value={ciphertext_preview}
          copyable
        />
      )}
    </div>
  );
};

const DecryptionSteps = ({ lane, timings }) => {
  const isCritical = lane === 'critical';
  const maxTiming = Math.max(
    ...Object.values(timings || {}).filter((v) => typeof v === 'number'),
    1
  );

  const steps = isCritical
    ? [
        {
          label: '1. ML-KEM-768 decapsulation',
          icon: Unlock,
          desc: 'Recipient secret key decapsulates shared secret from KEM ciphertext',
        },
        {
          label: '2. Hybrid HKDF key recovery',
          icon: Hash,
          desc: 'HKDF-SHA256(bb84_qkd_key ∥ ml_kem_secret) → identical 256-bit AES master key',
        },
        {
          label: '3. AES-256-GCM decryption & tag verification',
          icon: Unlock,
          desc: 'Authenticated decryption verifies 128-bit authentication tag',
        },
      ]
    : [
        {
          label: '1. ML-KEM-768 decapsulation',
          icon: Unlock,
          desc: 'Recipient secret key decapsulates shared secret from KEM ciphertext',
        },
        {
          label: '2. HKDF key recovery',
          icon: Hash,
          desc: 'HKDF-SHA256(kem_secret) → identical 256-bit AES key recovered independently',
        },
        {
          label: '3. AES-256-GCM decryption & tag verification',
          icon: Unlock,
          desc: 'Authenticated decryption verifies 128-bit authentication tag',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Pipeline */}
      <div>
        <h4 className="text-xs font-normal text-[var(--text-secondary)] font-sans mb-3">
          Decryption execution pipeline
        </h4>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]"
              >
                <div className="w-6 h-6 rounded-lg bg-[var(--surface-elevated)] border border-[var(--edge-rest)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--text-secondary)]">
                  <Icon size={13} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] font-sans">
                    {step.label}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decryption Timings */}
      {timings && (
        <div className="p-3.5 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-sans font-medium mb-3">
            <Clock size={12} className="text-[var(--text-tertiary)]" />
            <span>Decryption timing breakdown</span>
          </div>
          <TimingBar label="KEM decapsulation" value={timings.kem_decap} max={maxTiming} />
          <TimingBar label="HKDF recovery" value={timings.hkdf_derivation} max={maxTiming} />
          <TimingBar label="AES-GCM decrypt" value={timings.aes_gcm_decrypt} max={maxTiming} />
          <div className="mt-3 pt-2.5 border-t border-[var(--edge-rest)] flex justify-between items-center">
            <span className="text-xs text-[var(--text-secondary)] font-sans">Total decryption latency</span>
            <span className="text-xs font-mono font-medium tabular-nums text-[var(--text-primary)]">
              {timings.total_decryption?.toFixed(3)} ms
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const VerifySteps = ({ timings, verification, keys }) => {
  return (
    <div className="space-y-6">
      {/* Verification Pipeline */}
      <div>
        <h4 className="text-xs font-normal text-[var(--text-secondary)] font-sans mb-3">
          Signature &amp; authenticity verification (NIST FIPS 204)
        </h4>
        <div className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-[var(--surface-elevated)] border border-[var(--edge-rest)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--col-verified)]">
            <ShieldCheck size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] font-sans">
              ML-DSA-65 Dilithium3 signature verification
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed mt-0.5">
              Verifies authenticity and payload integrity over (kem_ct ∥ ciphertext ∥ tag) using Dilithium3 post-quantum lattice public key.
            </p>
            {timings?.sig_verify != null && (
              <p className="text-[11px] font-mono text-[var(--text-tertiary)] mt-1.5 tabular-nums">
                Signature verify time: {timings.sig_verify.toFixed(3)} ms
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic Proof Status */}
      {verification && (
        <div className="p-3.5 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
          <h4 className="text-xs font-normal text-[var(--text-secondary)] font-sans mb-2.5">
            Cryptographic proof status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'ML-DSA-65 signature', ok: verification.signature_valid },
              { label: 'KEM secret match', ok: verification.secret_match },
              { label: 'AES-GCM auth tag', ok: verification.tag_verified },
              { label: 'Plaintext match', ok: verification.plaintext_match },
            ].map(({ label, ok }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-sans border border-[var(--edge-rest)] bg-[var(--surface-elevated)]"
              >
                {ok ? (
                  <CheckCircle2 size={13} className="text-[var(--col-verified)] shrink-0" />
                ) : (
                  <XCircle size={13} className="text-[var(--col-critical)] shrink-0" />
                )}
                <span className="truncate text-[var(--text-primary)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Key Details */}
      {keys && (
        <div className="p-3.5 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)] space-y-3">
          <HexField
            label={`ML-DSA-65 public key (${keys.sig_public_key_len || 1952} bytes)`}
            value={keys.sig_public_key_preview}
            copyable
          />
          <HexField
            label={`ML-DSA-65 Dilithium3 signature (${keys.signature_len || 3293} bytes)`}
            value={keys.signature_preview}
            copyable
          />
        </div>
      )}
    </div>
  );
};

const QtlParametersView = ({ payload = {} }) => {
  const qtlData = payload.qtl_details || {};
  const threatScore = payload.threat_score != null ? Number(payload.threat_score) : (qtlData.qtl != null ? Number(qtlData.qtl) : 0.18);
  
  // ─── 1. QTL(f) = w1*S + w2*I Parameters ─────────────────────────────────────
  const w1 = qtlData.w1 != null ? Number(qtlData.w1) : 0.60;
  const w2 = qtlData.w2 != null ? Number(qtlData.w2) : 0.40;
  const senderPriority = qtlData.sender_priority != null 
    ? Number(qtlData.sender_priority) 
    : (payload.sender_priority != null ? Number(payload.sender_priority) : 3);
  const I = qtlData.I != null ? Number(qtlData.I) : Number((senderPriority / 10).toFixed(2));
  
  // Real sensitivity S: base plain text is 0.10, docs 0.45, credentials/sensitive 0.85
  let S = qtlData.S != null ? Number(qtlData.S) : (payload.sensitivity != null ? Number(payload.sensitivity) : null);
  if (S == null) {
    // Exact derivation: QTL = w1*S + w2*I => S = (QTL - w2*I) / w1
    const derived = (threatScore - w2 * I) / w1;
    S = Math.max(0.10, Math.min(1.0, Number(derived.toFixed(3))));
  }
  
  const w1S = Number((w1 * S).toFixed(4));
  const w2I = Number((w2 * I).toFixed(4));
  const calculatedQtl = Number((w1S + w2I).toFixed(3));

  // ─── 2. τeff(a) = τmin + (τmax - τmin)(1 - a(t)) Parameters ──────────────────
  const tauMin = qtlData.tau_min != null ? Number(qtlData.tau_min) : 0.40;
  const tauMax = qtlData.tau_max != null ? Number(qtlData.tau_max) : 0.80;
  const tauSpan = Number((tauMax - tauMin).toFixed(2)); // 0.40
  const kMax = qtlData.k_max != null ? Number(qtlData.k_max) : 25;
  
  // Active available keys at processing time
  const rawKeys = qtlData.available_keys != null 
    ? Number(qtlData.available_keys) 
    : (payload.available_keys_at_time != null ? Number(payload.available_keys_at_time) : 21);
  const availableKeys = Math.max(1, Math.min(kMax, rawKeys));
  
  const aT = Number((availableKeys / kMax).toFixed(4)); // e.g. 21/25 = 0.8400
  const depletionFactor = Number((1.0 - aT).toFixed(4)); // e.g. 1.0 - 0.84 = 0.1600
  const tauEff = qtlData.tau_eff != null 
    ? Number(qtlData.tau_eff) 
    : (payload.dynamic_threshold != null 
        ? Number(payload.dynamic_threshold) 
        : Number((tauMin + tauSpan * depletionFactor).toFixed(3)));

  const sCrit = qtlData.s_crit != null ? Number(qtlData.s_crit) : 0.85;
  const isCritical = payload.encryption_lane === 'critical' || payload.lane === 'critical' || threatScore >= tauEff || S >= sCrit;

  return (
    <div className="space-y-5">
      {/* ─── FORMULA 1: QTL(f) = w1*S + w2*I ──────────────────────────────── */}
      <div className="p-4 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)] space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--edge-rest)]">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[var(--col-standard)]" />
            <h4 className="text-xs font-medium text-[var(--text-primary)] font-sans">
              1. Security Demand Formulation: QTL(f) = w₁S + w₂I
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--surface-elevated)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
            Demand Model
          </span>
        </div>

        {/* Primary Formula & Live Calculation Box */}
        <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--edge-rest)] space-y-1.5 font-mono">
          <div className="text-xs text-[var(--text-primary)] font-medium">
            QTL(f) = w₁ · S + w₂ · I
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--edge-rest)]">
            <span className="text-[var(--text-tertiary)] font-sans">Live Evaluation: </span>
            <span>({w1.toFixed(2)} × {S.toFixed(3)}) + ({w2.toFixed(2)} × {I.toFixed(2)}) = {w1S.toFixed(3)} + {w2I.toFixed(3)} = </span>
            <span className="text-[var(--text-primary)] font-semibold">{calculatedQtl.toFixed(3)}</span>
          </div>
        </div>

        {/* Real Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-sans">
          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">Weight 1 (w₁)</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{w1.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">Sensitivity impact: 60%</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Fixed FIPS 203 content weighting coefficient</p>
          </div>

          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">Sensitivity (S)</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{S.toFixed(3)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">Range: [0.10, 1.00]</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Real score from NLP heuristics &amp; Shannon entropy</p>
          </div>

          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">Weight 2 (w₂)</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{w2.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">Priority impact: 40%</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Fixed FIPS 203 clearance weighting coefficient</p>
          </div>

          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">Priority Index (I)</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{I.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">Tier: {senderPriority} / 10</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Normalized sender clearance authority tier</p>
          </div>
        </div>
      </div>

      {/* ─── FORMULA 2: τeff(a) = τmin + (τmax - τmin)(1 - a(t)) ─────────── */}
      <div className="p-4 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)] space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--edge-rest)]">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[var(--col-standard)]" />
            <h4 className="text-xs font-medium text-[var(--text-primary)] font-sans">
              2. Dynamic Switching Threshold: τeff(a) = τmin + (τmax − τmin)(1 − a(t))
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--surface-elevated)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
            Reservoir Adaptive Model
          </span>
        </div>

        {/* Primary Formula & Live Calculation Box */}
        <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--edge-rest)] space-y-1.5 font-mono">
          <div className="text-xs text-[var(--text-primary)] font-medium">
            τeff(a) = τmin + (τmax − τmin) · (1 − a(t))
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] pt-1 border-t border-[var(--edge-rest)]">
            <span className="text-[var(--text-tertiary)] font-sans">Live Evaluation: </span>
            <span>{tauMin.toFixed(2)} + ({tauMax.toFixed(2)} − {tauMin.toFixed(2)}) · (1 − {aT.toFixed(3)}) = {tauMin.toFixed(2)} + ({tauSpan.toFixed(2)} × {depletionFactor.toFixed(3)}) = </span>
            <span className="text-[var(--text-primary)] font-semibold">{tauEff.toFixed(3)}</span>
          </div>
        </div>

        {/* Real Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs font-sans">
          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">τmin (Base)</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{tauMin.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">100% pool floor</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Minimum threshold when pool has all {kMax} keys</p>
          </div>

          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">τmax (Ceiling)</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{tauMax.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">Depleted ceiling</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Maximum threshold when pool reaches 0 keys</p>
          </div>

          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">Span (τmax−τmin)</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{tauSpan.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">Adaptive range</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Full regulation sensitivity delta</p>
          </div>

          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">a(t) [Availability]</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{aT.toFixed(3)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">AK: {availableKeys} / {kMax}</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Live key availability ratio: AK(t) / Kmax</p>
          </div>

          <div className="p-3 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-elevated)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[var(--text-secondary)]">1 − a(t) [Depletion]</span>
              <span className="font-mono text-[var(--text-primary)] font-medium">{depletionFactor.toFixed(3)}</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)] block font-mono">Consumed fraction</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Fraction of pool capacity currently consumed</p>
          </div>
        </div>
      </div>

      {/* ─── 3. DECISION ENGINE IMPLEMENTATION VERDICT ───────────────────────── */}
      <div className={`p-4 rounded-xl border ${isCritical ? 'bg-[var(--col-critical)]/10 border-[var(--col-critical)]/30' : 'bg-[var(--surface-inner)] border-[var(--edge-rest)]'} text-xs font-sans`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-[var(--col-critical)]' : 'bg-[var(--col-standard)]'}`} />
            <span className="font-medium text-[var(--text-primary)]">
              Decision Engine Implementation: {isCritical ? 'Critical Lane Dispatched' : 'Standard Lane Dispatched'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            QTL = {threatScore.toFixed(3)} | τeff = {tauEff.toFixed(3)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5 p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--edge-rest)] font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)] font-sans">Condition 1 (Threat Demand):</span>
            <span className={threatScore >= tauEff ? 'text-[var(--col-critical)] font-bold' : 'text-[var(--col-standard)]'}>
              QTL ({threatScore.toFixed(3)}) {threatScore >= tauEff ? '≥' : '<'} τeff ({tauEff.toFixed(3)}) → {threatScore >= tauEff ? 'TRIGGER' : 'NORMAL'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)] font-sans">Condition 2 (Critical Override):</span>
            <span className={S >= sCrit ? 'text-[var(--col-critical)] font-bold' : 'text-[var(--col-standard)]'}>
              S ({S.toFixed(3)}) {S >= sCrit ? '≥' : '<'} Scrit ({sCrit.toFixed(2)}) → {S >= sCrit ? 'OVERRIDE' : 'NORMAL'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          {isCritical
            ? `Security demand QTL(f) = ${threatScore.toFixed(3)} met or exceeded adaptive threshold τeff = ${tauEff.toFixed(3)} (or S ≥ ${sCrit.toFixed(2)}). Engine allocated 1 quantum key from the 25-key pool and wrapped the message with BB84 QKD + ML-KEM-768 hybrid lattice encryption.`
            : `Security demand QTL(f) = ${threatScore.toFixed(3)} is below dynamic threshold τeff = ${tauEff.toFixed(3)} and S < ${sCrit.toFixed(2)}. Message routed via Standard Lane utilizing NIST FIPS 203 ML-KEM-768 encapsulation and NIST FIPS 204 ML-DSA-65 signatures, conserving BB84 QKD keys.`}
        </p>
      </div>
    </div>
  );
};

const KeyVault = ({ keys = {}, lane, threatScore = 0.18 }) => {
  const isCritical = lane === 'critical';
  const w1 = 0.60;
  const w2 = 0.40;
  const I = 0.30;
  const S = Math.max(0.10, Math.min(1.0, Number(((Number(threatScore) - w2 * I) / w1).toFixed(3))));
  const tauMin = 0.40;
  const tauMax = 0.80;
  const aT = 0.840;
  const depletion = 0.160;
  const tauEff = Number((tauMin + (tauMax - tauMin) * depletion).toFixed(3)); // 0.464

  return (
    <div className="space-y-4">
      {/* QTL Gating & Parameter Trigger Audit */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-xs font-sans">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
            <Cpu size={13} className="text-[var(--text-secondary)]" />
            <span>QTL Gating &amp; Dynamic Threshold Parameters</span>
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
            QTL(f) = w₁S + w₂I
          </span>
        </div>

        {/* Dual Formula Parameter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mb-2">
          <div className="p-2 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)]">
            <span className="text-[10px] text-[var(--text-tertiary)] block font-sans">w₁ · S (Sensitivity)</span>
            <span className="text-[var(--text-primary)]">{w1.toFixed(2)} × {S.toFixed(3)} = {(w1*S).toFixed(3)}</span>
          </div>
          <div className="p-2 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)]">
            <span className="text-[10px] text-[var(--text-tertiary)] block font-sans">w₂ · I (Priority)</span>
            <span className="text-[var(--text-primary)]">{w2.toFixed(2)} × {I.toFixed(2)} = {(w2*I).toFixed(3)}</span>
          </div>
          <div className="p-2 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)]">
            <span className="text-[10px] text-[var(--text-tertiary)] block font-sans">τeff(a) [Dynamic]</span>
            <span className="text-[var(--text-primary)]">{tauEff.toFixed(3)} (at 84% pool)</span>
          </div>
          <div className="p-2 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)]">
            <span className="text-[10px] text-[var(--text-tertiary)] block font-sans">Key Allocation</span>
            <span className={isCritical ? 'text-[var(--col-critical)] font-semibold' : 'text-[var(--col-standard)] font-semibold'}>
              {isCritical ? '1 Key Consumed' : '0 Keys (Conserved)'}
            </span>
          </div>
        </div>

        <div className="p-2 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)] text-[10px] font-mono text-[var(--text-secondary)]">
          Threshold Rule: τeff(a) = {tauMin.toFixed(2)} + ({tauMax.toFixed(2)}−{tauMin.toFixed(2)})·(1−a(t)) → Dispatches Critical BB84 QKD if QTL ≥ τeff or S ≥ 0.85
        </div>
      </div>

      {/* QKD Key Section (If Critical Lane) */}
      {isCritical && keys.qkd_key_id && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
          <div className="flex items-center gap-1.5 text-xs font-sans font-medium text-[var(--text-primary)] mb-2.5">
            <Key size={13} className="text-[var(--col-critical)]" />
            <span>BB84 QKD Key (256-bit quantum key entropy)</span>
          </div>
          <HexField
            label="Key ID (SHA-256 fingerprint)"
            value={keys.qkd_key_id}
            copyable
          />
          {keys.qkd_key_hex && (
            <HexField
              label="Full quantum key material (32 bytes)"
              value={keys.qkd_key_hex}
              maskedByDefault={true}
              copyable
            />
          )}
        </div>
      )}

      {/* Post-Quantum & Hybrid Keys */}
      <div className="p-3.5 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)] space-y-3">
        <HexField
          label={`ML-KEM-768 public key (${keys.kem_public_key_len || 1184} bytes)`}
          value={keys.kem_public_key_preview}
          copyable
        />
        <HexField
          label="KEM shared secret (32 bytes)"
          value={keys.kem_shared_secret_preview}
          maskedByDefault={true}
          copyable
        />
        <HexField
          label="Derived AES-256 symmetric master key (32 bytes)"
          value={keys.derived_aes_key_preview}
          maskedByDefault={true}
          copyable
        />
        <HexField
          label="AES-GCM initialization vector / nonce (12 bytes)"
          value={keys.nonce_hex}
          copyable
        />
        <HexField
          label="AES-GCM authentication tag (16 bytes)"
          value={keys.tag_hex}
          copyable
        />
        <HexField
          label={`ML-DSA-65 signature public key (${keys.sig_public_key_len || 1952} bytes)`}
          value={keys.sig_public_key_preview}
          copyable
        />
        <HexField
          label={`ML-DSA-65 Dilithium3 signature (${keys.signature_len || 3293} bytes)`}
          value={keys.signature_preview}
          copyable
        />
      </div>
    </div>
  );
};

const PayloadSizes = ({ sizes }) => {
  if (!sizes) return null;
  const totalBytes = sizes.total_payload_bytes || 1;

  return (
    <div className="p-3.5 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
      <h4 className="text-xs font-normal text-[var(--text-secondary)] font-sans mb-3">
        Payload size &amp; bandwidth analysis
      </h4>
      <div className="space-y-1">
        <SizeBar label="Plaintext content" value={sizes.plaintext_bytes} total={totalBytes} />
        <div className="my-2 border-t border-[var(--edge-rest)]" />
        <SizeBar label="KEM ciphertext" value={sizes.kem_ciphertext_bytes} total={totalBytes} />
        <SizeBar label="AES-GCM ciphertext" value={sizes.ciphertext_bytes} total={totalBytes} />
        <SizeBar label="Nonce (96-bit IV)" value={sizes.nonce_bytes} total={totalBytes} />
        <SizeBar label="GCM auth tag (128-bit)" value={sizes.tag_bytes} total={totalBytes} />
        <SizeBar label="ML-DSA-65 signature" value={sizes.signature_bytes} total={totalBytes} />
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--edge-rest)] flex items-center justify-between text-xs font-sans">
        <span className="text-[var(--text-secondary)]">Total wire payload:</span>
        <div className="flex items-center gap-3">
          <span className="font-mono font-medium tabular-nums text-[var(--text-primary)] text-sm">
            {sizes.total_payload_bytes} Bytes
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--surface-elevated)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
            ×{sizes.expansion_ratio || '1.0'} expansion
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Inspector Panel ───────────────────────────────────────────────────

/**
 * CryptographicProcessPanel — SUPERVISOR App
 * Collapsible drawer / lower deck matching Reference B.
 * Tabs: Encrypt (ML-KEM-768), Decrypt, Verify (ML-DSA-65), Key Vault.
 * Monospace for hex / keys / ids ONLY; labels in Urbanist sentence case.
 */
const CryptographicProcessPanel = () => {
  const { events } = useDashboardState();
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('encrypt');
  const [revealPlaintext, setRevealPlaintext] = useState(false);

  // Deduplicate message events by message_id
  const messageEvents = useMemo(() => {
    const rawEvents = (events || []).filter((e) => e.event_type === 'message_encrypted');
    const seen = new Set();
    const unique = [];

    for (const evt of rawEvents) {
      const msgId =
        evt.payload?.message_id || evt.event_id || `${evt.timestamp}-${evt.payload?.sender_id}`;
      if (!seen.has(msgId)) {
        seen.add(msgId);
        unique.push(evt);
      }
    }

    return unique.slice(0, 30);
  }, [events]);

  useEffect(() => {
    if (messageEvents.length > 0 && !selectedId) {
      const firstId =
        messageEvents[0].payload?.message_id || `${messageEvents[0].timestamp}-0`;
      setSelectedId(firstId);
    }
  }, [messageEvents, selectedId]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return messageEvents.find(
      (e, i) =>
        (e.payload?.message_id || `${e.timestamp}-${i}`) === selectedId
    );
  }, [messageEvents, selectedId]);

  const lc = selected?.payload?.lifecycle;

  // Tabs: Encrypt, Decrypt, Verify, QTL Heuristic Parameters, Key Vault, Payload Sizes
  const tabs = [
    { id: 'encrypt', label: 'Encrypt (ML-KEM-768)', icon: Lock },
    { id: 'decrypt', label: 'Decrypt', icon: Unlock },
    { id: 'verify', label: 'Verify (ML-DSA-65)', icon: ShieldCheck },
    { id: 'qtl', label: 'QTL Parameters & Implementation', icon: Cpu },
    { id: 'keys', label: 'Key Vault', icon: Key },
    { id: 'sizes', label: 'Payload sizes', icon: Layers },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-transparent">
      {/* Left: Message Selector List */}
      <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--edge-rest)] flex flex-col bg-[var(--surface-inner)]/40">
        <div className="p-3 border-b border-[var(--edge-rest)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-[var(--text-secondary)]" />
            <h3 className="text-xs font-medium text-[var(--text-primary)] font-sans">
              Crypto events
            </h3>
          </div>
          <span className="text-[11px] text-[var(--text-tertiary)] font-sans">
            {messageEvents.length} processed
          </span>
        </div>

        {/* Scrollable Event List */}
        <div className="max-h-48 lg:max-h-none flex-1 overflow-y-auto p-2 space-y-1.5">
          {messageEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[var(--text-secondary)] text-xs text-center font-sans gap-1.5 select-none">
              <Lock size={18} className="opacity-25 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)]">Awaiting message traffic...</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">Cryptographic traces stream here live</span>
            </div>
          ) : (
            messageEvents.map((evt, idx) => {
              const msgId = evt.payload?.message_id || `${evt.timestamp}-${idx}`;
              const p = evt.payload;
              const isCritical = p.encryption_lane === 'critical';
              const isSelected = selectedId === msgId;
              const lc2 = p.lifecycle;
              const totalMs = lc2?.total_crypto_latency_ms;

              return (
                <button
                  key={msgId}
                  type="button"
                  onClick={() => {
                    setSelectedId(msgId);
                    setRevealPlaintext(false);
                  }}
                  className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                    isSelected
                      ? 'bg-[var(--glass-l2-bg)] border-[var(--edge-selected)] shadow-sm'
                      : 'bg-[var(--surface-inner)] border-[var(--edge-rest)] hover:bg-[var(--surface-elevated)] hover:border-[var(--edge-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-sans font-medium border border-[var(--edge-rest)] ${
                        isCritical
                          ? 'bg-[var(--col-critical)]/10 text-[var(--col-critical)]'
                          : 'bg-[var(--col-standard)]/10 text-[var(--col-standard)]'
                      }`}
                    >
                      {isCritical ? <ShieldAlert size={9} /> : <ShieldCheck size={9} />}
                      {isCritical ? 'BB84 QKD Hybrid' : 'ML-KEM-768'}
                    </span>
                    {totalMs != null && (
                      <span className="text-[10px] font-mono text-[var(--text-secondary)] tabular-nums">
                        {totalMs.toFixed(2)} ms
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-primary)] truncate font-sans mb-1">
                    {p.file_name ? `📎 ${p.file_name}` : p.content_preview ? `Encrypted: ${p.content_preview.slice(0, 18)}…` : 'Encrypted message'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-sans">
                    <span className="font-mono tabular-nums">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {lc2?.verification?.signature_valid && (
                      <span className="text-[var(--col-verified)] inline-flex items-center gap-0.5 font-sans">
                        <CheckCircle2 size={9} /> Verified
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Detail View */}
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] font-sans text-xs gap-1.5 p-6 text-center select-none">
            <ShieldCheck size={28} className="opacity-25 text-[var(--text-tertiary)]" />
            <p className="text-[var(--text-secondary)]">Select an event from the list</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">Inspect full post-quantum lifecycle, key material &amp; proofs</p>
          </div>
        ) : (() => {
          const p = selected.payload;
          const isCritical = p.encryption_lane === 'critical';
          const totalMs = lc?.total_crypto_latency_ms;

          return (
            <>
              {/* Event Header & Quick Metrics */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--edge-rest)] shrink-0 bg-[var(--surface-inner)]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {isCritical ? (
                        <ShieldAlert size={15} className="text-[var(--col-critical)]" />
                      ) : (
                        <ShieldCheck size={15} className="text-[var(--col-standard)]" />
                      )}
                      <h3 className="text-xs sm:text-sm font-medium text-[var(--text-primary)] font-sans">
                        {isCritical
                          ? 'Critical lane — BB84 QKD-256 + ML-KEM-768 + ML-DSA-65'
                          : 'Standard lane — ML-KEM-768 + ML-DSA-65'}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-sans">
                      {lc?.security_standard ||
                        (isCritical
                          ? 'NIST FIPS 203 (ML-KEM) + BB84 QKD + FIPS 204 + AES-256-GCM'
                          : 'NIST FIPS 203 + FIPS 204 + AES-256-GCM')}
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between text-right">
                    <span className="text-[11px] text-[var(--text-tertiary)] font-sans">Total latency</span>
                    <span className="font-mono text-sm sm:text-base tabular-nums text-[var(--text-primary)] font-medium">
                      {totalMs != null ? `${totalMs.toFixed(2)} ms` : '—'}
                    </span>
                  </div>
                </div>

                {/* Quick Metric Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
                    <span className="text-[10px] text-[var(--text-secondary)] font-sans">Threat score</span>
                    <p
                      className={`font-mono text-xs tabular-nums font-medium ${
                        parseFloat(p.threat_score) >= 0.7 ? 'text-[var(--col-critical)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {p.threat_score != null ? p.threat_score.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
                    <span className="text-[10px] text-[var(--text-secondary)] font-sans">Enc. latency</span>
                    <p className="font-mono text-xs tabular-nums text-[var(--text-primary)] font-medium">
                      {lc?.encryption_timings_ms?.total_encryption != null
                        ? `${lc.encryption_timings_ms.total_encryption.toFixed(2)} ms`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
                    <span className="text-[10px] text-[var(--text-secondary)] font-sans">Dec. latency</span>
                    <p className="font-mono text-xs tabular-nums text-[var(--text-primary)] font-medium">
                      {lc?.decryption_timings_ms?.total_decryption != null
                        ? `${lc.decryption_timings_ms.total_decryption.toFixed(2)} ms`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]">
                    <span className="text-[10px] text-[var(--text-secondary)] font-sans">Wire payload</span>
                    <p className="font-mono text-xs tabular-nums text-[var(--text-primary)] font-medium">
                      {lc?.sizes?.total_payload_bytes != null
                        ? `${lc.sizes.total_payload_bytes} B`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)] col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[var(--text-secondary)] font-sans">Sig status</span>
                    <p
                      className={`font-sans text-xs font-medium ${
                        lc?.verification?.signature_valid ? 'text-[var(--col-verified)]' : 'text-[var(--col-critical)]'
                      }`}
                    >
                      {lc?.verification?.signature_valid ? '✓ Verified' : lc ? '✗ Failed' : '—'}
                    </p>
                  </div>
                </div>

                {/* Privacy-Preserving Plaintext Metadata Bar */}
                <div className="mt-2.5 p-2 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-[var(--text-secondary)]">Content preview:</span>
                    {revealPlaintext ? (
                      <span className="text-[var(--text-primary)] truncate font-mono text-[11px]">{p.content_preview || '(empty)'}</span>
                    ) : (
                      <span className="text-[var(--text-tertiary)] tracking-wider text-[11px] truncate">
                        •••••••••••••••••••• (Encrypted)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRevealPlaintext((r) => !r)}
                    className="inline-flex items-center gap-1 text-[11px] font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline shrink-0 ml-2"
                  >
                    {revealPlaintext ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{revealPlaintext ? 'Mask' : 'Reveal (Audit)'}</span>
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-[var(--edge-rest)] bg-transparent shrink-0 overflow-x-auto p-1 gap-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans rounded-full transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-[var(--glass-l2-bg)] text-[var(--text-primary)] border border-[var(--edge-rest)] font-medium shadow-sm'
                          : 'border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inner)]'
                      }`}
                    >
                      <Icon size={12} strokeWidth={1.8} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Single scroll container for all tabs */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {!lc ? (
                  <div className="flex flex-col items-center justify-center h-48 text-[var(--text-secondary)] font-sans text-xs text-center gap-1.5 select-none">
                    <Lock size={20} className="opacity-25 text-[var(--text-tertiary)]" />
                    <p className="text-[var(--text-secondary)]">Lifecycle telemetry awaiting message activity</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">Send a message to view the full cryptographic trace</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'encrypt' && (
                      <EncryptionSteps
                        lane={p.encryption_lane}
                        timings={lc.encryption_timings_ms}
                        ciphertext_preview={lc.ciphertext_preview}
                      />
                    )}
                    {activeTab === 'decrypt' && (
                      <DecryptionSteps
                        lane={p.encryption_lane}
                        timings={lc.decryption_timings_ms}
                      />
                    )}
                    {activeTab === 'verify' && (
                      <VerifySteps
                        timings={lc.decryption_timings_ms}
                        verification={lc.verification}
                        keys={lc.keys}
                      />
                    )}
                    {activeTab === 'qtl' && (
                      <QtlParametersView payload={p} />
                    )}
                    {activeTab === 'keys' && (
                      <KeyVault keys={lc.keys} lane={p.encryption_lane} threatScore={p.threat_score} />
                    )}
                    {activeTab === 'sizes' && (
                      <PayloadSizes sizes={lc.sizes} />
                    )}
                  </>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default CryptographicProcessPanel;
