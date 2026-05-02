import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TelemetryContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function TelemetryProvider({ children }) {
  const [snapshot, setSnapshot] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/ws/telemetry`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);
      ws.onmessage = (e) => {
        try {
          setSnapshot(JSON.parse(e.data));
        } catch {}
      };
      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, []);

  return (
    <TelemetryContext.Provider value={{ snapshot, isConnected }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export const useTelemetry = () => useContext(TelemetryContext);
