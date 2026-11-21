import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, AlertCircle, HelpCircle, Shield, X, Camera, Check, Trash2 } from 'lucide-react';
import ThemeToggle from '../theme/ThemeToggle';
import { useTheme } from '../theme/ThemeProvider';
import AvatarCropModal from '../components/common/AvatarCropModal';
import { uploadAvatar } from '../services/api';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    display_name: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);
  const [stagedAvatar, setStagedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyCrop = (blob) => {
    setStagedAvatar(blob);
    setAvatarPreview(URL.createObjectURL(blob));
  };

  const handleRemoveStagedPhoto = () => {
    setStagedAvatar(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-danger' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-[var(--col-critical)]' };
      case 3:
        return { score: 3, label: 'Strong', color: 'bg-[var(--col-standard)]' };
      case 4:
        return { score: 4, label: 'Quantum-Safe', color: 'bg-verified' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-danger' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        display_name: formData.display_name || formData.username,
        password: formData.password,
      });
      localStorage.setItem('pqc_last_username', formData.username);

      if (stagedAvatar) {
        try {
          await uploadAvatar(stagedAvatar);
        } catch (avatarErr) {
          console.warn('Avatar upload deferred:', avatarErr);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Username or email may already be registered.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center px-4 pt-20 pb-10 sm:py-12 relative z-10 font-sans selection:bg-[var(--text-primary)] selection:text-[var(--text-inverse)]">
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

      {/* Auth Group: Card + Companion Strip */}
      <div className="relative w-full max-w-[440px] flex flex-col items-center">
        {/* MAIN LIQUID GLASS CARD (Reduced sheen & blur ~25-30% per Refinement spec) */}
        <div
          className="glass-l1 relative z-10 w-full p-6 sm:p-9 rounded-[24px] box-border transition-all duration-300 border border-[var(--edge-rest)]"
          style={{
            boxShadow: isDark
              ? 'inset 0 1px 0 rgba(255, 245, 230, 0.15), 0 20px 44px rgba(10, 8, 4, 0.38)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.40), 0 16px 36px rgba(50, 36, 24, 0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-[28px] sm:text-[34px] font-normal tracking-tight text-[var(--text-primary)] leading-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5 font-normal tracking-normal">
              Quantum-resilient communications from day one.
            </p>
          </div>

          {/* Error notification */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3 bg-danger/10 border border-danger/40 rounded-xl text-danger text-xs flex items-center gap-2"
            >
              <AlertCircle size={15} className="shrink-0" />
              <span className="break-words font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Avatar Photo Picker (Optional) */}
            <div className="flex items-center gap-3.5 p-3 rounded-[16px] bg-[var(--surface-inner)] border border-[var(--edge-rest)]">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--edge-rest)] bg-[var(--surface-elevated)] flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={20} className="text-[var(--text-tertiary)]" />
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-xs font-normal text-[var(--text-primary)]">
                  {avatarPreview ? 'Profile photo staged' : 'Profile photo (optional)'}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {avatarPreview ? 'Cropped to 512×512 WebP' : 'Square crop with circular mask'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-[10px] btn-glass border border-[var(--edge-rest)] text-[11px] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                >
                  {avatarPreview ? 'Change' : 'Upload'}
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveStagedPhoto}
                    className="p-1.5 rounded-[10px] border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove staged photo"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            {/* Username / Call-Sign Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-username"
                className="block text-xs font-normal text-[var(--text-secondary)]"
              >
                Call-Sign / Username
              </label>
              <input
                id="reg-username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                autoComplete="username"
                className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--text-secondary)] focus:bg-[var(--surface-elevated)] transition-all font-sans"
                placeholder="e.g. charlie, diana"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-email"
                className="block text-xs font-normal text-[var(--text-secondary)]"
              >
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--text-secondary)] focus:bg-[var(--surface-elevated)] transition-all font-sans"
                placeholder="name@domain.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-normal text-[var(--text-secondary)]"
                >
                  Password
                </label>
                {formData.password && (
                  <span className="text-[11px] font-sans text-[var(--text-secondary)]">
                    Strength: <strong className={strength.score >= 3 ? 'text-verified' : 'text-[var(--col-critical)]'}>{strength.label}</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full h-11 pl-3.5 pr-11 rounded-[12px] bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--text-secondary)] focus:bg-[var(--surface-elevated)] transition-all font-mono"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter Bars */}
              {formData.password && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 rounded-full transition-colors duration-300 ${
                        strength.score >= step ? strength.color : 'bg-[var(--edge-rest)]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reg-confirm"
                className="block text-xs font-normal text-[var(--text-secondary)]"
              >
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
                className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm focus:outline-none focus:border-[var(--text-secondary)] focus:bg-[var(--surface-elevated)] transition-all font-mono"
                placeholder="Re-enter password"
              />
            </div>

            {/* Neutral Inverse Primary Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-[12px] btn-primary cursor-pointer font-medium tracking-normal text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Footer Line */}
          <p className="mt-5 sm:mt-6 text-center text-xs text-[var(--text-secondary)] font-normal">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2 font-medium transition-colors"
            >
              Sign in
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
      {/* Crop Modal */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onApplyCrop={handleApplyCrop}
      />
    </div>
  );
};

export default RegisterPage;
