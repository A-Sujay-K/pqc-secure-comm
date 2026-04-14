import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';

const TYPING_DEBOUNCE_MS = 1500;

export default function MessageInput({ onSendMessage, onTypingStart, onTypingStop, disabled }) {
  const [text, setText] = useState('');
  const isTypingRef = useRef(false);
  const stopTypingTimer = useRef(null);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }
    clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
    }, TYPING_DEBOUNCE_MS);
  }, [onTypingStart, onTypingStop]);

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping();
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendMessage?.(trimmed);
    setText('');
    clearTimeout(stopTypingTimer.current);
    isTypingRef.current = false;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-slate-700 bg-slate-900">
      <div className="flex items-end gap-3">
        <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0">
          <Paperclip size={20} />
        </button>
        <textarea
          className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5
                     text-slate-100 placeholder-slate-400 resize-none max-h-40
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type a message..."
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                     rounded-xl text-white transition-colors flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
