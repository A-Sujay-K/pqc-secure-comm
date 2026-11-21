import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { createTelemetryConnection } from '../services/ws';
import { fetchTelemetrySnapshot, fetchRecentEvents } from '../services/api';

export const TelemetryContext = createContext(null);

export const TelemetryProvider = ({ children }) => {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [laneFilter, setLaneFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [policyConfig, setPolicyConfig] = useState({
    mode: 'adaptive', // 'adaptive' | 'force_standard' | 'force_critical'
    threshold: 0.70,
  });

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleMessage = useCallback((payload, timestamp) => {
    if (!payload || typeof payload !== 'object' || !payload.key_pool) return;
    if (isPausedRef.current) return; // Frozen when paused

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

  const refetchSnapshot = useCallback(async () => {
    try {
      const [data, eventsData] = await Promise.all([
        fetchTelemetrySnapshot().catch((err) => {
          console.error('Failed to fetch snapshot:', err);
          return null;
        }),
        fetchRecentEvents(50).catch((err) => {
          console.error('Failed to fetch events:', err);
          return null;
        })
      ]);

      if (data && typeof data === 'object' && data.key_pool) {
        setSnapshot(data);
      }

      if (Array.isArray(eventsData) && eventsData.length > 0) {
        setEvents(eventsData);
      } else if (data?.recent_events && Array.isArray(data.recent_events)) {
        setEvents(data.recent_events);
      }

      return data;
    } catch (err) {
      console.error('Failed to refetch telemetry snapshot:', err);
    }
    return null;
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  useEffect(() => {
    // Initial fetch
    refetchSnapshot();

    const connection = createTelemetryConnection(handleMessage, setIsConnected);

    // Auto-retry polling until initial snapshot is loaded (handles Render cold start wake up)
    const retryInterval = setInterval(() => {
      setSnapshot((current) => {
        if (!current) {
          refetchSnapshot();
        }
        return current;
      });
    }, 5000);

    return () => {
      clearInterval(retryInterval);
      connection.disconnect();
    };
  }, [handleMessage, refetchSnapshot]);

  const value = {
    snapshot,
    history,
    events,
    isConnected,
    isPaused,
    togglePause,
    refetchSnapshot,
    laneFilter,
    setLaneFilter,
    policyConfig,
    setPolicyConfig,
    activeTab,
    setActiveTab,
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
};
