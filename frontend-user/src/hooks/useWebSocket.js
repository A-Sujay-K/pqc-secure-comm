import { useEffect, useState } from 'react';
import { wsManager } from '../services/ws';
import { useAuth } from './useAuth';

export const useWebSocket = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (token) {
      wsManager.connect(token);
      
      const unsubscribe = wsManager.on('connection_status', (data) => {
        setStatus(data.status);
      });

      return () => {
        unsubscribe();
        wsManager.disconnect();
      };
    }
  }, [token]);

  return { status, wsManager };
};
