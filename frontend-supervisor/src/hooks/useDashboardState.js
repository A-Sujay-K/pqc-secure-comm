import { useMemo } from 'react';
import { useTelemetryWS } from './useTelemetryWS';

export const useDashboardState = () => {
  const {
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
  } = useTelemetryWS();

  return useMemo(() => {
    if (!snapshot || typeof snapshot !== 'object' || !snapshot.key_pool || !snapshot.routing || !snapshot.queue) {
      return {
        isConnected,
        isReady: false,
        kpi: null,
        chartData: null,
        alerts: null,
        activeLane: 'standard',
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
    }

    const { key_pool, queue, routing, active_connections = 0, uptime_seconds = 0 } = snapshot;

    // Defensively count routed events
    const routedEventCount = (events || []).filter(e => e.event_type === 'message_encrypted' || e.event_type === 'routing_decision').length;
    const totalMessages = Math.max(routing.total_messages || 0, routedEventCount);
    
    const stdCount = routing.standard_lane_count || 0;
    const critCount = routing.critical_lane_count || 0;
    
    // Strict QKD key pool limit of 25 keys max
    const qkdCapacity = 25;
    const safeAvailable = Math.min(key_pool.available != null ? key_pool.available : 0, qkdCapacity);
    const availabilityFraction = safeAvailable / qkdCapacity;

    // Pure real telemetry threat score data filtered strictly to genuine routing_decision events
    const rawThreatData = (events || [])
      .filter(e => e.event_type === 'routing_decision' && e.payload && e.payload.threat_score != null)
      .map(e => {
        const rawTime = e.timestamp ? (e.timestamp.endsWith('Z') ? e.timestamp : `${e.timestamp}Z`) : new Date().toISOString();
        const dateObj = new Date(rawTime);
        const time = dateObj.getTime();
        const displayTime = dateObj.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const score = Number(Math.min(Math.max(Number(e.payload.threat_score) || 0, 0), 1.0).toFixed(3));
        const lane = e.payload.lane || (score >= (policyConfig?.threshold ?? 0.70) ? 'critical' : 'standard');
        return {
          id: e._id || `${time}-${score}`,
          time,
          displayTime,
          score,
          lane,
          isRealEvent: true,
        };
      })
      .sort((a, b) => a.time - b.time);

    // Calculate genuine mathematical average threat score
    const computedAvgThreat = routing.avg_threat_score != null
      ? Math.min(routing.avg_threat_score, 1.0).toFixed(2)
      : rawThreatData.length > 0
        ? (rawThreatData.reduce((acc, p) => acc + p.score, 0) / rawThreatData.length).toFixed(2)
        : '0.00';

    const kpi = {
      keyPoolAvailable: safeAvailable,
      keyPoolCapacity: qkdCapacity,
      availabilityRatio: availabilityFraction.toFixed(2),
      availabilityPercent: `${Math.round(availabilityFraction * 100)}%`,
      isAvailOverflow: false,
      keyPoolConsumed: key_pool.consumed || 0,
      totalMessages,
      standardLanePct: totalMessages > 0 ? ((stdCount / totalMessages) * 100).toFixed(1) : '0.0',
      criticalLanePct: totalMessages > 0 ? ((critCount / totalMessages) * 100).toFixed(1) : '0.0',
      mdrPercent: routing.mdr_percent != null ? routing.mdr_percent.toFixed(1) : '100.0',
      failedMessages: routing.failed_messages || 0,
      queueDepth: queue.depth || 0,
      deadlineSeconds: queue.deadline_seconds || 5.0,
      oldestEntrySeconds: queue.oldest_entry_age_seconds || 0,
      avgThreatScore: computedAvgThreat,
      activeConnections: active_connections,
      uptime: uptime_seconds,
      genRate: key_pool.generation_rate != null ? key_pool.generation_rate.toFixed(1) : '0.0',
    };

    // Chart Data transformations (Unified 24h format matching header clock)
    const timeSeriesData = history.map(point => {
      const time = new Date(point.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        time,
        standard: point.routing?.standard_lane_count || 0,
        critical: point.routing?.critical_lane_count || 0,
        queueDepth: point.queue?.depth || 0,
      };
    });

    const chartData = {
      timeSeries: timeSeriesData,
      threatScatter: rawThreatData,
    };

    // Alerts
    const alerts = {
      keyPoolLow: safeAvailable < 5,
      keyPoolEmpty: safeAvailable === 0,
      queueGrowing: (queue.depth || 0) > 5,
      highThreat: parseFloat(kpi.avgThreatScore) > 0.7,
    };

    // Active Lane derivation from most recent routing decision
    const latestDecision = (events || []).find(e => 
      e.event_type === 'routing_decision' || 
      e.event_type === 'message_encrypted' ||
      (e.payload && (e.payload.lane != null || e.payload.threat_score != null))
    );

    let activeLane = 'standard';
    if (latestDecision?.payload) {
      const p = latestDecision.payload;
      if (typeof p.lane === 'string') {
        activeLane = p.lane.toLowerCase() === 'critical' ? 'critical' : 'standard';
      } else if (p.threat_score != null) {
        activeLane = p.threat_score >= 0.70 ? 'critical' : 'standard';
      }
    }

    // Policy override effect on activeLane if forced
    if (policyConfig?.mode === 'force_critical') {
      activeLane = 'critical';
    } else if (policyConfig?.mode === 'force_standard') {
      activeLane = 'standard';
    }

    return {
      isConnected,
      isReady: true,
      snapshot,
      events,
      kpi,
      chartData,
      alerts,
      activeLane,
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
  }, [
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
  ]);
};
