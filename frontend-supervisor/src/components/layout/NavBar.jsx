import React, { useState, useEffect, useRef } from 'react';
import { Shield, Clock, BookOpen, Play, Square, Activity, LogOut, ExternalLink } from 'lucide-react';
import LiveBadge from '../common/LiveBadge';
import ThemeToggle from '../../theme/ThemeToggle';
import { useDashboardState } from '../../hooks/useDashboardState';
import { useDemoMode } from '../../hooks/useDemoMode';
import HarvestLabPanel from '../panels/HarvestLabPanel';

/**
 * NavBar — SUPERVISOR App (Reference B style)
 * Frosted top bar (L1 glass) with:
 * 1. App title / monogram left
 * 2. Centered Tab Capsule (Dashboard / Analytics / Infrastructure / Harvest Lab)
 * 3. Right: Clock, Live dot, Demo mode, Theme toggle, Avatar monogram disc.
 */
const NavBar = () => {
  const { isConnected, isReady, kpi, activeTab = 'Dashboard', setActiveTab } = useDashboardState();
  const { isRunning, step, total, currentLane, statusMessage, startDemo, stopDemo } = useDemoMode();
  const [time, setTime] = useState(new Date());
  const [isHarvestLabOpen, setIsHarvestLabOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setIsAdminMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsAdminMenuOpen(false);
    };

    if (isAdminMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminMenuOpen]);

  const tabs = ['Dashboard', 'Analytics', 'Infrastructure', 'Harvest Lab'];

  const getHomeUrl = () => {
    const envUrl = import.meta.env.VITE_HOME_URL;
    const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    if (isLocal) {
      return envUrl || 'http://localhost:5173';
    }
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl;
    }
    return 'https://pqc-secure-comm.vercel.app';
  };

  const handleTabClick = (tab) => {
    if (tab === 'Harvest Lab') {
      setIsHarvestLabOpen(true);
    } else {
      if (setActiveTab) setActiveTab(tab);
    }
  };

  return (
    <>
      <header className="h-16 glass-l1 border-b border-[var(--edge-rest)] border-t-0 border-x-0 rounded-none px-3 sm:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 select-none">
        {/* Left: App Title / Monogram */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            onClick={() => setActiveTab && setActiveTab('Dashboard')}
            className="w-8 h-8 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center text-[var(--text-primary)] shrink-0 shadow-sm cursor-pointer"
            title="Return to PQCHS Dashboard"
          >
            <Shield size={16} strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-2">
            <span
              onClick={() => setActiveTab && setActiveTab('Dashboard')}
              className="text-sm font-medium tracking-tight text-[var(--text-primary)] cursor-pointer"
            >
              PQC Secure Comm
            </span>
            <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-sans bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-tertiary)] uppercase">
              FIPS 203 / 204
            </span>
          </div>
        </div>

        {/* Center: Tab Capsule Pill (Reference B style — shown on desktop lg+) */}
        <div className="hidden lg:flex items-center p-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-xs font-sans">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                  isActive
                    ? 'bg-[var(--glass-l2-bg)] text-[var(--text-primary)] shadow-sm border border-[var(--edge-rest)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right: Clock, Live Status, Demo, Theme, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Demo Mode Button */}
          {isRunning ? (
            <button
              type="button"
              onClick={stopDemo}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] transition-all text-xs font-sans"
              title={statusMessage || 'Click to abort demo'}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentLane === 'critical' ? 'bg-[var(--col-critical)]' : 'bg-[var(--col-standard)]'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentLane === 'critical' ? 'bg-[var(--col-critical)]' : 'bg-[var(--col-standard)]'}`} />
              </span>
              <span className="tabular-nums font-medium text-xs">
                {step}/{total}
              </span>
              <span className="hidden xs:inline text-[11px] text-[var(--text-secondary)]">
                {currentLane === 'critical' ? 'Critical' : 'Standard'}
              </span>
              <Square size={10} fill="currentColor" className="ml-0.5 opacity-80" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full btn-glass text-[var(--text-primary)] transition-colors text-xs font-sans font-medium"
              title="Execute live 10-message test with escalating threat scores"
            >
              <Play size={10} fill="currentColor" className="text-[var(--text-secondary)]" />
              <span className="hidden xs:inline">Demo Mode</span>
              <span className="xs:hidden">Demo</span>
            </button>
          )}

          {/* Unified Local Clock (24-hour cycle matching chart axes) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-secondary)]">
            <Clock size={12} className="text-[var(--text-tertiary)]" />
            <span className="font-mono text-xs text-[var(--text-primary)] tabular-nums">
              {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Live Badge */}
          <LiveBadge isLive={isConnected} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Supervisor Avatar Monogram Disc & Admin Exit/Logout Dropdown */}
          <div className="relative" ref={adminMenuRef}>
            <button
              type="button"
              onClick={() => setIsAdminMenuOpen((prev) => !prev)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium transition-all select-none shrink-0 cursor-pointer ${
                isAdminMenuOpen
                  ? 'border-[var(--edge-hover)] bg-[var(--surface-elevated)] text-[var(--col-standard)] shadow-sm ring-1 ring-[var(--edge-hover)]'
                  : 'border-[var(--edge-rest)] bg-[var(--surface-inner)] text-[var(--text-primary)] hover:border-[var(--edge-hover)] hover:bg-[var(--surface-elevated)]'
              }`}
              title="Supervisor Console Admin (Click for profile & exit/logout)"
              aria-label="Supervisor Console Admin menu"
              aria-expanded={isAdminMenuOpen}
            >
              SA
            </button>

            {/* Frosted Liquid Glass Dropdown Menu */}
            {isAdminMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl border border-[var(--edge-rest)] shadow-2xl z-50 animate-enter select-none"
                style={{ 
                  backgroundColor: 'var(--surface-bg)',
                  backdropFilter: 'blur(28px)', 
                  WebkitBackdropFilter: 'blur(28px)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 20px 48px -10px var(--shadow-color)'
                }}
              >
                {/* Profile Header */}
                <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-[var(--edge-rest)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--surface-elevated)] border border-[var(--edge-rest)] flex items-center justify-center text-xs font-semibold text-[var(--text-primary)] shrink-0">
                    SA
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        Supervisor Admin
                      </p>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-verified)]" />
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-mono truncate">
                      admin@pqchs.local · Tier 10
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-1 text-xs font-sans">
                  {/* Exit to Home Page */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      window.location.href = getHomeUrl();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer group"
                  >
                    <ExternalLink size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--col-standard)] transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-[var(--text-primary)]">Exit to Home Page</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Return to main application</p>
                    </div>
                  </button>

                  {/* Sign Out / Exit Console */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      try {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('pqc_user');
                        sessionStorage.clear();
                      } catch(e) {}
                      window.location.href = getHomeUrl();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[var(--col-danger,#ef4444)] hover:bg-[var(--col-danger)]/10 transition-colors cursor-pointer group"
                  >
                    <LogOut size={14} className="text-[var(--col-danger,#ef4444)] transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-[var(--col-danger,#ef4444)]">Logout &amp; Terminate Session</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Sign out and return to home page</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Harvest Lab Reference Modal */}
      <HarvestLabPanel 
        isOpen={isHarvestLabOpen} 
        onClose={() => setIsHarvestLabOpen(false)} 
      />
    </>
  );
};

export default NavBar;
