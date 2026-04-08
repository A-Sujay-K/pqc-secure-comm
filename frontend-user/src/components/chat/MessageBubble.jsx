import React from 'react';
import { format } from 'date-fns';
import { Shield, ShieldAlert } from 'lucide-react';

export default function MessageBubble({ message, isOwn }) {
  const isStandard = message.encryption_lane === 'standard';
  const timeStr = format(new Date(message.created_at), 'HH:mm');

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
      <div
        className={[
          'max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2.5 shadow-sm',
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-slate-700 text-slate-100 rounded-bl-none',
        ].join(' ')}
      >
        {/* Content */}
        {message.content && (
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-end gap-1.5 mt-1">
          {isStandard ? (
            <Shield size={10} className="text-emerald-300 opacity-70" />
          ) : (
            <ShieldAlert size={10} className="text-yellow-300 opacity-70" />
          )}
          <span className={`text-xs opacity-60 ${isOwn ? 'text-indigo-100' : 'text-slate-400'}`}>
            {timeStr}
          </span>
        </div>
      </div>
    </div>
  );
}
