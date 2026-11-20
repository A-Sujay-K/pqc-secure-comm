import { MAX_RECONNECT_ATTEMPTS } from '../utils/constants';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.token = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
    this.pingInterval = null;
  }

  connect(token) {
    this.token = token;
    this.shouldReconnect = true;
    
    if (this.ws) {
      this.ws.close();
    }

    const wsBase = import.meta.env.VITE_WS_URL;
    let wsUrl;
    if (wsBase) {
      let cleanBase = wsBase.trim().replace(/\/+$/, '');
      if (cleanBase.startsWith('http://')) {
        cleanBase = 'ws://' + cleanBase.slice(7);
      } else if (cleanBase.startsWith('https://')) {
        cleanBase = 'wss://' + cleanBase.slice(8);
      }
      const baseWithWs = cleanBase.endsWith('/ws') ? cleanBase : `${cleanBase}/ws`;
      wsUrl = `${baseWithWs}/chat/${token}`;
    } else {
      const apiBase = import.meta.env.VITE_API_URL;
      if (apiBase && (apiBase.startsWith('http://') || apiBase.startsWith('https://'))) {
        try {
          const parsed = new URL(apiBase);
          const proto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${proto}//${parsed.host}/ws/chat/${token}`;
        } catch {
          const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${proto}//pqc-secure-comm-backend.onrender.com/ws/chat/${token}`;
        }
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        wsUrl = `${protocol}//${host}/ws/chat/${token}`;
      }
    }
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connection_status', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type) {
          this.emit(data.type, data.payload);
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.emit('connection_status', { status: 'disconnected' });
      
      if (this.shouldReconnect && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.pow(2, this.reconnectAttempts) * 1000;
        this.reconnectAttempts++;
        setTimeout(() => this.connect(this.token), Math.min(delay, 30000));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  send(type, payload) {
    const raw = JSON.stringify({ type, ...payload });
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(raw);
      return true;
    } else if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      console.warn('WebSocket is connecting, queuing message...');
      this.ws.addEventListener('open', () => {
        this.ws.send(raw);
      }, { once: true });
      return true;
    } else {
      console.warn('Cannot send message, WebSocket is not open. State:', this.ws?.readyState);
      if (this.token && (!this.ws || this.ws.readyState === WebSocket.CLOSED)) {
        this.connect(this.token);
      }
      return false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export const wsManager = new WebSocketManager();
