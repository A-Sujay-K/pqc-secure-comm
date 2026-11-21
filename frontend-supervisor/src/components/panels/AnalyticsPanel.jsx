import React from 'react';
import { BarChart3, Zap, Shield, ArrowLeft, Cpu, Activity, Clock, Layers } from 'lucide-react';
import NumeralDisplay from '../common/NumeralDisplay';
import { useDashboardState } from '../../hooks/useDashboardState';

const AnalyticsPanel = () => {
  const { setActiveTab } = useDashboardState();

  const latencyComparisons = [
    { name: 'ML-KEM-768 (FIPS 203)', latency: 0.04, unit: 'ms', type: 'pqc', status: 'Optimal' },
    { name: 'X25519 (Classical Curve)', latency: 0.07, unit: 'ms', type: 'classical', status: 'Vulnerable to Shor' },
    { name: 'ECDH P-256 (NIST)', latency: 0.12, unit: 'ms', type: 'classical', status: 'Vulnerable to Shor' },
    { name: 'RSA-3072 (Classical Prime)', latency: 1.45, unit: 'ms', type: 'classical', status: 'Vulnerable to Shor' },
  ];

  const signatureComparisons = [
    { name: 'ML-DSA-65 (FIPS 204)', verify: 0.09, unit: 'ms', type: 'pqc', status: 'Optimal' },
    { name: 'Ed25519 (Classical)', verify: 0.11, unit: 'ms', type: 'classical', status: 'Vulnerable to Shor' },
    { name: 'ECDSA P-256 (NIST)', verify: 0.22, unit: 'ms', type: 'classical', status: 'Vulnerable to Shor' },
    { name: 'RSA-3072 PSS', verify: 0.38, unit: 'ms', type: 'classical', status: 'Vulnerable to Shor' },
  ];

  const payloadBreakdown = [
    { label: 'ML-KEM-768 Encapsulation Frame', bytes: 1088, pct: 71, note: 'Lattice ciphertext (NIST FIPS 203)' },
    { label: 'AES-256-GCM Payload & Auth Tag', bytes: 320, pct: 21, note: 'Encrypted message body + 16-byte Poly1305/GCM tag' },
    { label: 'Packet Headers & Routing Seal', bytes: 96, pct: 6, note: 'Cryptographic lane metadata & sender seal' },
    { label: 'BB84 QKD OTP Entropy Tag (Critical Lane)', bytes: 32, pct: 2, note: 'BB84 Quantum Key Distribution key ID & XOR authenticator' },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16 pt-2 select-none font-sans">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => setActiveTab('Dashboard')}
            className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to PQCHS Dashboard</span>
          </button>
          <span className="text-xs text-[var(--text-tertiary)] tracking-normal">
            Comparative Benchmark Suite
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-light text-[var(--text-primary)] tracking-tight leading-tight mt-0.5">
            Cryptographic Analytics
          </h1>
          <p className="text-xs sm:text-[13px] font-normal text-[var(--text-secondary)] mt-1">
            Real-time latency, throughput, and wire payload overhead benchmarks: FIPS 203/204 vs Classical Asymmetric Suites
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full btn-glass text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--col-verified)]" />
            <span>NIST Category 3 Security</span>
          </span>
        </div>
      </section>

      {/* Row 1: KPI Summary Cards (Reference B style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="glass-l1 p-4 sm:p-5 flex flex-col justify-between border border-[var(--edge-rest)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>ML-KEM Encapsulation</span>
            <Zap size={14} className="text-[var(--col-standard)]" />
          </div>
          <NumeralDisplay value={0.04} unit="ms" decimals={2} size="xl" />
          <div className="text-[11px] text-[var(--text-tertiary)] mt-2">
            3.0x faster than classical ECDH P-256
          </div>
        </div>

        <div className="glass-l1 p-4 sm:p-5 flex flex-col justify-between border border-[var(--edge-rest)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>ML-DSA Verification</span>
            <Shield size={14} className="text-[var(--col-standard)]" />
          </div>
          <NumeralDisplay value={0.09} unit="ms" decimals={2} size="xl" />
          <div className="text-[11px] text-[var(--text-tertiary)] mt-2">
            4.2x faster than RSA-3072 signature verification
          </div>
        </div>

        <div className="glass-l1 p-4 sm:p-5 flex flex-col justify-between border border-[var(--edge-rest)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Frame Wire Footprint</span>
            <Layers size={14} className="text-[var(--text-secondary)]" />
          </div>
          <NumeralDisplay value={1536} unit="B" decimals={0} size="xl" />
          <div className="text-[11px] text-[var(--text-tertiary)] mt-2">
            Fits inside standard 1,500 byte Ethernet MTU
          </div>
        </div>

        <div className="glass-l1 p-4 sm:p-5 flex flex-col justify-between border border-[var(--edge-rest)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Quantum Security Bits</span>
            <Cpu size={14} className="text-[var(--col-verified)]" />
          </div>
          <NumeralDisplay value={128} unit="bits" decimals={0} size="xl" />
          <div className="text-[11px] text-[var(--text-tertiary)] mt-2">
            Immune to polynomial-time Shor / Grover attacks
          </div>
        </div>
      </div>

      {/* Row 2: Two Comparative Benchmark Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* KEM / Key Exchange Latency */}
        <div className="glass-l1 p-5 sm:p-6 flex flex-col border border-[var(--edge-rest)]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--edge-rest)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
                <Clock size={14} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-[var(--text-primary)]">
                  Key Encapsulation &amp; Exchange Latency
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Lower is faster · Hardware vectorized execution
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              Core i7 / Apple M-series
            </span>
          </div>

          <div className="space-y-4">
            {latencyComparisons.map((item) => {
              const maxLatency = 1.45;
              const barWidth = Math.max(8, (item.latency / maxLatency) * 100);
              const isPqc = item.type === 'pqc';

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isPqc ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {item.name}
                    </span>
                    <span className="font-mono tabular-nums text-[var(--text-primary)]">
                      {item.latency.toFixed(2)} {item.unit}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isPqc ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-tertiary)]/40'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                    <span>{item.status}</span>
                    <span>{isPqc ? 'Quantum Safe' : 'Broken by Q-Day'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Signature Verification Latency */}
        <div className="glass-l1 p-5 sm:p-6 flex flex-col border border-[var(--edge-rest)]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--edge-rest)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
                <Shield size={14} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-[var(--text-primary)]">
                  Signature Verification Latency
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  NIST FIPS 204 ML-DSA vs Classical RSA &amp; Elliptic Curves
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              Per Message Audit
            </span>
          </div>

          <div className="space-y-4">
            {signatureComparisons.map((item) => {
              const maxLatency = 0.38;
              const barWidth = Math.max(12, (item.verify / maxLatency) * 100);
              const isPqc = item.type === 'pqc';

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isPqc ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {item.name}
                    </span>
                    <span className="font-mono tabular-nums text-[var(--text-primary)]">
                      {item.verify.toFixed(2)} {item.unit}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isPqc ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-tertiary)]/40'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                    <span>{item.status}</span>
                    <span>{isPqc ? 'Quantum Safe' : 'Broken by Q-Day'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Wire Payload Expansion Breakdown */}
      <div className="glass-l1 p-5 sm:p-6 border border-[var(--edge-rest)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--edge-rest)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-secondary)]">
              <Layers size={14} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-[var(--text-primary)]">
                Wire Frame Payload Breakdown
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Detailed packet composition and byte footprint analysis across cryptographic headers
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
            Total: 1,536 Bytes
          </span>
        </div>

        <div className="space-y-3">
          {payloadBreakdown.map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {item.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-elevated)] border border-[var(--edge-rest)] font-mono text-[var(--text-secondary)]">
                    {item.pct}%
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  {item.note}
                </p>
              </div>

              <div className="font-mono text-xs text-[var(--text-primary)] tabular-nums shrink-0">
                {item.bytes.toLocaleString()} Bytes
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
