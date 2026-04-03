import React from 'react';

export default function Badge({ isOnline }) {
  return (
    <span
      className={[
        'inline-block w-2.5 h-2.5 rounded-full flex-shrink-0',
        isOnline ? 'bg-emerald-400' : 'bg-slate-500',
      ].join(' ')}
    />
  );
}
