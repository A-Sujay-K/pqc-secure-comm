import { useEffect, useRef, useCallback, useState } from 'react';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
const RECONNECT_DELAY_MS = 3000;

export function useWebSocket(token, onMessage) {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/ws/chat?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('[WS] Connected to chat');
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage?.(data);
      } catch (err) {
        console.warn('[WS] Could not parse message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('[WS] Disconnected. Retrying in 3s...');
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }, [token, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, send };
}
