import React from 'react';
import { useDashboardState } from '../hooks/useDashboardState';
import MetricCard from '../components/common/MetricCard';
import KeyPoolPanel from '../components/panels/KeyPoolPanel';
import RoutingPanel from '../components/panels/RoutingPanel';
import QueuePanel from '../components/panels/QueuePanel';
import ThreatScorePanel from '../components/panels/ThreatScorePanel';
import SystemHealthPanel from '../components/panels/SystemHealthPanel';
import CryptographicProcessPanel from '../components/panels/CryptographicProcessPanel';
import { Key, Activity, ShieldAlert, GitCommit, Layers, Lock, CheckCircle2 } from 'lucide-react';

const DashboardPage = () => {
  const { isReady, kpi } = useDashboardState();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pqc border-t-transparent rounded-full animate-spin"></div>
          <p className="text-pqc font-mono animate-pulse">ESTABLISHING TELEMETRY LINK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      {/* Top Row: KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 h-32 shrink-0">
        <MetricCard 
          title="Keys Available" 
          value={kpi.keyPoolAvailable} 
          icon={Key} 
          colorClass={kpi.keyPoolAvailable < 5 ? "text-health-critical" : "text-health-good"}
        />
        <MetricCard 
          title="Total Messages" 
          value={kpi.totalMessages} 
          icon={Activity} 
          colorClass="text-white"
        />
        <MetricCard 
          title="Standard Lane" 
          value={`${kpi.standardLanePct}%`} 
          icon={GitCommit} 
          colorClass="text-pqc"
        />
        <MetricCard 
          title="Critical Lane" 
          value={`${kpi.criticalLanePct}%`} 
          icon={ShieldAlert} 
          colorClass="text-qkd"
        />
        <MetricCard 
          title="Delivery Ratio (MDR)" 
          value={`${kpi.mdrPercent}%`} 
          icon={CheckCircle2} 
          colorClass={parseFloat(kpi.mdrPercent) < 90 ? "text-health-critical" : "text-health-good"}
        />
        <MetricCard 
          title="Queue Depth" 
          value={kpi.queueDepth} 
          icon={Layers} 
          colorClass={kpi.queueDepth > 0 ? "text-queue" : "text-health-good"}
        />
      </div>

      {/* Middle Row: Charts & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px] shrink-0">
        <KeyPoolPanel />
        <ThreatScorePanel />
        <QueuePanel />
      </div>

      {/* === CRYPTOGRAPHIC PROCESS PANEL (Main Feature) === */}
      <div className="glass-panel shrink-0 overflow-hidden flex flex-col" style={{ height: '640px' }}>
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700/80 bg-dark-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pqc/10 rounded-lg border border-pqc/20">
              <Lock size={18} className="text-pqc" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest">
                Cryptographic Process Inspector
              </h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Real-time encryption · decryption · key details · timing breakdown · verification
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pqc"></span>Standard: ML-KEM-768 + ML-DSA-65 + AES-256-GCM
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-qkd"></span>Critical: QKD-256 + ML-KEM-768 + ML-DSA-65 + AES-256-GCM
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <CryptographicProcessPanel />
        </div>
      </div>

      {/* Bottom Row: Routing Feed & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px] shrink-0">
        <div className="lg:col-span-2 glass-panel flex flex-col overflow-hidden">
          <RoutingPanel />
        </div>
        <div className="glass-panel flex flex-col p-5 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pqc/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={16} className="text-pqc" /> System Health
            </h2>
            <SystemHealthPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
