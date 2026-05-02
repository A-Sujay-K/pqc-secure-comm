import React from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function SecurityBanner({ isVisible, isQueued }) {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-yellow-500/10 border-b border-yellow-500/20">
      {isQueued ? (
        <Loader2 size={16} className="text-yellow-400 animate-spin flex-shrink-0" />
      ) : (
        <ShieldAlert size={16} className="text-yellow-400 flex-shrink-0" />
      )}
      <p className="text-xs text-yellow-300 font-medium">
        {isQueued
          ? 'Securing connection... Your message will be delivered once a quantum key becomes available.'
          : 'This conversation is protected by Post-Quantum Cryptography'}
      </p>
    </div>
  );
}
