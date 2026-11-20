import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import ChatHeader from '../components/layout/ChatHeader';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import SecurityBanner from '../components/chat/SecurityBanner';
import { useChat } from '../hooks/useChat';
import { Lock, Shield, ShieldAlert, UserPlus } from 'lucide-react';

const ChatPage = () => {
  const { activeChat, setActiveChat, securityBanner, addContact } = useChat();
  // highSecurityMode: false = Standard lane, true = Critical lane
  const [highSecurityMode, setHighSecurityMode] = useState(false);

  const handleToggleSecurity = (target) => {
    if (typeof target === 'boolean') {
      setHighSecurityMode(target);
    } else {
      setHighSecurityMode((prev) => !prev);
    }
  };

  const handleAddSender = async () => {
    if (!activeChat) return;
    try {
      await addContact(activeChat);
    } catch (err) {
      console.error('Failed to add unverified sender to contacts', err);
    }
  };

  const isUnverifiedSender = activeChat && activeChat.is_contact === false;

  return (
    <AppShell>
      {activeChat ? (
        <div className="flex flex-col h-full w-full relative overflow-hidden">
          {securityBanner && (
            <div className="shrink-0 z-20">
              <SecurityBanner banner={securityBanner} />
            </div>
          )}
          {/* ChatHeader: inside conversation pane, separated from messages by an edge-rest hairline */}
          <ChatHeader 
            contact={activeChat} 
            highSecurityMode={highSecurityMode}
            onToggleSecurity={handleToggleSecurity}
            onBack={() => setActiveChat(null)}
          />

          {/* Liquid Glass Security Alert Banner for Unverified Senders (fixed above scroll container) */}
          {isUnverifiedSender && (
            <div className="shrink-0 px-3 sm:px-6 pt-3 pb-1 z-10">
              <div 
                className="max-w-xl mx-auto p-3 sm:p-3.5 rounded-2xl border border-amber-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                style={{ backgroundColor: 'var(--surface-bg)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert size={16} className="text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">Unverified Sender</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] font-sans leading-tight">
                        Incoming message from <span className="font-medium text-[var(--text-primary)]">@{activeChat.username}</span>. Verify sender identity and add to contacts to unlock composer and reply.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSender}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-[var(--col-standard)] hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0 self-end sm:self-auto"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 2px 8px var(--shadow-color)'
                    }}
                    title="Add this user to your contacts"
                  >
                    <UserPlus size={13} />
                    <span>Add Contact</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ChatWindow + MessageInput: scroll area + composer, no separate floating bars */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <ChatWindow />
            <MessageInput highSecurityMode={highSecurityMode} />
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center p-6 text-center select-none">
          <div className="max-w-sm animate-enter">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-1">
              Select a contact
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 font-sans">
              End-to-end encrypted post-quantum messaging powered by NIST FIPS 203 (ML-KEM-768) and simulated QKD.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-inner)] border border-[var(--edge-rest)] text-[var(--text-secondary)] text-xs">
              <Shield size={12} className="text-[var(--col-standard)]" />
              <span>HNDL Quantum-Resistant</span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default ChatPage;
