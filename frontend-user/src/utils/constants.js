export const WS_EVENTS = {
  CHAT_MESSAGE: 'chat_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  READ_RECEIPT: 'read_receipt',
  SECURITY_BANNER: 'security_banner',
  ENCRYPTION_STATUS: 'encryption_status',
  SYSTEM_MESSAGE: 'system_message',
  USER_STATUS: 'user_status',
  DELIVERY_CONFIRMATION: 'delivery_confirmation',
};

export const API_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  ME: '/auth/me',
  USERS: '/auth/users',
  MESSAGES: (peerId) => `/messages/history/${peerId}`,
  UNREAD: '/messages/unread',
};

export const ENCRYPTION_LANES = {
  STANDARD: 'standard',
  CRITICAL: 'critical',
};

// Display labels for encryption lanes
export const LANE_LABELS = {
  standard: 'PQC',
  critical: 'QKD',
};

// Lane badge colors
export const LANE_COLORS = {
  standard: { bg: 'bg-accent-blue/10', border: 'border-accent-blue/20', text: 'text-accent-blue' },
  critical: { bg: 'bg-accent-gold/10', border: 'border-accent-gold/20', text: 'text-accent-gold' },
};

export const FILE_SIZE_LIMIT = 25 * 1024 * 1024; // 25MB
export const MAX_RECONNECT_ATTEMPTS = 10;
