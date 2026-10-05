import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
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
