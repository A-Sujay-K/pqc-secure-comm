import React from 'react';

export default function TypingIndicator({ user }) {
  return (
    <div className="flex justify-start px-4 mb-2">
      <div className="bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
        <span className="text-xs text-slate-400 mr-1">{user?.display_name} is typing</span>
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
