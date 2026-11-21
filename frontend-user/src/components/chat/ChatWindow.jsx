import React, { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Shield } from 'lucide-react';

const ChatWindow = () => {
  const { messages, activeChat, typingUsers, markAsRead, unreadCounts } = useChat();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const chatMessages = activeChat ? (messages.get(activeChat.id) || []) : [];
  const isTyping = activeChat && typingUsers.has(activeChat.id);
  const unreadCount = activeChat ? (unreadCounts[activeChat.id] || 0) : 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (activeChat && unreadCount > 0 && chatMessages.length > 0) {
      const unreadIds = chatMessages
        .filter(m => m.sender_id === activeChat.id)
        .slice(-unreadCount)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        markAsRead(activeChat.id, unreadIds);
      }
    }
  }, [activeChat, chatMessages, unreadCount, markAsRead]);

  // Group by date logic
  const groupedMessages = chatMessages.reduce((acc, msg) => {
    let normalized = msg.created_at;
    if (typeof normalized === 'string' && !normalized.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(normalized)) {
      normalized = normalized + 'Z';
    }
    const date = new Date(normalized).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" ref={scrollRef}>
      {chatMessages.length === 0 ? (
        <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 space-y-2 select-none">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-inner)] border border-[var(--edge-rest)] flex items-center justify-center mb-1">
            <Shield size={18} className="text-[var(--col-standard)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">This is the beginning of your secure conversation.</p>
          <p className="text-xs text-[var(--text-secondary)] font-sans max-w-sm">
            Protected by NIST FIPS 203 (ML-KEM-768) lattice KEM and BB84 Quantum Key Distribution (QKD). Confidential against future quantum decryption.
          </p>
        </div>
      ) : (
        Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-3">
            {/* Plain small centered muted text date separator (no outlined pill) */}
            <div className="flex justify-center my-3 select-none">
              <span className="text-xs text-[var(--text-tertiary)] font-sans tracking-normal">
                {date}
              </span>
            </div>

            {msgs.map((msg, index) => {
              const isLastInGroup = index === msgs.length - 1 || msgs[index + 1]?.sender_id !== msg.sender_id;
              return (
                <MessageBubble 
                  key={msg.id || index}
                  message={msg}
                  isOwn={msg.sender_id === user?.id}
                  hasTail={isLastInGroup}
                />
              );
            })}
          </div>
        ))
      )}
      
      {isTyping && (
        <div className="flex justify-start pl-2">
          <TypingIndicator name={activeChat.display_name} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
