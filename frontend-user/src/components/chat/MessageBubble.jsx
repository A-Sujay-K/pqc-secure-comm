import React from 'react';
import { formatTime } from '../../utils/formatters';
import { Check, CheckCheck, FileText, Download, Shield } from 'lucide-react';
import { ENCRYPTION_LANES, LANE_LABELS, LANE_COLORS } from '../../utils/constants';

const MessageBubble = ({ message, isOwn }) => {
  const lane = message.encryption_lane || 'standard';
  const laneLabel = LANE_LABELS[lane] || 'PQC';
  const laneColor = LANE_COLORS[lane] || LANE_COLORS.standard;
  const isQKD = lane === ENCRYPTION_LANES.CRITICAL;
  
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-in group`}>
      <div 
        className={`max-w-[75%] md:max-w-[65%] rounded-2xl p-3 shadow-lg relative ${
          isOwn 
            ? 'bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-white/10 rounded-tr-sm backdrop-blur-sm' 
            : 'glass rounded-tl-sm'
        }`}
      >
        {/* Threat Score Indicator (subtle edge glow for high threat) */}
        {message.threat_score > 0.7 && !isOwn && (
          <div className="absolute inset-0 rounded-2xl border border-amber-500/30 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)] pointer-events-none" />
        )}

        {/* File Attachment */}
        {(message.file_url || message.file_name) && (
          <div className="mb-2 p-3 bg-black/20 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText size={20} className="text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{message.file_name || 'Attachment'}</p>
              {message.file_url && (
                <a 
                  href={message.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-accent-blue hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Download size={10} /> Download
                </a>
              )}
            </div>
          </div>
        )}

        {/* Text Content */}
        {message.content && (
          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Meta Footer */}
        <div className={`flex items-center gap-2 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-white/40">
            {formatTime(message.created_at)}
          </span>
          
          {/* Encryption Lane Badge */}
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono border ${laneColor.bg} ${laneColor.border} ${laneColor.text}`}>
            <Shield size={8} />
            <span>{laneLabel}</span>
          </div>

          {/* Read Receipt */}
          {isOwn && (
            <span className="text-white/30">
              <CheckCheck size={14} className={message.is_read ? 'text-accent-blue' : ''} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
