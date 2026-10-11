import React, { useState, useRef, useEffect } from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import {
  Lock, Unlock, ShieldCheck, ShieldAlert, Key, Clock, FileText,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Eye, EyeOff,
  Activity, Layers, Hash, Cpu
} from 'lucide-react';

// ─── Sub-components ─────────────────────────────────────────────────────────

const HexField = ({ label, value, color = 'text-green-400', copyable = false }) => {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);
  if (!value) return null;
  const preview = value.length > 48 ? value.slice(0, 48) + '…' : value;
  const displayed = show ? value : preview;

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          {value.length > 48 && (
            <button onClick={() => setShow(s => !s)} className="text-slate-500 hover:text-slate-300 transition-colors">
              {show ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
          )}
          {copyable && (
            <button onClick={handleCopy} className="text-slate-500 hover:text-pqc transition-colors text-[10px] font-mono">
              {copied ? '✓ Copied' : 'copy'}
            </button>
          )}
        </div>
      </div>
      <p className={`font-mono text-[10px] break-all leading-relaxed ${color} bg-black/20 rounded px-2 py-1 border border-white/5`}>
        {displayed}
      </p>
    </div>
  );
};

const TimingBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mb-1.5">
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[10px] text-slate-400">{label}</span>
        <span className={`text-[10px] font-mono ${color}`}>{value.toFixed(3)} ms</span>
      </div>
      <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SizeBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3 text-[10px]">
      <span className="text-slate-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono ${color} w-12 text-right shrink-0`}>{value} B</span>
    </div>
  );
};

const EncryptionSteps = ({ lane, timings, keys, sizes, ciphertext_preview }) => {
  const isCritical = lane === 'critical';
  const maxTiming = Math.max(...Object.values(timings || {}).filter(v => typeof v === 'number'), 1);

  const steps = isCritical ? [
    { label: '1. QKD Key Retrieved', icon: Key, color: 'text-qkd', description: 'Single-use 256-bit pre-shared quantum key fetched from reservoir' },
    { label: '2. ML-KEM-768 Keypair', icon: Cpu, color: 'text-pqc', description: 'NIST FIPS 203: Lattice-based Key Encapsulation Mechanism keypair generated' },
    { label: '3. KEM Encapsulation', icon: Lock, color: 'text-pqc', description: 'Ciphertext + shared secret encapsulated using recipient public key' },
    { label: '4. Hybrid HKDF Derivation', icon: Hash, color: 'text-purple-400', description: 'HKDF-SHA256(qkd_key ∥ kem_secret) → 256-bit AES master key' },
    { label: '5. AES-256-GCM Encryption', icon: Lock, color: 'text-blue-400', description: 'Authenticated symmetric encryption with random 96-bit nonce' },
    { label: '6. ML-DSA-65 Signature', icon: ShieldCheck, color: 'text-green-400', description: 'NIST FIPS 204: Dilithium3 signs (kem_ct ∥ ciphertext ∥ tag)' },
  ] : [
    { label: '1. ML-KEM-768 Keypair', icon: Cpu, color: 'text-pqc', description: 'NIST FIPS 203: Lattice-based Key Encapsulation Mechanism keypair generated' },
    { label: '2. KEM Encapsulation', icon: Lock, color: 'text-pqc', description: 'Ciphertext + shared secret encapsulated using recipient public key' },
    { label: '3. HKDF Key Derivation', icon: Hash, color: 'text-purple-400', description: 'HKDF-SHA256(kem_secret) → 256-bit AES master key' },
    { label: '4. AES-256-GCM Encryption', icon: Lock, color: 'text-blue-400', description: 'Authenticated symmetric encryption with random 96-bit nonce' },
    { label: '5. ML-DSA-65 Signature', icon: ShieldCheck, color: 'text-green-400', description: 'NIST FIPS 204: Dilithium3 signs (kem_ct ∥ ciphertext ∥ tag)' },
  ];

  return (
    <div>
      {/* Step Diagram */}
      <div className="space-y-1.5 mb-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-start gap-2">
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${step.color.replace('text-', 'bg-')}/20 border border-current/30 ${step.color}`}>
                <Icon size={11} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold ${step.color}`}>{step.label}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timing Breakdown */}
      {timings && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5"><Clock size={11} /> Encryption Timings</p>
          <TimingBar label="KEM Encap" value={timings.kem_encap || 0} max={maxTiming} color="text-pqc" />
          <TimingBar label="HKDF Derivation" value={timings.hkdf_derivation || 0} max={maxTiming} color="text-purple-400" />
          <TimingBar label="AES-GCM Encrypt" value={timings.aes_gcm_encrypt || 0} max={maxTiming} color="text-blue-400" />
          <TimingBar label="Sig Generation" value={timings.sig_generation || 0} max={maxTiming} color="text-green-400" />
          <div className="mt-2 pt-2 border-t border-white/5 flex justify-between">
            <span className="text-[10px] text-slate-400">Total Encryption</span>
            <span className="text-[10px] font-mono text-white font-bold">{timings.total_encryption?.toFixed(3)} ms</span>
          </div>
        </div>
      )}

      {/* Ciphertext Preview */}
      {ciphertext_preview && (
        <HexField label="Ciphertext (AES-GCM output)" value={ciphertext_preview} color="text-amber-400" />
      )}
    </div>
  );
};

const DecryptionSteps = ({ lane, timings, verification }) => {
  const isCritical = lane === 'critical';
  const maxTiming = Math.max(...Object.values(timings || {}).filter(v => typeof v === 'number'), 1);

  const steps = isCritical ? [
    { label: '1. ML-DSA-65 Verify Signature', icon: ShieldCheck, color: 'text-green-400', description: 'Verifies (kem_ct ∥ ciphertext ∥ tag) authenticates the sender and detects tampering' },
    { label: '2. ML-KEM-768 Decapsulation', icon: Unlock, color: 'text-pqc', description: 'Recipient secret key decapsulates the shared secret from KEM ciphertext' },
    { label: '3. Hybrid HKDF Key Recovery', icon: Hash, color: 'text-purple-400', description: 'HKDF-SHA256(qkd_key ∥ kem_secret) → same 256-bit AES master key' },
    { label: '4. AES-256-GCM Decrypt', icon: Unlock, color: 'text-blue-400', description: 'Authenticated decryption + GCM tag verification (integrity check)' },
  ] : [
    { label: '1. ML-DSA-65 Verify Signature', icon: ShieldCheck, color: 'text-green-400', description: 'Verifies (kem_ct ∥ ciphertext ∥ tag) and confirms sender authenticity' },
    { label: '2. ML-KEM-768 Decapsulation', icon: Unlock, color: 'text-pqc', description: 'Recipient secret key decapsulates the shared secret from KEM ciphertext' },
    { label: '3. HKDF Key Recovery', icon: Hash, color: 'text-purple-400', description: 'HKDF-SHA256(kem_secret) → same 256-bit AES key re-derived independently' },
    { label: '4. AES-256-GCM Decrypt', icon: Unlock, color: 'text-blue-400', description: 'Authenticated decryption + GCM tag verification (integrity check)' },
  ];

  return (
    <div>
      {/* Step Diagram */}
      <div className="space-y-1.5 mb-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-start gap-2">
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${step.color.replace('text-', 'bg-')}/20 border border-current/30 ${step.color}`}>
                <Icon size={11} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold ${step.color}`}>{step.label}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decryption Timings */}
      {timings && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5"><Clock size={11} /> Decryption Timings</p>
          <TimingBar label="Sig Verify" value={timings.sig_verify || 0} max={maxTiming} color="text-green-400" />
          <TimingBar label="KEM Decap" value={timings.kem_decap || 0} max={maxTiming} color="text-pqc" />
          <TimingBar label="HKDF Recovery" value={timings.hkdf_derivation || 0} max={maxTiming} color="text-purple-400" />
          <TimingBar label="AES-GCM Decrypt" value={timings.aes_gcm_decrypt || 0} max={maxTiming} color="text-blue-400" />
          <div className="mt-2 pt-2 border-t border-white/5 flex justify-between">
            <span className="text-[10px] text-slate-400">Total Decryption</span>
            <span className="text-[10px] font-mono text-white font-bold">{timings.total_decryption?.toFixed(3)} ms</span>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {verification && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Signature Valid', ok: verification.signature_valid },
            { label: 'KEM Secret Match', ok: verification.secret_match },
            { label: 'GCM Tag Verified', ok: verification.tag_verified },
            { label: 'Plaintext Recovered', ok: verification.plaintext_match },
          ].map(({ label, ok }) => (
            <div key={label} className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono ${ok ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KeyVault = ({ keys, lane }) => {
  const isCritical = lane === 'critical';
  return (
    <div className="space-y-2">
      {isCritical && keys.qkd_key_id && (
        <div className="p-2 rounded bg-qkd/5 border border-qkd/20">
          <p className="text-[10px] uppercase tracking-wider text-qkd font-semibold mb-1.5 flex items-center gap-1"><Key size={10} /> QKD Key (Pre-Shared, 256-bit)</p>
          <HexField label="Key ID (SHA-256 fingerprint)" value={keys.qkd_key_id} color="text-qkd" />
          {keys.qkd_key_preview && <HexField label="Key Preview" value={keys.qkd_key_preview} color="text-qkd" />}
          {keys.qkd_key_hex && <HexField label="Full Key (64 hex = 32 bytes)" value={keys.qkd_key_hex} color="text-qkd" copyable />}
        </div>
      )}
      <HexField label={`ML-KEM-768 Public Key (${keys.kem_public_key_len || 1184} bytes)`} value={keys.kem_public_key_preview} color="text-pqc" />
      <HexField label="KEM Shared Secret (32 bytes)" value={keys.kem_shared_secret_preview} color="text-cyan-400" />
      <HexField label="Derived AES-256 Key (32 bytes)" value={keys.derived_aes_key_preview} color="text-blue-400" copyable />
      <HexField label="AES-GCM Nonce (12 bytes)" value={keys.nonce_hex} color="text-yellow-300" />
      <HexField label="AES-GCM Auth Tag (16 bytes)" value={keys.tag_hex} color="text-orange-400" />
      <HexField label={`ML-DSA-65 Sig Public Key (${keys.sig_public_key_len || 1952} bytes)`} value={keys.sig_public_key_preview} color="text-green-400" />
      <HexField label={`ML-DSA-65 Signature (${keys.signature_len || 3293} bytes)`} value={keys.signature_preview} color="text-purple-400" />
    </div>
  );
};

const PayloadSizes = ({ sizes, lane }) => {
  if (!sizes) return null;
  const totalBytes = sizes.total_payload_bytes || 1;
  return (
    <div>
      <SizeBar label="Plaintext" value={sizes.plaintext_bytes} total={totalBytes} color="text-green-400" />
      <div className="my-1.5 border-t border-white/5" />
      <SizeBar label="KEM Ciphertext" value={sizes.kem_ciphertext_bytes} total={totalBytes} color="text-pqc" />
      <SizeBar label="AES-GCM Ciphertext" value={sizes.ciphertext_bytes} total={totalBytes} color="text-blue-400" />
      <SizeBar label="Nonce (IV)" value={sizes.nonce_bytes} total={totalBytes} color="text-yellow-300" />
      <SizeBar label="Auth Tag" value={sizes.tag_bytes} total={totalBytes} color="text-orange-400" />
      <SizeBar label="Signature" value={sizes.signature_bytes} total={totalBytes} color="text-purple-400" />
      <div className="mt-2 pt-2 border-t border-white/5 flex justify-between">
        <span className="text-[10px] text-slate-400">Total Payload</span>
        <span className="text-[10px] font-mono text-white">{sizes.total_payload_bytes} B</span>
        <span className="text-[10px] font-mono text-slate-400">×{sizes.expansion_ratio} overhead</span>
      </div>
    </div>
  );
};

// ─── Main Panel ──────────────────────────────────────────────────────────────

const CryptographicProcessPanel = () => {
  const { events } = useDashboardState();
  const listRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('encrypt');

  const messageEvents = (events || [])
    .filter(e => e.event_type === 'message_encrypted')
    .slice(0, 30);

  useEffect(() => {
    if (messageEvents.length > 0 && !selectedId) {
      setSelectedId(`${messageEvents[0].timestamp}-0`);
    }
  }, [messageEvents.length]);

  const selected = selectedId
    ? messageEvents.find((e, i) => `${e.timestamp}-${i}` === selectedId)
    : null;

  const lc = selected?.payload?.lifecycle;

  const tabs = [
    { id: 'encrypt', label: 'Encryption Steps', icon: Lock },
    { id: 'decrypt', label: 'Decryption Steps', icon: Unlock },
    { id: 'keys', label: 'Key Vault', icon: Key },
    { id: 'sizes', label: 'Payload Sizes', icon: Layers },
  ];

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* Left: Event List */}
      <div className="w-64 shrink-0 border-r border-dark-700/80 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-dark-700/80 bg-dark-800/80">
          <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Activity size={12} className="text-pqc" /> Live Crypto Events
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{messageEvents.length} messages processed</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 p-2" ref={listRef}>
          {messageEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-[11px] text-center font-mono gap-2">
              <Lock size={20} className="opacity-40" />
              Send a message in<br />the chat to see crypto
            </div>
          ) : (
            messageEvents.map((evt, idx) => {
              const id = `${evt.timestamp}-${idx}`;
              const p = evt.payload;
              const isCritical = p.encryption_lane === 'critical';
              const isSelected = selectedId === id;
              const lc2 = p.lifecycle;
              const totalMs = lc2?.total_crypto_latency_ms;

              return (
                <button
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={`w-full text-left rounded-lg p-2.5 border transition-all ${
                    isSelected
                      ? isCritical
                        ? 'bg-qkd/15 border-qkd/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        : 'bg-pqc/15 border-pqc/50 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                      : 'bg-dark-800/40 border-dark-700/30 hover:border-white/10 hover:bg-dark-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      isCritical
                        ? 'bg-qkd/20 text-qkd border-qkd/30'
                        : 'bg-pqc/20 text-pqc border-pqc/30'
                    }`}>
                      {isCritical ? '🔐 QKD' : '🛡️ PQC'}
                    </span>
                    {totalMs != null && (
                      <span className="text-[9px] font-mono text-slate-500">{totalMs.toFixed(1)}ms</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-300 truncate mb-0.5">
                    {p.content_preview || p.file_name || '(no preview)'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false })}
                    {p.high_security && <span className="ml-1 text-red-400">● HIGH-SEC</span>}
                  </p>
                  {lc2?.verification && (
                    <div className="mt-1 flex items-center gap-1">
                      <CheckCircle size={10} className="text-green-400" />
                      <span className="text-[9px] text-green-400">Verified & Authenticated</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Detail View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 font-mono text-[12px] gap-3">
            <ShieldCheck size={32} className="opacity-30" />
            <p>Select a message to inspect its cryptographic process</p>
          </div>
        ) : (() => {
          const p = selected.payload;
          const isCritical = p.encryption_lane === 'critical';
          const totalMs = lc?.total_crypto_latency_ms;

          return (
            <>
              {/* Header */}
              <div className={`p-3 border-b border-dark-700/80 shrink-0 ${
                isCritical ? 'bg-qkd/5' : 'bg-pqc/5'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isCritical
                        ? <ShieldAlert size={16} className="text-qkd" />
                        : <ShieldCheck size={16} className="text-pqc" />
                      }
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${isCritical ? 'text-qkd' : 'text-pqc'}`}>
                        {isCritical ? 'Critical Lane — QKD-256 + ML-KEM-768 + ML-DSA-65' : 'Standard Lane — ML-KEM-768 + ML-DSA-65'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {lc?.security_standard || (isCritical
                        ? 'NIST FIPS 203 + FIPS 204 + AES-256-GCM + QKD'
                        : 'NIST FIPS 203 + FIPS 204 + AES-256-GCM')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-500">Total Crypto Latency</div>
                    <div className="text-lg font-mono font-bold text-white">
                      {totalMs != null ? `${totalMs.toFixed(2)} ms` : '—'}
                    </div>
                    <div className="text-[9px] text-slate-600 font-mono">
                      {new Date(selected.timestamp).toLocaleTimeString([], { hour12: false })}
                    </div>
                  </div>
                </div>
                {/* Quick stats */}
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[
                    { label: 'Threat Score', value: p.threat_score?.toFixed(3) ?? '—', color: parseFloat(p.threat_score) > 0.7 ? 'text-qkd' : 'text-pqc' },
                    { label: 'Enc. Time', value: lc?.encryption_timings_ms?.total_encryption != null ? `${lc.encryption_timings_ms.total_encryption.toFixed(2)}ms` : '—', color: 'text-blue-400' },
                    { label: 'Dec. Time', value: lc?.decryption_timings_ms?.total_decryption != null ? `${lc.decryption_timings_ms.total_decryption.toFixed(2)}ms` : '—', color: 'text-purple-400' },
                    { label: 'Payload', value: lc?.sizes?.total_payload_bytes != null ? `${lc.sizes.total_payload_bytes}B` : '—', color: 'text-slate-300' },
                    { label: 'Sig Status', value: lc?.verification?.signature_valid ? '✓ VALID' : lc ? '✗ FAIL' : '—', color: lc?.verification?.signature_valid ? 'text-green-400' : 'text-red-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-dark-800/60 rounded px-2 py-1.5 border border-white/5">
                      <p className="text-[9px] text-slate-500">{s.label}</p>
                      <p className={`text-[11px] font-mono font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-dark-700/80 bg-dark-800/40 shrink-0">
                {tabs.map(t => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium transition-all border-b-2 ${
                        isActive
                          ? 'border-pqc text-pqc bg-pqc/5'
                          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={12} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {!lc ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 font-mono text-[11px] gap-2">
                    <Lock size={24} className="opacity-30" />
                    <p>Send a new message to generate full crypto trace</p>
                    <p className="text-[10px]">(events before the upgrade may not have lifecycle data)</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'encrypt' && (
                      <EncryptionSteps
                        lane={p.encryption_lane}
                        timings={lc.encryption_timings_ms}
                        keys={lc.keys}
                        sizes={lc.sizes}
                        ciphertext_preview={lc.ciphertext_preview}
                      />
                    )}
                    {activeTab === 'decrypt' && (
                      <DecryptionSteps
                        lane={p.encryption_lane}
                        timings={lc.decryption_timings_ms}
                        verification={lc.verification}
                      />
                    )}
                    {activeTab === 'keys' && (
                      <KeyVault keys={lc.keys} lane={p.encryption_lane} />
                    )}
                    {activeTab === 'sizes' && (
                      <PayloadSizes sizes={lc.sizes} lane={p.encryption_lane} />
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
