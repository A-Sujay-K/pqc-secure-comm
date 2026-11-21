import React, { useEffect, useRef, useState, useCallback } from 'react';
import TitleWipe from '../components/landing/TitleWipe';
import ScrambleText from '../components/landing/ScrambleText';
import QuantumComputerHero from '../home/qc/QuantumComputerHero';
import ShortcutBar from '../components/landing/ShortcutBar';
import AwarenessSection from '../components/landing/AwarenessSection';
import AccessSection from '../components/landing/AccessSection';
import { useTheme } from '../theme/useTheme';

const SECTIONS = ['home', 'awareness', 'access'];
const CRITICAL_THRESHOLD = '0.70';

export default function HomePage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('home');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  // Detect touch capability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    const container = containerRef.current;
    if (el && container) {
      container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const navigateRelative = useCallback((direction) => {
    const currentIndex = SECTIONS.indexOf(activeSection);
    if (direction === 'up' && currentIndex > 0) {
      scrollToSection(SECTIONS[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < SECTIONS.length - 1) {
      scrollToSection(SECTIONS[currentIndex + 1]);
    }
  }, [activeSection, scrollToSection]);

  const handleScroll = (e) => {
    const top = e.target.scrollTop;
    const windowH = window.innerHeight || 800;
    const p = Math.min(1, Math.max(0, top / windowH));
    setScrollProgress(p);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();

      if (key === 'H') {
        e.preventDefault();
        scrollToSection('home');
      } else if (key === 'A') {
        e.preventDefault();
        scrollToSection('awareness');
      } else if (key === 'E') {
        e.preventDefault();
        scrollToSection('access');
      } else if (key === 'I') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateRelative('up');
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        navigateRelative('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToSection, toggleTheme, navigateRelative]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: [0.5] }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen w-screen overflow-y-scroll overflow-x-hidden snap-y snap-mandatory no-scrollbar text-[var(--text-primary)] font-mono-light relative select-none"
    >
      {/* ── Fixed Vertical Compliance Badge (Right Edge) ──────────────────── */}
      <aside
        aria-label="Standards Compliance Badge"
        className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-40 pointer-events-none hidden sm:block"
      >
        <div className="rotate-90 origin-right text-[10px] md:text-[11px] tracking-[0.25em] text-[var(--text-tertiary)] uppercase font-mono-light whitespace-nowrap opacity-75">
          NIST FIPS 203 · 204 · SIMULATION BUILD
        </div>
      </aside>

      {/* ── SECTION 1: HOME (Page 01 / 03) ─────────────────────────────────── */}
      <section
        id="home"
        className="h-screen min-h-[640px] w-full snap-start flex flex-col justify-between p-6 sm:p-8 md:p-10 relative pb-16 sm:pb-20 overflow-hidden"
      >
        {/* Top Edge: Giant Edge-to-Edge Dot-Matrix Title */}
        <header className="pt-1 md:pt-2 w-full overflow-visible">
          <TitleWipe />
        </header>

        {/* Hero Area: Unboxed Photographic Quantum Computer Chandelier (Left) + 4 Diagonally Staggered Info Lines (Right) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center my-auto py-2">
          {/* Left Column (~35% width): Unboxed Photographic Quantum Computer Chandelier */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <QuantumComputerHero scrollProgress={scrollProgress} />
          </div>

          {/* Right Column (~65% width): 4 Diagonally Staggered Info Lines */}
          <div className="lg:col-span-7 flex flex-col justify-center gap-5 sm:gap-7 md:gap-9 pt-4 lg:pt-6">
            {/* Line 1: Main Proposition (Stagger 0) */}
            <div className="text-xs sm:text-sm md:text-base lg:text-lg tracking-wide uppercase font-mono-light text-[var(--text-primary)] pl-0">
              <span className="text-[var(--text-tertiary)] mr-2">/</span>
              <ScrambleText
                text="POST-QUANTUM CRYPTOGRAPHY WITH HYBRID SWITCHING"
                delay={200}
                duration={700}
              />
            </div>

            {/* Line 2: PQC Full Form (Stagger 1) with Teal Dot */}
            <div className="text-xs sm:text-sm md:text-base lg:text-lg tracking-wide uppercase font-mono-light pl-2 sm:pl-4 md:pl-6 lg:pl-8 text-[var(--text-primary)] group cursor-pointer">
              <span className="text-[var(--text-tertiary)] mr-2">/</span>
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--col-standard)] mr-2.5 align-middle opacity-90 group-hover:scale-125 transition-transform" />
              <ScrambleText
                text="PQC — POST-QUANTUM CRYPTOGRAPHY"
                hoverText="ML-KEM-768 + ML-DSA-65 (NIST FIPS 203 / 204)"
                delay={450}
                duration={500}
                className="hover:text-[var(--col-standard)] transition-colors"
              />
            </div>

            {/* Line 3: QKD Full Form (Stagger 2) with Amber Dot */}
            <div className="text-xs sm:text-sm md:text-base lg:text-lg tracking-wide uppercase font-mono-light pl-4 sm:pl-8 md:pl-12 lg:pl-14 text-[var(--text-primary)] group cursor-pointer">
              <span className="text-[var(--text-tertiary)] mr-2">/</span>
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--col-critical)] mr-2.5 align-middle opacity-90 group-hover:scale-125 transition-transform" />
              <ScrambleText
                text="QKD — QUANTUM KEY DISTRIBUTION"
                hoverText="BB84 PROTOCOL · 256-BIT ONE-TIME PAD ENTROPY"
                delay={700}
                duration={500}
                className="hover:text-[var(--col-critical)] transition-colors"
              />
            </div>

            {/* Line 4: Dynamic Switching (Stagger 3) - Hover reveals: ML-KEM-768 + BB84 QKD DUAL-LAYER SECURITY */}
            <div className="text-xs sm:text-sm md:text-base lg:text-lg tracking-wide uppercase font-mono-light pl-6 sm:pl-12 md:pl-16 lg:pl-20 text-[var(--text-primary)] group cursor-pointer">
              <span className="text-[var(--text-tertiary)] mr-2">/</span>
              <ScrambleText
                text="HYBRID SWITCHING"
                hoverText="ML-KEM-768 + BB84 QKD DUAL-LAYER SECURITY"
                delay={950}
                duration={500}
                className="hover:text-[var(--text-primary)] underline decoration-[var(--edge-rest)] hover:decoration-[var(--col-standard)] transition-colors inline-block"
              />
            </div>
          </div>
        </main>

        {/* Lower Right Navigation Prompt - Raised above floating shortcut capsule */}
        <footer className="flex justify-end pt-1 pb-4 sm:pb-6">
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-secondary)] font-mono-light flex items-center gap-1.5">
            <span className="text-[var(--text-tertiary)] mr-1">/</span>
            <span>{isTouchDevice ? 'SCROLL TO NAVIGATE' : 'USE YOUR KEYBOARD TO NAVIGATE'}</span>
            <span className="animate-bounce inline-block">↓</span>
          </div>
        </footer>
      </section>

      {/* ── SECTION 2: AWARENESS (Page 02 / 03 - Concise Threat & Solution) ── */}
      <AwarenessSection />

      {/* ── SECTION 3: ACCESS (Page 03 / 03 - Liquid Glass Cards) ─────────── */}
      <AccessSection />

      {/* ── Fixed Floating Glass Capsule Shortcut Bar ──────────────────────── */}
      <ShortcutBar
        activeSection={activeSection}
        onNavigateSection={scrollToSection}
        onNavigateRelative={navigateRelative}
        onToggleTheme={toggleTheme}
        resolvedTheme={resolvedTheme}
      />
    </div>
  );
}
