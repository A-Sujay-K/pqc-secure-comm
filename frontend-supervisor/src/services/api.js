import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL;
const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';

const baseURL = (apiBase && !apiBase.includes('localhost'))
  ? (apiBase.endsWith('/api/v1') ? apiBase : `${apiBase.replace(/\/+$/, '')}/api/v1`)
  : (isLocal 
      ? (apiBase || 'http://localhost:8000/api/v1') 
      : 'https://pqc-secure-comm-backend.onrender.com/api/v1');

const api = axios.create({
  baseURL,
  timeout: 10000,
});

export const fetchTelemetrySnapshot = async () => {
  const response = await api.get('/telemetry/snapshot');
  return response.data;
};

export const fetchRecentEvents = async (limit = 50, eventType = '') => {
  const params = { limit };
  if (eventType) params.event_type = eventType;
  const response = await api.get('/telemetry/events', { params });
  return response.data;
};

export default api;
