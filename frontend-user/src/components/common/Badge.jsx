import React from 'react';
import { Shield } from 'lucide-react';
import { ENCRYPTION_LANES } from '../../utils/constants';

const Badge = ({ variant = ENCRYPTION_LANES.PQC, className = '' }) => {
  const isQKD = variant === ENCRYPTION_LANES.QKD;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono border ${isQKD ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold' : 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'} ${className}`}>
      <Shield size={12} className={isQKD ? 'fill-accent-gold/20' : 'fill-accent-blue/20'} />
      <span>{variant}</span>
    </div>
  );
};

export default Badge;
