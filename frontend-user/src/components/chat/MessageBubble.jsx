import React, { useState, useRef, useLayoutEffect } from 'react';
import { formatTime, getFileUrl } from '../../utils/formatters';
import { Check, CheckCheck, FileText, Download, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ENCRYPTION_LANES } from '../../utils/constants';
import MessageSealPopover from './MessageSealPopover';

const MessageBubble = ({ message, isOwn, hasTail = true }) => {
  const lane = message.encryption_lane || ENCRYPTION_LANES.STANDARD;
  const isQKD = lane === ENCRYPTION_LANES.CRITICAL || lane === 'critical' || lane === 'QKD';
  const [showSealPopover, setShowSealPopover] = useState(false);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDims({ w: Math.round(rect.width), h: Math.round(rect.height) });
        }
      }
    };

    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute single SVG path for bubble + tail (prevents double-alpha translucent overlap)
  const r = 18;
  let pathD = '';
  if (dims.w > 0 && dims.h > 0) {
    const w = dims.w;
    const h = dims.h;
    if (!hasTail) {
      pathD = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    } else if (isOwn) {
      // Sent: tail on bottom-right (curves out to w + 6, h)
      pathD = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${Math.max(r, h - 14)} C ${w} ${h - 5}, ${w + 4} ${h - 1}, ${w + 6} ${h} C ${w + 1} ${h}, ${w - 5} ${h}, ${w - 12} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    } else {
      // Received: tail on bottom-left (curves out to -6, h)
      pathD = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H 12 C 5 ${h}, -1 ${h}, -6 ${h} C -4 ${h - 1}, 0 ${h - 5}, 0 ${Math.max(r, h - 14)} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    }
  }

  const fillColor = isQKD
    ? (isOwn ? 'var(--bubble-critical-sent-bg)' : 'var(--bubble-critical-recv-bg)')
    : (isOwn ? 'var(--bubble-sent-bg)' : 'var(--bubble-recv-bg)');

  return (
    <div className={`flex w-full ${isOwn ? 'justify-end pr-2' : 'justify-start pl-2'} select-text relative`}>
      <div 
        ref={containerRef}
        className="max-w-[85%] sm:max-w-[70%] md:max-w-[65%] min-h-[38px] p-3 sm:p-3.5 relative transition-colors"
        style={{
          // Fallback before SVG measurement
          backgroundColor: dims.w > 0 ? 'transparent' : fillColor,
          borderRadius: '18px',
          border: dims.w > 0 ? 'none' : '1px solid var(--edge-rest)',
        }}
      >
        {/* Single-shape SVG background with seamless tail */}
        {dims.w > 0 && dims.h > 0 && (
          <svg 
            className="absolute inset-0 pointer-events-none overflow-visible z-0"
            width={dims.w}
            height={dims.h}
          >
            <path 
              d={pathD}
              fill={fillColor}
              stroke="var(--edge-rest)"
              strokeWidth="1"
            />
          </svg>
        )}

        {/* Content container inside the bubble */}
        <div className="relative z-10 font-sans">
          {/* File Attachment */}
          {(message.file_url || message.file_name) && (
            <div className="mb-2 p-2 bg-[var(--surface-inner)] rounded-xl border border-[var(--edge-rest)] flex items-center gap-2.5">
              <div className="p-1.5 bg-[var(--surface-elevated)] rounded-lg shrink-0 border border-[var(--edge-rest)]">
                <FileText size={16} className="text-[var(--text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {message.file_name || 'Attachment'}
                </p>
                {message.file_url && (
                  <a 
                    href={getFileUrl(message.file_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download={message.file_name || true}
                    className="text-[11px] text-[var(--col-standard)] hover:underline inline-flex items-center gap-1 mt-0.5 font-medium cursor-pointer"
                  >
                    <Download size={10} /> Download
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Meta line: time (Urbanist 11px, muted) + small lane seal glyph + delivery check */}
          <div className="flex items-center justify-end gap-1.5 mt-1 select-none">
            <span className="text-[11px] text-[var(--text-tertiary)] font-sans">
              {formatTime(message.created_at)}
            </span>
            
            {/* Small Lane Seal Glyph (Clickable to open Message Seal popover) */}
            <button
              type="button"
              onClick={() => setShowSealPopover((prev) => !prev)}
              className="p-0.5 rounded hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--edge-hover)]"
              title={isQKD ? 'Critical Lane (BB84 QKD + ML-KEM-768 Hybrid) — Click for Message Seal' : 'Standard Lane (ML-KEM-768) — Click for Message Seal'}
              aria-label="View message seal"
            >
              {isQKD ? (
                <ShieldAlert size={12} className="text-[var(--col-critical)]" />
              ) : (
                <ShieldCheck size={12} className="text-[var(--text-tertiary)] hover:text-[var(--col-standard)]" />
              )}
            </button>

            {/* Read Receipt (Sender side only) */}
            {isOwn && (
              <span className="text-[var(--text-tertiary)]" title={message.is_read ? 'Delivered & Read' : 'Delivered'}>
                {message.is_read ? (
                  <CheckCheck size={13} className="text-[var(--col-standard)]" />
                ) : (
                  <Check size={13} className="text-[var(--text-tertiary)]" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Message Seal Popover */}
        {showSealPopover && (
          <MessageSealPopover 
            message={message} 
            isOwn={isOwn} 
            onClose={() => setShowSealPopover(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;