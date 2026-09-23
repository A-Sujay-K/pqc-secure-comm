import React from 'react';

const TypingIndicator = ({ name }) => {
  return (
    <div className="glass px-4 py-2 rounded-2xl rounded-tl-sm inline-flex items-center gap-3 animate-fade-in shadow-md border-white/5">
      <span className="text-xs text-white/60 font-medium">{name} is typing</span>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default TypingIndicator;
