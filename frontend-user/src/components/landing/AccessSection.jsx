import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrambleText from './ScrambleText';
import { useAuth } from '../../hooks/useAuth';

/**
 * AccessSection (Page 03 / 03)
 * Liquid Glass implementation per design specification:
 * - Documented exception to sparse-glass rule on the Access page
 * - Two liquid cards: "Secure Chat" and "Supervisor Console"
 * - Translucent fill, heavy backdrop blur & saturation, bright inner specular rim
 * - Zero hardcoded URLs or ports in text (reads VITE_SUPERVISOR_URL)
 * - 7 Liquid Micro-Animations:
 *     1. Ambient gooey blobs (SVG metaball filter)
 *     2. Cursor-following specular highlight
 *     3. Hover swell & shimmer sweep
 *     4. Click ripple expansion
 *     5. Entrance pour-in settling
 *     6. Magnetic button pull
 *     7. Dot-matrix "ACCESS" heading scramble
 */
export default function AccessSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultSupervisorUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5174'
    : 'https://pqc-supervisor-dashboard.vercel.app';
  const supervisorUrl = import.meta.env.VITE_SUPERVISOR_URL || defaultSupervisorUrl;

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <section
      id="access"
      className="min-h-screen w-full snap-start flex flex-col justify-between p-6 sm:p-8 md:p-12 relative pb-28 sm:pb-32 border-t border-[var(--edge-rest)] select-none overflow-hidden"
    >
      {/* ── SVG Liquid Filter Definitions (Hidden) ────────────────────────── */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          {/* Authentic Chromium refraction lens */}
          <filter id="liquid-glass-refract" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Liquid Gooey / Metaball Filter for ambient blobs */}
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      {/* ── 1. Ambient Gooey Blobs (Floating behind cards) ────────────────── */}
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          style={{ filter: 'url(#liquid-goo)' }}
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25 overflow-hidden z-0"
        >
          <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-[var(--surface-elevated)] animate-pulse duration-[6000ms]" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-[var(--col-standard)]/10 animate-pulse duration-[8000ms]" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[var(--col-critical)]/10 animate-pulse duration-[7000ms]" />
        </div>
      )}

      {/* ── Heading: Dot-Matrix Title ─────────────────────────────────────── */}
      <header className="pt-2 md:pt-4 relative z-10">
        <h2 className="text-[clamp(2.2rem,7vw,5.5rem)] font-doto font-black tracking-tight uppercase leading-[0.9] text-[var(--text-primary)]">
          <ScrambleText text="ACCESS" trigger="inView" duration={800} />
        </h2>
      </header>

      {/* ── Main Liquid Cards Grid ────────────────────────────────────────── */}
      <div className="max-w-[960px] w-full my-auto py-4 sm:py-6 flex flex-col gap-6 relative z-10">
        <p className="text-xs md:text-sm uppercase tracking-wider text-[var(--text-secondary)] font-mono-light leading-relaxed">
          Select a terminal access point to launch the simulated post-quantum cryptographic application stack.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* ── CARD 1: SECURE CHAT ────────────────────────────────────────── */}
          <LiquidCard
            title="SECURE CHAT"
            badge="CLIENT"
            badgeColor="var(--col-standard)"
            description="Create a profile, add contacts, and exchange post-quantum authenticated messages with dynamic threat routing."
            primaryText={user ? 'CONTINUE TO CHAT →' : 'SIGN IN →'}
            primaryTo={user ? '/chat' : '/login'}
            secondaryText="Create profile"
            secondaryTo="/register"
            prefersReducedMotion={prefersReducedMotion}
          />

          {/* ── CARD 2: SUPERVISOR CONSOLE ─────────────────────────────────── */}
          <LiquidCard
            title="SUPERVISOR CONSOLE"
            badge="TELEMETRY"
            badgeColor="var(--col-critical)"
            description="Inspect real-time telemetry, monitor active QKD key reservoirs, observe threat scores, and control lane thresholds."
            primaryText="LAUNCH CONSOLE ↗"
            primaryHref={supervisorUrl}
            secondaryText="LIVE ARBITRATION"
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>

        <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-3">
          <span>SIMULATED ENVIRONMENT · DO NOT USE REAL PASSWORDS</span>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider flex items-center justify-between flex-wrap gap-2 pt-2 relative z-10">
        <span>POST-QUANTUM HYBRID SWITCHING ENVIRONMENT</span>
        <span className="font-mono">PAGE 03 / 03</span>
      </footer>
    </section>
  );
}

/**
 * LiquidCard Component
 * Encapsulates liquid glass aesthetics, cursor specular tracking,
 * hover swell, shimmer sweep, magnetic button, and click ripple.
 */
function LiquidCard({
  title,
  badge,
  badgeColor,
  description,
  primaryText,
  primaryTo = null,
  primaryHref = null,
  secondaryText,
  secondaryTo = null,
  prefersReducedMotion = false
}) {
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  // Cursor specular tracking
  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    // Magnetic pull on button
    if (buttonRef.current) {
      const bRect = buttonRef.current.getBoundingClientRect();
      const bCenterX = bRect.left + bRect.width / 2;
      const bCenterY = bRect.top + bRect.height / 2;
      const dist = Math.hypot(e.clientX - bCenterX, e.clientY - bCenterY);
      if (dist < 45) {
        setBtnOffset({
          x: (e.clientX - bCenterX) * 0.22,
          y: (e.clientY - bCenterY) * 0.22
        });
      } else {
        setBtnOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  // Click ripple
  const handleClick = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: rippleX, y: rippleY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        boxShadow:
          'inset 1px 1px 0 rgba(255, 255, 255, 0.22), inset -1px -1px 0 rgba(0, 0, 0, 0.12), 0 20px 45px -12px rgba(0, 0, 0, 0.35)'
      }}
      className="p-6 sm:p-8 rounded-[24px] border border-[var(--edge-rest)] bg-[var(--surface-inner)]/30 backdrop-blur-[28px] backdrop-saturate-[140%] flex flex-col justify-between gap-6 transition-all duration-300 relative overflow-hidden group hover:scale-[1.015] hover:border-[var(--edge-hover)]"
    >
      {/* 2. Cursor Specular Highlight */}
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle 220px at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.12), transparent 70%)`
          }}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-0"
        />
      )}

      {/* 3. Hover Shimmer Sweep */}
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"
        />
      )}

      {/* 4. Click Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          style={{ left: r.x, top: r.y }}
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text-primary)]/20 animate-ping pointer-events-none z-0"
        />
      ))}

      {/* Content Top */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--edge-rest)]">
          <span className="font-mono font-bold tracking-wider text-[var(--text-primary)] text-sm sm:text-base uppercase">
            {title}
          </span>
          <span
            style={{ color: badgeColor }}
            className="text-[10px] font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5"
          >
            <span
              style={{ backgroundColor: badgeColor }}
              className="inline-block w-1.5 h-1.5 rounded-full opacity-80"
            />
            {badge}
          </span>
        </div>

        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed font-sans normal-case">
          {description}
        </p>
      </div>

      {/* Content Actions */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-[var(--edge-rest)]">
        {/* 6. Magnetic Button */}
        {primaryTo ? (
          <Link
            ref={buttonRef}
            to={primaryTo}
            style={{
              transform: prefersReducedMotion
                ? 'none'
                : `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="px-5 py-2.5 rounded-[12px] bg-[var(--text-primary)] text-[var(--text-inverse)] font-mono text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            {primaryText}
          </Link>
        ) : (
          <a
            ref={buttonRef}
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              transform: prefersReducedMotion
                ? 'none'
                : `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className="px-5 py-2.5 rounded-[12px] bg-[var(--text-primary)] text-[var(--text-inverse)] font-mono text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            {primaryText}
          </a>
        )}

        {secondaryTo ? (
          <Link
            to={secondaryTo}
            className="text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase underline decoration-[var(--edge-rest)] hover:decoration-[var(--text-primary)] transition-colors"
          >
            {secondaryText}
          </Link>
        ) : (
          <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
            {secondaryText}
          </span>
        )}
      </div>
    </div>
  );
}
