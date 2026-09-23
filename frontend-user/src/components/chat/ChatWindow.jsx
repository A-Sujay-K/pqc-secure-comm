import React, { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

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
        .filter(m => m.sender_id === activeChat.id) // Only mark received messages
        .slice(-unreadCount)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        markAsRead(activeChat.id, unreadIds);
      }
    }
  }, [activeChat, chatMessages, unreadCount, markAsRead]);

  // Group by date logic
  const groupedMessages = chatMessages.reduce((acc, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
      {chatMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-2">
          <p className="text-sm">This is the beginning of your encrypted chat.</p>
          <p className="text-xs font-mono">End-to-End Post-Quantum Secured.</p>
        </div>
      ) : (
        Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/50 font-medium tracking-wider uppercase backdrop-blur-sm border border-white/5">
                {date}
              </span>
            </div>
            {msgs.map((msg, index) => (
              <MessageBubble 
                key={msg.id || index}
                message={msg}
                isOwn={msg.sender_id === user.id}
              />
            ))}
          </div>
        ))
      )}
      
      {isTyping && (
        <div className="flex justify-start">
          <TypingIndicator name={activeChat.display_name} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
