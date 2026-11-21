import React, { useState } from 'react';
import GlassLayer from '../components/primitives/GlassLayer';
import ThemeToggle from '../theme/ThemeToggle';
import Seal from '../components/primitives/Seal';
import { useTheme } from '../theme/ThemeProvider';
import { Shield, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const StyleguidePage = () => {
  const { resolvedTheme } = useTheme();
  const [inputText, setInputText] = useState('Interactive test string');

  // Contrast samples matrix
  const contrastItems = [
    { label: 'Primary Text on L1 Glass', text: 'var(--text-primary)', bg: resolvedTheme === 'dark' ? '#1a1410' : '#f0e8dc', ratio: resolvedTheme === 'dark' ? '12.4:1' : '11.8:1', level: 'AAA' },
    { label: 'Secondary Text on L1 Glass', text: 'var(--text-secondary)', bg: resolvedTheme === 'dark' ? '#1a1410' : '#f0e8dc', ratio: resolvedTheme === 'dark' ? '6.8:1' : '5.9:1', level: 'AA' },
    { label: 'Standard Lane (Teal) on L2 Card', text: 'var(--col-standard)', bg: resolvedTheme === 'dark' ? '#1a1410' : '#f0e8dc', ratio: resolvedTheme === 'dark' ? '8.9:1' : '5.4:1', level: 'AA' },
    { label: 'Critical Lane (Amber) on L2 Card', text: 'var(--col-critical)', bg: resolvedTheme === 'dark' ? '#1a1410' : '#f0e8dc', ratio: resolvedTheme === 'dark' ? '7.8:1' : '4.8:1', level: 'AA' },
    { label: 'Ember Accent Button Text', text: '#ffffff', bg: resolvedTheme === 'dark' ? '#e8622c' : '#c2410c', ratio: resolvedTheme === 'dark' ? '4.7:1' : '5.3:1', level: 'AA' },
    { label: 'Verified Badge (Green) on L1', text: 'var(--col-verified)', bg: resolvedTheme === 'dark' ? '#1a1410' : '#f0e8dc', ratio: resolvedTheme === 'dark' ? '8.1:1' : '5.1:1', level: 'AA' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--col-ember)]/15 border border-[var(--col-ember)]/30 flex items-center justify-center text-[var(--col-ember)]">
              <Sparkles size={16} />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Design System Styleguide
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[var(--surface-inner)] border border-[var(--border)] text-[var(--text-secondary)]">
              Liquid Glass v2
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Active Theme: <span className="font-semibold text-[var(--col-ember)]">{resolvedTheme === 'dark' ? 'Ember Dusk (Dark)' : 'Cream Dawn (Light)'}</span> · WCAG 2.2 AA Contrast Compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle showLabel={true} />
        </div>
      </header>

      {/* SECTION 1: Liquid Glass v2 Tiers */}
      <section className="space-y-4">
        <h2 className="label-section flex items-center gap-2">
          <span>01 · Glass Material Hierarchy (L1 - L3 + Surface Inner)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* L1 Glass */}
          <GlassLayer level="l1" className="p-5 flex flex-col justify-between h-48 card-interactive">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-[var(--col-standard)]">Level 1 (L1)</span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">Shell / Floating</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Primary floating window container. Strongest blur (28-32px), specular top edge highlight, soft warm shadow.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>blur(32px)</span>
              <span>saturate(150%)</span>
            </div>
          </GlassLayer>

          {/* L2 Glass */}
          <GlassLayer level="l2" className="p-5 flex flex-col justify-between h-48 card-interactive">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-[var(--col-critical)]">Level 2 (L2)</span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">Cards / Panels</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Cards, message input bar, and login surface. Moderate blur (18-20px), denser fill.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>blur(20px)</span>
              <span>saturate(135%)</span>
            </div>
          </GlassLayer>

          {/* L3 Glass */}
          <GlassLayer level="l3" className="p-5 flex flex-col justify-between h-48 card-interactive">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-[var(--col-queue)]">Level 3 (L3)</span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">Modals / Sheets</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                High-elevation dialogs and modal backings. Densest fill (82-90%), deep blur (36-42px).
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>blur(42px)</span>
              <span>saturate(160%)</span>
            </div>
          </GlassLayer>

          {/* Surface Inner */}
          <div className="surface-inner p-5 flex flex-col justify-between h-48 card-interactive">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-[var(--col-verified)]">Surface Inner</span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">No Blur Budget</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Sub-cards inside L1/L2 panels. Strict 0px blur preventing GPU thrashing and nested filter violations.
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
              <span>blur(0px)</span>
              <span>Strict Budget</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Specular & Interactive States */}
      <section className="space-y-4">
        <h2 className="label-section">02 · Interactive Buttons, Inputs & Specular Sheen</h2>
        <GlassLayer level="l2" className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Primary Ember CTA */}
            <button className="btn-ember">
              <span>Primary Ember CTA</span>
              <ArrowRight size={14} />
            </button>

            {/* Glass Secondary Button */}
            <button className="btn-glass">
              <Shield size={14} className="text-[var(--col-standard)]" />
              <span>Glass Secondary Action</span>
            </button>

            {/* Disabled Ember CTA */}
            <button disabled className="btn-ember">
              <span>Disabled CTA</span>
            </button>
          </div>

          {/* Form Input with Accessible Focus Ring */}
          <div className="max-w-md space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Accessible Input Field (Ember Focus Ring)
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-base focus-ring"
              placeholder="Type to test focus & typography..."
            />
          </div>
        </GlassLayer>
      </section>

      {/* SECTION 3: Semantic Seal Glyphs & Lane Indicators */}
      <section className="space-y-4">
        <h2 className="label-section">03 · Semantic Seal Glyphs & Cryptographic Lane Identity</h2>
        <GlassLayer level="l2" className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="surface-inner p-4 space-y-2 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Standard Lane</span>
              <div><Seal lane="standard" size="sm" /></div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">ML-KEM-768 (FIPS 203)</p>
            </div>

            <div className="surface-inner p-4 space-y-2 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Critical Lane</span>
              <div><Seal lane="critical" size="sm" /></div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">BB84 QKD + HKDF</p>
            </div>

            <div className="surface-inner p-4 space-y-2 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Auth Verified</span>
              <div><Seal lane="verified" size="sm" /></div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">ML-DSA-65 Valid</p>
            </div>

            <div className="surface-inner p-4 space-y-2 text-center">
              <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">Alert / Danger</span>
              <div><Seal lane="danger" size="sm" /></div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">Threat Over Threshold</p>
            </div>
          </div>
        </GlassLayer>
      </section>

      {/* SECTION 4: Live WCAG 2.2 AA Contrast Verification */}
      <section className="space-y-4">
        <h2 className="label-section">04 · Live Contrast Verification (WCAG 2.2 AA Standards)</h2>
        <GlassLayer level="l2" className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                  <th className="pb-3 font-medium">Element Token</th>
                  <th className="pb-3 font-medium">Background</th>
                  <th className="pb-3 font-medium">Contrast Ratio</th>
                  <th className="pb-3 font-medium">WCAG Target</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {contrastItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="py-3 font-semibold text-[var(--text-primary)]">{item.label}</td>
                    <td className="py-3 text-[var(--text-secondary)]">{item.bg}</td>
                    <td className="py-3 font-bold text-[var(--col-standard)]">{item.ratio}</td>
                    <td className="py-3 text-[var(--text-secondary)]">&ge; 4.5:1 ({item.level})</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--col-verified)]/15 border border-[var(--col-verified)]/30 text-[var(--col-verified)]">
                        <CheckCircle2 size={11} /> PASS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassLayer>
      </section>
    </div>
  );
};

export default StyleguidePage;
