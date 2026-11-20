export class TelemetryWebSocket {
  constructor(url, onMessage, onStatusChange) {
    this.url = url;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onStatusChange(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'telemetry_update' && data.payload) {
          this.onMessage(data.payload, data.timestamp);
        }
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    this.ws.onclose = () => {
      this.onStatusChange(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      this.ws.close();
    };
  }

  scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const createTelemetryConnection = (onMessage, onStatusChange) => {
  const wsBase = import.meta.env.VITE_WS_URL;
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  let url;
  if (wsBase && (!wsBase.includes('localhost') || isLocal)) {
    let cleanBase = wsBase.trim().replace(/\/+$/, '');
    if (cleanBase.startsWith('http://')) {
      cleanBase = 'ws://' + cleanBase.slice(7);
    } else if (cleanBase.startsWith('https://')) {
      cleanBase = 'wss://' + cleanBase.slice(8);
    }
    const baseWithWs = cleanBase.endsWith('/ws') ? cleanBase : `${cleanBase}/ws`;
    url = `${baseWithWs}/telemetry`;
  } else if (isLocal) {
    url = 'ws://localhost:8000/ws/telemetry';
  } else {
    url = 'wss://pqc-secure-comm-backend.onrender.com/ws/telemetry';
  }
  const connection = new TelemetryWebSocket(url, onMessage, onStatusChange);
  connection.connect();
  return connection;
};
