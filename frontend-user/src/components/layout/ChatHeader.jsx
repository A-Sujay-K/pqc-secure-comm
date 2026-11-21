import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import { ShieldCheck, ShieldAlert, Info, ChevronLeft } from 'lucide-react';
import HarvestLabTooltip from '../chat/HarvestLabTooltip';
import SessionSealModal from '../chat/SessionSealModal';

/**
 * ChatHeader — Cleaned frosted header with:
 * - Mobile Back Button (chevron) returning to contacts list
 * - Contact avatar + name + status
 * - Segmented Lane Control: Standard (ML-KEM-768) vs Critical (BB84 QKD + ML-KEM-768 Hybrid)
 * - Two circular glass icon buttons: Session Seal Details, HNDL Info
 */
const ChatHeader = ({
  contact,
  contactName,
  contactStatus,
  highSecurityMode,
  onToggleSecurity,
  onBack,
}) => {
  const [isSealDetailsOpen, setIsSealDetailsOpen] = useState(false);
  const [isHndlOpen, setIsHndlOpen] = useState(false);

  const displayName = contact?.display_name || contactName || 'Secure Peer';
  const username = contact?.username || displayName.toLowerCase().replace(/\s+/g, '');
  const status = contactStatus || (contact?.status ? contact.status : 'Online');

  return (
    <div className="h-16 px-2.5 sm:px-6 border-b border-[var(--edge-rest)] bg-[var(--glass-l2-bg)] backdrop-blur-2xl flex items-center justify-between shrink-0 select-none relative z-20 gap-1.5 sm:gap-2 shadow-[inset_0_1px_0_var(--border-highlight)]">
      {/* Contact identity + Mobile Back Button */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] active:scale-90 transition-all cursor-pointer shrink-0 touch-manipulation"
            title="Back to contacts"
            aria-label="Back to contacts"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
        )}
        <Avatar 
          name={displayName} 
          color={contact?.avatar_color} 
          avatarUrl={contact?.avatar_url}
          size="md" 
          isOnline={status === 'Online'} 
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate">
            {displayName}
          </h2>
          <div className="hidden xs:flex items-center gap-1.5 text-[11px] sm:text-xs text-[var(--text-tertiary)] font-sans">
            <span className="truncate">@{username}</span>
            <span className="text-[var(--edge-rest)]">·</span>
            <span className="capitalize">{status}</span>
          </div>
        </div>
      </div>

      {/* Right controls: Segmented Lane Control + circular glass buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Segmented Lane Pill: Standard / Critical */}
        <div 
          role="group" 
          aria-label="Encryption Lane Selector" 
          className="inline-flex items-center p-0.5 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-xs font-sans select-none"
        >
          {/* Standard Lane Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSecurity?.(false);
            }}
            className={`px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs transition-all duration-150 flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 ${
              !highSecurityMode
                ? 'bg-[var(--glass-l2-bg)] text-[var(--text-primary)] shadow-sm border border-[var(--edge-rest)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] border border-transparent opacity-75 hover:opacity-100'
            }`}
            title="Switch to Standard Lane (NIST FIPS 203 ML-KEM-768 + ML-DSA-65)"
            aria-pressed={!highSecurityMode}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--col-standard)] shrink-0 pointer-events-none" />
            <span className="font-medium pointer-events-none">Standard</span>
          </button>

          {/* Critical Lane Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSecurity?.(true);
            }}
            className={`px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs transition-all duration-150 flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95 ${
              highSecurityMode
                ? 'bg-[var(--glass-l2-bg)] text-[var(--text-primary)] shadow-sm border border-[var(--col-critical)]/40 font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] border border-transparent opacity-75 hover:opacity-100'
            }`}
            title="Switch to Critical Lane (BB84 QKD + ML-KEM-768 Dual-Layer Hybrid)"
            aria-pressed={highSecurityMode}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-[var(--col-critical)] shrink-0 pointer-events-none ${highSecurityMode ? 'animate-pulse' : ''}`} />
            <span className="font-medium pointer-events-none">BB84 QKD</span>
          </button>
        </div>

        {/* 1. Session Seal Details Icon Button */}
        <button
          type="button"
          onClick={() => setIsSealDetailsOpen(true)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            isSealDetailsOpen
              ? 'border-[var(--edge-hover)] bg-[var(--surface-elevated)] text-[var(--col-standard)]'
              : 'border-[var(--edge-rest)] bg-[var(--surface-inner)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--edge-hover)]'
          }`}
          title="View Session Cryptographic Seal Details"
          aria-label="View Session Cryptographic Seal Details"
        >
          {highSecurityMode ? (
            <ShieldAlert size={13} className="text-[var(--col-critical)]" />
          ) : (
            <ShieldCheck size={13} className="text-[var(--col-standard)]" />
          )}
        </button>

        {/* 2. HNDL Threat Defense Info */}
        <button
          type="button"
          onClick={() => setIsHndlOpen(true)}
          className={`hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full items-center justify-center border transition-all cursor-pointer ${
            isHndlOpen
              ? 'border-[var(--edge-hover)] bg-[var(--surface-elevated)] text-[var(--col-standard)]'
              : 'border-[var(--edge-rest)] bg-[var(--surface-inner)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--edge-hover)]'
          }`}
          title="HNDL Quantum Threat Defence Information"
          aria-label="HNDL Quantum Threat Defence Information"
        >
          <Info size={13} />
        </button>
      </div>

      {/* Session Seal Modal */}
      <SessionSealModal
        isOpen={isSealDetailsOpen}
        onClose={() => setIsSealDetailsOpen(false)}
        peerName={displayName}
        highSecurityMode={highSecurityMode}
      />

      {/* HNDL Educational Modal */}
      <HarvestLabTooltip
        isOpen={isHndlOpen}
        onClose={() => setIsHndlOpen(false)}
      />
    </div>
  );
};

export default ChatHeader;
