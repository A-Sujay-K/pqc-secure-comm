export const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const apiEnv = import.meta.env.VITE_API_URL || '';
  let origin = '';
  if (apiEnv.startsWith('http://') || apiEnv.startsWith('https://')) {
    try {
      const parsed = new URL(apiEnv);
      origin = parsed.origin;
    } catch {
      origin = apiEnv.replace(/\/api\/v1\/?$/, '');
    }
  } else {
    origin = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'http://localhost:8000'
      : 'https://pqc-secure-comm-backend.onrender.com';
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  let normalized = dateStr;
  if (typeof normalized === 'string' && !normalized.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(normalized)) {
    normalized = normalized + 'Z';
  }
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  let normalized = dateStr;
  if (typeof normalized === 'string' && !normalized.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(normalized)) {
    normalized = normalized + 'Z';
  }
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return 'Today';
  } else if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const truncate = (text, max) => {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
};
