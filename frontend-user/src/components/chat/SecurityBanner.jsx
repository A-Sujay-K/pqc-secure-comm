import React from 'react';
import { Shield } from 'lucide-react';

const SecurityBanner = ({ banner }) => {
  if (!banner) return null;

  return (
    <div className="w-full relative overflow-hidden bg-dark-bg/80 backdrop-blur-xl border-b border-white/10 shadow-lg animate-slide-in" style={{ animationName: 'slideDown' }}>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      
      {/* Animated shimmer background */}
      <div className="absolute inset-0 shimmer-bg opacity-30 pointer-events-none" />
      
      <div className="relative z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-accent-gold/20 rounded-lg">
            <Shield size={16} className="text-accent-gold animate-pulse" />
          </div>
          <span className="text-sm font-medium text-white/90">
            {banner.message || 'Securing connection...'}
          </span>
        </div>
        
        {banner.queue_position !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Queue Position:</span>
            <span className="text-sm font-mono text-accent-gold font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {banner.queue_position}
            </span>
          </div>
        )}
      </div>
      
      {/* Loading bar at bottom */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-accent-gold/50 w-full overflow-hidden">
        <div className="h-full bg-accent-gold animate-[shimmer_1.5s_infinite_linear] w-1/3 rounded-full" />
      </div>
    </div>
  );
};

export default SecurityBanner;
