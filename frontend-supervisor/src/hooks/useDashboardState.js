import { useMemo } from 'react';
import { useTelemetryWS } from './useTelemetryWS';

export const useDashboardState = () => {
  const { snapshot, history, events, isConnected } = useTelemetryWS();

  return useMemo(() => {
    if (!snapshot || typeof snapshot !== 'object' || !snapshot.key_pool || !snapshot.routing || !snapshot.queue) {
      return {
        isConnected,
        isReady: false,
        kpi: null,
        chartData: null,
        alerts: null,
      };
    }

    const { key_pool, queue, routing, active_connections = 0, uptime_seconds = 0 } = snapshot;

    // KPI Metrics
    const totalMessages = routing.total_messages || 0;
    const stdCount = routing.standard_lane_count || 0;
    const critCount = routing.critical_lane_count || 0;
    
    const kpi = {
      keyPoolAvailable: key_pool.available,
      keyPoolCapacity: key_pool.capacity || 20,
      availabilityRatio: key_pool.availability_ratio != null ? key_pool.availability_ratio.toFixed(2) : '1.00',
      keyPoolConsumed: key_pool.consumed,
      totalMessages,
      standardLanePct: totalMessages > 0 ? ((stdCount / totalMessages) * 100).toFixed(1) : '0.0',
      criticalLanePct: totalMessages > 0 ? ((critCount / totalMessages) * 100).toFixed(1) : '0.0',
      mdrPercent: routing.mdr_percent != null ? routing.mdr_percent.toFixed(1) : '100.0',
      failedMessages: routing.failed_messages || 0,
      queueDepth: queue.depth,
      deadlineSeconds: queue.deadline_seconds || 5.0,
      avgThreatScore: routing.avg_threat_score?.toFixed(2) || '0.00',
      activeConnections: active_connections,
      uptime: uptime_seconds,
    };

    // Chart Data transformations
    const timeSeriesData = history.map(point => {
      const time = new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        time,
        standard: point.routing.standard_lane_count || 0,
        critical: point.routing.critical_lane_count || 0,
        queueDepth: point.queue.depth || 0,
      };
    });

    const threatScatterData = events
      .filter(e => e.event_type === 'routing_decision')
      .map(e => ({
        time: new Date(e.timestamp).getTime(), // Using raw time for scatter
        displayTime: new Date(e.timestamp).toLocaleTimeString(),
        score: e.payload.threat_score,
        lane: e.payload.lane,
      }));

    const chartData = {
      timeSeries: timeSeriesData,
      threatScatter: threatScatterData,
    };

    // Alerts
    const alerts = {
      keyPoolLow: key_pool.available < 5,
      keyPoolEmpty: key_pool.available === 0,
      queueGrowing: queue.depth > 5,
      highThreat: kpi.avgThreatScore > 0.7,
    };

    return {
      isConnected,
      isReady: true,
      snapshot,
      events,
      kpi,
      chartData,
      alerts,
    };
  }, [snapshot, history, events, isConnected]);
};
