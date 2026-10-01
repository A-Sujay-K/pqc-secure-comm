import React, { useRef, useEffect } from 'react';
import { useDashboardState } from '../../hooks/useDashboardState';
import { Lock, ShieldCheck, ShieldAlert, FileText, Eye, EyeOff } from 'lucide-react';

const MessageTrackerPanel = () => {
  const { events } = useDashboardState();
  const listRef = useRef(null);
  const [expandedId, setExpandedId] = React.useState(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events]);

  const messageEvents = events
    .filter(e => e.event_type === 'message_encrypted')
    .slice(0, 50);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-dark-700/80 bg-dark-800/80 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Lock size={16} className="text-qkd" /> Encrypted Message Tracker
        </h2>
        <div className="text-xs text-slate-500 font-mono">{messageEvents.length} messages tracked</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2" ref={listRef}>
        {messageEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            No encrypted messages yet...
          </div>
        ) : (
          messageEvents.map((evt, idx) => {
            const p = evt.payload;
            const isExpanded = expandedId === `${evt.timestamp}-${idx}`;
            const isCritical = p.encryption_lane === 'critical';
            
            return (
              <div
                key={`${evt.timestamp}-${idx}`}
                className={`rounded-lg border transition-all duration-200 ${
                  isCritical
                    ? 'border-qkd/30 bg-qkd/5 hover:bg-qkd/10'
                    : 'border-pqc/20 bg-pqc/5 hover:bg-pqc/10'
                }`}
              >
                {/* Header Row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : `${evt.timestamp}-${idx}`)}
                >
                  <div className="shrink-0">
                    {isCritical ? (
                      <ShieldAlert size={18} className="text-qkd" />
                    ) : (
                      <ShieldCheck size={18} className="text-pqc" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false })}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isCritical
                          ? 'bg-qkd/20 text-qkd border border-qkd/30'
                          : 'bg-pqc/20 text-pqc border border-pqc/30'
                      }`}>
                        {isCritical ? 'QKD-256' : 'KYBER-768'}
                      </span>
                      {p.high_security && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          HIGH SEC
                        </span>
                      )}
                      {p.file_name && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <FileText size={10} /> {p.file_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 truncate">
                      {p.content_preview || '[File only]'}
                    </p>
                  </div>

                  <div className="shrink-0 text-xs font-mono">
                    <span className={p.threat_score > 0.7 ? 'text-health-critical' : 'text-slate-400'}>
                      Q_TL: {p.threat_score?.toFixed(3)}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {isExpanded ? <EyeOff size={14} className="text-slate-500" /> : <Eye size={14} className="text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Encryption Details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-500">KEM Algorithm</span>
                        <p className="text-white font-mono">{p.kem_used}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Signature</span>
                        <p className="text-white font-mono">{p.sig_used}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Symmetric Cipher</span>
                        <p className="text-white font-mono">{p.aes_mode}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Threat Score</span>
                        <p className="text-white font-mono">{p.threat_score?.toFixed(4)}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Nonce (IV)</span>
                        <p className="text-green-400 font-mono text-[11px] break-all">{p.nonce}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Ciphertext (first 64 hex chars)</span>
                        <p className="text-amber-400 font-mono text-[11px] break-all">{p.ciphertext_preview}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Signature (first 64 hex chars)</span>
                        <p className="text-purple-400 font-mono text-[11px] break-all">{p.signature_preview}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Sender ID</span>
                        <p className="text-white font-mono text-[11px]">{p.sender_id}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Recipient ID</span>
                        <p className="text-white font-mono text-[11px]">{p.recipient_id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageTrackerPanel;
