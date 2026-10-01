import { useContext } from 'react';
import { TelemetryContext } from '../context/TelemetryContext';

export const useTelemetryWS = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetryWS must be used within a TelemetryProvider');
  }
  return context;
};
