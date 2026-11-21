import React, { useState, useEffect } from 'react';
import ScrambleText from './ScrambleText';

/**
 * AwarenessSection (Page 02 / 03)
 * Modeled on yannickgregoire.nl (Animation 7 & Reference Frames 3-4):
 * - Merges Threat & Solution into ONE concise viewport
 * - Set in Urbanist font (max ~90 words per column), NOT dense monospace walls
 * - Left column: The Threat (3 short points: Shor, HNDL, Mosca's inequality)
 * - Right column: The Solution (3 short points: PQC lattice, Hybrid HKDF, Switching)
 * - Interactive 1-line signature ASCII Harvest Strip (Key 'D' or Click to decrypt)
 * - Verified NIST citations (FIPS 203/204/205 and IR 8547 transition guidance)
 */
export default function AwarenessSection() {
  const [isDeciphered, setIsDeciphered] = useState(false);

  // Keyboard shortcut: Key 'D' toggles illustrative harvest decryption
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'd' || e.key === 'D') {
        setIsDeciphered((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      id="awareness"
      className="min-h-screen w-full snap-start flex flex-col justify-between p-6 sm:p-8 md:p-12 relative pb-28 sm:pb-32 border-t border-[var(--edge-rest)] select-none"
    >
      {/* Dot-matrix Heading */}
      <header className="pt-2 md:pt-4">
        <h2 className="text-[clamp(2.2rem,7vw,5.5rem)] font-doto font-black tracking-tight uppercase leading-[0.9] text-[var(--text-primary)]">
          <ScrambleText text="AWARENESS" trigger="inView" duration={800} />
        </h2>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1100px] w-full my-auto py-4 sm:py-6 flex flex-col gap-6 sm:gap-8">
        {/* 2-Column Concise Copy in Urbanist font */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 text-sm sm:text-[15px] font-sans leading-relaxed text-[var(--text-secondary)]">
          {/* Column 1: The Threat */}
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text-primary)] border-b border-[var(--edge-rest)] pb-1.5 font-medium flex items-center justify-between">
              <span>01 / THE THREAT</span>
              <span className="text-[10px] text-[var(--col-critical)] font-mono">VULNERABILITY</span>
            </h3>
            <p className="text-justify font-sans">
              <strong className="text-[var(--text-primary)] font-medium">Asymmetric Collapse:</strong> RSA, Diffie-Hellman, and Elliptic Curve Cryptography depend on mathematical problems that Shor's algorithm solves in polynomial time on large fault-tolerant quantum hardware.
            </p>
            <p className="text-justify font-sans">
              <strong className="text-[var(--text-primary)] font-medium">Harvest Now, Decrypt Later:</strong> Adversaries are capturing encrypted backbone telecommunications today to store and decrypt retrospectively once cryptanalytically relevant quantum computers emerge.
            </p>
            <p className="text-justify font-sans">
              <strong className="text-[var(--text-primary)] font-medium">Mosca's Inequality:</strong> If security shelf-life (<em className="font-mono">X</em>) plus migration time (<em className="font-mono">Y</em>) exceeds quantum arrival (<em className="font-mono">Z</em>), exposure has already occurred.
            </p>
          </div>

          {/* Column 2: The Solution */}
          <div className="flex flex-col gap-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text-primary)] border-b border-[var(--edge-rest)] pb-1.5 font-medium flex items-center justify-between">
              <span>02 / THE SOLUTION</span>
              <span className="text-[10px] text-[var(--col-standard)] font-mono">HYBRID ASSURANCE</span>
            </h3>
            <p className="text-justify font-sans">
              <strong className="text-[var(--text-primary)] font-medium">Post-Quantum Cryptography:</strong> NIST-standardized module-lattice algorithms (FIPS 203 ML-KEM and FIPS 204 ML-DSA) provide proven resistance against both classical and quantum adversaries.
            </p>
            <p className="text-justify font-sans">
              <strong className="text-[var(--text-primary)] font-medium">Hybrid Defense:</strong> Combining NIST FIPS 203 ML-KEM-768 post-quantum lattice shared secrets with BB84 Quantum Key Distribution (QKD) one-time entropy via HKDF enforces dual-layer defense-in-depth: an attacker must break both independent quantum and mathematical mechanisms.
            </p>
            <p className="text-justify font-sans">
              <strong className="text-[var(--text-primary)] font-medium">Autonomous Switching:</strong> Real-time threat arbitration computes a quantum risk score (<em className="font-mono">Q_TL</em>) per payload, instantly routing high-sensitivity traffic into isolated Critical lanes.
            </p>
          </div>
        </div>

        {/* Signature Visual: Interactive 1-Line ASCII Harvest Strip */}
        <div
          onClick={() => setIsDeciphered((prev) => !prev)}
          className="p-3 sm:p-4 rounded-xl border border-[var(--edge-rest)] bg-[var(--surface-inner)]/25 backdrop-blur-sm cursor-pointer group hover:border-[var(--edge-hover)] transition-all font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-secondary)]"
          title="Click or press 'D' to simulate Q-Day decryption"
          role="button"
          tabIndex={0}
          aria-label="Interactive harvest now decrypt later demonstration"
        >
          <div className="flex items-center justify-between border-b border-[var(--edge-rest)] pb-1.5 mb-2 text-[9px] text-[var(--text-tertiary)]">
            <span>HARVEST NOW, DECRYPT LATER · TIMELINE DEMONSTRATION</span>
            <span className="group-hover:text-[var(--text-primary)] transition-colors">
              [ PRESS 'D' OR CLICK TO {isDeciphered ? 'RESET' : 'DECIPHER'} ]
            </span>
          </div>

          <div className="flex flex-col gap-1.5 font-mono">
            {/* RSA/ECC Row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="w-20 text-[var(--text-primary)]">RSA / ECC</span>
              <span className="text-[var(--text-tertiary)]">───────►</span>
              <span className={isDeciphered ? 'text-[var(--col-critical)] font-bold' : 'text-[var(--text-secondary)]'}>
                {isDeciphered ? 'EXPOSED: "TOP_SECRET_COMM"' : 'CIPHER: §¶∆≈¥µ¢§¶∆≈¥µ¢§¶'}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${isDeciphered ? 'bg-[var(--col-critical)]/15 text-[var(--col-critical)]' : 'bg-[var(--surface-inner)] text-[var(--text-tertiary)]'}`}>
                {isDeciphered ? 'COMPROMISED AT Q-DAY' : 'ARCHIVED BY ADVERSARY'}
              </span>
            </div>

            {/* PQC Row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="w-20 text-[var(--col-standard)] font-medium">PQCHS</span>
              <span className="text-[var(--text-tertiary)]">───────►</span>
              <span className="text-[var(--col-standard)] font-medium">
                {isDeciphered ? 'IMMUNE: ▓▒░▓▒░▓▒░▓▒░▓▒░' : 'CIPHER: ▓▒░▓▒░▓▒░▓▒░▓▒░'}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--col-standard)]/15 text-[var(--col-standard)]">
                ML-KEM + BB84 QKD SECURE
              </span>
            </div>
          </div>
        </div>

        {/* Hedged Disclaimer */}
        <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
          SIMULATION BUILD · DO NOT USE REAL PASSWORDS
        </div>
      </div>

      {/* Verified NIST Sources Footer */}
      <footer className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <a
            href="https://csrc.nist.gov/pubs/fips/203/final"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors underline decoration-[var(--edge-rest)]"
          >
            NIST FIPS 203 (ML-KEM) ↗
          </a>
          <a
            href="https://csrc.nist.gov/pubs/fips/204/final"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors underline decoration-[var(--edge-rest)]"
          >
            FIPS 204 (ML-DSA) ↗
          </a>
          <a
            href="https://csrc.nist.gov/pubs/fips/205/final"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors underline decoration-[var(--edge-rest)]"
          >
            FIPS 205 (SLH-DSA) ↗
          </a>
          <a
            href="https://csrc.nist.gov/pubs/ir/8547/ipd"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors underline decoration-[var(--edge-rest)]"
          >
            NIST IR 8547 GUIDANCE (~2030 DEPRECATE / ~2035 DISALLOW) ↗
          </a>
        </div>
        <span className="font-mono">PAGE 02 / 03</span>
      </footer>
    </section>
  );
}
