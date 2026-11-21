/**
 * Client-Side Sensitivity & Threat Analysis
 * Mirroring backend app/utils/sensitivity.py and threat_analyzer.py
 * Ensures instantaneous optimistic UI rendering for Critical BB84 QKD messages
 * without waiting for network round-trips or requiring manual page refresh.
 */

export const HIGH_SENSITIVITY_KEYWORDS = [
  'password', 'secret', 'confidential', 'key', 'classified', 'urgent', 'private',
  'token', 'credential', 'seed phrase', 'passphrase', 'api_key', 'apikey',
  'top secret', 'private key', 'critical', 'restricted', 'classified', 'auth token'
];

export const SENSITIVE_EXTENSIONS = [
  '.key', '.pem', '.p12', '.pfx', '.gpg', '.env', '.exe', '.bin', '.dll', '.zip', '.7z', '.tar'
];

/**
 * Checks whether a payload will be routed to Critical Lane (BB84 QKD Hybrid).
 * Evaluates:
 * 1. Explicit high security manual toggle
 * 2. High-sensitivity content keywords
 * 3. Sensitive file extensions (keys, certificates, archives)
 */
export const isCriticalPayload = (content = '', file = null, isHighSecurity = false) => {
  if (isHighSecurity) return true;

  if (file && file.name) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (SENSITIVE_EXTENSIONS.includes(ext)) {
      return true;
    }
  }

  if (content && typeof content === 'string') {
    const lower = content.toLowerCase();
    const hasKeyword = HIGH_SENSITIVITY_KEYWORDS.some(kw => lower.includes(kw));
    if (hasKeyword) return true;
  }

  return false;
};

/**
 * Estimates the threat score (Q_TL) for optimistic rendering.
 */
export const estimateThreatScore = (content = '', file = null, isHighSecurity = false) => {
  if (isCriticalPayload(content, file, isHighSecurity)) {
    return isHighSecurity ? 0.95 : 0.85;
  }
  return 0.12;
};
