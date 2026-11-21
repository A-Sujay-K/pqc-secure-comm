/**
 * Client-Side Dynamic Sensitivity & Threat Analysis (Mirror of backend threat_analyzer.py)
 * Dynamically computes Quantum Threat Level (Q_TL) and sensitivity S(m) with respect
 * to exact message content, keyword compounding, regex secrets, entropy, and attachments.
 */

// Base file extension risk levels
export const EXTENSION_SCORES = {
  // Plain text / logs: 0.12 - 0.22
  '.txt': 0.12, '.md': 0.14, '.csv': 0.18, '.log': 0.22,
  // Media files: 0.20 - 0.28
  '.jpg': 0.22, '.jpeg': 0.22, '.png': 0.25, '.gif': 0.20, '.mp3': 0.22, '.mp4': 0.28,
  // Documents / spreadsheets: 0.40 - 0.52
  '.pdf': 0.46, '.doc': 0.42, '.docx': 0.45, '.xls': 0.48, '.xlsx': 0.52, '.ppt': 0.40, '.pptx': 0.42,
  // Code & configuration: 0.30 - 0.70
  '.json': 0.30, '.yaml': 0.35, '.yml': 0.35, '.xml': 0.30, '.sql': 0.65, '.sh': 0.70, '.ps1': 0.70,
  // High risk / credentials & archives: 0.75 - 0.95
  '.key': 0.95, '.pem': 0.92, '.p12': 0.94, '.pfx': 0.94, '.gpg': 0.90,
  '.env': 0.92, '.exe': 0.85, '.bin': 0.82, '.dll': 0.85, '.zip': 0.75,
  '.7z': 0.78, '.tar': 0.75, '.gz': 0.75
};

// Weighted keywords for continuous threat evaluation
export const KEYWORD_WEIGHTS = {
  // Critical / High-Value Cryptographic & Security Credentials (0.84 - 0.96)
  'private key': 0.96,
  'seed phrase': 0.96,
  'top secret': 0.94,
  'master key': 0.94,
  'root password': 0.94,
  'passphrase': 0.90,
  'api_key': 0.90,
  'apikey': 0.90,
  'secret_key': 0.90,
  'access_token': 0.88,
  'private_key': 0.96,
  'classified': 0.90,
  'password': 0.86,
  'secret': 0.84,
  'credential': 0.86,
  'credentials': 0.86,
  'token': 0.80,
  'urgent': 0.78,
  'confidential': 0.84,
  'auth token': 0.86,
  'private': 0.74,
  'restricted': 0.76,
  'vulnerability': 0.76,
  'exploit': 0.80,
  'cve': 0.74,

  // Medium Sensitivity / Corporate, Financial & Regulated Data (0.42 - 0.65)
  'financial': 0.56,
  'salary': 0.58,
  'payroll': 0.58,
  'invoice': 0.52,
  'banking': 0.58,
  'tax': 0.52,
  'contract': 0.52,
  'nda': 0.56,
  'patent': 0.54,
  'audit': 0.50,
  'proprietary': 0.56,
  'internal': 0.44,
  'compliance': 0.46,
  'customer data': 0.62,
  'ssn': 0.65,
  'intellectual property': 0.60,
  'revenue': 0.50,
  'budget': 0.48,

  // Low Sensitivity / Routine Communication & Coordination (0.10 - 0.20)
  'meeting': 0.16,
  'schedule': 0.18,
  'update': 0.15,
  'status': 0.15,
  'agenda': 0.16,
  'notes': 0.14,
  'sync': 0.15,
  'review': 0.16,
  'draft': 0.15,
  'lunch': 0.12,
  'coffee': 0.12,
  'hello': 0.12,
  'thanks': 0.10,
  'public': 0.10,
  'discussion': 0.14
};

// Regex patterns for high-risk structured secrets
export const SECRET_PATTERNS = [
  { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, weight: 0.96 },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}/, weight: 0.92 },
  { pattern: /(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{20,}/, weight: 0.94 },
  { pattern: /AKIA[0-9A-Z]{16}/, weight: 0.92 },
  { pattern: /(?:password|passwd|pwd|secret)\s*[:=]\s*\S+/i, weight: 0.88 },
  { pattern: /\b[0-9a-fA-F]{32,64}\b/, weight: 0.82 }
];

export const SENSITIVE_EXTENSIONS = [
  '.key', '.pem', '.p12', '.pfx', '.gpg', '.env', '.exe', '.bin', '.dll', '.zip', '.7z', '.tar'
];

/**
 * Calculates Shannon entropy in bits per character.
 */
export const computeShannonEntropy = (text) => {
  if (!text || text.length === 0) return 0.0;
  const freq = {};
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    freq[c] = (freq[c] || 0) + 1;
  }
  const len = text.length;
  let entropy = 0.0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
};

/**
 * Computes deterministic CRC32 hash for nuanced per-message variation.
 */
export const computeCrc32 = (str) => {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i) & 0xff;
    let temp = (crc ^ byte) & 0xff;
    for (let j = 0; j < 8; j++) {
      temp = (temp & 1) ? (-306674912 ^ (temp >>> 1)) : (temp >>> 1);
    }
    crc = (crc >>> 8) ^ temp;
  }
  return (crc ^ -1) >>> 0;
};

/**
 * Dynamically computes the sensitivity score S(m) in [0.05, 1.0]
 * reflecting exact message words, entropy, file risk, and length.
 */
export const getSensitivityScore = (content = '', file = null, isHighSecurity = false) => {
  const textContent = content || '';
  const fileName = file?.name || '';

  if (!textContent && !fileName) {
    return isHighSecurity ? 0.95 : 0.10;
  }

  const contentLower = textContent.toLowerCase();
  const matchedWeights = [];

  if (textContent) {
    for (const [kw, w] of Object.entries(KEYWORD_WEIGHTS)) {
      if (contentLower.includes(kw)) {
        matchedWeights.push(w);
      }
    }
    for (const { pattern, weight } of SECRET_PATTERNS) {
      if (pattern.test(textContent)) {
        matchedWeights.push(weight);
      }
    }
  }

  let baseS = 0.10;
  if (matchedWeights.length > 0) {
    matchedWeights.sort((a, b) => b - a);
    const primary = matchedWeights[0];
    const compound = matchedWeights.slice(1).reduce((acc, w) => acc + w / 15.0, 0);
    baseS = Math.min(0.96, primary + compound);
  } else {
    baseS = 0.10 + Math.min(0.08, (textContent.length / 200.0) * 0.08);
  }

  // Shannon entropy boost for password / crypto / token randomness
  if (textContent.length >= 8) {
    const ent = computeShannonEntropy(textContent);
    if (ent > 3.6) {
      const entBoost = Math.min(0.08, (ent - 3.6) * 0.05);
      baseS = Math.min(0.97, baseS + entBoost);
    }
  }

  // File extension risk
  if (fileName) {
    const ext = '.' + fileName.split('.').pop().toLowerCase();
    const fileRisk = EXTENSION_SCORES[ext] || 0.25;
    if (baseS < fileRisk) {
      baseS = fileRisk;
    } else {
      baseS = Math.min(0.97, baseS + fileRisk / 12.0);
    }
  }

  if (file?.size) {
    const sizeMb = file.size / (1024 * 1024);
    const sizeFactor = Math.min(0.06, sizeMb * 0.01);
    baseS = Math.min(0.98, baseS + sizeFactor);
  }

  // Deterministic CRC variance for unique score per message
  const hashSubject = textContent || fileName || '';
  if (hashSubject) {
    const crc = computeCrc32(hashSubject);
    const crcVar = ((crc % 1000) / 1000.0) * 0.04 - 0.02;
    baseS = baseS + crcVar;
  }

  // Explicit High Security override
  if (isHighSecurity) {
    const crc = computeCrc32(hashSubject || 'high_security');
    const hsVar = ((crc % 1000) / 1000.0) * 0.04 - 0.02;
    baseS = Math.max(baseS, 0.92 + hsVar);
  }

  return Number(Math.max(0.05, Math.min(0.99, baseS)).toFixed(4));
};

/**
 * Checks whether a payload routes to Critical Lane (BB84 QKD Hybrid).
 */
export const isCriticalPayload = (content = '', file = null, isHighSecurity = false) => {
  if (isHighSecurity) return true;

  if (file && file.name) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (SENSITIVE_EXTENSIONS.includes(ext)) {
      return true;
    }
  }

  const sensitivity = getSensitivityScore(content, file, isHighSecurity);
  // Matches backend S_CRIT override (0.75+ or QTL >= 0.60)
  return sensitivity >= 0.75;
};

/**
 * Dynamically computes estimated Quantum Threat Level (Q_TL) score:
 * QTL(f) = w1 * S + w2 * I
 * Where w1 = 0.6, w2 = 0.4, I = senderPriority / 10.0 (default 0.5)
 */
export const estimateThreatScore = (content = '', file = null, isHighSecurity = false, priority = 5) => {
  const S = getSensitivityScore(content, file, isHighSecurity);
  const I = Math.max(0.1, Math.min(1.0, priority / 10.0));
  const w1 = 0.6;
  const w2 = 0.4;
  const qtl = (w1 * S) + (w2 * I);
  return Number(Math.max(0.05, Math.min(0.99, qtl)).toFixed(3));
};
