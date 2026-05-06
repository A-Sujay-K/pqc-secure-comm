import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import KeyPoolPanel from '../components/panels/KeyPoolPanel';
import QueuePanel from '../components/panels/QueuePanel';
import RoutingPanel from '../components/panels/RoutingPanel';
import SystemHealthPanel from '../components/panels/SystemHealthPanel';
import ThreatScorePanel from '../components/panels/ThreatScorePanel';
import MessageTrackerPanel from '../components/panels/MessageTrackerPanel';
import LiveBadge from '../components/common/LiveBadge';

export default function DashboardPage() {
  const { snapshot, isConnected } = useTelemetry();

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Supervisor Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">PQC Secure Comm — Real-time Monitoring</p>
        </div>
        <LiveBadge isLive={isConnected} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <KeyPoolPanel data={snapshot?.key_pool} />
        <QueuePanel data={snapshot?.queue} />
        <RoutingPanel data={snapshot?.routing} />
        <SystemHealthPanel
          uptime={snapshot?.uptime_seconds}
          connections={snapshot?.active_connections}
        />
        <ThreatScorePanel avgThreat={snapshot?.routing?.avg_threat_score} />
        <MessageTrackerPanel routing={snapshot?.routing} />
      </div>
    </div>
  );
}
