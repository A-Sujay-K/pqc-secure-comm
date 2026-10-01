import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createTelemetryConnection } from '../services/ws';
import { fetchTelemetrySnapshot } from '../services/api';

export const TelemetryContext = createContext(null);

export const TelemetryProvider = ({ children }) => {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleMessage = useCallback((payload, timestamp) => {
    if (!payload || typeof payload !== 'object' || !payload.key_pool) return;
    const payloadWithTime = { ...payload, timestamp };
    
    setSnapshot(payloadWithTime);
    
    setHistory((prev) => {
      const newHistory = [...prev, payloadWithTime];
      if (newHistory.length > 60) return newHistory.slice(newHistory.length - 60);
      return newHistory;
    });

    if (payload.recent_events && Array.isArray(payload.recent_events) && payload.recent_events.length > 0) {
      setEvents((prev) => {
        const newEvents = [...payload.recent_events, ...prev];
        return newEvents.slice(0, 100);
      });
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTelemetrySnapshot().then(data => {
      if (data && typeof data === 'object' && data.key_pool) {
        setSnapshot(prev => prev || data);
        if (Array.isArray(data.recent_events)) setEvents(data.recent_events);
      }
    }).catch(err => console.error('Failed initial fetch:', err));

    const connection = createTelemetryConnection(handleMessage, setIsConnected);

    return () => {
      connection.disconnect();
    };
  }, [handleMessage]);

  const value = {
    snapshot,
    history,
    events,
    isConnected,
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
};
