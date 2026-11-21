import { MAX_RECONNECT_ATTEMPTS } from '../utils/constants';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.token = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
    this.pingInterval = null;

    if (typeof window !== 'undefined') {
      // Reconnect when mobile device wakes up or tab is foregrounded
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.token && !this.isConnected() && this.shouldReconnect) {
          console.log('App foregrounded, reconnecting WebSocket...');
          this.reconnectAttempts = 0;
          this.connect(this.token);
        }
      });
      // Reconnect when network returns online
      window.addEventListener('online', () => {
        if (this.token && !this.isConnected() && this.shouldReconnect) {
          console.log('Network online, reconnecting WebSocket...');
          this.reconnectAttempts = 0;
          this.connect(this.token);
        }
      });
    }
  }

  connect(token) {
    this.token = token;
    this.shouldReconnect = true;
    
    if (this.ws) {
      this.ws.close();
    }

    const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const wsBase = import.meta.env.VITE_WS_URL;
    let wsUrl;
    if (wsBase && (!wsBase.includes('localhost') || isLocal)) {
      let cleanBase = wsBase.trim().replace(/\/+$/, '');
      if (cleanBase.startsWith('http://')) {
        cleanBase = 'ws://' + cleanBase.slice(7);
      } else if (cleanBase.startsWith('https://')) {
        cleanBase = 'wss://' + cleanBase.slice(8);
      }
      const baseWithWs = cleanBase.endsWith('/ws') ? cleanBase : `${cleanBase}/ws`;
      wsUrl = `${baseWithWs}/chat/${token}`;
    } else if (isLocal) {
      wsUrl = `ws://localhost:8000/ws/chat/${token}`;
    } else {
      wsUrl = `wss://pqc-secure-comm-backend.onrender.com/ws/chat/${token}`;
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
