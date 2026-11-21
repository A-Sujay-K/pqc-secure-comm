import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, AlertCircle, User, ExternalLink, HelpCircle, Shield, X } from 'lucide-react';
import ThemeToggle from '../theme/ThemeToggle';
import { useTheme } from '../theme/ThemeProvider';

function formatDisplayName(name = '') {
  if (!name) return '';
  return name
    .replace(/^@/, '')
    .split(/[\s._-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export const LoginPage = () => {
  const { login } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // 'how-it-works' | 'why-pqc' | null
  const [savedUser, setSavedUser] = useState('');

  useEffect(() => {
    const lastUser = localStorage.getItem('pqc_last_username');
    if (lastUser) {
      setSavedUser(lastUser);
      setFormData((prev) => ({ ...prev, username: lastUser }));
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;
    setError('');
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      localStorage.setItem('pqc_last_username', formData.username);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid call-sign or password. Please verify credentials.');
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleDemoLogin = (username, password = 'password123') => {
    setFormData({ username, password });
    setError('');
    setLoading(true);
    login(username, password).catch((err) => {
      setError(err.response?.data?.detail || 'Demo login failed');
      setLoading(false);
    });
  };

  const defaultSupervisorUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5174'
    : 'https://pqc-supervisor-dashboard.vercel.app';
  const supervisorUrl = (import.meta.env.VITE_SUPERVISOR_URL && !import.meta.env.VITE_SUPERVISOR_URL.includes('localhost'))
    ? import.meta.env.VITE_SUPERVISOR_URL
    : defaultSupervisorUrl;

  const displayName = formatDisplayName(savedUser || formData.username);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center px-4 pt-20 pb-10 sm:py-10 relative z-10 font-sans selection:bg-[var(--text-primary)] selection:text-[var(--text-inverse)]">
      {/* Top Bar with Wordmark & Theme Toggle */}
      <header className="fixed top-3.5 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-40 flex items-center justify-between pointer-events-none">
        <Link to="/" className="flex items-center gap-2.5 pointer-events-auto hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center shadow-sm backdrop-blur-md">
            <Shield size={16} className="text-[var(--text-secondary)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium tracking-tight text-[13px] sm:text-[15px] text-[var(--text-primary)]">
              PQC Secure Comm
            </span>
            <span className="text-[10px] font-sans text-[var(--text-tertiary)] -mt-0.5 hidden xs:block">
              ML-KEM-768 &amp; BB84 QKD Core
            </span>
          </div>
        </Link>

        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Shake Keyframe Animation */}
      <style>{`
        @keyframes loginCardShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-card-shake {
          animation: loginCardShake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      {/* Auth Group: Card + Companion Strip */}
      <div className="relative w-full max-w-[440px] flex flex-col items-center">
        {/* MAIN LIQUID GLASS CARD (Reduced sheen & blur ~25-30% per Refinement spec) */}
        <div
          className={`glass-l1 relative z-10 w-full p-6 sm:p-9 rounded-[24px] box-border transition-all duration-300 border border-[var(--edge-rest)] ${
            shake ? 'animate-card-shake !border-danger' : ''
          }`}
          style={{
            boxShadow: isDark
              ? 'inset 0 1px 0 rgba(255, 245, 230, 0.15), 0 20px 44px rgba(10, 8, 4, 0.38)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.40), 0 16px 36px rgba(50, 36, 24, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Heading and Tagline */}
          <div className="mb-6 sm:mb-7">
            <h1 className="text-[28px] sm:text-[34px] font-normal tracking-tight text-[var(--text-primary)] leading-tight">
              {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
            </h1>
            <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5 font-normal tracking-normal">
              Encrypted today. Still secret after Q-Day.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block text-xs font-normal text-[var(--text-secondary)]"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                autoComplete="username"
                className="w-full h-12 px-3.5 rounded-[13px] bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--text-secondary)] focus:bg-[var(--surface-elevated)] transition-all font-sans"
                placeholder="e.g. alice, bob"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-normal text-[var(--text-secondary)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyDown}
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-3.5 pr-11 rounded-[13px] bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--text-secondary)] focus:bg-[var(--surface-elevated)] transition-all font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Warning / Error Slot under Password */}
            <div className="min-h-[22px] flex flex-col justify-center">
              {capsLock && (
                <p className="text-[11px] text-[var(--col-critical)] flex items-center gap-1.5 font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--col-critical)]" />
                  Caps Lock is enabled
                </p>
              )}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="text-[12px] text-danger flex items-center gap-1.5 font-medium"
                >
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Neutral Inverse Primary Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[12px] btn-primary cursor-pointer font-medium tracking-normal text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Secondary Stacked Glass Buttons */}
          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('alice')}
              className="w-full h-11 px-4 rounded-[12px] btn-glass border border-[var(--edge-rest)] text-[13px] font-normal flex items-center justify-center gap-2.5 cursor-pointer text-[var(--text-primary)]"
            >
              <User size={15} className="text-[var(--text-secondary)] shrink-0" />
              <span>Continue as demo user (@alice)</span>
            </button>
          </div>

          {/* Footer Line */}
          <p className="mt-5 sm:mt-6 text-center text-xs text-[var(--text-secondary)] font-normal">
            New here?{' '}
            <Link
              to="/register"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2 font-medium inline-flex items-center min-h-[36px] py-1 px-2 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* COMPANION GLASS STRIP BENEATH CARD */}
        <div className="mt-3.5 sm:mt-4 w-full">
          <div
            className="glass-l2 w-full p-2.5 sm:p-3.5 rounded-[18px] box-border border border-[var(--edge-rest)]"
            style={{
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255, 245, 230, 0.10), 0 8px 20px rgba(10, 8, 4, 0.28)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 6px 16px rgba(50, 36, 24, 0.06)',
            }}
          >
            {/* Equal Glass Action Buttons */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveSheet('how-it-works')}
                className="h-10 px-3 rounded-[10px] btn-glass border border-[var(--edge-rest)] text-xs font-normal flex items-center justify-center gap-2 cursor-pointer text-[var(--text-primary)]"
              >
                <HelpCircle size={14} className="text-[var(--col-standard)] shrink-0" />
                <span>How it works</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSheet('why-pqc')}
                className="h-10 px-3 rounded-[10px] btn-glass border border-[var(--edge-rest)] text-xs font-normal flex items-center justify-center gap-2 cursor-pointer text-[var(--text-primary)]"
              >
                <Shield size={14} className="text-[var(--col-critical)] shrink-0" />
                <span>Why post-quantum?</span>
              </button>
            </div>

            {/* Cryptographic Spec Line */}
            <p className="text-[10px] font-sans text-[var(--text-tertiary)] text-center mt-2 sm:mt-2.5 select-none font-normal">
              NIST FIPS 203 (ML-KEM-768) · BB84 QKD · ML-DSA-65 · AES-256-GCM
            </p>
          </div>
        </div>
      </div>

      {/* EXPLAINER SHEET MODAL */}
      {activeSheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveSheet(null)}
        >
          <div
            className="glass-l3 w-full max-w-[520px] p-6 sm:p-8 rounded-[24px] box-border text-[var(--text-primary)] border border-[var(--edge-rest)]"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255, 245, 230, 0.18), 0 24px 48px rgba(10, 8, 4, 0.50)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.50), 0 20px 40px rgba(50, 36, 24, 0.10)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--edge-rest)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center">
                  {activeSheet === 'how-it-works' ? (
                    <HelpCircle size={16} className="text-[var(--col-standard)]" />
                  ) : (
                    <Shield size={16} className="text-[var(--col-critical)]" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-base text-[var(--text-primary)]">
                    {activeSheet === 'how-it-works' ? 'How PQC Secure Comm Works' : 'Why Post-Quantum Cryptography?'}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] font-sans">
                    NIST FIPS 203 & 204 Standard Architecture
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                className="w-8 h-8 rounded-full btn-glass flex items-center justify-center p-0 text-[var(--text-secondary)] border border-[var(--edge-rest)]"
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed font-normal">
              {activeSheet === 'how-it-works' ? (
                <>
                  <p>
                    <strong className="text-[var(--text-primary)] font-medium">1. Hybrid Lattice Key Encapsulation (FIPS 203):</strong>
                    <br />
                    Sessions encapsulate symmetric AES-256 keys using both classical X25519 and ML-KEM-768 (Module-Lattice KEM). Secrets are combined via HKDF-SHA256, guaranteeing confidentiality even if one algorithm is compromised.
                  </p>
                  <p>
                    <strong className="text-[var(--text-primary)] font-medium">2. Quantum-Safe Digital Signatures (FIPS 204):</strong>
                    <br />
                    Message authentication and integrity are cryptographically sealed with ML-DSA-65 signatures, eliminating man-in-the-middle forging by quantum adversaries.
                  </p>
                  <p>
                    <strong className="text-[var(--text-primary)] font-medium">3. BB84 Quantum Key Distribution (QKD) Hardware Lane:</strong>
                    <br />
                    For critical payload transmission, the BB84 protocol supplies one-time-pad quantum key entropy directly combined with ML-KEM-768 into the ephemeral session pool.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong className="text-[var(--text-primary)] font-medium">The HNDL Threat (Harvest Now, Decrypt Later):</strong>
                    <br />
                    Hostile nation-states and automated collectors are recording petabytes of encrypted internet traffic today. When a Cryptographically Relevant Quantum Computer (CRQC) becomes operational on Q-Day, all recorded RSA and ECC communications will be decrypted retroactively.
                  </p>
                  <p>
                    <strong className="text-[var(--text-primary)] font-medium">Forward Secrecy Against Future Machines:</strong>
                    <br />
                    PQC Secure Comm implements lattice-based mathematics based on hard problems over module lattices (Learning With Errors). This prevents historical payloads intercepted today from ever being decrypted by quantum computers in 2030 and beyond.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--edge-rest)] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                className="px-4 py-2 rounded-xl btn-primary text-xs font-medium cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
