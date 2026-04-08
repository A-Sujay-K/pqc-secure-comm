import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Spinner from '../common/Spinner';

export default function ChatWindow({ messages = [], currentUserId, peerUser, isLoading, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!peerUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500">
        <p>Select a contact to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 py-4 space-y-1">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id || msg._id}
          message={msg}
          isOwn={msg.sender_id === currentUserId}
        />
      ))}
      {isTyping && <TypingIndicator user={peerUser} />}
      <div ref={bottomRef} />
    </div>
  );
}
